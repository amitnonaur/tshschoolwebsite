import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, KeyRound, Save, DatabaseBackup } from "lucide-react";
import { API } from "../../config/school";

const AdminSettings = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (next.length < 8) return toast.error("New password must be at least 8 characters.");
    if (next !== confirm) return toast.error("New passwords do not match.");
    setSaving(true);
    try {
      await axios.post(`${API}/auth/change-password`, { current_password: current, new_password: next }, { withCredentials: true });
      toast.success("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not update password");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="max-w-lg" data-testid="admin-settings-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF0F8] flex items-center justify-center text-[#0756A5]"><KeyRound size={18} aria-hidden="true" /></div>
          <div>
            <h2 className="text-base font-bold text-[#123D62]">Change Password</h2>
            <p className="text-xs text-[#64748B]">Keep your admin account secure.</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="mt-5 space-y-4" data-testid="settings-password-form">
          <div>
            <label htmlFor="sp_current" className="block text-sm font-semibold text-[#123D62] mb-1.5">Current password</label>
            <input id="sp_current" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} data-testid="settings-current-password" />
          </div>
          <div>
            <label htmlFor="sp_new" className="block text-sm font-semibold text-[#123D62] mb-1.5">New password (min 8 characters)</label>
            <input id="sp_new" type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} data-testid="settings-new-password" />
          </div>
          <div>
            <label htmlFor="sp_confirm" className="block text-sm font-semibold text-[#123D62] mb-1.5">Confirm new password</label>
            <input id="sp_confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} data-testid="settings-confirm-password" />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
            data-testid="settings-save-btn">
            {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
            Update Password
          </button>
        </form>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid="backup-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDF9F0] flex items-center justify-center text-[#16A34A]"><DatabaseBackup size={18} aria-hidden="true" /></div>
          <div>
            <h2 className="text-base font-bold text-[#123D62]">Full Backup</h2>
            <p className="text-xs text-[#64748B]">Download all students, fees, finance, attendance, results and promotions as one Excel file.</p>
          </div>
        </div>
        <button type="button" onClick={async () => {
            const { data } = await axios.get(`${API}/admin/backup`, { withCredentials: true, responseType: "blob" });
            const url = URL.createObjectURL(data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `tsh-backup-${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Backup downloaded");
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-6 py-2.5"
          data-testid="backup-download-btn">
          <DatabaseBackup size={15} aria-hidden="true" /> Download Backup (.xlsx)
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
