import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Youtube, Link2 } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const VideosAdmin = () => {
  const { meta } = useAdmin();
  const [items, setItems] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState({ title: "", class_name: "Class 1", subject: "", youtube_url: "", description: "" });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const qs = filterClass ? `?class_name=${encodeURIComponent(filterClass)}` : "";
      const { data } = await axios.get(`${API}/videos${qs}`, { withCredentials: true });
      setItems(data);
    } catch {
      toast.error("Could not load videos");
    } finally {
      setLoading(false);
    }
  }, [filterClass]);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3 || !form.youtube_url.trim()) return toast.error("Title and YouTube link are required");
    setAdding(true);
    try {
      await axios.post(`${API}/videos`, form, { withCredentials: true });
      toast.success("Video added");
      setForm({ title: "", class_name: "Class 1", subject: "", youtube_url: "", description: "" });
      load();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : detail?.[0]?.msg || "Could not add video");
    } finally {
      setAdding(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="videos-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Add YouTube Video</h2>
        <p className="mt-1 text-xs text-[#64748B]">Upload your video on YouTube, then paste its link here against the right class.</p>
        <form onSubmit={add} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="video-form">
          <div>
            <label htmlFor="vid_title" className="block text-xs font-semibold text-[#123D62] mb-1">Title *</label>
            <input id="vid_title" type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} data-testid="video-title-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vid_class" className="block text-xs font-semibold text-[#123D62] mb-1">Class</label>
              <select id="vid_class" value={form.class_name} onChange={(e) => setForm((f) => ({ ...f, class_name: e.target.value }))} className={inputCls} data-testid="video-class-select">
                <option value="All">All Classes</option>
                {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="vid_subject" className="block text-xs font-semibold text-[#123D62] mb-1">Subject</label>
              <input id="vid_subject" type="text" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={inputCls} data-testid="video-subject-input" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vid_url" className="block text-xs font-semibold text-[#123D62] mb-1">YouTube Link *</label>
            <div className="relative">
              <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
              <input id="vid_url" type="url" value={form.youtube_url} onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=…" className={inputCls + " pl-10"} data-testid="video-url-input" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vid_desc" className="block text-xs font-semibold text-[#123D62] mb-1">Description</label>
            <input id="vid_desc" type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} data-testid="video-desc-input" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={adding}
              className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="video-add-btn">
              {adding ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />} Add Video
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="videos-list-card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#123D62]">Videos ({items.length})</p>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs" aria-label="Filter by class" data-testid="videos-filter-class">
            <option value="">All Classes</option>
            {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center" data-testid="videos-empty">
            <Youtube size={30} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-2 text-sm text-[#64748B]">No videos added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {items.map((v) => (
              <div key={v.video_id} className="rounded-xl border border-slate-200 overflow-hidden" data-testid={`video-card-${v.video_id}`}>
                <div className="aspect-video bg-slate-100">
                  <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3.5">
                  <p className="font-semibold text-sm text-[#123D62]">{v.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{v.class_name}{v.subject ? ` • ${v.subject}` : ""}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <a href={v.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline" data-testid={`video-watch-${v.video_id}`}>
                      <Youtube size={14} aria-hidden="true" /> Watch on YouTube
                    </a>
                    <button type="button" onClick={async () => { if (window.confirm("Delete this video?")) { await axios.delete(`${API}/videos/${v.video_id}`, { withCredentials: true }); load(); } }}
                      aria-label={`Delete ${v.title}`} className="text-red-500 hover:text-red-700" data-testid={`video-delete-${v.video_id}`}>
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosAdmin;
