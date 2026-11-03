import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Save, Search, IndianRupee } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const fmtInr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const METHODS = ["Cash", "UPI", "Bank Transfer", "Cheque", "Other"];

const FeeManager = () => {
  const { meta } = useAdmin();
  const [searchParams] = useSearchParams();
  const [defaults, setDefaults] = useState({});
  const [summary, setSummary] = useState(null);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [q, setQ] = useState(searchParams.get("student") || "");
  const [found, setFound] = useState(null);
  const [pay, setPay] = useState({ month: "April", amount: "", method: "Cash", note: "" });
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, s] = await Promise.all([
          axios.get(`${API}/fees/defaults`, { withCredentials: true }),
          axios.get(`${API}/fees/summary`, { withCredentials: true }),
        ]);
        setDefaults(d.data.fee_defaults || {});
        setSummary(s.data);
        if (searchParams.get("student")) searchStudent(searchParams.get("student"));
      } catch {
        toast.error("Could not load fee data");
      }
    })();
  }, []);

  const saveDefaults = async () => {
    setSavingDefaults(true);
    try {
      await axios.put(`${API}/fees/defaults`, { fee_defaults: defaults }, { withCredentials: true });
      toast.success("Default fees saved — new admissions will auto-fill these");
    } catch {
      toast.error("Could not save defaults");
    } finally {
      setSavingDefaults(false);
    }
  };

  const searchStudent = async (term = q) => {
    if (!term.trim()) return;
    try {
      const { data } = await axios.get(`${API}/fees/student/${encodeURIComponent(term.trim())}`, { withCredentials: true });
      setFound(data);
      setPay((p) => ({ ...p, amount: Math.round((data.student.annual_fee || 0) / 12) }));
    } catch {
      try {
        const { data } = await axios.get(`${API}/students?q=${encodeURIComponent(term.trim())}&limit=1`, { withCredentials: true });
        if (data.students.length) {
          const { data: f } = await axios.get(`${API}/fees/student/${data.students[0].reg_id}`, { withCredentials: true });
          setFound(f);
          setPay((p) => ({ ...p, amount: Math.round((f.student.annual_fee || 0) / 12) }));
        } else {
          setFound(null);
          toast.error("No student found");
        }
      } catch {
        toast.error("No student found");
      }
    }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    if (!found) return;
    setRecording(true);
    try {
      await axios.post(`${API}/fees/payments`, { reg_id: found.student.reg_id, ...pay, amount: Number(pay.amount) }, { withCredentials: true });
      toast.success(`Payment of ${fmtInr(pay.amount)} recorded for ${found.student.full_name}`);
      searchStudent(found.student.reg_id);
      const s = await axios.get(`${API}/fees/summary`, { withCredentials: true });
      setSummary(s.data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not record payment");
    } finally {
      setRecording(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="fee-manager-page">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Collected ({summary.session})</p>
            <p className="mt-1 text-2xl font-extrabold text-[#16A34A]" data-testid="fee-collected">{fmtInr(summary.collected)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Total Dues</p>
            <p className="mt-1 text-2xl font-extrabold text-[#D97706]" data-testid="fee-dues">{fmtInr(summary.total_dues)}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Expected Annually</p>
            <p className="mt-1 text-2xl font-extrabold text-[#123D62]" data-testid="fee-expected">{fmtInr(summary.expected)}</p>
          </div>
        </div>
      )}

      {/* Record payment */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="record-payment-card">
        <h2 className="text-base font-bold text-[#123D62]">Record a Payment</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchStudent())}
              placeholder="Student name or Registration ID"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40"
              data-testid="fee-search-input" />
          </div>
          <button type="button" onClick={() => searchStudent()}
            className="rounded-xl bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-2.5"
            data-testid="fee-search-btn">Find Student</button>
        </div>

        {found && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="fee-student-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#123D62]" data-testid="fee-student-name">{found.student.full_name} <span className="font-mono text-xs text-[#64748B]">{found.student.reg_id}</span></p>
                <p className="text-xs text-[#64748B] mt-0.5">{found.student.course} • {found.student.class_name} • Annual fee {fmtInr(found.student.annual_fee)}</p>
              </div>
              <div className="text-sm">
                <span className="text-[#16A34A] font-semibold">Paid {fmtInr(found.total_paid)}</span>
                <span className="mx-2 text-slate-300">|</span>
                <span className="text-[#D97706] font-semibold" data-testid="fee-student-due">Due {fmtInr(found.due)}</span>
              </div>
            </div>
            <form onSubmit={recordPayment} className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label htmlFor="pay_month" className="block text-xs font-semibold text-[#123D62] mb-1">Month</label>
                <select id="pay_month" value={pay.month} onChange={(e) => setPay((p) => ({ ...p, month: e.target.value }))} className={inputCls} data-testid="pay-month-select">
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pay_amount" className="block text-xs font-semibold text-[#123D62] mb-1">Amount (₹)</label>
                <input id="pay_amount" type="number" min="1" required value={pay.amount} onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))} className={inputCls} data-testid="pay-amount-input" />
              </div>
              <div>
                <label htmlFor="pay_method" className="block text-xs font-semibold text-[#123D62] mb-1">Method</label>
                <select id="pay_method" value={pay.method} onChange={(e) => setPay((p) => ({ ...p, method: e.target.value }))} className={inputCls} data-testid="pay-method-select">
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pay_note" className="block text-xs font-semibold text-[#123D62] mb-1">Note</label>
                <input id="pay_note" type="text" value={pay.note} onChange={(e) => setPay((p) => ({ ...p, note: e.target.value }))} className={inputCls} placeholder="Optional" data-testid="pay-note-input" />
              </div>
              <div className="flex items-end">
                <button type="submit" disabled={recording}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5"
                  data-testid="pay-record-btn">
                  {recording ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <IndianRupee size={15} aria-hidden="true" />}
                  Record
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Dues list */}
      {summary && summary.dues.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="dues-table-card">
          <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">Outstanding Dues ({summary.dues.length} students)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Reg ID</th><th className="py-3 px-4">Student</th><th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Pending Months</th><th className="py-3 px-4">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {summary.dues.map((d) => (
                  <tr key={d.reg_id} className="border-b border-slate-100">
                    <td className="py-3 px-5 font-mono text-xs">{d.reg_id}</td>
                    <td className="py-3 px-4 font-medium text-[#123D62]">{d.full_name}</td>
                    <td className="py-3 px-4">{d.class_name}</td>
                    <td className="py-3 px-4 text-[#64748B]">{d.pending_months.slice(0, 4).join(", ")}{d.pending_months.length > 4 ? ` +${d.pending_months.length - 4}` : ""}</td>
                    <td className="py-3 px-4 font-semibold text-[#D97706]">{fmtInr(d.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fee defaults */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="fee-defaults-card">
        <h2 className="text-base font-bold text-[#123D62]">Default Annual Fees by Class</h2>
        <p className="mt-1 text-xs text-[#64748B]">These auto-fill the admission form. You can adjust per student during admission.</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(meta?.all_classes || []).map((c) => (
            <div key={c}>
              <label htmlFor={`def_${c}`} className="block text-xs font-semibold text-[#123D62] mb-1">{c}</label>
              <input id={`def_${c}`} type="number" min="0" value={defaults[c] ?? ""} placeholder="₹/year"
                onChange={(e) => setDefaults((d) => ({ ...d, [c]: e.target.value }))}
                className={inputCls} data-testid={`fee-default-${c.toLowerCase().replace(/\s/g, "-")}`} />
            </div>
          ))}
        </div>
        <button type="button" onClick={saveDefaults} disabled={savingDefaults}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
          data-testid="fee-defaults-save-btn">
          {savingDefaults ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
          Save Defaults
        </button>
      </div>
    </div>
  );
};

export default FeeManager;
