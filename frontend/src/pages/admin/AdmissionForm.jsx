import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Printer, RotateCcw, Camera, Save } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const fmtInr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const emptyForm = {
  full_name: "", admission_date: "", dob: "", father_name: "", mother_name: "",
  gender: "", mobile_primary: "", mobile_alt: "", address: "", previous_school: "",
  course: "Primary", class_name: "Class 1", subjects: [], session_start: "", session_end: "",
  roll_number: "", annual_fee: "", admission_status: "Confirmed",
};

const AdmissionForm = () => {
  const { meta } = useAdmin();
  const { regId } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!regId;
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!meta) return;
    if (isEdit) {
      (async () => {
        try {
          const { data } = await axios.get(`${API}/students/${regId}`, { withCredentials: true });
          setForm({
            full_name: data.full_name, admission_date: data.admission_date, dob: data.dob,
            father_name: data.father_name, mother_name: data.mother_name, gender: data.gender,
            mobile_primary: data.mobile_primary, mobile_alt: data.mobile_alt || "", address: data.address,
            previous_school: data.previous_school || "", course: data.course, class_name: data.class_name,
            subjects: data.subjects || [], session_start: data.session_start, session_end: data.session_end,
            roll_number: data.roll_number ?? "", annual_fee: data.annual_fee, admission_status: data.admission_status,
          });
          setPhoto(data.photo || null);
        } catch {
          toast.error("Student not found");
          navigate("/admin/students");
        }
      })();
    } else {
      const cls = searchParams.get("class") || "Class 1";
      setForm((f) => ({
        ...f,
        admission_date: new Date().toISOString().slice(0, 10),
        session_start: meta.session_start,
        session_end: meta.session_end,
        class_name: cls,
        annual_fee: meta.fee_defaults?.[cls] ?? "",
      }));
    }
  }, [meta, regId, isEdit, navigate, searchParams]);

  const set = (key) => (e) => {
    const v = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: v };
      if (key === "class_name") {
        next.course = Object.entries(meta.course_classes).find(([, cls]) => cls.includes(v))?.[0] || f.course;
        if (!isEdit) next.annual_fee = meta.fee_defaults?.[v] ?? f.annual_fee;
      }
      return next;
    });
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const toggleSubject = (s) => {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s) ? f.subjects.filter((x) => x !== s) : [...f.subjects, s],
    }));
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isEdit) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { data } = await axios.post(`${API}/students/${regId}/photo`, fd, { withCredentials: true });
        setPhoto(data.photo);
        toast.success("Photo updated");
      } catch (err) {
        toast.error(err?.response?.data?.detail || "Photo upload failed");
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const er = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2) er.full_name = "Student name is required.";
    if (!form.admission_date) er.admission_date = "Admission date is required.";
    if (!form.dob) er.dob = "Date of birth is required.";
    if (!form.father_name.trim() || form.father_name.trim().length < 2) er.father_name = "Father's name is required.";
    if (!form.mother_name.trim() || form.mother_name.trim().length < 2) er.mother_name = "Mother's name is required.";
    if (!form.gender) er.gender = "Select gender.";
    if (!/^[6-9]\d{9}$/.test(form.mobile_primary)) er.mobile_primary = "Valid 10-digit mobile required.";
    if (form.mobile_alt && !/^[6-9]\d{9}$/.test(form.mobile_alt)) er.mobile_alt = "Valid 10-digit mobile required.";
    if (!form.address.trim() || form.address.trim().length < 5) er.address = "Address is required.";
    if (!form.class_name) er.class_name = "Select a class.";
    if (form.annual_fee === "" || Number(form.annual_fee) < 0) er.annual_fee = "Annual fee is required.";
    if (form.roll_number !== "" && (isNaN(Number(form.roll_number)) || Number(form.roll_number) < 1)) er.roll_number = "Roll number must be a positive number.";
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) {
      setErrors(er);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      roll_number: form.roll_number === "" ? null : Number(form.roll_number),
      annual_fee: Number(form.annual_fee),
      mobile_alt: form.mobile_alt || null,
      previous_school: form.previous_school || null,
    };
    try {
      if (isEdit) {
        await axios.patch(`${API}/students/${regId}`, payload, { withCredentials: true });
        toast.success("Student information updated");
        navigate(`/admin/students/${regId}`);
      } else {
        const { data } = await axios.post(`${API}/students`, payload, { withCredentials: true });
        if (photo && photo.startsWith("data:")) {
          const blob = await (await fetch(photo)).blob();
          const fd = new FormData();
          fd.append("file", blob, "photo.jpg");
          await axios.post(`${API}/students/${data.reg_id}/photo`, fd, { withCredentials: true });
        }
        toast.success(`Admission saved — ${data.reg_id}`, { description: "Student is now in Student List and Fee Manager." });
        navigate(`/admin/students/${data.reg_id}`);
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Could not save admission");
      setSaving(false);
    }
  };

  const inputCls = (er) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40 ${er ? "border-red-400" : "border-slate-300"}`;
  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="block text-sm font-semibold text-[#123D62] mb-1.5">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );

  if (!meta) return null;

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl space-y-6" data-testid="admission-form">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Student Information</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Student's Full Name" required error={errors.full_name}>
            <input id="adm_name" type="text" value={form.full_name} onChange={set("full_name")} className={inputCls(errors.full_name)} data-testid="adm-input-name" />
          </Field>
          <Field label="Admission Date" required error={errors.admission_date}>
            <input id="adm_date" type="date" value={form.admission_date} onChange={set("admission_date")} className={inputCls(errors.admission_date)} data-testid="adm-input-admission-date" />
          </Field>
          <Field label="Date of Birth" required error={errors.dob}>
            <input id="adm_dob" type="date" value={form.dob} onChange={set("dob")} className={inputCls(errors.dob)} data-testid="adm-input-dob" />
          </Field>
          <Field label="Gender" required error={errors.gender}>
            <select id="adm_gender" value={form.gender} onChange={set("gender")} className={inputCls(errors.gender)} data-testid="adm-select-gender">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Father's Name" required error={errors.father_name}>
            <input id="adm_father" type="text" value={form.father_name} onChange={set("father_name")} className={inputCls(errors.father_name)} data-testid="adm-input-father" />
          </Field>
          <Field label="Mother's Name" required error={errors.mother_name}>
            <input id="adm_mother" type="text" value={form.mother_name} onChange={set("mother_name")} className={inputCls(errors.mother_name)} data-testid="adm-input-mother" />
          </Field>
          <Field label="Primary Mobile (WhatsApp)" required error={errors.mobile_primary}>
            <input id="adm_mobile" type="tel" inputMode="tel" value={form.mobile_primary} onChange={set("mobile_primary")} className={inputCls(errors.mobile_primary)} data-testid="adm-input-mobile" />
          </Field>
          <Field label="Alternative Mobile" error={errors.mobile_alt}>
            <input id="adm_mobile_alt" type="tel" inputMode="tel" value={form.mobile_alt} onChange={set("mobile_alt")} className={inputCls(errors.mobile_alt)} data-testid="adm-input-mobile-alt" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Permanent Address" required error={errors.address}>
              <textarea id="adm_address" rows={2} value={form.address} onChange={set("address")} className={inputCls(errors.address)} data-testid="adm-input-address" />
            </Field>
          </div>
          <Field label="Previous School (if any)">
            <input id="adm_prev_school" type="text" value={form.previous_school} onChange={set("previous_school")} className={inputCls(false)} data-testid="adm-input-prev-school" />
          </Field>
          <div>
            <label className="block text-sm font-semibold text-[#123D62] mb-1.5">Student Photograph</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center" data-testid="adm-photo-preview">
                {photo ? <img src={photo} alt="Student" className="w-full h-full object-cover" /> : <Camera size={20} className="text-slate-400" aria-hidden="true" />}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhoto} data-testid="adm-photo-input" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#123D62] hover:bg-slate-50"
                  data-testid="adm-photo-btn">
                  {photo ? "Replace Photo" : "Upload Photo"}
                </button>
                <p className="mt-1 text-xs text-[#64748B]">JPG/PNG/WebP, max 2 MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Course & Office Details</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Course" required>
            <input type="text" value={form.course} readOnly className={`${inputCls(false)} bg-slate-50`} data-testid="adm-input-course" aria-label="Course (auto from class)" />
          </Field>
          <Field label="Class" required error={errors.class_name}>
            <select id="adm_class" value={form.class_name} onChange={set("class_name")} className={inputCls(errors.class_name)} data-testid="adm-select-class">
              {Object.entries(meta.course_classes).map(([course, classes]) => (
                <optgroup key={course} label={course}>
                  {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Roll Number" error={errors.roll_number}>
            <input id="adm_roll" type="number" min="1" value={form.roll_number} onChange={set("roll_number")} className={inputCls(errors.roll_number)} data-testid="adm-input-roll" placeholder="Leave blank to assign later" />
          </Field>
          <Field label="Annual Course Fee (₹)" required error={errors.annual_fee}>
            <input id="adm_fee" type="number" min="0" value={form.annual_fee} onChange={set("annual_fee")} className={inputCls(errors.annual_fee)} data-testid="adm-input-fee" />
            <p className="mt-1 text-xs text-[#64748B]">Auto-filled from fee defaults — adjustable by admin. Monthly: {form.annual_fee ? fmtInr(Math.round(Number(form.annual_fee) / 12)) : "—"}</p>
          </Field>
          <Field label="Session Start" required>
            <input id="adm_sess_start" type="date" value={form.session_start} onChange={set("session_start")} className={inputCls(false)} data-testid="adm-input-session-start" />
          </Field>
          <Field label="Session End" required>
            <input id="adm_sess_end" type="date" value={form.session_end} onChange={set("session_end")} className={inputCls(false)} data-testid="adm-input-session-end" />
          </Field>
          <Field label="Admission Status">
            <select id="adm_status" value={form.admission_status} onChange={set("admission_status")} className={inputCls(false)} data-testid="adm-select-status">
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-[#123D62] mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2" data-testid="adm-subjects">
              {meta.default_subjects.map((s) => (
                <button key={s} type="button" onClick={() => toggleSubject(s)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${form.subjects.includes(s) ? "bg-[#0756A5] text-white border-[#0756A5]" : "bg-white text-[#123D62] border-slate-300 hover:border-[#0756A5]"}`}
                  data-testid={`adm-subject-${s.toLowerCase().replace(/\s/g, "-")}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isEdit && (
        <div className="rounded-2xl bg-[#EAF0F8] border border-[#C9DCF0] p-4 text-sm text-[#123D62]" data-testid="adm-reg-id-note">
          Registration ID <strong className="font-mono">{regId}</strong> is permanent and cannot be changed.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-7 py-3 transition-colors"
          data-testid="adm-save-btn">
          {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Save Admission"}
        </button>
        {isEdit && (
          <button type="button" onClick={() => navigate(`/admin/students/${regId}`)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-6 py-3 hover:bg-slate-50"
            data-testid="adm-print-btn">
            <Printer size={16} aria-hidden="true" /> Print / PDF
          </button>
        )}
        <button type="button" onClick={() => { setForm(emptyForm); setPhoto(null); setErrors({}); }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-6 py-3 hover:bg-slate-50"
          data-testid="adm-reset-btn">
          <RotateCcw size={15} aria-hidden="true" /> Reset Form
        </button>
      </div>
    </form>
  );
};

export default AdmissionForm;
