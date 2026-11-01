import { Link } from "react-router-dom";
import { SCHOOL } from "../config/school";

export const LogoMark = ({ size = 44 }) => (
  <img
    src="/logo.png"
    width={size}
    height={size}
    alt="The Study Home School logo"
    className="rounded-full shrink-0"
    data-testid="logo-mark"
  />
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
