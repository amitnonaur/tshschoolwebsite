import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { LogoMark } from "./Logo";
import { SCHOOL } from "../config/school";

const Footer = () => (
  <footer className="bg-[#0B2742] text-[#C9D9E8]" data-testid="site-footer">
    <div className="container-site py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <span className="leading-tight">
            <span className="block font-extrabold text-white tracking-tight text-sm uppercase">The Study Home</span>
            <span className="block text-[10px] font-semibold tracking-[0.28em] uppercase text-[#7FB4E3]">School</span>
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed">{SCHOOL.tagline}</p>
        <p className="mt-3 text-xs text-[#8FA9C2] leading-relaxed">
          A planned primary school for Classes 1–6, proposed for {SCHOOL.sessionLabel}.
        </p>
      </div>

      <nav aria-label="Footer — school">
        <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">School</h2>
        <ul className="space-y-2.5 text-sm">
          <li><Link className="hover:text-white transition-colors" to="/about" data-testid="footer-link-about">About Us</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/academics" data-testid="footer-link-academics">Academics</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/experiential-learning" data-testid="footer-link-experiential">Learning Beyond Textbooks</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/sports" data-testid="footer-link-sports">Sports & Well-being</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/assessment" data-testid="footer-link-assessment">Assessment & Development</Link></li>
        </ul>
      </nav>

      <nav aria-label="Footer — parents">
        <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Parents</h2>
        <ul className="space-y-2.5 text-sm">
          <li><Link className="hover:text-white transition-colors" to="/admissions" data-testid="footer-link-admissions">Admissions</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/parents" data-testid="footer-link-parent-portal">Parent Portal</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/videos" data-testid="footer-link-videos">Learning Videos</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/results" data-testid="footer-link-results">Check Results</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/parent-partnership" data-testid="footer-link-parent-partnership">Parent Partnership</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/faq" data-testid="footer-link-faq">FAQ</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/contact" data-testid="footer-link-contact">Contact Us</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/privacy-policy" data-testid="footer-link-privacy">Privacy Policy</Link></li>
          <li><Link className="hover:text-white transition-colors" to="/terms" data-testid="footer-link-terms">Terms of Use</Link></li>
        </ul>
      </nav>

      <div>
        <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact</h2>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-2.5">
            <MapPin size={16} className="shrink-0 mt-0.5 text-[#7FB4E3]" aria-hidden="true" />
            <span data-testid="footer-address">{SCHOOL.address}</span>
          </li>
          <li className="flex gap-2.5">
            <Phone size={16} className="shrink-0 mt-0.5 text-[#7FB4E3]" aria-hidden="true" />
            <a href={SCHOOL.phoneHref} className="hover:text-white transition-colors" data-testid="footer-phone-link">{SCHOOL.phone}</a>
          </li>
          <li className="flex gap-2.5">
            <Mail size={16} className="shrink-0 mt-0.5 text-[#7FB4E3]" aria-hidden="true" />
            <a href={SCHOOL.emailHref} className="hover:text-white transition-colors break-all" data-testid="footer-email-link">{SCHOOL.email}</a>
          </li>
        </ul>
        <p className="mt-4 text-xs text-[#8FA9C2]">{SCHOOL.sessionLabel} — proposed opening</p>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8FA9C2]">
        <p>© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.</p>
        <p>{SCHOOL.tagline}</p>
      </div>
    </div>
  </footer>
);

export default Footer;
