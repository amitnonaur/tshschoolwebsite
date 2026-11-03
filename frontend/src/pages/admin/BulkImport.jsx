import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { API } from "../../config/school";

const BulkImport = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [previewing, setPreviewing] = useState(false);

  const loadHistory = async () => {
    try {
      const { data } = await axios.get(`${API}/import/history`, { withCredentials: true });
      setHistory(data);
    } catch { /* non-blocking */ }
  };
  useEffect(() => { loadHistory(); }, []);

  const downloadTemplate = async () => {
    const { data } = await axios.get(`${API}/import/template.csv`, { withCredentials: true, responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doPreview = async () => {
    if (!file) return toast.error("Choose a CSV or Excel file first");
    setPreviewing(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await axios.post(`${API}/import/preview`, fd, { withCredentials: true });
      setPreview(data);
      if (data.invalid > 0) toast.error(`${data.invalid} row(s) have errors — fix or they will be skipped`);
      else toast.success(`All ${data.valid} rows look good`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not read the file");
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  };

  const doCommit = async () => {
    if (!file || !preview) return;
    if (!window.confirm(`Import ${preview.valid} valid student(s) into the database? ${preview.invalid} invalid row(s) will be skipped. Nothing existing is overwritten.`)) return;
    setCommitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await axios.post(`${API}/import/commit`, fd, { withCredentials: true });
      setResult(data);
      setPreview(null);
      setFile(null);
      toast.success(`Imported ${data.imported} students`);
      loadHistory();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Import failed");
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-5" data-testid="bulk-import-page">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#123D62]">Bulk Student Import</h2>
        <p className="mt-1 text-sm text-[#64748B]">Upload existing school records from Excel (.xlsx) or CSV. Required columns: full_name, dob (YYYY-MM-DD), father_name, mother_name, gender, mobile_primary, address, class_name.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-5 py-2.5 hover:bg-slate-50"
            data-testid="import-template-btn">
            <Download size={15} aria-hidden="true" /> Download Sample Template
          </button>
          <label className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-5 py-2.5 cursor-pointer" data-testid="import-choose-label">
            <Upload size={15} aria-hidden="true" /> {file ? file.name : "Choose File"}
            <input type="file" accept=".csv,.xlsx" className="hidden" data-testid="import-file-input"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setPreview(null); setResult(null); }} />
          </label>
          <button type="button" onClick={doPreview} disabled={!file || previewing}
            className="inline-flex items-center gap-2 rounded-full bg-[#123D62] hover:bg-[#0B2742] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5"
            data-testid="import-preview-btn">
            {previewing && <Loader2 size={15} className="animate-spin" aria-hidden="true" />} Preview & Validate
          </button>
        </div>
      </div>

      {preview && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="import-preview-card">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#123D62]">
              {preview.valid} valid • {preview.invalid} with errors (of {preview.total} rows)
            </p>
            <button type="button" onClick={doCommit} disabled={committing || preview.valid === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5"
              data-testid="import-commit-btn">
              {committing && <Loader2 size={15} className="animate-spin" aria-hidden="true" />} Confirm Import
            </button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm" data-testid="import-preview-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">Row</th><th className="py-3 px-4">Name</th><th className="py-3 px-4">Class</th><th className="py-3 px-4">DOB</th><th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.row} className="border-b border-slate-100">
                    <td className="py-2.5 px-5">{r.row}</td>
                    <td className="py-2.5 px-4 font-medium text-[#123D62]">{r.data.full_name || "—"}</td>
                    <td className="py-2.5 px-4">{r.data.class_name || "—"}</td>
                    <td className="py-2.5 px-4">{r.data.dob || "—"}</td>
                    <td className="py-2.5 px-4">
                      {r.errors.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#16A34A]"><CheckCircle2 size={13} aria-hidden="true" /> OK</span>
                      ) : (
                        <span className="inline-flex items-start gap-1 text-xs font-semibold text-red-600" data-testid={`import-error-row-${r.row}`}>
                          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" /> {r.errors.join("; ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-2xl bg-[#EDF9F0] border border-[#BBEBC8] p-5" data-testid="import-result-card">
          <p className="text-sm font-bold text-[#16A34A]">Import complete: {result.imported} imported, {result.skipped} skipped.</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-[#475569] space-y-1">
              {result.errors.slice(0, 10).map((e) => <li key={e.row}>Row {e.row}: {e.errors.join("; ")}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden" data-testid="import-history-card">
        <p className="px-5 py-4 text-sm font-bold text-[#123D62] border-b border-slate-100">Import History</p>
        {history.length === 0 ? (
          <p className="text-sm text-[#64748B] px-5 py-6">No imports yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200 bg-slate-50">
                  <th className="py-3 px-5">File</th><th className="py-3 px-4">Imported</th><th className="py-3 px-4">Skipped</th><th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100">
                    <td className="py-3 px-5 font-medium text-[#123D62]">{h.filename}</td>
                    <td className="py-3 px-4 text-[#16A34A] font-semibold">{h.imported}/{h.total}</td>
                    <td className="py-3 px-4">{h.skipped}</td>
                    <td className="py-3 px-4 text-[#64748B]">{new Date(h.created_at).toLocaleString("en-IN")}</td>
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

export default BulkImport;
