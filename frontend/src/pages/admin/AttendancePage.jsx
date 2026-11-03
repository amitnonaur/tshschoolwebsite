import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Save, CalendarCheck } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const STATUS_STYLE = {
  P: "bg-[#16A34A] text-white",
  A: "bg-red-500 text-white",
  L: "bg-[#D97706] text-white",
};

const AttendancePage = () => {
  const { meta } = useAdmin();
  const [className, setClassName] = useState("Class 1");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchDay = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/attendance/class?class_name=${encodeURIComponent(className)}&date=${date}`, { withCredentials: true });
      setStudents(data.students);
      // default everyone to Present if not yet marked
      const rec = {};
      data.students.forEach((s) => { rec[s.reg_id] = data.records[s.reg_id] || "P"; });
      setRecords(rec);
      setMarked(data.marked);
      if (!data.students.length) toast.info(`No active students in ${className}`);
    } catch {
      toast.error("Could not load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDay(); }, [className, date]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/attendance/class`, { class_name: className, date, records }, { withCredentials: true });
      setMarked(true);
      toast.success(`Attendance saved for ${className} on ${date}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save attendance");
    } finally {
      setSaving(false);
    }
  };

  const counts = Object.values(records).reduce((a, s) => ({ ...a, [s]: (a[s] || 0) + 1 }), {});

  return (
    <div className="space-y-5" data-testid="attendance-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="att_class" className="block text-xs font-semibold text-[#123D62] mb-1">Class</label>
            <select id="att_class" value={className} onChange={(e) => setClassName(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62]" data-testid="att-class-select">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="att_date" className="block text-xs font-semibold text-[#123D62] mb-1">Date</label>
            <input id="att_date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62]" data-testid="att-date-input" />
          </div>
          {marked && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF9F0] text-[#16A34A] text-xs font-semibold px-3 py-2" data-testid="att-marked-badge">
              <CalendarCheck size={13} aria-hidden="true" /> Marked
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
      ) : students.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="att-table-card">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#123D62]">
              {students.length} students — Present <strong className="text-[#16A34A]">{counts.P || 0}</strong>, Absent <strong className="text-red-600">{counts.A || 0}</strong>, Leave <strong className="text-[#D97706]">{counts.L || 0}</strong>
            </p>
            <button type="button" onClick={() => { const r = {}; students.forEach((s) => { r[s.reg_id] = "P"; }); setRecords(r); }}
              className="text-xs font-semibold text-[#0756A5] hover:underline" data-testid="att-all-present-btn">Mark all present</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="att-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Roll</th><th className="py-3 px-4">Student</th><th className="py-3 px-4">Reg ID</th><th className="py-3 px-4">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.reg_id} className="border-b border-slate-100">
                    <td className="py-3 px-5">{s.roll_number ?? "—"}</td>
                    <td className="py-3 px-4 font-medium text-[#123D62]">{s.full_name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{s.reg_id}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2" role="radiogroup" aria-label={`Attendance for ${s.full_name}`}>
                        {[["P", "Present"], ["A", "Absent"], ["L", "Leave"]].map(([code, label]) => (
                          <button key={code} type="button"
                            onClick={() => setRecords((r) => ({ ...r, [s.reg_id]: code }))}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${records[s.reg_id] === code ? STATUS_STYLE[code] : "bg-slate-100 text-[#64748B] hover:bg-slate-200"}`}
                            aria-pressed={records[s.reg_id] === code}
                            data-testid={`att-${s.reg_id}-${code}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={save} disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-7 py-2.5"
              data-testid="att-save-btn">
              {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
