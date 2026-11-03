import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Clock, LogOut, Send, GraduationCap, Trophy } from "lucide-react";
import { LogoMark } from "../components/Logo";
import { API } from "../config/school";

const getStudent = () => {
  const raw = sessionStorage.getItem("student_exam");
  return raw ? JSON.parse(raw) : null;
};

const authHeaders = () => ({ Authorization: `Bearer ${getStudent()?.token}` });

export const StudentExams = () => {
  const [exams, setExams] = useState(null);
  const student = getStudent();
  const navigate = useNavigate();

  useEffect(() => {
    if (!student) return navigate("/exam-login");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/student/exams`, { headers: authHeaders() });
        setExams(data);
      } catch {
        sessionStorage.removeItem("student_exam");
        navigate("/exam-login");
      }
    })();
  }, []);

  const logout = () => {
    sessionStorage.removeItem("student_exam");
    navigate("/exam-login");
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#F3F6FA]" data-testid="student-exams-page">
      <header className="bg-[#123D62] text-white">
        <div className="container-site py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <div>
              <p className="font-bold text-sm">The Study Home School</p>
              <p className="text-xs text-[#9FBBD6]">{student.full_name} • {student.class_name}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white" data-testid="student-logout-btn">
            <LogOut size={14} aria-hidden="true" /> Logout
          </button>
        </div>
      </header>
      <main className="container-site py-10 max-w-3xl">
        <h1 className="text-xl font-bold text-[#123D62]">My Exams</h1>
        {!exams ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : exams.length === 0 ? (
          <div className="mt-6 card-site text-center !p-10" data-testid="student-exams-empty">
            <GraduationCap size={36} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-3 text-sm text-[#64748B]">No exams are scheduled for your class right now. Check back later.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {exams.map((e) => (
              <div key={e.exam_id} className="card-site !p-5" data-testid={`student-exam-${e.exam_id}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#123D62]">{e.name}</h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      {e.subject} • {e.duration_minutes} min • {new Date(e.start_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} – {new Date(e.end_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    {e.effective_status === "live" && e.attempts_used < e.max_attempts ? (
                      <Link to={`/exam/${e.exam_id}/take`}
                        className="rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-6 py-2.5"
                        data-testid={`student-start-${e.exam_id}`}>
                        Start Exam
                      </Link>
                    ) : e.results_published && e.attempts_used > 0 ? (
                      <Link to={`/exam/${e.exam_id}/result`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0756A5] text-white text-sm font-semibold px-6 py-2.5"
                        data-testid={`student-result-${e.exam_id}`}>
                        <Trophy size={14} aria-hidden="true" /> View Result
                      </Link>
                    ) : e.attempts_used >= e.max_attempts ? (
                      <span className="text-xs font-semibold text-[#64748B]">Attempt submitted</span>
                    ) : (
                      <span className="text-xs font-semibold text-[#D97706]">Starts {new Date(e.start_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                    )}
                  </div>
                </div>
                {e.instructions && <p className="mt-2 text-xs text-[#64748B]">{e.instructions}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export const StudentTakeExam = () => {
  const { examId } = useParams();
  const student = getStudent();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (!student) return navigate("/exam-login");
    (async () => {
      try {
        const { data } = await axios.post(`${API}/student/exams/${examId}/start`, {}, { headers: authHeaders() });
        setExamData(data);
        const end = new Date(data.deadline).getTime();
        setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
      } catch (err) {
        toast.error(err?.response?.data?.detail || "Could not start exam");
        navigate("/exam");
      }
    })();
  }, [examId]);

  const submit = useCallback(async (auto = false) => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      await axios.post(`${API}/student/exams/${examId}/submit`, { answers }, { headers: authHeaders() });
      setDone(true);
    } catch {
      toast.error("Submission failed — please tell your teacher immediately.");
      submitted.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [answers, examId]);

  useEffect(() => {
    if (timeLeft === null || done) return;
    if (timeLeft <= 0) {
      submit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, submit]);

  if (!student || !examData) {
    return <div className="min-h-screen bg-[#F3F6FA] flex items-center justify-center"><Loader2 size={26} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>;
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F3F6FA] flex items-center" data-testid="exam-submitted-page">
        <div className="container-site py-16">
          <div className="max-w-md mx-auto card-site text-center !p-10">
            <Send size={40} className="mx-auto text-[#16A34A]" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-[#123D62]">Exam Submitted</h1>
            <p className="mt-2 text-sm text-[#64748B]">Your answers have been recorded. Your teacher will publish the results.</p>
            <Link to="/exam" className="mt-6 inline-block rounded-full bg-[#0756A5] text-white text-sm font-semibold px-7 py-3" data-testid="exam-back-to-list">Back to My Exams</Link>
          </div>
        </div>
      </div>
    );
  }

  const q = examData.questions[current];
  const answered = Object.keys(answers).length;
  const mins = Math.floor((timeLeft || 0) / 60);
  const secs = (timeLeft || 0) % 60;

  return (
    <div className="min-h-screen bg-[#F3F6FA]" data-testid="take-exam-page">
      <header className="bg-[#123D62] text-white sticky top-0 z-40">
        <div className="container-site py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <LogoMark size={32} />
            <p className="font-bold text-sm truncate">{student.full_name} <span className="font-normal text-white/70">• {student.reg_id}</span></p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${timeLeft < 120 ? "bg-red-500" : "bg-white/15"}`} data-testid="exam-timer">
            <Clock size={15} aria-hidden="true" />
            {mins}:{String(secs).padStart(2, "0")}
          </div>
        </div>
      </header>
      <main className="container-site py-8 max-w-3xl">
        <div className="flex items-center justify-between text-sm text-[#64748B] mb-4">
          <span>Question {current + 1} of {examData.questions.length}</span>
          <span>{answered} answered • {examData.negative_marking ? `+${examData.marks_correct} / ${examData.marks_wrong}` : `+${examData.marks_correct} / 0`}</span>
        </div>
        <div className="card-site !p-6 sm:!p-8" data-testid={`exam-question-${current}`}>
          <h2 className="text-lg font-bold text-[#123D62]">{q.text}</h2>
          <div className="mt-5 space-y-3">
            {q.options.map((o) => {
              const checked = (answers[q.qid] || []).includes(o.index);
              return (
                <label key={o.index} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-colors text-sm ${checked ? "border-[#0756A5] bg-[#EAF0F8]" : "border-slate-200 hover:border-[#0756A5]/50"}`} data-testid={`exam-option-${o.index}`}>
                  <input type="radio" name={`q_${q.qid}`} checked={checked}
                    onChange={() => setAnswers((a) => ({ ...a, [q.qid]: [o.index] }))}
                    className="w-4 h-4 accent-[#0756A5]" />
                  <span>{o.text}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button type="button" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}
            className="rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-6 py-2.5 disabled:opacity-40"
            data-testid="exam-prev-btn">Previous</button>
          {current < examData.questions.length - 1 ? (
            <button type="button" onClick={() => setCurrent((c) => c + 1)}
              className="rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-2.5"
              data-testid="exam-next-btn">Next</button>
          ) : (
            <button type="button" disabled={submitting} onClick={() => { if (window.confirm(`Submit exam? You answered ${answered} of ${examData.questions.length} questions.`)) submit(); }}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-7 py-2.5"
              data-testid="exam-submit-btn">
              {submitting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
              Submit Exam
            </button>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-2" data-testid="exam-palette">
          {examData.questions.map((qq, i) => (
            <button key={qq.qid} type="button" onClick={() => setCurrent(i)} aria-label={`Go to question ${i + 1}`}
              className={`w-9 h-9 rounded-lg text-xs font-bold border-2 ${i === current ? "border-[#0756A5] text-[#0756A5]" : answers[qq.qid] ? "border-[#16A34A] bg-[#EDF9F0] text-[#16A34A]" : "border-slate-200 text-[#64748B]"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export const StudentExamResult = () => {
  const { examId } = useParams();
  const student = getStudent();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!student) return navigate("/exam-login");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/student/exams/${examId}/result`, { headers: authHeaders() });
        setResult(data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Result not available.");
      }
    })();
  }, [examId]);

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex items-center" data-testid="exam-result-page">
      <div className="container-site py-16">
        <div className="max-w-md mx-auto card-site text-center !p-10">
          <Trophy size={40} className="mx-auto text-[#D97706]" aria-hidden="true" />
          {result ? (
            <>
              <h1 className="mt-4 text-xl font-bold text-[#123D62]">{result.exam_name}</h1>
              <p className="text-sm text-[#64748B]">{result.subject}</p>
              <p className="mt-5 text-4xl font-extrabold text-[#0756A5]" data-testid="exam-result-score">{result.score}<span className="text-lg text-[#64748B]">/{result.max_score}</span></p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[#64748B]" data-testid="exam-result-unavailable">{error || "Loading…"}</p>
          )}
          <Link to="/exam" className="mt-6 inline-block rounded-full bg-[#0756A5] text-white text-sm font-semibold px-7 py-3" data-testid="result-back-btn">Back to My Exams</Link>
        </div>
      </div>
    </div>
  );
};
