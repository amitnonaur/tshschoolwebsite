import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const AttendanceReport = () => {
  const { meta } = useAdmin();
  const [className, setClassName] = useState("Class 1");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/attendance/report?class_name=${encodeURIComponent(className)}&month=${month}`, { withCredentials: true });
      setReport(data);
    } catch {
      toast.error("Could not load report");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    const { data } = await axios.get(`${API}/attendance/report.csv?class_name=${encodeURIComponent(className)}&month=${month}`, { withCredentials: true, responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${className}-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const selCls = "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62]";

  return (
    <div className="space-y-5" data-testid="attendance-report-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Class-wise Monthly Attendance Report</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="ar_class" className="block text-xs font-semibold text-[#123D62] mb-1">Class</label>
            <select id="ar_class" value={className} onChange={(e) => setClassName(e.target.value)} className={selCls} data-testid="ar-class-select">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ar_month" className="block text-xs font-semibold text-[#123D62] mb-1">Month</label>
            <input id="ar_month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={selCls} data-testid="ar-month-input" />
          </div>
          <button type="button" onClick={fetchReport} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5"
            data-testid="ar-fetch-btn">
            {loading && <Loader2 size={14} className="animate-spin" aria-hidden="true" />} Generate
          </button>
        </div>
      </div>

      {report && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="ar-report-card">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#123D62]">{report.class_name} — {report.month} ({report.days.length} day{report.days.length === 1 ? "" : "s"} marked)</p>
            <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0756A5] hover:underline" data-testid="ar-export-btn">
              <Download size={14} aria-hidden="true" /> Export Excel/CSV
            </button>
          </div>
          {report.rows.length === 0 ? (
            <p className="text-sm text-[#64748B] px-5 py-8 text-center">No students in this class.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="ar-table">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                    <th className="py-3 px-5 sticky left-0 bg-slate-50">Student</th>
                    <th className="py-3 px-3">P</th><th className="py-3 px-3">A</th><th className="py-3 px-3">L</th><th className="py-3 px-3">%</th>
                    {report.days.map((d) => <th key={d} className="py-3 px-2 text-center">{d.slice(8)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((r) => (
                    <tr key={r.reg_id} className="border-b border-slate-100">
                      <td className="py-2.5 px-5 font-medium text-[#123D62] sticky left-0 bg-white">{r.full_name}</td>
                      <td className="py-2.5 px-3 text-[#16A34A] font-semibold">{r.present}</td>
                      <td className="py-2.5 px-3 text-red-600 font-semibold">{r.absent}</td>
                      <td className="py-2.5 px-3 text-[#D97706] font-semibold">{r.leave}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#123D62]">{r.attendance_pct != null ? `${r.attendance_pct}%` : "—"}</td>
                      {report.days.map((d) => {
                        const st = r.days[d];
                        return (
                          <td key={d} className="py-2.5 px-2 text-center">
                            <span className={`inline-block w-6 h-6 rounded-md text-[10px] font-bold leading-6 ${
                              st === "P" ? "bg-[#EDF9F0] text-[#16A34A]" : st === "A" ? "bg-red-50 text-red-600" : st === "L" ? "bg-[#FDF6EC] text-[#D97706]" : "text-slate-300"
                            }`}>{st || "·"}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
