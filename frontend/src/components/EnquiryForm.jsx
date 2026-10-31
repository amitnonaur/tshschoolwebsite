import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { API, SCHOOL } from "../config/school";

const PHONE_RE = /^(?:\+91|91|0)?[6-9]\d{9}$/;

const EnquiryForm = ({ source = "admissions" }) => {
  const [form, setForm] = useState({
    parent_name: "",
    child_name: "",
    class_of_interest: "",
    phone: "",
    email: "",
    preferred_contact: "phone",
    message: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | submitting | success | error

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.parent_name.trim() || form.parent_name.trim().length < 2)
      er.parent_name = "Please enter the parent or guardian name.";
    if (!form.class_of_interest) er.class_of_interest = "Please choose a class.";
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, "")))
      er.phone = "Please enter a valid 10-digit Indian mobile number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      er.email = "Please enter a valid email address, or leave this blank.";
    if (!form.consent) er.consent = "Please acknowledge the privacy policy to continue.";
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) {
      setErrors(er);
      return;
    }
    setState("submitting");
    try {
      await axios.post(`${API}/enquiries`, {
        ...form,
        email: form.email || null,
        child_name: form.child_name || null,
        message: form.message || null,
        source,
      });
      setState("success");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail?.[0]?.msg ||
        "Something went wrong. Please try again, or call the school directly.";
      setState("error");
      toast.error("Enquiry not submitted", { description: msg });
    }
  };

  if (state === "success") {
    return (
      <div
        className="card-site text-center !p-10"
        role="status"
        data-testid="enquiry-success-state"
      >
        <CheckCircle2 size={48} className="mx-auto text-[#16A34A]" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-[#123D62]">Enquiry received</h3>
        <p className="mt-2 text-sm sm:text-base text-[#475569] leading-relaxed max-w-md mx-auto">
          Thank you. Your enquiry for the proposed {SCHOOL.sessionLabel} has been recorded.
          The school will contact you on your preferred method ({form.preferred_contact === "whatsapp" ? "WhatsApp" : "phone"}).
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-[#0756A5] hover:underline"
          onClick={() => {
            setState("idle");
            setForm({ parent_name: "", child_name: "", class_of_interest: "", phone: "", email: "", preferred_contact: "phone", message: "", consent: false, website: "" });
          }}
          data-testid="enquiry-submit-another-btn"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  const inputCls = (er) =>
    `w-full rounded-xl border px-4 py-3 text-sm sm:text-base bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40 ${
      er ? "border-red-400" : "border-slate-300"
    }`;

  return (
    <form onSubmit={onSubmit} noValidate data-testid="admission-enquiry-form" className="card-site !p-6 sm:!p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="parent_name" className="block text-sm font-semibold text-[#123D62] mb-1.5">
            Parent / guardian name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="parent_name" type="text" autoComplete="name" value={form.parent_name} onChange={set("parent_name")}
            className={inputCls(errors.parent_name)} aria-invalid={!!errors.parent_name}
            aria-describedby={errors.parent_name ? "err-parent" : undefined} data-testid="enquiry-input-parent-name" />
          {errors.parent_name && <p id="err-parent" className="mt-1 text-xs text-red-600" role="alert" data-testid="enquiry-error-parent">{errors.parent_name}</p>}
        </div>
        <div>
          <label htmlFor="child_name" className="block text-sm font-semibold text-[#123D62] mb-1.5">Child's name (optional)</label>
          <input id="child_name" type="text" value={form.child_name} onChange={set("child_name")}
            className={inputCls(false)} data-testid="enquiry-input-child-name" />
        </div>
        <div>
          <label htmlFor="class_of_interest" className="block text-sm font-semibold text-[#123D62] mb-1.5">
            Class of interest <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select id="class_of_interest" value={form.class_of_interest} onChange={set("class_of_interest")}
            className={inputCls(errors.class_of_interest)} aria-invalid={!!errors.class_of_interest}
            data-testid="enquiry-select-class">
            <option value="">Choose a class</option>
            {SCHOOL.classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.class_of_interest && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="enquiry-error-class">{errors.class_of_interest}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-[#123D62] mb-1.5">
            Mobile number <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 98XXXXXXXX"
            value={form.phone} onChange={set("phone")} className={inputCls(errors.phone)}
            aria-invalid={!!errors.phone} data-testid="enquiry-input-phone" />
          {errors.phone && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="enquiry-error-phone">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#123D62] mb-1.5">Email (optional)</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")}
            className={inputCls(errors.email)} aria-invalid={!!errors.email} data-testid="enquiry-input-email" />
          {errors.email && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="enquiry-error-email">{errors.email}</p>}
        </div>
        <fieldset>
          <legend className="block text-sm font-semibold text-[#123D62] mb-1.5">Preferred contact method</legend>
          <div className="flex gap-4 pt-2" data-testid="enquiry-contact-method-group">
            {["phone", "whatsapp"].map((m) => (
              <label key={m} className="inline-flex items-center gap-2 text-sm text-[#1E293B] cursor-pointer">
                <input type="radio" name="preferred_contact" value={m} checked={form.preferred_contact === m}
                  onChange={set("preferred_contact")} className="w-4 h-4 accent-[#0756A5]"
                  data-testid={`enquiry-radio-${m}`} />
                {m === "phone" ? "Phone call" : "WhatsApp"}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="block text-sm font-semibold text-[#123D62] mb-1.5">Questions or message (optional)</label>
          <textarea id="message" rows={3} value={form.message} onChange={set("message")}
            className={inputCls(false)} data-testid="enquiry-textarea-message" />
        </div>
        {/* Honeypot — hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-[#1E293B] cursor-pointer">
            <input type="checkbox" checked={form.consent} onChange={set("consent")}
              className="mt-0.5 w-4 h-4 accent-[#0756A5]" aria-invalid={!!errors.consent}
              data-testid="enquiry-checkbox-consent" />
            <span>
              I have read the <Link to="/privacy-policy" className="text-[#0756A5] font-semibold hover:underline">privacy policy</Link> and
              agree that the school may contact me about this enquiry. <span className="text-red-500" aria-hidden="true">*</span>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="enquiry-error-consent">{errors.consent}</p>}
        </div>
      </div>
      {state === "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert" data-testid="enquiry-error-banner">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Your enquiry could not be submitted. Please try again, or call {SCHOOL.phone}.</span>
        </div>
      )}
      <button type="submit" disabled={state === "submitting"}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base px-6 py-3.5 transition-colors"
        data-testid="enquiry-submit-btn">
        {state === "submitting" && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {state === "submitting" ? "Submitting…" : "Submit Enquiry"}
      </button>
      <p className="mt-3 text-xs text-[#64748B] text-center">
        Submitting an enquiry does not confirm admission. Admission details will be shared when the process officially opens.
      </p>
    </form>
  );
};

export default EnquiryForm;
