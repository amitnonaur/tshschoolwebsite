import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Printer, ArrowLeft } from "lucide-react";
import { API } from "../../config/school";
import { LogoMark } from "../../components/Logo";

const AdmissionPrint = () => {
  const { regId } = useParams();
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/students/${regId}`, { withCredentials: true });
        setS(data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Student not found.");
      }
    })();
  }, [regId]);

  if (error) return <p className="text-sm text-red-600 py-10 text-center" data-testid="admission-print-error">{error}</p>;
  if (!s) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>;

  const Row = ({ label, value }) => (
    <tr>
      <td className="py-2 px-3 text-xs font-semibold text-[#64748B] border border-slate-300 w-44 bg-slate-50">{label}</td>
      <td className="py-2 px-3 text-sm text-[#123D62] border border-slate-300">{value || "—"}</td>
    </tr>
  );

  return (
    <div className="max-w-3xl mx-auto" data-testid="admission-print-page">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/admin/students/${s.reg_id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0756A5] hover:underline" data-testid="admission-print-back">
          <ArrowLeft size={15} aria-hidden="true" /> Back to Profile
        </Link>
        <button type="button" onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-2.5"
          data-testid="admission-print-btn">
          <Printer size={15} aria-hidden="true" /> Print A4 / Save as PDF
        </button>
      </div>

      <div className="rounded-2xl bg-white border-2 border-[#123D62] p-8 sm:p-10" data-testid="admission-document">
        <div className="flex items-center justify-between border-b-2 border-[#123D62] pb-5">
          <div className="flex items-center gap-3">
            <LogoMark size={56} />
            <div>
              <p className="font-extrabold text-[#123D62] uppercase tracking-tight text-lg">The Study Home School</p>
              <p className="text-xs text-[#64748B]">South Bhelai Road, Krishna Nagar, Zero Mile, Arrah, Bihar</p>
              <p className="text-xs text-[#64748B]">+91 70116 15622 • thestudyhomeschool@gmail.com</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Admission Form</p>
            <p className="text-xs text-[#64748B]">Academic Session 20{s.session.slice(0, 2)}–20{s.session.slice(2)}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          <div className="flex-1">
            <div className="rounded-xl bg-[#EAF0F8] border border-[#C9DCF0] px-4 py-3 inline-block">
              <p className="text-xs text-[#64748B]">Registration ID</p>
              <p className="font-mono font-extrabold text-lg text-[#0756A5]" data-testid="admission-print-regid">{s.reg_id}</p>
            </div>
            <table className="mt-4 w-full border-collapse">
              <tbody>
                <Row label="Student's Full Name" value={s.full_name} />
                <Row label="Date of Birth" value={s.dob} />
                <Row label="Gender" value={s.gender} />
                <Row label="Admission Date" value={s.admission_date} />
                <Row label="Father's Name" value={s.father_name} />
                <Row label="Mother's Name" value={s.mother_name} />
                <Row label="Primary Mobile" value={s.mobile_primary} />
                <Row label="Alternative Mobile" value={s.mobile_alt} />
                <Row label="Permanent Address" value={s.address} />
                <Row label="Previous School" value={s.previous_school} />
              </tbody>
            </table>
          </div>
          <div className="w-32 shrink-0">
            <div className="w-32 h-40 rounded-lg border-2 border-slate-300 overflow-hidden bg-slate-50 flex items-center justify-center text-slate-400 text-xs text-center p-2">
              {s.photo ? <img src={s.photo} alt={`Photograph of ${s.full_name}`} className="w-full h-full object-cover" /> : "Affix passport photo"}
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#64748B]">Course & Office Details</p>
        <table className="mt-2 w-full border-collapse">
          <tbody>
            <Row label="Course" value={s.course} />
            <Row label="Class" value={s.class_name} />
            <Row label="Roll Number" value={s.roll_number} />
            <Row label="Subjects" value={(s.subjects || []).join(", ")} />
            <Row label="Annual Course Fee" value={s.annual_fee ? `₹${Number(s.annual_fee).toLocaleString("en-IN")}` : "—"} />
            <Row label="Session" value={`${s.session_start} to ${s.session_end}`} />
            <Row label="Admission Status" value={s.admission_status} />
          </tbody>
        </table>

        <p className="mt-6 text-xs leading-relaxed text-[#475569]">
          Declaration: I certify that the information provided above is correct to the best of my knowledge.
          I agree to follow the school's rules and fee schedule as communicated by the school.
        </p>
        <div className="mt-10 flex items-end justify-between">
          <div className="text-center">
            <div className="w-44 border-b border-slate-400 mb-1.5 h-10" />
            <p className="text-xs font-semibold text-[#123D62]">Parent / Guardian Signature</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-slate-400 mb-1.5 h-10" />
            <p className="text-xs font-semibold text-[#123D62]">Date</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-slate-400 mb-1.5 h-10" />
            <p className="text-xs font-semibold text-[#123D62]">School Seal & Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionPrint;
