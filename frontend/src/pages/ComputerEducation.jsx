import { Link } from "react-router-dom";
import { ArrowRight, Mouse, Keyboard, FolderOpen, ShieldCheck, PenTool, BrainCircuit, Code2 } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { IMAGES } from "../config/school";

const STAGES = [
  {
    step: "Stage 1", title: "Foundations",
    text: "Familiarity with computers: what a computer is, input devices, switching on and off correctly, and safe, respectful use of equipment.",
    examples: ["Naming parts of a computer", "Correct sitting and handling", "Opening and closing a program"],
  },
  {
    step: "Stage 2", title: "Digital Skills",
    text: "Typing, file handling, drawing and simple productivity activities that make the computer a useful everyday tool.",
    examples: ["Keyboard and mouse practice", "Saving and finding files", "Drawing and colouring digitally"],
  },
  {
    step: "Stage 3", title: "Applied Learning",
    text: "Presentations, creative projects, organising information and solving small problems — using technology to support other subjects.",
    examples: ["A simple class presentation", "A digital poster for EVS", "Organising pictures and words"],
  },
  {
    step: "Stage 4", title: "Introductory Coding",
    text: "Simple logical sequences and beginner-friendly programming ideas, introduced only when developmentally appropriate.",
    examples: ["Sequencing steps in order", "Cause-and-effect puzzles", "Block-based beginner activities"],
  },
];

const SUPPORTS = [
  { icon: BrainCircuit, text: "Mathematics — patterns, sequencing and logical steps strengthen number thinking." },
  { icon: PenTool, text: "Language — typing and digital writing support spelling and composition." },
  { icon: PenTool, text: "Creativity — drawing and design tools open new ways to express ideas." },
  { icon: Code2, text: "Problem-solving — breaking a task into steps is a skill for every subject." },
];

const SAFETY = [
  "Age-appropriate, supervised computer time.",
  "Digital safety and responsible technology use taught explicitly.",
  "Screen time balanced with books, play and outdoor activity.",
];

const ComputerEducation = () => (
  <div data-testid="computer-education-page">
    <SEO
      title="Computer Education for Children | The Study Home School, Bhojpur"
      description="Age-appropriate computer education at The Study Home School: computer basics, typing, digital safety, creative activities and gradual logical thinking for primary classes."
    />
    <PageHero
      eyebrow="Computer education"
      title="Digital Confidence, Built Step by Step"
      description="A careful, age-appropriate progression — from basic computer familiarity to logical thinking — always balanced with books, play and outdoor life."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <Reveal>
          <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-[#475569]">
            These stages describe the intended instructional direction. They are not promises of
            separate grade-wise courses or specific software — the pace and depth will always match
            the children's age and readiness.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {STAGES.map((s, i) => (
            <Reveal key={s.step} delay={(i % 2) * 0.08}>
              <article className="card-site h-full" data-testid={`computer-stage-${i + 1}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0756A5]">{s.step}</p>
                <h2 className="mt-1 text-lg sm:text-xl font-semibold text-[#123D62]">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{s.text}</p>
                <ul className="mt-4 space-y-2">
                  {s.examples.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm text-[#1E293B]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0" aria-hidden="true" />{e}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    <section className="py-14 sm:py-20 bg-[#F3F6FA]">
      <div className="container-site grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <p className="eyebrow">Beyond the computer room</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">How Computers Support Every Subject</h2>
          <ul className="mt-6 space-y-4">
            {SUPPORTS.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#1E293B]">
                <s.icon size={20} className="mt-0.5 shrink-0 text-[#0756A5]" aria-hidden="true" />{s.text}
              </li>
            ))}
          </ul>
          <div className="mt-7 rounded-2xl bg-white border border-slate-200 p-5">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[#123D62]"><ShieldCheck size={18} className="text-[#16A34A]" aria-hidden="true" />A note on safety and balance</h3>
            <ul className="mt-3 space-y-2">
              {SAFETY.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-[#475569]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" aria-hidden="true" />{s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
            <img src={IMAGES.computerLabAlt.src} alt={IMAGES.computerLabAlt.alt} className="w-full h-full object-cover" loading="lazy" data-testid="computer-page-image" />
          </div>
          <p className="mt-3 text-xs text-[#64748B]">Illustrative photograph. It does not depict the actual school, teachers or students.</p>
          <Link to="/admissions#enquiry-form"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
            data-testid="computer-page-enquiry-cta">
            Ask about computer education <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ComputerEducation;
