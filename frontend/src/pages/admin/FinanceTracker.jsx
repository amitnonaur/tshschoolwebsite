import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Download, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { API } from "../../config/school";

const fmtInr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const INVESTMENT_CATS = ["Furniture", "Building & Rooms", "Computers & Equipment", "Books & Library", "Play Area & Sports", "Electrical & Fixtures", "Other Investment"];
const OPERATIONAL_CATS = ["Salaries", "Rent", "Electricity & Utilities", "Stationery & Printing", "Maintenance & Repairs", "Transport", "Events & Activities", "Internet & Phone", "Other Expense"];

const FinanceTracker = () => {
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("operational");
  const [form, setForm] = useState({ kind: "operational", category: "", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([
        axios.get(`${API}/finance/summary`, { withCredentials: true }),
        axios.get(`${API}/finance/entries`, { withCredentials: true }),
      ]);
      setSummary(s.data);
      setEntries(e.data);
    } catch {
      toast.error("Could not load finance data");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const cats = form.kind === "investment" ? INVESTMENT_CATS : OPERATIONAL_CATS;

  const add = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || Number(form.amount) <= 0) return toast.error("Category and a positive amount are required");
    setAdding(true);
    try {
      await axios.post(`${API}/finance/entries`, { ...form, amount: Number(form.amount) }, { withCredentials: true });
      toast.success("Entry recorded");
      setForm((f) => ({ ...f, category: "", amount: "", note: "" }));
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save entry");
    } finally {
      setAdding(false);
    }
  };

  const exportCsv = async () => {
    const { data } = await axios.get(`${API}/finance/export.csv`, { withCredentials: true, responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";
  const filtered = entries.filter((e) => e.kind === tab);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={26} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>;

  return (
    <div className="space-y-5" data-testid="finance-tracker-page">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Fee Collection</p><Wallet size={17} className="text-[#16A34A]" aria-hidden="true" /></div>
          <p className="mt-1 text-2xl font-extrabold text-[#16A34A]" data-testid="fin-collection">{fmtInr(summary?.fee_collection)}</p>
          <p className="text-xs text-[#64748B] mt-0.5">session {summary?.session}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Investment</p><TrendingUp size={17} className="text-[#0756A5]" aria-hidden="true" /></div>
          <p className="mt-1 text-2xl font-extrabold text-[#0756A5]" data-testid="fin-investment">{fmtInr(summary?.investment)}</p>
          <p className="text-xs text-[#64748B] mt-0.5">one-time setup costs</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Operational Cost</p><TrendingDown size={17} className="text-[#D97706]" aria-hidden="true" /></div>
          <p className="mt-1 text-2xl font-extrabold text-[#D97706]" data-testid="fin-operational">{fmtInr(summary?.operational)}</p>
          <p className="text-xs text-[#64748B] mt-0.5">running expenses</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Net (Fees − Operational)</p>
          <p className={`mt-1 text-2xl font-extrabold ${(summary?.net_after_operational ?? 0) >= 0 ? "text-[#16A34A]" : "text-red-600"}`} data-testid="fin-net">{fmtInr(summary?.net_after_operational)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="fin-add-card">
        <h2 className="text-base font-bold text-[#123D62]">Record an Entry</h2>
        <form onSubmit={add} className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3" data-testid="fin-form">
          <div>
            <label htmlFor="fin_kind" className="block text-xs font-semibold text-[#123D62] mb-1">Type</label>
            <select id="fin_kind" value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value, category: "" }))} className={inputCls} data-testid="fin-kind-select">
              <option value="operational">Operational Cost</option>
              <option value="investment">Investment</option>
            </select>
          </div>
          <div>
            <label htmlFor="fin_cat" className="block text-xs font-semibold text-[#123D62] mb-1">Category</label>
            <select id="fin_cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} data-testid="fin-category-select">
              <option value="">Select</option>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fin_amount" className="block text-xs font-semibold text-[#123D62] mb-1">Amount (₹)</label>
            <input id="fin_amount" type="number" min="1" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className={inputCls} data-testid="fin-amount-input" />
          </div>
          <div>
            <label htmlFor="fin_date" className="block text-xs font-semibold text-[#123D62] mb-1">Date</label>
            <input id="fin_date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} data-testid="fin-date-input" />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="fin_note" className="block text-xs font-semibold text-[#123D62] mb-1">Note</label>
              <input id="fin_note" type="text" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className={inputCls} placeholder="Optional" data-testid="fin-note-input" />
            </div>
            <button type="submit" disabled={adding}
              className="rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5"
              data-testid="fin-add-btn">
              {adding ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="fin-entries-card">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Finance sections">
            {[["operational", `Operational (${entries.filter((e) => e.kind === "operational").length})`], ["investment", `Investment (${entries.filter((e) => e.kind === "investment").length})`]].map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${tab === k ? "bg-[#0756A5] text-white" : "bg-slate-100 text-[#123D62]"}`}
                data-testid={`fin-tab-${k}`}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0756A5] hover:underline" data-testid="fin-export-btn">
            <Download size={14} aria-hidden="true" /> Export CSV
          </button>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-[#64748B] px-5 py-8 text-center" data-testid="fin-empty">No {tab} entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="fin-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Date</th><th className="py-3 px-4">Category</th><th className="py-3 px-4">Amount</th><th className="py-3 px-4">Note</th><th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.entry_id} className="border-b border-slate-100">
                    <td className="py-3 px-5 text-[#64748B]">{e.date}</td>
                    <td className="py-3 px-4 font-medium text-[#123D62]">{e.category}</td>
                    <td className="py-3 px-4 font-semibold">{fmtInr(e.amount)}</td>
                    <td className="py-3 px-4 text-[#64748B]">{e.note || "—"}</td>
                    <td className="py-3 px-4">
                      <button type="button" onClick={async () => { if (window.confirm("Delete this entry?")) { await axios.delete(`${API}/finance/entries/${e.entry_id}`, { withCredentials: true }); load(); } }}
                        aria-label="Delete entry" className="text-red-500 hover:text-red-700" data-testid={`fin-delete-${e.entry_id}`}>
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
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

export default FinanceTracker;
