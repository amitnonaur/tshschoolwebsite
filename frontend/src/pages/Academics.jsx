import { Link } from "react-router-dom";
import { Calculator, BookOpen, Languages, Sprout, Monitor, Palette, Trophy, HeartHandshake, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const SUBJECTS = [
  {
    icon: Calculator, title: "Mathematics",
    objectives: "Confident number sense, the four operations, patterns, measurement, shapes and everyday problem-solving.",
    activities: "Counting with real objects, measuring classroom items, pattern games, mental-maths practice and story-based problems.",
    progression: "From number recognition and simple sums (Class 1–2) to multiplication, division, fractions and multi-step reasoning (Class 4–5).",
    assessment: "Oral questions, written practice, observation during activities and application to everyday situations.",
  },
  {
    icon: BookOpen, title: "English",
    objectives: "Reading fluency, clear writing, growing vocabulary and confident everyday communication.",
    activities: "Phonics and reading aloud, storytelling, handwriting practice, sentence building and simple presentations.",
    progression: "From letters and simple sentences to paragraphs, comprehension and independent written expression.",
    assessment: "Reading tasks, dictation, written work, listening activities and spoken participation.",
  },
  {
    icon: Languages, title: "Hindi",
    objectives: "Strong reading and writing in Hindi, with respect for the language of home and community.",
    activities: "Akshar and matra practice, reading stories and poems, dictation and short composition.",
    progression: "From script fluency to fluent reading, grammar basics and confident written expression.",
    assessment: "Reading aloud, dictation, written exercises and oral recitation.",
  },
  {
    icon: Sprout, title: "Environmental Studies & Early Science",
    objectives: "Curiosity about the natural and social world, and care for the environment.",
    activities: "Observing plants and weather, simple demonstrations, discussing family, food, water and cleanliness.",
    progression: "From observing and naming to classifying, explaining simple causes and caring for surroundings.",
    assessment: "Discussion, observation, drawing and simple project work.",
  },
  {
    icon: Monitor, title: "Computer Education",
    objectives: "Digital familiarity, responsible use, typing and file basics, and logical thinking.",
    activities: "Keyboard and mouse practice, drawing programs, simple documents and beginner-friendly logic exercises.",
    progression: "From basic operations to digital creativity, information organisation and introductory coding ideas.",
    assessment: "Practical tasks and observation during computer activities.",
  },
  {
    icon: Palette, title: "Art, Creativity & Project Work",
    objectives: "Creative expression, fine-motor skills and the habit of making things carefully.",
    activities: "Drawing, craft, charts and models connected to topics being studied.",
    progression: "From guided craft to independent projects and displays.",
    assessment: "Participation, effort and the finished work itself.",
  },
  {
    icon: Trophy, title: "Sports, Movement & Well-being",
    objectives: "Physical coordination, fitness, teamwork and fair play.",
    activities: "Warm-ups, running and balancing games, simple team games and free play within available space.",
    progression: "From basic movement skills to organised games with rules and cooperation.",
    assessment: "Participation, effort and growing coordination — observed, not examined.",
  },
  {
    icon: HeartHandshake, title: "Values, Habits & Life Skills",
    objectives: "Respect, honesty, responsibility, good routines and care for others.",
    activities: "Classroom routines, group responsibilities, stories with meaning and everyday courtesy.",
    progression: "From guided habits to self-managed responsibility and helpful behaviour.",
    assessment: "Observation and gentle feedback, never marks.",
  },
];

const Field = ({ label, children }) => (
  <div className="mt-4">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0756A5]">{label}</h4>
    <p className="mt-1 text-sm leading-relaxed text-[#475569]">{children}</p>
  </div>
);

const Academics = () => (
  <div data-testid="academics-page">
    <SEO
      title="Academics | Classes 1–6 Curriculum Overview — The Study Home School"
      description="Academic overview for Classes 1–6 at The Study Home School, Arrah: Mathematics, English, Hindi, EVS, computer education, art, sports and life skills — taught for understanding, not memorising."
    />
    <PageHero
      eyebrow="Academics"
      title="One Philosophy, Adapted to Every Class"
      description="The same belief — understanding over memorising — runs through every subject and every grade, from Class 1 to Class 6."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <Reveal>
          <div className="max-w-3xl rounded-2xl border border-[#C9DCF0] bg-[#F3F6FA] p-6 sm:p-8" data-testid="academics-note">
            <p className="text-sm sm:text-base leading-relaxed text-[#475569]">
              <strong className="text-[#123D62]">An honest note for parents:</strong> the school is
              planned and not yet affiliated with any board. Curriculum planning draws on
              age-appropriate learning goals and may refer to widely used resources such as NCERT
              publications — this does not imply any board affiliation or recognition. Detailed
              grade-wise syllabi will be finalised and shared before the session begins.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUBJECTS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.08}>
              <article className="card-site h-full" data-testid={`subject-card-${i + 1}`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0">
                    <s.icon size={22} aria-hidden="true" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#123D62]">{s.title}</h2>
                </div>
                <Field label="Learning objectives">{s.objectives}</Field>
                <Field label="Example classroom activities">{s.activities}</Field>
                <Field label="Expected progression">{s.progression}</Field>
                <Field label="How understanding may be assessed">{s.assessment}</Field>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <Link to="/admissions#enquiry-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
              data-testid="academics-enquiry-cta">
              Ask about the academic programme <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Academics;
