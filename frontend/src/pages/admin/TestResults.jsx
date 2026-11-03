import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Save, Download, Trophy } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = [2026, 2027, 2028, 2029, 2030];

const TestResults = () => {
  const { meta } = useAdmin();
  const [course, setCourse] = useState("Primary");
  const [className, setClassName] = useState("Class 1");
  const [month, setMonth] = useState("November");
  const [year, setYear] = useState(new Date().getFullYear());
  const [subjects, setSubjects] = useState([]);
  const [maxMarks, setMaxMarks] = useState({});
  const [rows, setRows] = useState(null);
  const [marks, setMarks] = useState({});
  const [published, setPublished] = useState(false);
  const [ranking, setRanking] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBatch = async () => {
    setFetching(true);
    setRows(null);
    setRanking(null);
    try {
      const [batchRes, existingRes] = await Promise.all([
        axios.get(`${API}/results/fetch-batch?class_name=${encodeURIComponent(className)}&session=${meta.session}`, { withCredentials: true }),
        axios.get(`${API}/results?course=${encodeURIComponent(course)}&class_name=${encodeURIComponent(className)}&month=${month}&year=${year}`, { withCredentials: true }),
      ]);
      const batch = batchRes.data;
      const subjSet = new Set();
      batch.forEach((s) => (s.subjects || []).forEach((x) => subjSet.add(x)));
      let subj = [...subjSet];
      if (existingRes.data.found) {
        subj = existingRes.data.subjects;
        setMaxMarks(existingRes.data.max_marks);
        const m = {};
        existingRes.data.rows.forEach((r) => { m[r.reg_id] = r.marks; });
        setMarks(m);
        setPublished(existingRes.data.published);
      } else {
        setMaxMarks(Object.fromEntries(subj.map((s) => [s, 100])));
        setMarks({});
        setPublished(false);
      }
      setSubjects(subj.length ? subj : meta.default_subjects);
      setRows(batch);
      if (!batch.length) toast.info(`No active students in ${className} (${meta.session})`);
    } catch {
      toast.error("Could not fetch batch");
    } finally {
      setFetching(false);
    }
  };

  const setMark = (regId, subject, value) => {
    setMarks((m) => ({
      ...m,
      [regId]: { ...(m[regId] || {}), [subject]: value === "" ? null : Math.min(Number(value), maxMarks[subject] ?? 100) },
    }));
  };

  const computeRow = (regId) => {
    const entry = marks[regId] || {};
    const total = subjects.reduce((a, s) => a + (entry[s] ?? 0), 0);
    const maxTotal = subjects.reduce((a, s) => a + (maxMarks[s] ?? 100), 0);
    const pct = maxTotal ? Math.round((total / maxTotal) * 10000) / 100 : 0;
    return { total, maxTotal, pct };
  };

  const save = async (publish) => {
    if (!rows?.length) return;
    setSaving(true);
    try {
      const entries = rows.map((r) => ({ reg_id: r.reg_id, marks: subjects.reduce((o, s) => ({ ...o, [s]: marks[r.reg_id]?.[s] ?? null }), {}) }));
      const { data } = await axios.post(`${API}/results`, {
        course, class_name: className, month, year, subjects, max_marks: maxMarks, entries, published: publish,
      }, { withCredentials: true });
      setPublished(publish);
      toast.success(publish ? "Results saved and published" : "Marks saved (not yet published)");
      loadRanking();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save results");
    } finally {
      setSaving(false);
    }
  };

  const loadRanking = async () => {
    try {
      const { data } = await axios.get(`${API}/results/ranking?course=${encodeURIComponent(course)}&class_name=${encodeURIComponent(className)}&month=${month}&year=${year}`, { withCredentials: true });
      if (data.found) setRanking(data);
    } catch { /* no ranking yet */ }
  };

  const exportCsv = async () => {
    const { data } = await axios.get(`${API}/results/export.csv?course=${encodeURIComponent(course)}&class_name=${encodeURIComponent(className)}&month=${month}&year=${year}`, { withCredentials: true, responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results-${className}-${month}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selCls = "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62] w-full";
  const nameOf = (regId) => rows?.find((r) => r.reg_id === regId)?.full_name || regId;

  return (
    <div className="space-y-5" data-testid="test-results-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Monthly Test — Marks Entry</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label htmlFor="tr_course" className="block text-xs font-semibold text-[#123D62] mb-1">Course</label>
            <select id="tr_course" value={course} onChange={(e) => setCourse(e.target.value)} className={selCls} data-testid="tr-course">
              {(meta?.courses || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tr_class" className="block text-xs font-semibold text-[#123D62] mb-1">Class</label>
            <select id="tr_class" value={className} onChange={(e) => setClassName(e.target.value)} className={selCls} data-testid="tr-class">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tr_month" className="block text-xs font-semibold text-[#123D62] mb-1">Test Month</label>
            <select id="tr_month" value={month} onChange={(e) => setMonth(e.target.value)} className={selCls} data-testid="tr-month">
              {MONTH_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tr_year" className="block text-xs font-semibold text-[#123D62] mb-1">Test Year</label>
            <select id="tr_year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={selCls} data-testid="tr-year">
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={fetchBatch} disabled={fetching}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5"
              data-testid="tr-fetch-btn">
              {fetching && <Loader2 size={14} className="animate-spin" aria-hidden="true" />} Fetch Batch
            </button>
          </div>
        </div>
      </div>

      {rows && rows.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="tr-marks-card">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="text-sm font-bold text-[#123D62]">{rows.length} students — leave a subject blank for absent</p>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              Max marks:
              {subjects.map((s) => (
                <span key={s} className="inline-flex items-center gap-1">
                  {s}
                  <input type="number" min="1" value={maxMarks[s] ?? 100}
                    onChange={(e) => setMaxMarks((m) => ({ ...m, [s]: Number(e.target.value) || 100 }))}
                    className="w-16 rounded-lg border border-slate-300 px-2 py-1" aria-label={`Max marks for ${s}`} data-testid={`tr-max-${s.toLowerCase().replace(/\s/g, "-")}`} />
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="tr-marks-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Roll</th><th className="py-3 px-4">Student</th>
                  {subjects.map((s) => <th key={s} className="py-3 px-3">{s}</th>)}
                  <th className="py-3 px-3">Total</th><th className="py-3 px-3">%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const c = computeRow(r.reg_id);
                  return (
                    <tr key={r.reg_id} className="border-b border-slate-100">
                      <td className="py-2.5 px-5">{r.roll_number ?? "—"}</td>
                      <td className="py-2.5 px-4 font-medium text-[#123D62]">{r.full_name}<span className="block font-mono text-[10px] text-[#94A3B8]">{r.reg_id}</span></td>
                      {subjects.map((s) => (
                        <td key={s} className="py-2.5 px-3">
                          <input type="number" min="0" max={maxMarks[s] ?? 100} value={marks[r.reg_id]?.[s] ?? ""}
                            onChange={(e) => setMark(r.reg_id, s, e.target.value)}
                            className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm"
                            aria-label={`${s} marks for ${r.full_name}`} data-testid={`tr-mark-${r.reg_id}-${s.toLowerCase().replace(/\s/g, "-")}`} />
                        </td>
                      ))}
                      <td className="py-2.5 px-3 font-semibold text-[#123D62]">{c.total}/{c.maxTotal}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0756A5]">{c.pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap gap-3">
            <button type="button" onClick={() => save(false)} disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="tr-save-btn">
              {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Save Marks
            </button>
            <button type="button" onClick={() => { if (window.confirm("Publish these results? Students/parents will be able to view them once student result viewing is enabled.")) save(true); }} disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="tr-publish-btn">
              <Trophy size={15} aria-hidden="true" /> Save & Publish
            </button>
            <button type="button" onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-6 py-2.5 hover:bg-slate-50"
              data-testid="tr-export-btn">
              <Download size={15} aria-hidden="true" /> Export Excel/CSV
            </button>
            <button type="button" onClick={loadRanking}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-6 py-2.5 hover:bg-slate-50"
              data-testid="tr-ranking-btn">
              Show Ranking
            </button>
          </div>
        </div>
      )}

      {ranking && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="tr-ranking-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#123D62]">Live Ranking — {className}, {month} {year}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ranking.published ? "bg-[#EDF9F0] text-[#16A34A]" : "bg-[#FDF6EC] text-[#D97706]"}`}>
              {ranking.published ? "Published" : "Draft (not published)"}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[ranking.first, ranking.second, ranking.third].filter(Boolean).map((r, i) => (
              <div key={r.reg_id} className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center" data-testid={`tr-rank-${i + 1}`}>
                <p className="text-2xl" aria-hidden="true">{["🥇", "🥈", "🥉"][i]}</p>
                <p className="mt-1 font-bold text-[#123D62] text-sm">{nameOf(r.reg_id)}</p>
                <p className="text-xs text-[#64748B]">{r.total}/{r.max_total} • {r.percentage}% • {r.grade}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-[#64748B]">Class Average</p><p className="font-bold text-[#123D62]">{ranking.class_average}</p></div>
            <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-[#64748B]">Highest</p><p className="font-bold text-[#16A34A]">{ranking.highest}</p></div>
            <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-[#64748B]">Lowest</p><p className="font-bold text-[#D97706]">{ranking.lowest}</p></div>
            <div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-[#64748B]">Students</p><p className="font-bold text-[#123D62]">{ranking.count}</p></div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm" data-testid="tr-top10-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-4">Rank</th><th className="py-2.5 px-4">Student</th><th className="py-2.5 px-4">Total</th><th className="py-2.5 px-4">%</th><th className="py-2.5 px-4">Grade</th>
                </tr>
              </thead>
              <tbody>
                {ranking.top.map((r) => (
                  <tr key={r.reg_id} className="border-b border-slate-100">
                    <td className="py-2.5 px-4 font-bold text-[#0756A5]">#{r.rank}</td>
                    <td className="py-2.5 px-4 font-medium text-[#123D62]">{nameOf(r.reg_id)}</td>
                    <td className="py-2.5 px-4">{r.total}/{r.max_total}</td>
                    <td className="py-2.5 px-4">{r.percentage}%</td>
                    <td className="py-2.5 px-4">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-[#64748B]">
            Subject averages: {Object.entries(ranking.subject_average).map(([s, v]) => `${s} ${v ?? "—"}`).join(" • ")}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults;
