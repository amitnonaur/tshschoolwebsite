import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import {
  BookOpen, MessageSquareText, Monitor, Lightbulb, Calculator, Languages, Sprout,
  Trophy, BookMarked, ClipboardCheck, HeartHandshake, Wallet, ArrowRight, HelpCircle,
  Baby, PencilLine, Blocks, GraduationCap, Rocket, Sparkles, CheckCircle2,
} from "lucide-react";
import SEO from "../components/SEO";
import { Reveal, MaskedLine } from "../components/Reveal";
import Marquee from "../components/Marquee";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { SCHOOL, IMAGES } from "../config/school";

const SectionHead = ({ eyebrow, title, intro, center = false }) => (
  <div className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#123D62]">{title}</h2>
    {intro && <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#475569]">{intro}</p>}
  </div>
);

const Section = ({ children, alt = false, testId, className = "" }) => (
  <section className={`${alt ? "bg-[#F3F6FA]" : "bg-white"} py-14 sm:py-20 ${className}`} data-testid={testId}>
    <div className="container-site">{children}</div>
  </section>
);

const PHILOSOPHY = [
  { icon: BookOpen, title: "Learn with Understanding", text: "Children are helped to understand ideas instead of only memorising answers. Concepts are explained with examples, questions and everyday connections." },
  { icon: MessageSquareText, title: "Communicate with Confidence", text: "English is built gradually through listening, speaking, reading and writing — with patient practice, never pressure before a child is ready." },
  { icon: Monitor, title: "Explore Technology", text: "Age-appropriate computer education introduces digital skills, responsible use and logical thinking from an early age." },
  { icon: Lightbulb, title: "Think, Create and Solve", text: "Activities, projects and puzzles encourage children to ask questions, try ideas and solve problems with their own hands and minds." },
];

const GRADES = [
  { icon: Baby, grade: "Class 1", focus: "A gentle start", text: "Foundational letters, sounds, numbers and classroom habits. Learning through play, stories, rhymes and simple activities." },
  { icon: PencilLine, grade: "Class 2", focus: "Growing fluency", text: "Reading simple sentences, clear handwriting, basic addition and subtraction, and confident participation in class." },
  { icon: Blocks, grade: "Class 3", focus: "Building independence", text: "Longer reading, paragraph writing, multiplication and division, and simple projects that connect subjects to daily life." },
  { icon: GraduationCap, grade: "Class 4", focus: "Deeper reasoning", text: "Reading comprehension, mathematical reasoning, structured writing, and presenting ideas in English and Hindi." },
  { icon: Rocket, grade: "Class 5", focus: "Ready for middle school", text: "Independent study habits, problem-solving, digital basics, and preparation for a confident transition to middle school." },
  { icon: GraduationCap, grade: "Class 6", focus: "Confident next step", text: "Consolidated foundations, organised study routines, stronger writing and reasoning, and a smooth bridge into middle-school expectations." },
];

const ENGLISH_POINTS = [
  "Grammar and sentence formation",
  "Vocabulary and spelling",
  "Reading comprehension",
  "Handwriting and written expression",
  "Everyday English and conversation",
  "Listening and speaking practice",
  "Helpful translation exercises",
  "Presentations, storytelling and role-play",
];

const COMPUTER_POINTS = [
  "Basic computer operations",
  "Keyboard and mouse skills",
  "Digital safety and responsible use",
  "Typing and productivity basics",
  "Creative digital activities",
  "Logical thinking and problem-solving",
  "Gradual introduction to coding",
];

const DOING_POINTS = [
  "Mathematics through measuring, counting, patterns and everyday calculations",
  "Science and environment learning through observation and simple demonstrations",
  "English through storytelling, presentations and role-play",
  "Projects using charts, models and simple materials",
  "Problem-solving through puzzles and teamwork",
  "Art, creativity and responsible group work",
];

const ASSESSMENT_POINTS = [
  "Written and oral assessments",
  "Classwork and homework",
  "Observation during lessons",
  "Projects and practical activities",
  "Reading and communication tasks",
  "Portfolios of student work",
  "Periodic feedback and revision",
];

const FAQS = [
  { q: "Which classes are planned?", a: "The Study Home School is planned for Classes 1 to 6 at launch. Growth to further classes will be considered gradually, and parents will be informed transparently." },
  { q: "When is the proposed school session?", a: `The school is planned for ${SCHOOL.sessionLabel}. This is a proposed opening; families who register their interest will be updated as plans are confirmed.` },
  { q: "What is the school's teaching approach?", a: "Teaching focuses on understanding rather than memorising. Strong foundations in Mathematics, English and Hindi are combined with practical activities, computer education, sports and character development." },
  { q: "How will English communication be developed?", a: "English grows through regular listening, speaking, reading and writing practice — storytelling, presentations, role-play and everyday classroom conversation — with gradual, patient confidence-building." },
  { q: "Will computer education be included?", a: "Yes, age-appropriate computer education is a core part of the plan: basic operations, typing, digital safety, creative activities and gradual logical thinking, progressing as children are ready." },
  { q: "How can parents enquire about admission?", a: "You can submit the enquiry form on the Admissions page, call the school, or message on WhatsApp. Enquiring now simply registers your interest — it does not commit you to admission." },
];

const Home = () => {
  const heroRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  return (
    <div data-testid="home-page">
      <SEO
        title="The Study Home School | Primary School in Arrah, Bhojpur (Proposed 2027–28)"
        description="A planned primary school in Arrah, Bhojpur, Bihar for Classes 1–6. Strong academics, confident English communication, computer education and practical learning. Enquire for Academic Session 2027–28."
      />

      {/* Hero */}
      <section ref={heroRef} className="bg-white overflow-hidden" data-testid="hero-section">
        <div className="container-site py-12 sm:py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6">
            <Reveal delay={0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C9DCF0] bg-[#F3F6FA] px-4 py-1.5 text-xs font-semibold text-[#0756A5]">
                <Sparkles size={13} aria-hidden="true" />
                Planned primary school — {SCHOOL.city}
              </span>
            </Reveal>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#123D62]" data-testid="hero-headline">
              <MaskedLine delay={0.15}>A Strong Start</MaskedLine>
              <MaskedLine delay={0.3}>for a <span className="text-[#0756A5]">Brighter</span></MaskedLine>
              <MaskedLine delay={0.45}><span className="text-[#0756A5]">Future.</span></MaskedLine>
            </h1>
            <Reveal delay={0.6}>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#475569] max-w-xl">
                An approach to primary education that brings together strong academics,
                confident English communication, computer education, practical learning
                and character development.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/academics"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white font-semibold text-sm sm:text-base px-7 py-3.5 transition-colors"
                  data-testid="hero-cta-explore">
                  Explore Our Approach <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/admissions#enquiry-form"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#123D62] text-[#123D62] hover:bg-[#123D62] hover:text-white font-semibold text-sm sm:text-base px-7 py-3.5 transition-colors"
                  data-testid="hero-cta-enquire">
                  Enquire for {SCHOOL.session}
                </Link>
              </div>
              <p className="mt-6 text-xs sm:text-sm font-semibold tracking-wide text-[#64748B] uppercase" data-testid="hero-trust-statement">
                Focused on Classes 1–6 <span className="text-[#D97706] mx-1.5" aria-hidden="true">•</span> Academic Foundations <span className="text-[#D97706] mx-1.5" aria-hidden="true">•</span> Skills for Life
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-6">
            <motion.div style={{ y: imgY }} className="relative">
              <div className="absolute -inset-3 sm:-inset-4 rounded-[2rem] border-2 border-[#0756A5]/20" aria-hidden="true" />
              <div className="relative rounded-[1.75rem] overflow-hidden shadow-xl aspect-[4/3]">
                <img src={IMAGES.heroClassroom.src} alt={IMAGES.heroClassroom.alt}
                  className="w-full h-full object-cover hero-img-drift" loading="eager" fetchPriority="high"
                  data-testid="hero-image" />
              </div>
              <div className="absolute -bottom-5 left-5 sm:left-8 rounded-2xl bg-white shadow-lg border border-slate-200 px-5 py-4" data-testid="hero-floating-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Proposed Session</p>
                <p className="text-lg sm:text-xl font-extrabold text-[#123D62]">{SCHOOL.sessionLabel}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* Philosophy */}
      <Section testId="philosophy-section">
        <Reveal><SectionHead eyebrow="Our philosophy" title="Education Beyond Memorising Answers"
          intro="Children need more than textbook knowledge. They need to understand concepts, ask questions, communicate clearly, solve problems and apply what they learn in everyday life." /></Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PHILOSOPHY.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <article className="card-site h-full" data-testid={`philosophy-card-${i + 1}`}>
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5]">
                  <c.icon size={22} aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#123D62]">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{c.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Grades */}
      <Section alt testId="programme-section">
        <Reveal><SectionHead eyebrow="Our academic programme" title="Strong Foundations for Classes 1–6"
          intro="A careful progression from foundational literacy and numeracy to stronger comprehension, mathematical reasoning, independent learning and readiness for middle school. Detailed grade-wise curriculum will be finalised and shared before the session begins." /></Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRADES.map((g, i) => (
            <Reveal key={g.grade} delay={i * 0.07}>
              <article className="card-site h-full !p-6" data-testid={`grade-card-${i + 1}`}>
                <div className="w-10 h-10 rounded-xl bg-[#0756A5] text-white flex items-center justify-center font-extrabold text-lg" aria-hidden="true">{i + 1}</div>
                <h3 className="mt-4 text-lg font-bold text-[#123D62]">{g.grade}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0756A5] mt-0.5">{g.focus}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{g.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-8">
            <Link to="/academics" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="programme-link-academics">
              See the full academic overview <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* English */}
      <Section testId="english-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <SectionHead eyebrow="Integrated English learning" title="English Is More Than a Subject"
              intro="English development combines classroom instruction with regular opportunities to listen, speak, read and write. The emphasis is on confidence, gradual progress and meaningful practice — not memorising difficult words or forcing children to speak before they are ready." />
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {ENGLISH_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-[#1E293B]">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden="true" />{p}
                </li>
              ))}
            </ul>
            <Link to="/english-communication"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-3 transition-colors"
              data-testid="english-cta">
              Explore English & Communication <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
              <img src={IMAGES.studentsReading.src} alt={IMAGES.studentsReading.alt} className="w-full h-full object-cover" loading="lazy" data-testid="english-image" />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Computer education */}
      <Section alt testId="computer-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
              <img src={IMAGES.computerLab.src} alt={IMAGES.computerLab.alt} className="w-full h-full object-cover" loading="lazy" data-testid="computer-image" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <SectionHead eyebrow="Computer education" title="Building Digital Confidence from an Early Age"
              intro="Age-appropriate computer education can progress from basic familiarity and responsible use to typing, file management, digital creativity, logical thinking and introductory programming when appropriate. Computer concepts also support other subjects through cross-curricular activities." />
            <ul className="mt-6 space-y-3">
              {COMPUTER_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-[#1E293B]">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#0756A5]" aria-hidden="true" />{p}
                </li>
              ))}
            </ul>
            <Link to="/computer-education"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#123D62] hover:bg-[#0B2742] text-white text-sm font-semibold px-6 py-3 transition-colors"
              data-testid="computer-cta">
              Explore Computer Education <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Learning by doing */}
      <Section testId="experiential-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal>
            <SectionHead eyebrow="Practical learning" title="Children Learn by Doing"
              intro="Activities are selected according to age, learning objectives, available resources and safety requirements — making classroom ideas real and memorable." />
            <ul className="mt-6 space-y-3">
              {DOING_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-sm text-[#1E293B]">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#D97706]" aria-hidden="true" />{p}
                </li>
              ))}
            </ul>
            <Link to="/experiential-learning" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="experiential-cta">
              See example projects <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
              <img src={IMAGES.studentsUniform.src} alt={IMAGES.studentsUniform.alt} className="w-full h-full object-cover" loading="lazy" data-testid="experiential-image" />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Sports */}
      <Section alt testId="sports-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
              <img src={IMAGES.sportsPlayground.src} alt={IMAGES.sportsPlayground.alt} className="w-full h-full object-cover" loading="lazy" data-testid="sports-image" />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <SectionHead eyebrow="Sports & well-being" title="Growing Healthy, Confident and Cooperative"
              intro="Sports, movement and play build physical coordination, teamwork, fair play and healthy habits. Age-appropriate games, outdoor activities and structured physical exercise will be planned for the available space and resources." />
            <Link to="/sports" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="sports-cta">
              Learn about sports & well-being <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* Resources */}
      <Section testId="resources-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-5">
            <div className="w-12 h-12 rounded-2xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5]"><BookMarked size={24} aria-hidden="true" /></div>
            <SectionHead eyebrow="Learning resources" title="Essential Books. Meaningful Practice." />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <p className="text-sm sm:text-base leading-relaxed text-[#475569]">
              The school plans to use appropriate textbooks and essential learning resources,
              supported by school-prepared worksheets, additional exercises for concept
              reinforcement, practice matched to learning needs, and revision materials with
              age-appropriate activities.
            </p>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#475569]">
              The aim is to keep learning resources genuinely useful and costs transparent.
              Details of what is and is not included in school fees will be shared clearly
              before admission.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Assessment */}
      <Section alt testId="assessment-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Reveal className="lg:col-span-5">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0756A5] border border-slate-200"><ClipboardCheck size={24} aria-hidden="true" /></div>
            <SectionHead eyebrow="Assessment & progress" title="Understand Progress, Not Just Marks"
              intro="Assessment helps identify strengths, learning gaps and areas for improvement — guiding teaching rather than pressuring children." />
            <Link to="/assessment" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="assessment-cta">
              How progress will be assessed <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ASSESSMENT_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-2.5 rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-sm text-[#1E293B]">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#0756A5]" aria-hidden="true" />{p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section testId="values-section">
        <Reveal><SectionHead center eyebrow="Character & values" title="Knowledge with Character"
          intro="Respect, honesty, responsibility, curiosity, discipline, cooperation, kindness and care for the environment — values every family can share, whatever their background." /></Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap justify-center gap-3" data-testid="values-chips">
            {["Respect", "Honesty", "Responsibility", "Curiosity", "Discipline", "Cooperation", "Kindness", "Care for Nature"].map((v) => (
              <span key={v} className="rounded-full border border-[#C9DCF0] bg-[#F3F6FA] px-5 py-2.5 text-sm font-semibold text-[#123D62]">{v}</span>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Parents + Affordability */}
      <Section alt testId="parents-affordability-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Reveal>
            <article className="card-site h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5]"><HeartHandshake size={24} aria-hidden="true" /></div>
              <h2 className="mt-4 text-xl sm:text-2xl font-bold text-[#123D62]">Parents and School: One Team</h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#475569]">
                The school intends to encourage constructive communication, regular feedback,
                home-learning support and collaborative problem-solving. Planned practices
                include parent meetings, progress updates and clear communication channels,
                established as the school begins operations.
              </p>
              <Link to="/parent-partnership" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="parents-cta">
                About the parent partnership <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="card-site h-full">
              <div className="w-12 h-12 rounded-2xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5]"><Wallet size={24} aria-hidden="true" /></div>
              <h2 className="mt-4 text-xl sm:text-2xl font-bold text-[#123D62]">Quality Learning with Clear Costs</h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#475569]">
                The Study Home School is committed to sensible use of resources, appropriate
                learning materials and transparent communication about school-related expenses.
                Fee details will be shared openly with parents before any admission decision.
              </p>
              <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-3 transition-colors" data-testid="fees-cta">
                Ask About Fees & Admissions <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          </Reveal>
        </div>
      </Section>

      {/* FAQ preview */}
      <Section testId="faq-preview-section">
        <Reveal><SectionHead center eyebrow="Questions parents ask" title="Frequently Asked Questions" /></Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 max-w-3xl mx-auto">
            <Accordion type="single" collapsible data-testid="faq-preview-accordion">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-[#123D62]" data-testid={`faq-preview-trigger-${i}`}>{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-[#475569]" data-testid={`faq-preview-content-${i}`}>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-6 text-center">
              <Link to="/faq" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="faq-preview-more-link">
                <HelpCircle size={16} aria-hidden="true" /> See all questions
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Final CTA */}
      <section className="bg-[#123D62] py-16 sm:py-24" data-testid="final-cta-section">
        <div className="container-site text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white max-w-2xl mx-auto">
              Give Your Child a Stronger Foundation for the Future.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#C9D9E8] max-w-xl mx-auto">
              Connect with The Study Home School to learn about the proposed academic programme,
              admission plans and the school's approach to primary education.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/admissions#enquiry-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold text-sm sm:text-base px-8 py-3.5 transition-colors"
                data-testid="final-cta-enquiry-btn">
                Submit an Enquiry <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 text-white hover:bg-white hover:text-[#123D62] font-semibold text-sm sm:text-base px-8 py-3.5 transition-colors"
                data-testid="final-cta-contact-btn">
                Contact the School
              </Link>
            </div>
            <p className="mt-5 text-xs text-[#8FA9C2]">Proposed {SCHOOL.sessionLabel} — enquiry registers interest; it does not confirm admission.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
