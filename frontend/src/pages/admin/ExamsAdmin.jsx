import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Plus, MonitorPlay, Trash2, Clock, Eye, UploadCloud } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const STATUS_STYLE = {
  draft: "bg-slate-100 text-[#64748B]",
  scheduled: "bg-[#EAF0F8] text-[#0756A5]",
  published: "bg-[#EAF0F8] text-[#0756A5]",
  live: "bg-[#EDF9F0] text-[#16A34A]",
  completed: "bg-slate-100 text-[#123D62]",
  cancelled: "bg-red-50 text-red-600",
};

const emptyExam = {
  name: "", course: "Primary", class_name: "Class 1", subject: "", start_at: "", end_at: "",
  duration_minutes: 30, max_attempts: 1, instructions: "", negative_marking: true,
  marks_correct: 2, marks_wrong: -0.5, shuffle_questions: true, shuffle_options: true,
};

const ExamsAdmin = () => {
  const { meta } = useAdmin();
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(emptyExam);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/exams`, { withCredentials: true });
      setExams(data);
    } catch {
      toast.error("Could not load exams");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim() || !form.start_at || !form.end_at) {
      return toast.error("Fill name, subject, start and end time");
    }
    setCreating(true);
    try {
      const { data } = await axios.post(`${API}/exams`, {
        ...form,
        duration_minutes: Number(form.duration_minutes),
        max_attempts: Number(form.max_attempts),
        marks_correct: Number(form.marks_correct),
        marks_wrong: Number(form.marks_wrong),
      }, { withCredentials: true });
      toast.success("Exam created — now add questions");
      setForm(emptyExam);
      load();
      window.location.href = `/admin/exams/${data.exam_id}`;
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not create exam");
      setCreating(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="exams-admin-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Schedule & Create Exam</h2>
        <form onSubmit={create} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="exam-create-form">
          <div>
            <label htmlFor="ex_name" className="block text-xs font-semibold text-[#123D62] mb-1">Test Name *</label>
            <input id="ex_name" type="text" value={form.name} onChange={set("name")} className={inputCls} placeholder="e.g. Maths Weekly Test" data-testid="exam-name-input" />
          </div>
          <div>
            <label htmlFor="ex_course" className="block text-xs font-semibold text-[#123D62] mb-1">Course</label>
            <select id="ex_course" value={form.course} onChange={set("course")} className={inputCls} data-testid="exam-course-select">
              {(meta?.courses || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ex_class" className="block text-xs font-semibold text-[#123D62] mb-1">Target Class</label>
            <select id="ex_class" value={form.class_name} onChange={set("class_name")} className={inputCls} data-testid="exam-class-select">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ex_subject" className="block text-xs font-semibold text-[#123D62] mb-1">Subject *</label>
            <input id="ex_subject" type="text" value={form.subject} onChange={set("subject")} className={inputCls} placeholder="e.g. Mathematics" data-testid="exam-subject-input" />
          </div>
          <div>
            <label htmlFor="ex_start" className="block text-xs font-semibold text-[#123D62] mb-1">Start Date & Time *</label>
            <input id="ex_start" type="datetime-local" value={form.start_at} onChange={set("start_at")} className={inputCls} data-testid="exam-start-input" />
          </div>
          <div>
            <label htmlFor="ex_end" className="block text-xs font-semibold text-[#123D62] mb-1">End Date & Time *</label>
            <input id="ex_end" type="datetime-local" value={form.end_at} onChange={set("end_at")} className={inputCls} data-testid="exam-end-input" />
          </div>
          <div>
            <label htmlFor="ex_duration" className="block text-xs font-semibold text-[#123D62] mb-1">Duration (minutes)</label>
            <input id="ex_duration" type="number" min="5" max="300" value={form.duration_minutes} onChange={set("duration_minutes")} className={inputCls} data-testid="exam-duration-input" />
          </div>
          <div>
            <label htmlFor="ex_attempts" className="block text-xs font-semibold text-[#123D62] mb-1">Max Attempts</label>
            <input id="ex_attempts" type="number" min="1" max="5" value={form.max_attempts} onChange={set("max_attempts")} className={inputCls} data-testid="exam-attempts-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ex_correct" className="block text-xs font-semibold text-[#123D62] mb-1">Marks / Correct</label>
              <input id="ex_correct" type="number" step="0.5" min="0.5" value={form.marks_correct} onChange={set("marks_correct")} className={inputCls} data-testid="exam-marks-correct-input" />
            </div>
            <div>
              <label htmlFor="ex_wrong" className="block text-xs font-semibold text-[#123D62] mb-1">Marks / Wrong</label>
              <input id="ex_wrong" type="number" step="0.5" max="0" value={form.marks_wrong} onChange={set("marks_wrong")} className={inputCls} data-testid="exam-marks-wrong-input" />
            </div>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="ex_instructions" className="block text-xs font-semibold text-[#123D62] mb-1">Instructions</label>
            <textarea id="ex_instructions" rows={2} value={form.instructions} onChange={set("instructions")} className={inputCls} data-testid="exam-instructions-input" />
          </div>
          <div className="sm:col-span-3 flex flex-wrap gap-5">
            {[["negative_marking", "Negative marking"], ["shuffle_questions", "Shuffle questions"], ["shuffle_options", "Shuffle options"]].map(([k, label]) => (
              <label key={k} className="inline-flex items-center gap-2 text-sm text-[#123D62] cursor-pointer">
                <input type="checkbox" checked={form[k]} onChange={set(k)} className="w-4 h-4 accent-[#0756A5]" data-testid={`exam-${k.replace(/_/g, "-")}-check`} />
                {label}
              </label>
            ))}
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="exam-create-btn">
              {creating ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
              Create Exam
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="exams-list-card">
        <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">All Exams ({exams.length})</p>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : exams.length === 0 ? (
          <p className="text-sm text-[#64748B] px-5 py-8 text-center" data-testid="exams-empty">No exams yet. Create your first exam above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="exams-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Exam</th><th className="py-3 px-4">Class</th><th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Schedule</th><th className="py-3 px-4">Questions</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.exam_id} className="border-b border-slate-100">
                    <td className="py-3 px-5 font-medium text-[#123D62]">{e.name}</td>
                    <td className="py-3 px-4">{e.class_name}</td>
                    <td className="py-3 px-4">{e.subject}</td>
                    <td className="py-3 px-4 text-xs text-[#64748B]">{new Date(e.start_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                    <td className="py-3 px-4">{e.question_count}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[e.effective_status] || STATUS_STYLE.draft}`} data-testid={`exam-status-${e.exam_id}`}>{e.effective_status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/exams/${e.exam_id}`} className="text-[#0756A5] font-semibold text-xs hover:underline" data-testid={`exam-open-${e.exam_id}`}>Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamsAdmin;
