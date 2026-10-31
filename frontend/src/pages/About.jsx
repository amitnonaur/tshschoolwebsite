import { Link } from "react-router-dom";
import { Eye, Target, CheckCircle2, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { IMAGES } from "../config/school";

const PRINCIPLES = [
  "Every child deserves respect and encouragement.",
  "Understanding matters more than rote memorisation alone.",
  "Foundational skills must be developed systematically.",
  "Children should learn through practice and exploration.",
  "Feedback should help children improve.",
  "Parents and school should work together.",
  "Learning should be inclusive, safe and age-appropriate.",
];

const REASONS = [
  { title: "Why this school is being planned", text: "Many families in and around Arrah want a primary school that combines strong academics with confident English, early computer education and genuine care — at a cost that remains sensible. The Study Home School is being planned to answer that need, step by step." },
  { title: "Foundations decide the future", text: "What a child learns between Classes 1 and 5 shapes everything that follows. Strong reading, clear writing and confident numeracy in the primary years make later learning easier, faster and more enjoyable." },
  { title: "Knowledge with practical understanding", text: "A concept is truly learned when a child can use it — measuring real objects, explaining an idea in their own words, or solving a small everyday problem. Teaching connects the textbook to real life." },
  { title: "Communication, digital capability and creativity", text: "Alongside Mathematics, English and Hindi, children need to express themselves clearly, use technology responsibly and create with their hands and minds. These are treated as essential, not optional extras." },
  { title: "Character, discipline and responsibility", text: "Respect, honesty, good habits, sports and responsibility are woven into everyday school life — because education is about the kind of person a child becomes, not only the marks they score." },
  { title: "Affordability and transparency", text: "The school is being developed in phases, with gradual investment and honest communication. Parents will always know what they are paying for and what is planned next." },
];

const About = () => (
  <div data-testid="about-page">
    <SEO
      title="About Us | The Study Home School, Arrah Bhojpur"
      description="Why The Study Home School is being planned in Arrah, Bhojpur — our vision, mission and educational principles for affordable, high-quality primary education for Classes 1–5."
    />
    <PageHero
      eyebrow="About us"
      title="A School Planned Around What Children Truly Need"
      description="The Study Home School is a planned primary school in Arrah, Bhojpur, Bihar — being built carefully, honestly and in phases, around strong foundations and all-round development."
    />

    <section className="py-14 sm:py-20 bg-white" data-testid="about-reasons-section">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={(i % 2) * 0.08}>
              <article className="card-site h-full" data-testid={`about-reason-card-${i + 1}`}>
                <h2 className="text-lg sm:text-xl font-semibold text-[#123D62]">{r.title}</h2>
                <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#475569]">{r.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    <section className="py-14 sm:py-20 bg-[#F3F6FA]" data-testid="about-vision-mission-section">
      <div className="container-site grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Reveal>
          <article className="card-site h-full !bg-[#123D62] !border-transparent">
            <Eye size={28} className="text-[#7FB4E3]" aria-hidden="true" />
            <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white">Our Vision</h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#C9D9E8]">
              To help children become knowledgeable, confident, responsible and independent
              learners who can apply what they learn in everyday life.
            </p>
          </article>
        </Reveal>
        <Reveal delay={0.1}>
          <article className="card-site h-full !bg-[#0756A5] !border-transparent">
            <Target size={28} className="text-[#BFD9F2]" aria-hidden="true" />
            <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white">Our Mission</h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#DCEBF9]">
              To provide an affordable and supportive primary-learning environment that builds
              strong academic foundations, develops communication and digital skills, encourages
              practical problem-solving, and nurtures curiosity, character and lifelong learning.
            </p>
          </article>
        </Reveal>
      </div>
    </section>

    <section className="py-14 sm:py-20 bg-white" data-testid="about-principles-section">
      <div className="container-site grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <Reveal>
          <p className="eyebrow">How we intend to teach</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">Our Educational Principles</h2>
          <ul className="mt-6 space-y-3.5">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm sm:text-base text-[#1E293B]">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#16A34A]" aria-hidden="true" />{p}
              </li>
            ))}
          </ul>
          <Link to="/admissions"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-3 transition-colors"
            data-testid="about-admissions-cta">
            Enquire about admission <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="rounded-[1.75rem] overflow-hidden shadow-lg aspect-[4/3]">
            <img src={IMAGES.studentsUniform.src} alt={IMAGES.studentsUniform.alt} className="w-full h-full object-cover" loading="lazy" data-testid="about-image" />
          </div>
          <p className="mt-3 text-xs text-[#64748B]">Illustrative photograph. It does not depict the actual school, teachers or students.</p>
        </Reveal>
      </div>
    </section>
  </div>
);

export default About;
