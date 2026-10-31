import { Link } from "react-router-dom";
import { SCHOOL } from "../config/school";

export const LogoMark = ({ size = 44 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="The Study Home School logo"
    data-testid="logo-mark"
  >
    <rect width="64" height="64" rx="14" fill="#123D62" />
    <path d="M32 12 L52 25 H12 Z" fill="#0756A5" />
    <circle cx="32" cy="32" r="6.5" fill="#D97706" />
    <path d="M32 25.5 V38.5" stroke="#F3B561" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M25 27 L32 24 M39 27 L32 24 M21 31 L32 26.5 M43 31 L32 26.5" stroke="#F3B561" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13 45 C19.5 40.8 26.5 40.8 32 45 C37.5 40.8 44.5 40.8 51 45 V51.5 C44.5 47.3 37.5 47.3 32 51.5 C26.5 47.3 19.5 47.3 13 51.5 Z" fill="#FFFFFF" />
    <path d="M32 45 V51.5" stroke="#0756A5" strokeWidth="1.4" />
  </svg>
);

export const Logo = ({ compact = false }) => (
  <Link
    to="/"
    className="flex items-center gap-3 shrink-0"
    aria-label={`${SCHOOL.name} — home`}
    data-testid="header-logo-link"
  >
    <LogoMark size={compact ? 38 : 44} />
    <span className="leading-tight">
      <span className="block font-extrabold text-[#123D62] tracking-tight text-sm sm:text-base uppercase">
        The Study Home
      </span>
      <span className="block text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#0756A5]">
        School
      </span>
    </span>
  </Link>
);
