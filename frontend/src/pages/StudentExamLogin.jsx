import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";
import { LogoMark } from "../components/Logo";
import { API } from "../config/school";

const StudentExamLogin = () => {
  const [regId, setRegId] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/exam-login`, { reg_id: regId.trim(), dob });
      sessionStorage.setItem("student_exam", JSON.stringify({ token: data.token, full_name: data.full_name, class_name: data.class_name, reg_id: data.reg_id }));
      navigate("/exam");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed. Please check your details.");
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex items-center" data-testid="student-login-page">
      <div className="container-site py-16">
        <div className="max-w-md mx-auto card-site !p-8 sm:!p-10">
          <div className="text-center">
            <div className="mx-auto w-fit"><LogoMark size={56} /></div>
            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-[#123D62]">Student Exam Login</h1>
            <p className="mt-1 text-sm text-[#64748B]">Enter your Registration ID and date of birth to take your exam.</p>
          </div>
          <form onSubmit={onSubmit} className="mt-7 space-y-5" data-testid="student-login-form">
            <div>
              <label htmlFor="stu_reg" className="block text-sm font-semibold text-[#123D62] mb-1.5">Registration ID</label>
              <input id="stu_reg" type="text" required value={regId} onChange={(e) => setRegId(e.target.value)}
                placeholder="e.g. TSH27280001" className={inputCls} data-testid="student-regid-input" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="stu_dob" className="block text-sm font-semibold text-[#123D62] mb-1.5">Date of Birth</label>
              <input id="stu_dob" type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
                className={inputCls} data-testid="student-dob-input" />
            </div>
            {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert" data-testid="student-login-error">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 transition-colors"
              data-testid="student-login-submit">
              {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <GraduationCap size={17} aria-hidden="true" />}
              {loading ? "Checking…" : "View My Exams"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-[#64748B]">
            Are you the school admin? <Link to="/admin/login" className="text-[#0756A5] font-semibold hover:underline">Admin login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentExamLogin;
