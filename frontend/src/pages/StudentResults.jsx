import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { LogOut, GraduationCap, Trophy, ClipboardList } from "lucide-react";
import { LogoMark } from "../components/Logo";
import { API } from "../config/school";

const getStudent = () => {
  const raw = sessionStorage.getItem("student_exam");
  return raw ? JSON.parse(raw) : null;
};

const StudentResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const student = getStudent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!student) return navigate("/exam-login");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/student/results`, { headers: { Authorization: `Bearer ${student.token}` } });
        setData(data);
      } catch {
        sessionStorage.removeItem("student_exam");
        navigate("/exam-login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => {
    sessionStorage.removeItem("student_exam");
    navigate("/exam-login");
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#F3F6FA]" data-testid="student-results-page">
      <header className="bg-[#123D62] text-white">
        <div className="container-site py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-bold text-sm">The Study Home School</p>
              <p className="text-xs text-[#9FBBD6]">{student.full_name} • {student.class_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/exam" className="text-xs font-semibold text-white/80 hover:text-white" data-testid="results-to-exams-link">My Exams</Link>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white" data-testid="results-logout-btn">
              <LogOut size={14} aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container-site py-10 max-w-3xl">
        <h1 className="text-xl font-bold text-[#123D62]">My Results</h1>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>
        ) : (
          <>
            <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-[#64748B]">Monthly Test Results</h2>
            {data.monthly_results.length === 0 ? (
              <div className="mt-3 card-site text-center !p-8" data-testid="results-empty">
                <ClipboardList size={30} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
                <p className="mt-2 text-sm text-[#64748B]">No published monthly test results yet.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {data.monthly_results.map((r, i) => (
                  <div key={i} className="card-site !p-5" data-testid={`result-card-${i}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#123D62]">{r.month} {r.year} <span className="font-normal text-[#64748B]">• {r.class_name}</span></p>
                        <p className="text-xs text-[#64748B] mt-0.5">Rank {r.rank} of {r.class_strength} • Class average {r.class_average}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-[#0756A5]">{r.percentage}%</p>
                        <p className="text-xs font-semibold text-[#64748B]">{r.total}/{r.max_total} • Grade {r.grade}</p>
                      </div>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200">
                            {r.subjects.map((s) => <th key={s} className="py-2 pr-4">{s}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {r.subjects.map((s) => (
                              <td key={s} className="py-2 pr-4 font-medium text-[#123D62]">
                                {r.marks[s] == null ? <span className="text-[#D97706]">Absent</span> : `${r.marks[s]}/${r.max_marks[s] ?? 100}`}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-[#64748B]">Online Exam Results</h2>
            {data.exam_results.length === 0 ? (
              <div className="mt-3 card-site text-center !p-8" data-testid="exam-results-empty">
                <GraduationCap size={30} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
                <p className="mt-2 text-sm text-[#64748B]">No published online exam results yet.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {data.exam_results.map((r, i) => (
                  <div key={i} className="card-site !p-5 flex items-center justify-between" data-testid={`exam-result-card-${i}`}>
                    <div>
                      <p className="font-bold text-[#123D62]">{r.exam_name}</p>
                      <p className="text-xs text-[#64748B]">{r.subject} • {r.class_name}</p>
                    </div>
                    <p className="text-xl font-extrabold text-[#16A34A] inline-flex items-center gap-1.5"><Trophy size={17} aria-hidden="true" />{r.score}/{r.max_score}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StudentResults;
