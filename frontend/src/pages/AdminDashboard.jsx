import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, LogOut, Inbox, MessageSquare, RefreshCw } from "lucide-react";
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

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("enquiries");
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
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
          <div className="flex gap-2">
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
    </div>
  );
};

export default AdminDashboard;
