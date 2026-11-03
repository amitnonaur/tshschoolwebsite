import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Users, UserCheck, UserX, Wallet, TrendingUp, TrendingDown, Search, IndianRupee, ArrowRight } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const fmtInr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const StatCard = ({ icon: Icon, label, value, sub, color, testId }) => (
  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5" data-testid={testId}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} aria-hidden="true" /></div>
    </div>
    <p className="mt-2 text-2xl font-extrabold text-[#123D62]">{value}</p>
    {sub && <p className="mt-1 text-xs text-[#64748B]">{sub}</p>}
  </div>
);

const MONTHS_SHORT = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const AdminHome = () => {
  const { meta } = useAdmin();
  const [stats, setStats] = useState(null);
  const [fees, setFees] = useState(null);
  const [session, setSession] = useState("");
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async (sess) => {
    try {
      const qs = sess ? `?session=${sess}` : "";
      const [s, f] = await Promise.all([
        axios.get(`${API}/admin/stats${qs}`, { withCredentials: true }),
        axios.get(`${API}/fees/summary${qs}`, { withCredentials: true }),
      ]);
      setStats(s.data);
      setFees(f.data);
      if (!sess) setSession(s.data.session);
    } catch {
      toast.error("Could not load dashboard");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const searchDues = async (e) => {
    e.preventDefault();
    if (!q.trim()) return setSearchResults(null);
    setSearching(true);
    try {
      const { data } = await axios.get(`${API}/students?q=${encodeURIComponent(q.trim())}&limit=10`, { withCredentials: true });
      const duesMap = Object.fromEntries((fees?.dues || []).map((d) => [d.reg_id, d]));
      setSearchResults(data.students.map((s) => ({ ...s, due: duesMap[s.reg_id] || null })));
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  if (!stats || !fees) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>;
  }

  const maxRevenue = Math.max(...fees.revenue_by_month.map((r) => r.amount), 1);
  const courseColors = ["#0756A5", "#14B8A6", "#D97706", "#7C3AED"];
  const courseEntries = Object.entries(stats.course_counts);
  const courseTotal = courseEntries.reduce((a, [, c]) => a + c, 0) || 1;

  return (
    <div className="space-y-6" data-testid="admin-dashboard-page">
      {/* Session filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="dash-session" className="text-sm font-semibold text-[#123D62]">Academic Session</label>
        <select id="dash-session" value={session} onChange={(e) => { setSession(e.target.value); load(e.target.value); }}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-[#123D62]"
          data-testid="dash-session-select">
          {(stats.available_sessions || []).map((s) => (
            <option key={s} value={s}>20{s.slice(0, 2)}–20{s.slice(2)}</option>
          ))}
        </select>
        <span className="text-xs text-[#64748B]">{stats.session_start} to {stats.session_end}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={stats.total_students}
          sub={`${stats.active_students} active • ${stats.inactive_students} inactive`} color="bg-[#EAF0F8] text-[#0756A5]" testId="stat-total-students" />
        <StatCard icon={Wallet} label="Total Collection" value={fmtInr(fees.collected)}
          sub={`This month ${fmtInr(fees.this_month)} • Last month ${fmtInr(fees.prev_month)}`} color="bg-[#EDF9F0] text-[#16A34A]" testId="stat-total-collection" />
        <StatCard icon={IndianRupee} label="Total Dues" value={fmtInr(fees.total_dues)}
          sub={`of ${fmtInr(fees.expected)} expected annually`} color="bg-[#FDF6EC] text-[#D97706]" testId="stat-total-dues" />
        <StatCard icon={TrendingUp} label="Student Flow" value={`+${stats.new_this_month}`}
          sub={`${stats.left_this_session} left this session • net growth ${stats.total_students - stats.left_this_session >= 0 ? "+" : ""}${stats.total_students - stats.left_this_session}`} color="bg-[#F0EDFC] text-[#7C3AED]" testId="stat-student-flow" />
      </div>

      {/* Fee & due tracker */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="due-tracker">
        <h2 className="text-base font-bold text-[#123D62]">Fee & Due Tracker</h2>
        <form onSubmit={searchDues} className="mt-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search by student name or Registration ID"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40"
              data-testid="due-search-input" />
          </div>
          <button type="submit" disabled={searching}
            className="rounded-xl bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-2.5 transition-colors disabled:opacity-60"
            data-testid="due-search-btn">
            {searching ? "Searching…" : "Search"}
          </button>
        </form>
        {searchResults && (
          <div className="mt-4 overflow-x-auto">
            {searchResults.length === 0 ? (
              <p className="text-sm text-[#64748B] py-4 text-center" data-testid="due-search-empty">No students found for "{q}".</p>
            ) : (
              <table className="w-full text-sm" data-testid="due-search-table">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200">
                    <th className="py-2.5 pr-4">Reg ID</th><th className="py-2.5 pr-4">Student</th><th className="py-2.5 pr-4">Course</th>
                    <th className="py-2.5 pr-4">Class</th><th className="py-2.5 pr-4">Pending Months</th><th className="py-2.5 pr-4">Outstanding</th><th className="py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((s) => (
                    <tr key={s.reg_id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-mono text-xs">{s.reg_id}</td>
                      <td className="py-3 pr-4 font-medium text-[#123D62]">{s.full_name}</td>
                      <td className="py-3 pr-4">{s.course}</td>
                      <td className="py-3 pr-4">{s.class_name}</td>
                      <td className="py-3 pr-4">{s.due ? s.due.pending_months.length : 0}</td>
                      <td className="py-3 pr-4 font-semibold text-[#D97706]">{s.due ? fmtInr(s.due.due) : "₹0"}</td>
                      <td className="py-3">
                        <Link to={`/admin/students/${s.reg_id}`} className="inline-flex items-center gap-1 text-[#0756A5] font-semibold text-xs hover:underline" data-testid={`due-view-${s.reg_id}`}>
                          Fee history <ArrowRight size={13} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Revenue chart + course doughnut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="revenue-chart">
          <h2 className="text-base font-bold text-[#123D62]">Revenue Overview ({session.slice(0, 2)}–{session.slice(2)})</h2>
          <div className="mt-5 flex items-end gap-1.5 sm:gap-2 h-44">
            {fees.revenue_by_month.map((r, i) => (
              <div key={r.month} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-semibold text-[#64748B]">{r.amount > 0 ? fmtInr(r.amount) : ""}</span>
                <div className="w-full rounded-t-md bg-[#0756A5]/90 transition-all" style={{ height: `${Math.max((r.amount / maxRevenue) * 100, 2)}%` }} title={`${r.month}: ${fmtInr(r.amount)}`} />
                <span className="text-[10px] text-[#64748B]">{MONTHS_SHORT[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="course-chart">
          <h2 className="text-base font-bold text-[#123D62]">Active Students by Course</h2>
          {courseEntries.length === 0 ? (
            <p className="mt-6 text-sm text-[#64748B] text-center">No active students yet this session.</p>
          ) : (
            <>
              <div className="mt-5 mx-auto w-40 h-40 rounded-full" style={{
                background: `conic-gradient(${courseEntries.map(([k, c], i) => {
                  const start = courseEntries.slice(0, i).reduce((a, [, cc]) => a + cc, 0) / courseTotal * 360;
                  const end = start + (c / courseTotal) * 360;
                  return `${courseColors[i % courseColors.length]} ${start}deg ${end}deg`;
                }).join(", ")})`,
              }} role="img" aria-label="Doughnut chart of active students by course" />
              <ul className="mt-5 space-y-2">
                {courseEntries.map(([k, c], i) => (
                  <li key={k} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#123D62]">
                      <span className="w-3 h-3 rounded-sm" style={{ background: courseColors[i % courseColors.length] }} aria-hidden="true" />{k}
                    </span>
                    <span className="font-semibold text-[#123D62]">{c}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5" data-testid="recent-students">
          <h2 className="text-base font-bold text-[#123D62]">Recently Admitted</h2>
          {stats.recent_students.length === 0 ? <p className="mt-3 text-sm text-[#64748B]">No admissions yet.</p> : (
            <ul className="mt-3 space-y-2.5">
              {stats.recent_students.map((s) => (
                <li key={s.reg_id} className="flex items-center justify-between text-sm">
                  <Link to={`/admin/students/${s.reg_id}`} className="font-medium text-[#0756A5] hover:underline">{s.full_name}</Link>
                  <span className="text-xs text-[#64748B]">{s.class_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5" data-testid="recent-payments">
          <h2 className="text-base font-bold text-[#123D62]">Recent Fee Payments</h2>
          {stats.recent_payments.length === 0 ? <p className="mt-3 text-sm text-[#64748B]">No payments recorded yet.</p> : (
            <ul className="mt-3 space-y-2.5">
              {stats.recent_payments.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#123D62]">{p.full_name}</span>
                  <span className="text-xs font-semibold text-[#16A34A]">{fmtInr(p.amount)} • {p.month}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5" data-testid="pending-fees">
          <h2 className="text-base font-bold text-[#123D62]">Top Pending Fees</h2>
          {fees.dues.length === 0 ? <p className="mt-3 text-sm text-[#64748B]">No outstanding dues. Well done!</p> : (
            <ul className="mt-3 space-y-2.5">
              {fees.dues.slice(0, 5).map((d) => (
                <li key={d.reg_id} className="flex items-center justify-between text-sm">
                  <Link to={`/admin/students/${d.reg_id}`} className="font-medium text-[#0756A5] hover:underline">{d.full_name}</Link>
                  <span className="text-xs font-semibold text-[#D97706]">{fmtInr(d.due)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
