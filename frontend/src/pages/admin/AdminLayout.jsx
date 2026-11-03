import { useEffect, useState, createContext, useContext } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  LayoutDashboard, UserPlus, Users, ArrowUpRightSquare, ClipboardList, MonitorPlay,
  BookOpen, Video, Megaphone, Wallet, LineChart, Settings, UsersRound, LogOut, Menu, X, Upload, CalendarCheck,
} from "lucide-react";
import { API } from "../../config/school";
import { LogoMark } from "../../components/Logo";

export const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

const NAV = [
  { section: "MAIN" },
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, testId: "admin-nav-dashboard", roles: ["admin", "accountant", "teacher"] },
  { section: "STUDENT MANAGEMENT", roles: ["admin"] },
  { to: "/admin/admission", label: "New Admission", icon: UserPlus, testId: "admin-nav-admission", roles: ["admin"] },
  { to: "/admin/students", label: "Student List", icon: Users, testId: "admin-nav-students", roles: ["admin", "teacher", "accountant"] },
  { to: "/admin/promote", label: "Promote Batch", icon: ArrowUpRightSquare, testId: "admin-nav-promote", roles: ["admin"] },
  { to: "/admin/import", label: "Bulk Import", icon: Upload, testId: "admin-nav-import", roles: ["admin"] },
  { section: "ACADEMICS", roles: ["admin", "teacher"] },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck, testId: "admin-nav-attendance", roles: ["admin", "teacher"] },
  { to: "/admin/attendance-report", label: "Attendance Report", icon: ClipboardList, testId: "admin-nav-attendance-report", roles: ["admin", "teacher"] },
  { to: "/admin/results", label: "Test Results", icon: ClipboardList, testId: "admin-nav-results", roles: ["admin", "teacher"] },
  { to: "/admin/exams", label: "Online Exams", icon: MonitorPlay, testId: "admin-nav-exams", roles: ["admin", "teacher"] },
  { to: "/admin/materials", label: "Materials", icon: BookOpen, testId: "admin-nav-materials", roles: ["admin", "teacher"] },
  { to: "/admin/videos", label: "Videos", icon: Video, testId: "admin-nav-videos", roles: ["admin", "teacher"] },
  { section: "COMMUNICATION", roles: ["admin", "teacher"] },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, testId: "admin-nav-announcements", roles: ["admin", "teacher"] },
  { section: "FINANCE", roles: ["admin", "accountant"] },
  { to: "/admin/fees", label: "Fee Manager", icon: Wallet, testId: "admin-nav-fees", roles: ["admin", "accountant"] },
  { to: "/admin/finance", label: "Finance Tracker", icon: LineChart, testId: "admin-nav-finance", roles: ["admin", "accountant"] },
  { section: "SYSTEM", roles: ["admin", "accountant", "teacher"] },
  { to: "/admin/settings", label: "Admin Settings", icon: Settings, testId: "admin-nav-settings", roles: ["admin", "accountant", "teacher"] },
  { to: "/admin/users", label: "User Management", icon: UsersRound, testId: "admin-nav-users", roles: ["admin"] },
];

const PAGE_TITLES = {
  "/admin": "Dashboard",
  "/admin/admission": "New Admission",
  "/admin/students": "Student List",
  "/admin/promote": "Promote Batch",
  "/admin/import": "Bulk Import",
  "/admin/attendance": "Attendance Register",
  "/admin/attendance-report": "Attendance Report",
  "/admin/results": "Test Results",
  "/admin/exams": "Online Exams",
  "/admin/materials": "Materials",
  "/admin/videos": "Videos",
  "/admin/announcements": "Announcements",
  "/admin/fees": "Fee Manager",
  "/admin/finance": "Finance Tracker",
  "/admin/settings": "Admin Settings",
  "/admin/users": "User Management",
};

const AdminLayout = () => {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [meta, setMeta] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setAdmin(data);
        const m = await axios.get(`${API}/students/meta`, { withCredentials: true });
        setMeta(m.data);
      } catch {
        navigate("/admin/login");
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    setMobileNav(false);
  }, [location.pathname]);

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } finally {
      navigate("/admin/login");
    }
  };

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" data-testid="admin-panel-loading">
        <div className="w-8 h-8 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }

  const title = PAGE_TITLES[location.pathname] || (location.pathname.startsWith("/admin/students/") ? "Student Profile" : "Admin Panel");
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <LogoMark size={38} />
        <div className="leading-tight">
          <p className="text-white font-extrabold text-xs uppercase tracking-wide">The Study Home</p>
          <p className="text-[#2DD4BF] text-[10px] font-bold tracking-[0.25em] uppercase">School Admin</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
        {NAV.filter((item) => !item.roles || (admin && item.roles.includes(admin.role))).map((item, i) =>
          item.section ? (
            <p key={i} className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6B87A3]">{item.section}</p>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  isActive ? "bg-[#14B8A6] text-white" : "text-[#B8C9DB] hover:bg-white/10 hover:text-white"
                }`
              }
              data-testid={item.testId}>
              <item.icon size={17} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button type="button" onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#B8C9DB] hover:bg-white/10 hover:text-white transition-colors"
          data-testid="admin-nav-logout">
          <LogOut size={17} aria-hidden="true" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <AdminCtx.Provider value={{ admin, meta }}>
      <div className="min-h-screen bg-[#F1F5F9] flex" data-testid="admin-panel">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-[#123D62] fixed inset-y-0 left-0 z-40">
          <SidebarContent />
        </aside>
        {/* Mobile sidebar */}
        {mobileNav && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNav(false)} aria-hidden="true" />
            <aside className="absolute inset-y-0 left-0 w-72 bg-[#123D62]">
              <button type="button" onClick={() => setMobileNav(false)} aria-label="Close menu"
                className="absolute top-4 right-4 text-white/70 hover:text-white" data-testid="admin-mobile-nav-close">
                <X size={20} aria-hidden="true" />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4" data-testid="admin-topbar">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#123D62] hover:bg-slate-100"
                onClick={() => setMobileNav(true)} aria-label="Open menu" data-testid="admin-mobile-nav-open">
                <Menu size={20} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-[#123D62] truncate" data-testid="admin-page-title">{title}</h1>
                <p className="text-xs text-[#64748B] hidden sm:block">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#123D62]" data-testid="admin-user-name">{admin?.name}</p>
                <p className="text-xs text-[#64748B] capitalize">{admin?.role === "super_admin" ? "Super Administrator" : admin?.role === "teacher" ? "Teacher" : admin?.role === "accountant" ? "Accountant" : "Administrator"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#123D62] text-white flex items-center justify-center font-bold text-sm" aria-hidden="true">
                {(admin?.name || "A").slice(0, 1).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
};

export default AdminLayout;
