import { Link } from "react-router-dom";
import { GraduationCap, ClipboardList, MonitorPlay, Youtube, KeyRound, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { SCHOOL } from "../config/school";

const STEPS = [
  { icon: KeyRound, title: "Get your child's Registration ID", text: `Every admitted student has a permanent Registration ID (like TSH27280001). If you don't have it, call the school at ${SCHOOL.phone} or ask the class teacher.` },
  { icon: GraduationCap, title: "Open the login page", text: "Tap the Login button below and enter your child's Registration ID and date of birth (as given during admission)." },
  { icon: ClipboardList, title: "See results and exams", text: "View published monthly test results with marks, grade and class rank, take online exams when scheduled, and see exam scores once published." },
];

const ParentsPortal = () => (
  <div data-testid="parents-portal-page">
    <SEO
      title="Parent & Student Portal | The Study Home School, Bhojpur"
      description="How parents and students of The Study Home School can check monthly test results and take online exams using Registration ID and date of birth."
    />
    <PageHero
      eyebrow="Parent & student portal"
      title="Check Results and Take Exams Online"
      description="A simple, secure way for parents to follow their child's progress — no app to install, no password to remember."
    />
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site max-w-3xl">
        <div className="space-y-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="card-site flex gap-5 !p-6" data-testid={`portal-step-${i + 1}`}>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF0F8] flex items-center justify-center text-[#0756A5] shrink-0">
                  <s.icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#123D62]">{i + 1}. {s.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-8 text-center">
            <Link to="/exam-login"
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm sm:text-base px-8 py-3.5 transition-colors"
              data-testid="portal-login-btn">
              Open Student Login <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ClipboardList, title: "Monthly Results", text: "Marks per subject, percentage, grade and class rank — only after the school publishes them." },
              { icon: MonitorPlay, title: "Online Exams", text: "When an exam is scheduled for your child's class, it appears here with a countdown timer." },
              { icon: Youtube, title: "Learning Videos", text: "Class-wise lesson videos shared by the school.", link: "/videos", linkText: "Watch videos" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-[#F3F6FA] p-5" data-testid={`portal-feature-${f.title.toLowerCase().replace(/\s/g, "-")}`}>
                <f.icon size={20} className="text-[#0756A5]" aria-hidden="true" />
                <p className="mt-2 font-semibold text-[#123D62] text-sm">{f.title}</p>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">{f.text}</p>
                {f.link && <Link to={f.link} className="mt-2 inline-block text-xs font-semibold text-[#0756A5] hover:underline">{f.linkText}</Link>}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-[#C9DCF0] bg-[#EAF0F8] p-5" data-testid="portal-help">
            <p className="text-sm text-[#475569] leading-relaxed">
              <strong className="text-[#123D62]">Need help?</strong> If login doesn't work, check that the
              Registration ID and date of birth match the admission record exactly. Still stuck? Call or
              WhatsApp the school at <a href={SCHOOL.phoneHref} className="text-[#0756A5] font-semibold hover:underline">{SCHOOL.phone}</a> — we will help you.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ParentsPortal;
