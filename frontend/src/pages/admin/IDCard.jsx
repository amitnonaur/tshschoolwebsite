import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Printer, ArrowLeft, User } from "lucide-react";
import { API } from "../../config/school";
import { LogoMark } from "../../components/Logo";

const IDCard = () => {
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

  if (error) return <p className="text-sm text-red-600 py-10 text-center" data-testid="idcard-error">{error}</p>;
  if (!s) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>;

  return (
    <div className="max-w-md mx-auto" data-testid="idcard-page">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/admin/students/${s.reg_id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0756A5] hover:underline" data-testid="idcard-back">
          <ArrowLeft size={15} aria-hidden="true" /> Back to Profile
        </Link>
        <button type="button" onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-2.5"
          data-testid="idcard-print-btn">
          <Printer size={15} aria-hidden="true" /> Print ID Card
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border-2 border-[#123D62] bg-white shadow-lg w-[340px] mx-auto print:shadow-none" data-testid="idcard-document">
        <div className="bg-[#123D62] px-5 py-4 flex items-center gap-3">
          <LogoMark size={40} />
          <div>
            <p className="text-white font-extrabold text-sm uppercase tracking-tight leading-tight">The Study Home School</p>
            <p className="text-[#9FBBD6] text-[10px]">Krishna Nagar, Zero Mile, Arrah, Bihar • +91 70116 15622</p>
          </div>
        </div>
        <div className="p-5 flex gap-4">
          <div className="w-24 h-28 rounded-xl bg-[#EAF0F8] overflow-hidden flex items-center justify-center text-[#94A3B8] shrink-0 border border-slate-200">
            {s.photo ? <img src={s.photo} alt={s.full_name} className="w-full h-full object-cover" /> : <User size={32} aria-hidden="true" />}
          </div>
          <div className="text-sm min-w-0">
            <p className="font-extrabold text-[#123D62] text-base leading-tight" data-testid="idcard-name">{s.full_name}</p>
            <p className="font-mono text-xs font-bold text-[#0756A5] mt-1" data-testid="idcard-regid">{s.reg_id}</p>
            <div className="mt-2 space-y-0.5 text-xs text-[#475569]">
              <p><span className="font-semibold text-[#123D62]">Class:</span> {s.class_name}{s.roll_number ? ` • Roll ${s.roll_number}` : ""}</p>
              <p><span className="font-semibold text-[#123D62]">Session:</span> 20{s.session.slice(0, 2)}–20{s.session.slice(2)}</p>
              <p><span className="font-semibold text-[#123D62]">DOB:</span> {s.dob}</p>
              <p><span className="font-semibold text-[#123D62]">Father:</span> {s.father_name}</p>
              <p><span className="font-semibold text-[#123D62]">Mobile:</span> {s.mobile_primary}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0756A5] px-5 py-2 flex items-center justify-between">
          <p className="text-white text-[10px] font-semibold tracking-wider uppercase">Student Identity Card</p>
          <p className="text-[#BFD9F2] text-[10px]">Valid for session 20{s.session.slice(0, 2)}–20{s.session.slice(2)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#64748B] text-center print:hidden">Tip: set print scale to 100% for a standard ID-card size.</p>
    </div>
  );
};

export default IDCard;
