import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Save, Printer } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECT_SUGGESTIONS = ["Mathematics", "English", "Hindi", "EVS", "Computer", "Art", "Sports", "Library", "Moral Values", "Games", "Assembly", "Break"];

const TimetablePage = () => {
  const { meta } = useAdmin();
  const [className, setClassName] = useState("Class 1");
  const [periods, setPeriods] = useState(["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"]);
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async (cls) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/timetable/${encodeURIComponent(cls)}`, { withCredentials: true });
      if (data.found) {
        setPeriods(data.periods);
        setGrid(data.grid || {});
      } else {
        setPeriods(["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"]);
        setGrid({});
      }
    } catch {
      toast.error("Could not load timetable");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(className); }, [className]);

  const setCell = (day, idx, value) => {
    setGrid((g) => {
      const row = [...(g[day] || Array(periods.length).fill(""))];
      row[idx] = value;
      return { ...g, [day]: row };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/timetable`, { class_name: className, periods, grid, published: true }, { withCredentials: true });
      toast.success(`Timetable saved for ${className}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save timetable");
    } finally {
      setSaving(false);
    }
  };

  const addPeriod = () => {
    if (periods.length >= 10) return toast.error("Maximum 10 periods");
    setPeriods((p) => [...p, `Period ${p.length + 1}`]);
  };
  const removePeriod = () => {
    if (periods.length <= 1) return;
    setPeriods((p) => p.slice(0, -1));
  };

  const inputCls = "w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-[#123D62] focus:outline-none focus:ring-1 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="timetable-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="tt_class" className="block text-xs font-semibold text-[#123D62] mb-1">Class</label>
            <select id="tt_class" value={className} onChange={(e) => setClassName(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62]" data-testid="tt-class-select">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="button" onClick={addPeriod} className="rounded-xl border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-4 py-2.5 hover:bg-slate-50" data-testid="tt-add-period">+ Period</button>
          <button type="button" onClick={removePeriod} className="rounded-xl border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-4 py-2.5 hover:bg-slate-50" data-testid="tt-remove-period">− Period</button>
          <div className="flex-1" />
          <button type="button" onClick={save} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5"
            data-testid="tt-save-btn">
            {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />} Save
          </button>
          <button type="button" onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-5 py-2.5"
            data-testid="tt-print-btn">
            <Printer size={14} aria-hidden="true" /> Print
          </button>
        </div>
        <datalist id="tt-subjects">
          {SUBJECT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="tt-grid-card">
          <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">Weekly Timetable — {className}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" data-testid="tt-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#64748B] border border-slate-200 text-left sticky left-0 bg-slate-50">Day</th>
                  {periods.map((p, i) => (
                    <th key={i} className="py-2.5 px-2 text-xs font-bold uppercase tracking-wider text-[#64748B] border border-slate-200 min-w-[110px]">
                      <input value={p} onChange={(e) => setPeriods((pp) => pp.map((x, xi) => (xi === i ? e.target.value : x)))}
                        className="w-full text-center bg-transparent font-bold text-[#64748B] focus:outline-none" aria-label={`Period ${i + 1} name`} data-testid={`tt-period-${i}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="py-2 px-4 font-semibold text-[#123D62] border border-slate-200 sticky left-0 bg-white">{day}</td>
                    {periods.map((_, i) => (
                      <td key={i} className="border border-slate-200 p-1">
                        <input list="tt-subjects" value={(grid[day] || [])[i] || ""} onChange={(e) => setCell(day, i, e.target.value)}
                          className={inputCls} aria-label={`${day} period ${i + 1}`} data-testid={`tt-cell-${day.toLowerCase()}-${i}`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;
