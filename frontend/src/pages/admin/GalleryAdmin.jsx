import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { API } from "../../config/school";

const CATEGORIES = ["General", "Classrooms", "Activities", "Sports", "Events", "Building"];

const GalleryAdmin = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ title: "", caption: "", category: "General" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const qs = filter ? `?category=${encodeURIComponent(filter)}` : "";
      const { data } = await axios.get(`${API}/gallery${qs}`, { withCredentials: true });
      setItems(data);
    } catch {
      toast.error("Could not load photos");
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const upload = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !file) return toast.error("Title and photo are required");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("caption", form.caption);
      fd.append("category", form.category);
      fd.append("file", file);
      await axios.post(`${API}/gallery`, fd, { withCredentials: true });
      toast.success("Photo uploaded");
      setForm({ title: "", caption: "", category: "General" });
      setFile(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="gallery-admin-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Upload School Photo</h2>
        <p className="mt-1 text-xs text-[#64748B]">Photos appear on the public Gallery page (/gallery) as your school takes shape.</p>
        <form onSubmit={upload} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="gallery-form">
          <div>
            <label htmlFor="gal_title" className="block text-xs font-semibold text-[#123D62] mb-1">Title *</label>
            <input id="gal_title" type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} data-testid="gallery-title-input" />
          </div>
          <div>
            <label htmlFor="gal_cat" className="block text-xs font-semibold text-[#123D62] mb-1">Category</label>
            <select id="gal_cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls} data-testid="gallery-category-select">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="gal_caption" className="block text-xs font-semibold text-[#123D62] mb-1">Caption</label>
            <input id="gal_caption" type="text" value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} className={inputCls} data-testid="gallery-caption-input" />
          </div>
          <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-5 py-2.5 cursor-pointer hover:bg-slate-50" data-testid="gallery-file-label">
              <Upload size={15} aria-hidden="true" /> {file ? file.name : "Choose Photo (max 5 MB)"}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" data-testid="gallery-file-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <button type="submit" disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="gallery-upload-btn">
              {uploading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />} Upload
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="gallery-list-card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#123D62]">Photos ({items.length})</p>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs" aria-label="Filter by category" data-testid="gallery-filter">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center" data-testid="gallery-empty">
            <ImageIcon size={30} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-2 text-sm text-[#64748B]">No photos uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
            {items.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 overflow-hidden group" data-testid={`gallery-item-${p.id}`}>
                <div className="aspect-square bg-slate-100 relative">
                  <img src={`data:${p.content_type};base64,${p.data_b64}`} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                  <button type="button" onClick={async () => { if (window.confirm("Delete this photo?")) { await axios.delete(`${API}/gallery/${p.id}`, { withCredentials: true }); load(); } }}
                    aria-label={`Delete ${p.title}`} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 text-red-500 items-center justify-center hidden group-hover:flex" data-testid={`gallery-delete-${p.id}`}>
                    <Trash2 size={14} aria-hidden="true" className="mx-auto" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-xs text-[#123D62] truncate">{p.title}</p>
                  <p className="text-[10px] text-[#64748B]">{p.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryAdmin;
