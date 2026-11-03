import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, ArrowUpRightSquare } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const DECISIONS = ["Promote", "Hold Back", "Transfer Out", "Mark Inactive"];

const PromoteBatch = () => {
  const { meta } = useAdmin();
  const [fromClass, setFromClass] = useState("Class 1");
  const [toClass, setToClass] = useState("Class 2");
  const [fromSession, setFromSession] = useState("");
  const [toSession, setToSession] = useState("");
  const [rows, setRows] = useState(null);
  const [selected, setSelected] = useState({});
  const [summary, setSummary] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (meta) {
      setFromSession(meta.session);
      setToSession(`${parseInt(meta.session.slice(0, 2)) + 1}${parseInt(meta.session.slice(2)) + 1}`);
    }
  }, [meta]);

  const loadHistory = async () => {
    try {
      const { data } = await axios.get(`${API}/promotions/history`, { withCredentials: true });
      setHistory(data);
    } catch { /* history is non-blocking */ }
  };
  useEffect(() => { loadHistory(); }, []);

  const fetchStudents = async () => {
    setFetching(true);
    setRows(null);
    setSummary(null);
    try {
      const { data } = await axios.get(`${API}/promotions/fetch?class_name=${encodeURIComponent(fromClass)}&session=${fromSession}`, { withCredentials: true });
      const sel = {};
      data.forEach((s) => { sel[s.reg_id] = { included: true, decision: "Promote", new_roll: "" }; });
      setRows(data);
      setSelected(sel);
      if (!data.length) toast.info(`No active students found in ${fromClass} for session ${fromSession}`);
    } catch {
      toast.error("Could not fetch students");
    } finally {
      setFetching(false);
    }
  };

  const counts = rows ? Object.values(selected).reduce((acc, s) => {
    if (s.included) acc[s.decision] = (acc[s.decision] || 0) + 1;
    return acc;
  }, {}) : {};

  const runPromotion = async () => {
    const items = rows.filter((r) => selected[r.reg_id]?.included).map((r) => ({
      reg_id: r.reg_id,
      decision: selected[r.reg_id].decision,
      new_roll: selected[r.reg_id].decision === "Promote" && selected[r.reg_id].new_roll !== "" ? Number(selected[r.reg_id].new_roll) : null,
    }));
    if (!items.length) return toast.error("Select at least one student");
    setSummary({ fetched: rows.length, ...counts });
    setRunning(true);
    try {
      const { data } = await axios.post(`${API}/promotions/run`, {
        from_class: fromClass, to_class: toClass, from_session: fromSession, to_session: toSession, items,
      }, { withCredentials: true });
      toast.success(`Promotion complete: ${data.promoted} promoted, ${data.held} held, ${data.transferred} transferred, ${data.inactive} inactive`);
      setRows(null);
      loadHistory();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Promotion failed — no changes were partially applied without records");
    } finally {
      setRunning(false);
    }
  };

  const selCls = "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62]";

  return (
    <div className="space-y-5" data-testid="promote-batch-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Batch Promotion & Roll Re-sequencing</h2>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label htmlFor="pb_from_class" className="block text-xs font-semibold text-[#123D62] mb-1">From Class</label>
            <select id="pb_from_class" value={fromClass} onChange={(e) => setFromClass(e.target.value)} className={selCls + " w-full"} data-testid="pb-from-class">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="pb_to_class" className="block text-xs font-semibold text-[#123D62] mb-1">To Class</label>
            <select id="pb_to_class" value={toClass} onChange={(e) => setToClass(e.target.value)} className={selCls + " w-full"} data-testid="pb-to-class">
              {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="pb_from_session" className="block text-xs font-semibold text-[#123D62] mb-1">Previous Session</label>
            <input id="pb_from_session" value={fromSession} onChange={(e) => setFromSession(e.target.value)} className={selCls + " w-full"} maxLength={4} data-testid="pb-from-session" />
          </div>
          <div>
            <label htmlFor="pb_to_session" className="block text-xs font-semibold text-[#123D62] mb-1">New Session</label>
            <input id="pb_to_session" value={toSession} onChange={(e) => setToSession(e.target.value)} className={selCls + " w-full"} maxLength={4} data-testid="pb-to-session" />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={fetchStudents} disabled={fetching}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5"
              data-testid="pb-fetch-btn">
              {fetching && <Loader2 size={14} className="animate-spin" aria-hidden="true" />} Fetch
            </button>
          </div>
        </div>
      </div>

      {rows && rows.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="pb-table-card">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#123D62]">{rows.length} students in {fromClass} (session {fromSession})</p>
            <p className="text-xs text-[#64748B]">Blank new roll = auto-assign sequentially</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="pb-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5"><span className="sr-only">Include</span></th>
                  <th className="py-3 px-4">Student</th><th className="py-3 px-4">Reg ID</th><th className="py-3 px-4">Current Roll</th>
                  <th className="py-3 px-4">Decision</th><th className="py-3 px-4">New Roll</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.reg_id} className={`border-b border-slate-100 ${!selected[r.reg_id]?.included ? "opacity-40" : ""}`}>
                    <td className="py-3 px-5">
                      <input type="checkbox" checked={selected[r.reg_id]?.included || false}
                        onChange={(e) => setSelected((s) => ({ ...s, [r.reg_id]: { ...s[r.reg_id], included: e.target.checked } }))}
                        className="w-4 h-4 accent-[#0756A5]" aria-label={`Include ${r.full_name}`} data-testid={`pb-include-${r.reg_id}`} />
                    </td>
                    <td className="py-3 px-4 font-medium text-[#123D62]">{r.full_name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{r.reg_id}</td>
                    <td className="py-3 px-4">{r.roll_number ?? "—"}</td>
                    <td className="py-3 px-4">
                      <select value={selected[r.reg_id]?.decision || "Promote"}
                        onChange={(e) => setSelected((s) => ({ ...s, [r.reg_id]: { ...s[r.reg_id], decision: e.target.value } }))}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold" aria-label={`Decision for ${r.full_name}`} data-testid={`pb-decision-${r.reg_id}`}>
                        {DECISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input type="number" min="1" value={selected[r.reg_id]?.new_roll || ""} placeholder="Auto"
                        disabled={selected[r.reg_id]?.decision !== "Promote"}
                        onChange={(e) => setSelected((s) => ({ ...s, [r.reg_id]: { ...s[r.reg_id], new_roll: e.target.value } }))}
                        className="w-20 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs disabled:bg-slate-50" aria-label={`New roll for ${r.full_name}`} data-testid={`pb-newroll-${r.reg_id}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#64748B]" data-testid="pb-summary">
              Promote: <strong>{counts["Promote"] || 0}</strong> • Hold: <strong>{counts["Hold Back"] || 0}</strong> • Transfer: <strong>{counts["Transfer Out"] || 0}</strong> • Inactive: <strong>{counts["Mark Inactive"] || 0}</strong>
            </p>
            <button type="button" onClick={() => { if (window.confirm(`Confirm promotion of selected students from ${fromClass} (${fromSession}) to ${toClass} (${toSession})? Previous records are preserved in history.`)) runPromotion(); }}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="pb-run-btn">
              {running ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <ArrowUpRightSquare size={15} aria-hidden="true" />}
              Confirm Promotion
            </button>
          </div>
        </div>
      )}
      {rows && rows.length === 0 && (
        <p className="text-sm text-[#64748B] text-center py-8" data-testid="pb-empty">No active students found for that class and session.</p>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="pb-history-card">
        <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">Promotion History</p>
        {history.length === 0 ? (
          <p className="text-sm text-[#64748B] px-5 py-6">No promotions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Student</th><th className="py-3 px-4">Decision</th><th className="py-3 px-4">From</th><th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Roll</th><th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100">
                    <td className="py-3 px-5 font-medium text-[#123D62]">{h.full_name}</td>
                    <td className="py-3 px-4">{h.decision}</td>
                    <td className="py-3 px-4">{h.from_class} ({h.from_session})</td>
                    <td className="py-3 px-4">{h.to_class ? `${h.to_class}${h.to_session ? ` (${h.to_session})` : ""}` : "—"}</td>
                    <td className="py-3 px-4">{h.from_roll ?? "—"} → {h.to_roll ?? "—"}</td>
                    <td className="py-3 px-4 text-[#64748B]">{new Date(h.promoted_at).toLocaleDateString("en-IN")}</td>
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

export default PromoteBatch;
