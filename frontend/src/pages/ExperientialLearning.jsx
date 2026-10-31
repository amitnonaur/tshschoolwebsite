import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Leaf, BookOpen, Ruler, Monitor, Users } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const PROJECTS = [
  {
    icon: Calculator, title: "Mathematics in Daily Life",
    objective: "Show children that numbers are everywhere and useful.",
    activity: "Children measure their desks, count classroom objects, compare prices on a pretend shopping trip and build patterns with blocks.",
    skills: "Number sense, measurement, estimation, reasoning.",
    safety: "Uses simple classroom materials only.",
  },
  {
    icon: Leaf, title: "My Environment",
    objective: "Build observation skills and care for nature.",
    activity: "Children observe a plant over weeks, draw its changes, sort waste into the right bins and discuss water and cleanliness at home and school.",
    skills: "Observation, recording, environmental responsibility.",
    safety: "Outdoor observation is supervised and close to the classroom.",
  },
  {
    icon: BookOpen, title: "Reading & Storytelling",
    objective: "Make reading joyful and speaking confident.",
    activity: "Children read a short story, retell it in their own words, act out a scene and draw their favourite moment.",
    skills: "Comprehension, expression, imagination, confidence.",
    safety: "None — a reading and speaking activity.",
  },
  {
    icon: Ruler, title: "Creative Models & Charts",
    objective: "Turn learning into something children can see and touch.",
    activity: "Children build a chart of healthy foods, a paper model of their neighbourhood, or a weather calendar for the classroom wall.",
    skills: "Planning, fine-motor skills, presentation.",
    safety: "Child-safe scissors and materials; teacher supervision for cutting.",
  },
  {
    icon: Monitor, title: "Digital Creativity",
    objective: "Let children create with technology, not only consume it.",
    activity: "Children draw a festival scene in a painting program or arrange words and pictures into a simple class poster.",
    skills: "Digital tools, creativity, patience.",
    safety: "Supervised, time-limited computer sessions.",
  },
  {
    icon: Users, title: "Teamwork & Problem-Solving",
    objective: "Learn to plan, share, disagree kindly and finish together.",
    activity: "Small groups solve a puzzle challenge or build the tallest paper tower, then explain how their team decided what to do.",
    skills: "Cooperation, communication, persistence.",
    safety: "Lightweight materials; clear group rules.",
  },
];

const ExperientialLearning = () => (
  <div data-testid="experiential-learning-page">
    <SEO
      title="Learning Beyond Textbooks | The Study Home School, Bhojpur"
      description="Learning by doing at The Study Home School: example projects in mathematics, environment, reading, models and charts, digital creativity and teamwork for primary classes."
    />
    <PageHero
      eyebrow="Learning beyond textbooks"
      title="Children Learn by Doing"
      description="Practical activities make classroom ideas real. Every activity is chosen for the children's age, the learning objective, available resources and safety."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <Reveal>
          <div className="max-w-3xl rounded-2xl border border-[#C9DCF0] bg-[#F3F6FA] p-6" data-testid="projects-disclaimer">
            <p className="text-sm leading-relaxed text-[#475569]">
              <strong className="text-[#123D62]">Please note:</strong> the examples below are
              illustrative activities that show the intended teaching style. They are not completed
              school projects or photographs of actual students.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 0.07}>
              <article className="card-site h-full flex flex-col" data-testid={`project-card-${i + 1}`}>
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5]">
                  <p.icon size={22} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#123D62]">{p.title}</h2>
                <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[#475569]">
                  <p><strong className="text-[#123D62]">Objective:</strong> {p.objective}</p>
                  <p><strong className="text-[#123D62]">Sample activity:</strong> {p.activity}</p>
                  <p><strong className="text-[#123D62]">Skills:</strong> {p.skills}</p>
                </div>
                <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#64748B]">
                  <strong>Safety note:</strong> {p.safety}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <Link to="/admissions#enquiry-form"
              className="inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
              data-testid="projects-enquiry-cta">
              Ask about practical learning <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default ExperientialLearning;
