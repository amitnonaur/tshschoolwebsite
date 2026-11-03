import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { SCHOOL } from "../config/school";

const ACADEMICS_LINKS = [
  { to: "/academics", label: "Academics" },
  { to: "/english-communication", label: "English & Communication" },
  { to: "/computer-education", label: "Computer Education" },
  { to: "/experiential-learning", label: "Learning Beyond Textbooks" },
  { to: "/sports", label: "Sports & Well-being" },
  { to: "/assessment", label: "Assessment & Development" },
];

const PARENT_LINKS = [
  { to: "/parent-partnership", label: "Parent Partnership" },
  { to: "/admissions", label: "Admissions" },
  { to: "/parents", label: "Parent Portal" },
  { to: "/videos", label: "Learning Videos" },
  { to: "/results", label: "Check Results" },
  { to: "/faq", label: "FAQ" },
];

const linkCls = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "text-[#0756A5] bg-[#F3F6FA]" : "text-[#123D62] hover:text-[#0756A5] hover:bg-[#F3F6FA]"
  }`;

const Dropdown = ({ label, links, testId }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#123D62] hover:text-[#0756A5] hover:bg-[#F3F6FA] transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        data-testid={`${testId}-dropdown-button`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50"
          role="menu"
          data-testid={`${testId}-dropdown-menu`}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm transition-colors ${
                  isActive ? "text-[#0756A5] font-semibold bg-[#F3F6FA]" : "text-[#123D62] hover:bg-[#F3F6FA]"
                }`
              }
              data-testid={`${testId}-link-${l.to.replace(/\//g, "")}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]"
      data-testid="site-header"
    >
      <div className="container-site flex items-center justify-between gap-4 h-16 sm:h-20">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          <NavLink to="/" end className={linkCls} data-testid="nav-link-home">Home</NavLink>
          <NavLink to="/about" className={linkCls} data-testid="nav-link-about">About</NavLink>
          <Dropdown label="Academics" links={ACADEMICS_LINKS} testId="nav-academics" />
          <Dropdown label="Parents" links={PARENT_LINKS} testId="nav-parents" />
          <NavLink to="/contact" className={linkCls} data-testid="nav-link-contact">Contact</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/admissions#enquiry-form"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            data-testid="nav-admission-enquiry-btn"
          >
            Admission Enquiry
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#123D62] hover:bg-[#F3F6FA]"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-[#E2E8F0] bg-white max-h-[calc(100vh-5rem)] overflow-y-auto"
          aria-label="Mobile"
          data-testid="mobile-menu"
        >
          <div className="container-site py-4 flex flex-col gap-1">
            <NavLink to="/" end className={linkCls} data-testid="mobile-nav-link-home">Home</NavLink>
            <NavLink to="/about" className={linkCls} data-testid="mobile-nav-link-about">About Us</NavLink>
            <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[#64748B]">Academics</p>
            {ACADEMICS_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkCls} data-testid={`mobile-nav-${l.to.replace(/\//g, "")}`}>
                {l.label}
              </NavLink>
            ))}
            <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[#64748B]">Parents</p>
            {PARENT_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkCls} data-testid={`mobile-nav-${l.to.replace(/\//g, "")}`}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/contact" className={linkCls} data-testid="mobile-nav-link-contact">Contact Us</NavLink>
            <Link
              to="/admissions#enquiry-form"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-5 py-3 transition-colors"
              data-testid="mobile-nav-admission-btn"
            >
              Admission Enquiry — {SCHOOL.session}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
