import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, UserPlus, ShieldCheck, ShieldOff } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const ROLE_LABEL = { admin: "Administrator", accountant: "Accountant", teacher: "Teacher", super_admin: "Super Administrator" };
const ROLE_STYLE = {
  admin: "bg-[#EAF0F8] text-[#0756A5]",
  accountant: "bg-[#FDF6EC] text-[#D97706]",
  teacher: "bg-[#EDF9F0] text-[#16A34A]",
  super_admin: "bg-[#F0EDFC] text-[#7C3AED]",
};

const UserManagement = () => {
  const { admin } = useAdmin();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "teacher" });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(data);
    } catch {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) return toast.error("Name, email and an 8+ character password are required");
    setAdding(true);
    try {
      await axios.post(`${API}/admin/users`, form, { withCredentials: true });
      toast.success(`${ROLE_LABEL[form.role]} account created`);
      setForm({ name: "", email: "", password: "", role: "teacher" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not create user");
    } finally {
      setAdding(false);
    }
  };

  const toggle = async (u) => {
    const target = u.active === false;
    if (!window.confirm(`${target ? "Reactivate" : "Deactivate"} ${u.email}?`)) return;
    try {
      await axios.patch(`${API}/admin/users/${u.id}/active`, { active: target }, { withCredentials: true });
      toast.success(target ? "Account reactivated" : "Account deactivated");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not update");
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="user-management-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Add Staff Account</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Teachers see academics (students, results, exams, materials, videos, announcements). Accountants see finance (fees, finance tracker). Only administrators manage admissions, promotion, import and users.
        </p>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3" data-testid="user-form">
          <div>
            <label htmlFor="usr_name" className="block text-xs font-semibold text-[#123D62] mb-1">Name</label>
            <input id="usr_name" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} data-testid="user-name-input" />
          </div>
          <div>
            <label htmlFor="usr_email" className="block text-xs font-semibold text-[#123D62] mb-1">Email</label>
            <input id="usr_email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} data-testid="user-email-input" />
          </div>
          <div>
            <label htmlFor="usr_pass" className="block text-xs font-semibold text-[#123D62] mb-1">Password (8+ chars)</label>
            <input id="usr_pass" type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputCls} data-testid="user-password-input" />
          </div>
          <div>
            <label htmlFor="usr_role" className="block text-xs font-semibold text-[#123D62] mb-1">Role</label>
            <select id="usr_role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls} data-testid="user-role-select">
              <option value="teacher">Teacher</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={adding}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5"
              data-testid="user-add-btn">
              {adding ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <UserPlus size={15} aria-hidden="true" />} Add
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="users-list-card">
        <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">Staff Accounts ({users.length})</p>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="users-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Name</th><th className="py-3 px-4">Email</th><th className="py-3 px-4">Role</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-3 px-5 font-medium text-[#123D62]">{u.name || "—"}</td>
                    <td className="py-3 px-4 text-[#475569]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLE[u.role] || ROLE_STYLE.admin}`}>{ROLE_LABEL[u.role] || u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold ${u.active === false ? "text-red-600" : "text-[#16A34A]"}`}>{u.active === false ? "Deactivated" : "Active"}</span>
                    </td>
                    <td className="py-3 px-4">
                      {u.id !== admin?.id && u.role !== "super_admin" && (
                        <button type="button" onClick={() => toggle(u)}
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${u.active === false ? "text-[#16A34A] hover:underline" : "text-red-600 hover:underline"}`}
                          data-testid={`user-toggle-${u.id}`}>
                          {u.active === false ? <><ShieldCheck size={13} aria-hidden="true" /> Reactivate</> : <><ShieldOff size={13} aria-hidden="true" /> Deactivate</>}
                        </button>
                      )}
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

export default UserManagement;
