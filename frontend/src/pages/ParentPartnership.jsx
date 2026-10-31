import { Link } from "react-router-dom";
import { ArrowRight, MessagesSquare, BookOpen, Clock, HeartHandshake, MonitorSmartphone, ShieldCheck, CalendarCheck } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const PARTNERSHIP = [
  { icon: MessagesSquare, title: "Communication about learning progress", text: "Parents receive honest, understandable updates about how their child is doing — not just marks, but habits, confidence and participation." },
  { icon: BookOpen, title: "Reading and practice at home", text: "A few minutes of reading together each evening does more than hours of tuition. The school will share simple, realistic ways to support learning at home." },
  { icon: Clock, title: "Healthy routines and attendance", text: "Regular sleep, timely arrival and steady attendance give children the stability that learning needs. Small routines make a large difference." },
  { icon: HeartHandshake, title: "Discussing difficulties constructively", text: "If a child struggles, school and family look at it together — without blame. A difficulty is information, not a verdict." },
  { icon: MonitorSmartphone, title: "Sensible screen-time habits", text: "The school will encourage balanced screen habits at home, so technology supports learning rather than replacing sleep, play and reading." },
  { icon: ShieldCheck, title: "Mutual respect and child safeguarding", text: "Children learn best where adults cooperate respectfully. The school is committed to a safe, dignified environment for every child." },
  { icon: CalendarCheck, title: "Meetings and feedback, as they are established", text: "Parent meetings, progress discussions and clear communication channels are planned practices, introduced and shared as the school begins operations." },
];

const ParentPartnership = () => (
  <div data-testid="parent-partnership-page">
    <SEO
      title="Parent Partnership | The Study Home School, Bhojpur"
      description="How parents and The Study Home School will work together: honest progress communication, home reading, healthy routines, constructive problem-solving and mutual respect."
    />
    <PageHero
      eyebrow="Parent partnership"
      title="Parents and School: One Team"
      description="A child has one education but two classrooms — school and home. When both work together with respect and honesty, children flourish."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <Reveal>
          <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-[#475569]">
            The school does not believe in blaming parents when a child finds something difficult.
            Most parents are doing their best with the time and resources they have. The partnership
            below describes what the school will offer and what it gently asks in return.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PARTNERSHIP.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 0.08}>
              <article className="card-site h-full flex gap-4" data-testid={`partnership-card-${i + 1}`}>
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0">
                  <p.icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#123D62]">{p.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">{p.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <Link to="/admissions#enquiry-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
              data-testid="partnership-enquiry-cta">
              Start the conversation <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ParentPartnership;
