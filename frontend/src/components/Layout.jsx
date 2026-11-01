import { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { ArrowRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import { Toaster } from "sonner";
import { SCHOOL } from "../config/school";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    let rafId;
    const raf = (t) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-white" data-testid="site-layout">
      <div
        className="bg-[#123D62] text-white text-xs sm:text-sm py-2 px-4 text-center"
        role="status"
        data-testid="announcement-bar"
      >
        {SCHOOL.admissionStatus === "open"
          ? `Admissions Open — ${SCHOOL.sessionLabel} | ${SCHOOL.name}`
          : SCHOOL.announcement}
      </div>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#E2E8F0] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link
          to="/admissions#enquiry-form"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-[#16A34A] active:bg-[#15803D] text-white text-sm font-semibold py-3"
          data-testid="mobile-sticky-enquiry-btn"
        >
          Admission Enquiry — {SCHOOL.session}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <div className="sm:hidden h-16" aria-hidden="true" />
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default Layout;
