import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Loader2, LockKeyhole } from "lucide-react";
import SEO from "../components/SEO";
import { LogoMark } from "../components/Logo";
import { API } from "../config/school";

function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : "")).filter(Boolean).join(" ");
  return String(detail);
}

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err?.response?.data?.detail) || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center bg-[#F3F6FA]" data-testid="admin-login-page">
      <SEO title="Admin Login | The Study Home School" description="Private admin login for The Study Home School." />
      <div className="container-site py-16">
        <div className="max-w-md mx-auto card-site !p-8 sm:!p-10">
          <div className="text-center">
            <div className="mx-auto w-fit"><LogoMark size={56} /></div>
            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-[#123D62]">Admin Login</h1>
            <p className="mt-1 text-sm text-[#64748B]">Private area for the school owner.</p>
          </div>
          <form onSubmit={onSubmit} className="mt-7 space-y-5" data-testid="admin-login-form">
            <div>
              <label htmlFor="admin_email" className="block text-sm font-semibold text-[#123D62] mb-1.5">Email</label>
              <input id="admin_email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40"
                data-testid="admin-email-input" />
            </div>
            <div>
              <label htmlFor="admin_password" className="block text-sm font-semibold text-[#123D62] mb-1.5">Password</label>
              <input id="admin_password" type="password" autoComplete="current-password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40"
                data-testid="admin-password-input" />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert" data-testid="admin-login-error">{error}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white font-semibold text-sm px-6 py-3.5 transition-colors"
              data-testid="admin-login-submit">
              {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-[#64748B]">
            Not the school owner? <Link to="/" className="text-[#0756A5] font-semibold hover:underline" data-testid="admin-login-back-home">Back to the website</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
