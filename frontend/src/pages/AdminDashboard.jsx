import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, LogOut, Inbox, MessageSquare, RefreshCw, Download, KeyRound, X } from "lucide-react";
import SEO from "../components/SEO";
import { API } from "../config/school";

const STATUS_STYLES = {
  new: "bg-[#EAF0F8] text-[#0756A5]",
  contacted: "bg-[#FDF6EC] text-[#D97706]",
  closed: "bg-[#EDF9F0] text-[#16A34A]",
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.new}`}>
    {status || "new"}
  </span>
);

const fmt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
};

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (filename, headers, rows) => {
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ChangePasswordModal = ({ onClose }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("New passwords do not match.");
    setSaving(true);
    try {
      await axios.post(`${API}/auth/change-password`, { current_password: current, new_password: next }, { withCredentials: true });
      toast.success("Password updated", { description: "Use your new password next time you sign in." });
      onClose();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not update password. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Change password" data-testid="change-password-modal">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#123D62]">Change Password</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-[#F3F6FA] text-[#123D62]" data-testid="change-password-close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="mt-5 space-y-4" data-testid="change-password-form">
          <div>
            <label htmlFor="cp_current" className="block text-sm font-semibold text-[#123D62] mb-1.5">Current password</label>
            <input id="cp_current" type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40" data-testid="cp-current-input" />
          </div>
          <div>
            <label htmlFor="cp_new" className="block text-sm font-semibold text-[#123D62] mb-1.5">New password (min 8 characters)</label>
            <input id="cp_new" type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40" data-testid="cp-new-input" />
          </div>
          <div>
            <label htmlFor="cp_confirm" className="block text-sm font-semibold text-[#123D62] mb-1.5">Confirm new password</label>
            <input id="cp_confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40" data-testid="cp-confirm-input" />
          </div>
          {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert" data-testid="cp-error">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 transition-colors"
            data-testid="cp-submit">
            {saving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("enquiries");
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [enq, msg] = await Promise.all([
        axios.get(`${API}/admin/enquiries`, { withCredentials: true }),
        axios.get(`${API}/admin/contact-messages`, { withCredentials: true }),
      ]);
      setEnquiries(enq.data);
      setMessages(msg.data);
    } catch (err) {
      if (err?.response?.status === 401) navigate("/admin/login");
      else toast.error("Could not load enquiries", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setAdmin(data);
        load();
      } catch {
        navigate("/admin/login");
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate, load]);

  const setStatus = async (kind, id, status) => {
    const url = kind === "enquiries" ? `${API}/admin/enquiries/${id}/status` : `${API}/admin/contact-messages/${id}/status`;
    try {
      await axios.patch(url, { status }, { withCredentials: true });
      if (kind === "enquiries") setEnquiries((l) => l.map((e) => (e.id === id ? { ...e, status } : e)));
      else setMessages((l) => l.map((e) => (e.id === id ? { ...e, status } : e)));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      if (err?.response?.status === 401) navigate("/admin/login");
      else toast.error("Could not update status");
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } finally {
      navigate("/admin/login");
    }
  };

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (tab === "enquiries") {
      downloadCsv(
        `admission-enquiries-${stamp}.csv`,
        ["Parent Name", "Child Name", "Class", "Mobile", "Email", "Preferred Contact", "Message", "Status", "Received"],
        enquiries.map((e) => [e.parent_name, e.child_name || "", e.class_of_interest, e.phone, e.email || "", e.preferred_contact === "whatsapp" ? "WhatsApp" : "Phone", e.message || "", e.status || "new", fmt(e.created_at)])
      );
    } else {
      downloadCsv(
        `contact-messages-${stamp}.csv`,
        ["Name", "Mobile", "Enquiry Type", "Message", "Status", "Received"],
        messages.map((m) => [m.name, m.phone, m.enquiry_type, m.message, m.status || "new", fmt(m.created_at)])
      );
    }
    toast.success("Spreadsheet downloaded");
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" data-testid="admin-loading">
        <Loader2 size={28} className="animate-spin text-[#0756A5]" aria-label="Loading" />
      </div>
    );
  }

  const items = tab === "enquiries" ? enquiries : messages;

  return (
    <div className="bg-[#F3F6FA] min-h-[75vh]" data-testid="admin-dashboard">
      <SEO title="Enquiry Dashboard | The Study Home School" description="Private enquiry dashboard for The Study Home School." />
      <div className="container-site py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#123D62]">Enquiry Dashboard</h1>
            <p className="mt-1 text-sm text-[#64748B]">Signed in as {admin?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              data-testid="admin-export-csv-btn">
              <Download size={15} aria-hidden="true" /> Export {tab === "enquiries" ? "Enquiries" : "Messages"}
            </button>
            <button type="button" onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-5 py-2.5 hover:bg-[#F3F6FA] transition-colors"
              data-testid="admin-change-password-btn">
              <KeyRound size={15} aria-hidden="true" /> Change Password
            </button>
            <button type="button" onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white text-[#123D62] text-sm font-semibold px-5 py-2.5 hover:bg-[#F3F6FA] transition-colors"
              data-testid="admin-refresh-btn">
              <RefreshCw size={15} aria-hidden="true" /> Refresh
            </button>
            <button type="button" onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-[#123D62] hover:bg-[#0B2742] text-white text-sm font-semibold px-5 py-2.5 transition-colors"
              data-testid="admin-logout-btn">
              <LogOut size={15} aria-hidden="true" /> Log out
            </button>
          </div>
        </div>

        <div className="mt-7 flex gap-2" role="tablist" aria-label="Dashboard sections">
          <button type="button" role="tab" aria-selected={tab === "enquiries"} onClick={() => setTab("enquiries")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${tab === "enquiries" ? "bg-[#0756A5] text-white" : "bg-white text-[#123D62] border border-slate-300"}`}
            data-testid="admin-tab-enquiries">
            <Inbox size={15} aria-hidden="true" /> Admission Enquiries ({enquiries.length})
          </button>
          <button type="button" role="tab" aria-selected={tab === "messages"} onClick={() => setTab("messages")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${tab === "messages" ? "bg-[#0756A5] text-white" : "bg-white text-[#123D62] border border-slate-300"}`}
            data-testid="admin-tab-messages">
            <MessageSquare size={15} aria-hidden="true" /> Contact Messages ({messages.length})
          </button>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 size={26} className="animate-spin text-[#0756A5]" aria-label="Loading" /></div>
        ) : items.length === 0 ? (
          <div className="mt-8 card-site text-center !p-12" data-testid="admin-empty-state">
            <Inbox size={36} className="mx-auto text-[#94A3B8]" aria-hidden="true" />
            <p className="mt-3 text-sm text-[#64748B]">No {tab === "enquiries" ? "admission enquiries" : "contact messages"} yet.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <article key={item.id} className="card-site !p-5 sm:!p-6" data-testid={`admin-item-${item.id}`}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
                    {tab === "enquiries" ? (
                      <>
                        <p><span className="font-semibold text-[#123D62]">Parent:</span> <span data-testid={`admin-parent-${item.id}`}>{item.parent_name}</span></p>
                        {item.child_name && <p><span className="font-semibold text-[#123D62]">Child:</span> {item.child_name}</p>}
                        <p><span className="font-semibold text-[#123D62]">Class:</span> {item.class_of_interest}</p>
                        <p><span className="font-semibold text-[#123D62]">Mobile:</span> <a href={`tel:+91${item.phone}`} className="text-[#0756A5] hover:underline">{item.phone}</a></p>
                        {item.email && <p><span className="font-semibold text-[#123D62]">Email:</span> <a href={`mailto:${item.email}`} className="text-[#0756A5] hover:underline break-all">{item.email}</a></p>}
                        <p><span className="font-semibold text-[#123D62]">Preferred:</span> {item.preferred_contact === "whatsapp" ? "WhatsApp" : "Phone call"}</p>
                      </>
                    ) : (
                      <>
                        <p><span className="font-semibold text-[#123D62]">Name:</span> <span data-testid={`admin-name-${item.id}`}>{item.name}</span></p>
                        <p><span className="font-semibold text-[#123D62]">Mobile:</span> <a href={`tel:+91${item.phone}`} className="text-[#0756A5] hover:underline">{item.phone}</a></p>
                        <p><span className="font-semibold text-[#123D62]">Type:</span> {item.enquiry_type}</p>
                      </>
                    )}
                    <p><span className="font-semibold text-[#123D62]">Received:</span> {fmt(item.created_at)}</p>
                    {item.message && <p className="sm:col-span-2"><span className="font-semibold text-[#123D62]">Message:</span> {item.message}</p>}
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end gap-3 shrink-0">
                    <StatusBadge status={item.status} />
                    <select
                      value={item.status || "new"}
                      onChange={(e) => setStatus(tab, item.id, e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#123D62]"
                      aria-label="Update status"
                      data-testid={`admin-status-select-${item.id}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
};

export default AdminDashboard;
