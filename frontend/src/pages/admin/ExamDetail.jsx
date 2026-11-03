import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MonitorPlay, Clock, Trophy, UploadCloud, ArrowLeft } from "lucide-react";
import { API } from "../../config/school";

const STATUS_STYLE = {
  draft: "bg-slate-100 text-[#64748B]",
  scheduled: "bg-[#EAF0F8] text-[#0756A5]",
  published: "bg-[#EAF0F8] text-[#0756A5]",
  live: "bg-[#EDF9F0] text-[#16A34A]",
  completed: "bg-slate-100 text-[#123D62]",
  cancelled: "bg-red-50 text-red-600",
};

const ExamDetail = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [monitor, setMonitor] = useState(null);
  const [bank, setBank] = useState([]);
  const [q, setQ] = useState({ text: "", type: "mcq", options: ["", "", "", ""], correct: [], chapter: "", difficulty: "" });
  const [adding, setAdding] = useState(false);
  const [extendMin, setExtendMin] = useState(10);

  const load = useCallback(async () => {
    try {
      const [e, m] = await Promise.all([
        axios.get(`${API}/exams/${examId}`, { withCredentials: true }),
        axios.get(`${API}/exams/${examId}/monitor`, { withCredentials: true }),
      ]);
      setExam(e.data);
      setMonitor(m.data);
      const b = await axios.get(`${API}/question-bank?class_name=${encodeURIComponent(e.data.class_name)}&subject=${encodeURIComponent(e.data.subject)}`, { withCredentials: true });
      setBank(b.data);
    } catch {
      toast.error("Could not load exam");
    }
  }, [examId]);
  useEffect(() => { load(); }, [load]);

  const addQuestion = async (e) => {
    e.preventDefault();
    if (q.text.trim().length < 3) return toast.error("Enter the question text");
    setAdding(true);
    try {
      await axios.post(`${API}/exams/${examId}/questions`, {
        text: q.text, type: q.type,
        options: q.type === "mcq" ? q.options : [],
        correct: q.correct,
        chapter: q.chapter || null, difficulty: q.difficulty || null,
      }, { withCredentials: true });
      toast.success("Question added");
      setQ({ text: "", type: "mcq", options: ["", "", "", ""], correct: [], chapter: "", difficulty: "" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not add question");
    } finally {
      setAdding(false);
    }
  };

  const importFromBank = async (qid) => {
    try {
      await axios.post(`${API}/exams/${examId}/questions/import`, { qid }, { withCredentials: true });
      toast.success("Imported from question bank");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Import failed");
    }
  };

  const setStatus = async (status) => {
    try {
      await axios.patch(`${API}/exams/${examId}/status`, { status }, { withCredentials: true });
      toast.success(`Exam ${status}`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Status change failed");
    }
  };

  const extend = async () => {
    try {
      await axios.patch(`${API}/exams/${examId}/extend`, { minutes: Number(extendMin) }, { withCredentials: true });
      toast.success(`Extended by ${extendMin} minutes`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Extend failed");
    }
  };

  const publishResults = async () => {
    if (!window.confirm("Publish results? Students will be able to view their scores.")) return;
    try {
      await axios.post(`${API}/exams/${examId}/publish-results`, {}, { withCredentials: true });
      toast.success("Results published");
      load();
    } catch {
      toast.error("Could not publish results");
    }
  };

  if (!exam) return <div className="flex justify-center py-20"><Loader2 size={26} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>;

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";
  const editable = ["draft", "scheduled"].includes(exam.effective_status);

  return (
    <div className="space-y-5" data-testid="exam-detail-page">
      <Link to="/admin/exams" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0756A5] hover:underline" data-testid="exam-back-link">
        <ArrowLeft size={15} aria-hidden="true" /> All Exams
      </Link>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#123D62]" data-testid="exam-title">{exam.name}</h2>
            <p className="text-sm text-[#64748B] mt-1">{exam.course} • {exam.class_name} • {exam.subject} • {exam.questions.length} questions • {exam.duration_minutes} min</p>
            <p className="text-xs text-[#64748B] mt-0.5">
              {new Date(exam.start_at).toLocaleString("en-IN")} → {new Date(exam.end_at).toLocaleString("en-IN")}
              {exam.negative_marking ? ` • +${exam.marks_correct} / ${exam.marks_wrong}` : ` • +${exam.marks_correct} / 0`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLE[exam.effective_status]}`} data-testid="exam-status-badge">{exam.effective_status}</span>
            {exam.effective_status === "draft" && (
              <>
                <button type="button" onClick={() => setStatus("scheduled")} className="rounded-full bg-[#0756A5] text-white text-xs font-semibold px-4 py-2" data-testid="exam-schedule-btn">Schedule</button>
                <button type="button" onClick={() => setStatus("published")} className="rounded-full bg-[#16A34A] text-white text-xs font-semibold px-4 py-2" data-testid="exam-publish-btn">Publish</button>
              </>
            )}
            {exam.effective_status === "scheduled" && (
              <button type="button" onClick={() => setStatus("published")} className="rounded-full bg-[#16A34A] text-white text-xs font-semibold px-4 py-2" data-testid="exam-publish-btn">Publish</button>
            )}
            {!["completed", "cancelled"].includes(exam.effective_status) && (
              <button type="button" onClick={() => { if (window.confirm("Cancel this exam? Students will no longer see it.")) setStatus("cancelled"); }}
                className="rounded-full border border-red-300 text-red-600 text-xs font-semibold px-4 py-2" data-testid="exam-cancel-btn">Cancel</button>
            )}
            {exam.effective_status === "live" && (
              <span className="inline-flex items-center gap-1.5">
                <input type="number" min="1" max="180" value={extendMin} onChange={(e) => setExtendMin(e.target.value)} className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" aria-label="Extend minutes" data-testid="exam-extend-input" />
                <button type="button" onClick={extend} className="inline-flex items-center gap-1 rounded-full border border-slate-300 text-[#123D62] text-xs font-semibold px-3 py-2" data-testid="exam-extend-btn">
                  <Clock size={12} aria-hidden="true" /> Extend
                </button>
              </span>
            )}
            {exam.effective_status === "completed" && !monitor?.results_published && (
              <button type="button" onClick={publishResults} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] text-white text-xs font-semibold px-4 py-2" data-testid="exam-publish-results-btn">
                <Trophy size={12} aria-hidden="true" /> Publish Results
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Question builder */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="question-builder">
          <h3 className="text-base font-bold text-[#123D62]">Questions ({exam.questions.length})</h3>
          {exam.questions.length > 0 && (
            <ol className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {exam.questions.map((qq, i) => (
                <li key={qq.qid} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm" data-testid={`question-row-${qq.qid}`}>
                  <div>
                    <p className="font-medium text-[#123D62]">{i + 1}. {qq.text}</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      {qq.options.map((o, oi) => (
                        <span key={oi} className={qq.correct.includes(oi) ? "font-semibold text-[#16A34A]" : ""}>
                          {o}{oi < qq.options.length - 1 ? " • " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                  {editable && (
                    <button type="button" onClick={async () => { await axios.delete(`${API}/exams/${examId}/questions/${qq.qid}`, { withCredentials: true }); load(); }}
                      aria-label="Delete question" className="text-red-500 hover:text-red-700 shrink-0" data-testid={`question-delete-${qq.qid}`}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ol>
          )}
          {editable ? (
            <form onSubmit={addQuestion} className="mt-4 space-y-3 border-t border-slate-100 pt-4" data-testid="question-form">
              <textarea rows={2} value={q.text} onChange={(e) => setQ((x) => ({ ...x, text: e.target.value }))}
                placeholder="Question text" className={inputCls} data-testid="question-text-input" />
              <div className="flex gap-3">
                <select value={q.type} onChange={(e) => setQ((x) => ({ ...x, type: e.target.value, correct: [] }))} className={inputCls} data-testid="question-type-select" aria-label="Question type">
                  <option value="mcq">Multiple Choice (A–D)</option>
                  <option value="truefalse">True / False</option>
                </select>
                <select value={q.difficulty} onChange={(e) => setQ((x) => ({ ...x, difficulty: e.target.value }))} className={inputCls} data-testid="question-difficulty-select" aria-label="Difficulty (for question bank)">
                  <option value="">Difficulty (optional)</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              {q.type === "mcq" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" name="correct_opt" checked={q.correct[0] === i}
                        onChange={() => setQ((x) => ({ ...x, correct: [i] }))}
                        className="w-4 h-4 accent-[#16A34A]" aria-label={`Option ${["A", "B", "C", "D"][i]} is correct`} data-testid={`question-correct-${i}`} />
                      <input type="text" value={o} placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                        onChange={(e) => setQ((x) => { const opts = [...x.options]; opts[i] = e.target.value; return { ...x, options: opts }; })}
                        className={inputCls} data-testid={`question-option-${i}`} />
                    </div>
                  ))}
                </div>
              )}
              {q.type === "truefalse" && (
                <div className="flex gap-4">
                  {["True", "False"].map((t, i) => (
                    <label key={t} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="correct_tf" checked={q.correct[0] === i}
                        onChange={() => setQ((x) => ({ ...x, correct: [i] }))}
                        className="w-4 h-4 accent-[#16A34A]" data-testid={`question-tf-${i}`} />
                      {t}
                    </label>
                  ))}
                </div>
              )}
              <input type="text" value={q.chapter} onChange={(e) => setQ((x) => ({ ...x, chapter: e.target.value }))}
                placeholder="Chapter (optional — saved to question bank)" className={inputCls} data-testid="question-chapter-input" />
              <button type="submit" disabled={adding}
                className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5"
                data-testid="question-add-btn">
                {adding ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />} Add Question
              </button>
            </form>
          ) : (
            <p className="mt-3 text-xs text-[#64748B]">Questions are locked once the exam is published.</p>
          )}
          {bank.length > 0 && editable && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">Question Bank ({bank.length})</p>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {bank.map((b) => (
                  <li key={b.qid || b.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[#123D62] truncate">{b.text}</span>
                    <button type="button" onClick={() => importFromBank(b.qid)}
                      className="text-[#0756A5] text-xs font-semibold hover:underline shrink-0" data-testid={`bank-import-${b.qid}`}>Import</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Live monitor */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="exam-monitor">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#123D62]">Live Monitor</h3>
            <button type="button" onClick={load} className="text-xs font-semibold text-[#0756A5] hover:underline" data-testid="monitor-refresh-btn">Refresh</button>
          </div>
          {monitor && (
            <>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-xl font-extrabold text-[#123D62]" data-testid="monitor-total">{monitor.total_students}</p><p className="text-xs text-[#64748B]">Students</p></div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-xl font-extrabold text-[#0756A5]" data-testid="monitor-started">{monitor.started}</p><p className="text-xs text-[#64748B]">Started</p></div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-xl font-extrabold text-[#16A34A]" data-testid="monitor-submitted">{monitor.submitted}</p><p className="text-xs text-[#64748B]">Submitted</p></div>
              </div>
              <div className="mt-4 overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm" data-testid="monitor-table">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200">
                      <th className="py-2.5 pr-3">Student</th><th className="py-2.5 pr-3">Status</th><th className="py-2.5 pr-3">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitor.participants.map((p) => (
                      <tr key={p.reg_id} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 font-medium text-[#123D62]">{p.full_name}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`text-xs font-semibold ${p.status === "submitted" ? "text-[#16A34A]" : p.status === "in_progress" ? "text-[#D97706]" : "text-[#94A3B8]"}`}>
                            {p.status === "submitted" ? "Submitted" : p.status === "in_progress" ? "In progress" : "Not started"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">{p.score != null ? `${p.score}/${p.max_score}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {exam.activity?.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5" data-testid="exam-activity">
          <h3 className="text-sm font-bold text-[#123D62] mb-2">Activity Log</h3>
          <ul className="space-y-1.5 text-xs text-[#64748B]">
            {exam.activity.slice().reverse().map((a, i) => (
              <li key={i}>{new Date(a.at).toLocaleString("en-IN")} — {a.action} ({a.by})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
