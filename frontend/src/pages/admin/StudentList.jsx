import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Search, Download, UserPlus, Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const STATUS_COLORS = {
  Active: "bg-[#EDF9F0] text-[#16A34A]",
  Inactive: "bg-[#FDF6EC] text-[#D97706]",
  Archived: "bg-slate-100 text-[#64748B]",
};

const StudentList = () => {
  const { meta } = useAdmin();
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], total: 0 });
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("");
  const [className, setClassName] = useState("");
  const [session, setSession] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit });
      if (q.trim()) params.set("q", q.trim());
      if (course) params.set("course", course);
      if (className) params.set("class_name", className);
      if (session) params.set("session", session);
      if (status) params.set("status", status);
      const { data } = await axios.get(`${API}/students?${params}`, { withCredentials: true });
      setData(data);
    } catch {
      toast.error("Could not load students");
    } finally {
      setLoading(false);
    }
  }, [q, course, className, session, status, page]);

  useEffect(() => { load(1); setPage(1); }, [course, className, session, status]);
  useEffect(() => { load(page); }, [page]);

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (session) params.set("session", session);
    if (className) params.set("class_name", className);
    axios.get(`${API}/students-export.csv?${params}`, { withCredentials: true, responseType: "blob" }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "students.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Student list downloaded");
    });
  };

  const totalPages = Math.max(1, Math.ceil(data.total / limit));
  const selCls = "rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-[#123D62]";

  return (
    <div className="space-y-5" data-testid="student-list-page">
      {/* Filters */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(1)}
              placeholder="Name, Reg ID, father, mobile…"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40"
              data-testid="students-search-input" />
          </div>
          <select value={course} onChange={(e) => setCourse(e.target.value)} className={selCls} data-testid="students-filter-course" aria-label="Filter by course">
            <option value="">All Courses</option>
            {(meta?.courses || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={className} onChange={(e) => setClassName(e.target.value)} className={selCls} data-testid="students-filter-class" aria-label="Filter by class">
            <option value="">All Classes</option>
            {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selCls} data-testid="students-filter-status" aria-label="Filter by status">
            <option value="">Active + Inactive</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => load(1)}
              className="flex-1 rounded-xl bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-4 py-2.5 transition-colors"
              data-testid="students-search-btn">Search</button>
            <button type="button" onClick={exportCsv} aria-label="Export student list"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[#123D62] hover:bg-slate-50"
              data-testid="students-export-btn">
              <Download size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-[#123D62]" data-testid="students-count">{data.total} student{data.total === 1 ? "" : "s"}</p>
          <Link to="/admin/admission" className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2" data-testid="students-new-admission-btn">
            <UserPlus size={14} aria-hidden="true" /> New Admission
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>
        ) : data.students.length === 0 ? (
          <div className="py-16 text-center" data-testid="students-empty">
            <p className="text-sm text-[#64748B]">No students found. {q || course || className || status ? "Try clearing the filters." : "Start with a new admission."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="students-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Photo</th>
                  <th className="py-3 px-4">Reg ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course & Class</th>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s) => (
                  <tr key={s.reg_id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="py-3 px-5">
                      <div className="w-10 h-10 rounded-full bg-[#EAF0F8] overflow-hidden flex items-center justify-center text-[#0756A5] font-bold text-sm">
                        {s.photo ? <img src={s.photo} alt={s.full_name} className="w-full h-full object-cover" /> : s.full_name.slice(0, 1)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{s.reg_id}</td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/students/${s.reg_id}`} className="font-semibold text-[#0756A5] hover:underline" data-testid={`student-link-${s.reg_id}`}>{s.full_name}</Link>
                    </td>
                    <td className="py-3 px-4 text-[#475569]">{s.course} • {s.class_name}</td>
                    <td className="py-3 px-4">{s.roll_number ?? "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[s.status] || STATUS_COLORS.Active}`} data-testid={`student-status-${s.reg_id}`}>{s.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <Link to={`/admin/students/${s.reg_id}`} aria-label={`View ${s.full_name}`}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-[#123D62] hover:bg-slate-100"
                          data-testid={`student-view-${s.reg_id}`}>
                          <Eye size={14} aria-hidden="true" />
                        </Link>
                        <Link to={`/admin/admission/${s.reg_id}`} aria-label={`Edit ${s.full_name}`}
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-[#123D62] hover:bg-slate-100"
                          data-testid={`student-edit-${s.reg_id}`}>
                          <Pencil size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-[#64748B]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40" aria-label="Previous page" data-testid="students-prev-page">
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40" aria-label="Next page" data-testid="students-next-page">
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
