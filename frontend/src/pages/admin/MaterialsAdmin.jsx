import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Upload, Download, Trash2, BookOpen } from "lucide-react";
import { API } from "../../config/school";
import { useAdmin } from "./AdminLayout";

const MaterialsAdmin = () => {
  const { meta } = useAdmin();
  const [items, setItems] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [form, setForm] = useState({ title: "", class_name: "Class 1", subject: "", description: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const qs = filterClass ? `?class_name=${encodeURIComponent(filterClass)}` : "";
      const { data } = await axios.get(`${API}/materials${qs}`, { withCredentials: true });
      setItems(data);
    } catch {
      toast.error("Could not load materials");
    } finally {
      setLoading(false);
    }
  }, [filterClass]);
  useEffect(() => { load(); }, [load]);

  const upload = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !file) return toast.error("Title and file are required");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("class_name", form.class_name);
      fd.append("subject", form.subject);
      fd.append("description", form.description);
      fd.append("file", file);
      await axios.post(`${API}/materials`, fd, { withCredentials: true });
      toast.success("Material uploaded");
      setForm({ title: "", class_name: "Class 1", subject: "", description: "" });
      setFile(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const download = async (m) => {
    const { data } = await axios.get(`${API}/materials/${m.id}/download`, { withCredentials: true, responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = m.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40";

  return (
    <div className="space-y-5" data-testid="materials-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Upload Study Material</h2>
        <form onSubmit={upload} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="material-form">
          <div>
            <label htmlFor="mat_title" className="block text-xs font-semibold text-[#123D62] mb-1">Title *</label>
            <input id="mat_title" type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} data-testid="material-title-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mat_class" className="block text-xs font-semibold text-[#123D62] mb-1">Class</label>
              <select id="mat_class" value={form.class_name} onChange={(e) => setForm((f) => ({ ...f, class_name: e.target.value }))} className={inputCls} data-testid="material-class-select">
                <option value="All">All Classes</option>
                {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="mat_subject" className="block text-xs font-semibold text-[#123D62] mb-1">Subject</label>
              <input id="mat_subject" type="text" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className={inputCls} data-testid="material-subject-input" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="mat_desc" className="block text-xs font-semibold text-[#123D62] mb-1">Description</label>
            <input id="mat_desc" type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} data-testid="material-desc-input" />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-5 py-2.5 cursor-pointer hover:bg-slate-50" data-testid="material-file-label">
              <Upload size={15} aria-hidden="true" /> {file ? file.name : "Choose File (max 5 MB)"}
              <input type="file" className="hidden" data-testid="material-file-input" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <button type="submit" disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5"
              data-testid="material-upload-btn">
              {uploading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />} Upload
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="materials-list-card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#123D62]">Materials ({items.length})</p>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-xs" aria-label="Filter by class" data-testid="materials-filter-class">
            <option value="">All Classes</option>
            {(meta?.all_classes || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center" data-testid="materials-empty">
            <BookOpen size={30} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-2 text-sm text-[#64748B]">No materials uploaded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="materials-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Title</th><th className="py-3 px-4">Class</th><th className="py-3 px-4">Subject</th><th className="py-3 px-4">File</th><th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="py-3 px-5 font-medium text-[#123D62]">{m.title}</td>
                    <td className="py-3 px-4">{m.class_name}</td>
                    <td className="py-3 px-4">{m.subject || "—"}</td>
                    <td className="py-3 px-4 text-xs text-[#64748B]">{m.filename} ({Math.round(m.size / 1024)} KB)</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => download(m)} aria-label={`Download ${m.title}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-[#123D62] hover:bg-slate-100" data-testid={`material-download-${m.id}`}>
                          <Download size={14} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={async () => { if (window.confirm("Delete this material?")) { await axios.delete(`${API}/materials/${m.id}`, { withCredentials: true }); load(); } }}
                          aria-label={`Delete ${m.title}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-red-500 hover:bg-red-50" data-testid={`material-delete-${m.id}`}>
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
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

export default MaterialsAdmin;
