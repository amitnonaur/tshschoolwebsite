import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Megaphone, Trash2 } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const AnnouncementsAdmin = () => {
  const { meta } = useAdmin();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", audience: "All" });
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/announcements`, { withCredentials: true });
      setItems(data);
    } catch {
      toast.error("Could not load announcements");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const post = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3 || form.body.trim().length < 3) return toast.error("Title and message are required");
    setPosting(true);
    try {
      await axios.post(`${API}/announcements`, { ...form, published: true }, { withCredentials: true });
      toast.success("Announcement posted");
      setForm({ title: "", body: "", audience: "All" });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not post");
    } finally {
      setPosting(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="max-w-3xl space-y-5" data-testid="announcements-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">New Announcement</h2>
        <form onSubmit={post} className="mt-4 space-y-4" data-testid="announcement-form">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="ann_title" className="block text-xs font-semibold text-[#123D62] mb-1">Title *</label>
              <input id="ann_title" type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} data-testid="announcement-title-input" />
            </div>
            <div>
              <label htmlFor="ann_audience" className="block text-xs font-semibold text-[#123D62] mb-1">Audience</label>
              <select id="ann_audience" value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))} className={inputCls} data-testid="announcement-audience-select">
                <option value="All">All Classes</option>
                {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="ann_body" className="block text-xs font-semibold text-[#123D62] mb-1">Message *</label>
            <textarea id="ann_body" rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className={inputCls} data-testid="announcement-body-input" />
          </div>
          <button type="submit" disabled={posting}
            className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
            data-testid="announcement-post-btn">
            {posting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Megaphone size={15} aria-hidden="true" />}
            Post Announcement
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="announcements-list-card">
        <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">Posted Announcements ({items.length})</p>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#64748B] px-5 py-8 text-center" data-testid="announcements-empty">No announcements yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((a) => (
              <li key={a.id} className="px-5 py-4 flex items-start justify-between gap-4" data-testid={`announcement-${a.id}`}>
                <div>
                  <p className="font-semibold text-[#123D62]">{a.title} <span className="ml-2 rounded-full bg-[#EAF0F8] text-[#0756A5] text-xs font-semibold px-2.5 py-0.5">{a.audience}</span></p>
                  <p className="mt-1 text-sm text-[#475569]">{a.body}</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">{new Date(a.created_at).toLocaleString("en-IN")} • {a.created_by}</p>
                </div>
                <button type="button" onClick={async () => { if (window.confirm("Delete this announcement?")) { await axios.delete(`${API}/announcements/${a.id}`, { withCredentials: true }); load(); } }}
                  aria-label="Delete announcement" className="text-red-500 hover:text-red-700 shrink-0 mt-1" data-testid={`announcement-delete-${a.id}`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsAdmin;
