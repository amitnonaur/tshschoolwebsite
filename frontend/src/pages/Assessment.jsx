import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const METHODS = [
  { title: "Understanding prior learning", text: "Where appropriate, teachers gently diagnose what a child already knows, so teaching starts from the right place — not too easy, not too hard." },
  { title: "Formative checks during teaching", text: "Short questions, quick tasks and observation during lessons show whether the class is following, so teaching can adjust immediately." },
  { title: "Written and oral tests", text: "Regular, low-pressure written and oral assessments check retention and understanding without frightening young children." },
  { title: "Reading, writing & communication tasks", text: "Reading aloud, dictation, handwriting and spoken answers are assessed alongside written papers — especially in English and Hindi." },
  { title: "Projects & practical demonstrations", text: "Charts, models and practical activities let children show understanding in ways a test paper cannot capture." },
  { title: "Teacher observations", text: "Participation, effort, habits and confidence are noticed and recorded over time, not judged from a single day." },
  { title: "Identifying learning gaps", text: "Assessment results are used to find exactly where a child is stuck — a sound, an operation, a concept — so it can be fixed early." },
  { title: "Revision & additional practice", text: "Children who need more time receive revision and extra practice; children who are ready receive enrichment." },
  { title: "Parent feedback & progress discussions", text: "Progress is discussed honestly with parents — strengths, gaps and what can be done at school and at home." },
];

const Assessment = () => (
  <div data-testid="assessment-page">
    <SEO
      title="Assessment & Student Development | The Study Home School"
      description="A balanced assessment approach at The Study Home School: written and oral assessments, projects, observation, learning-gap identification and honest parent feedback."
    />
    <PageHero
      eyebrow="Assessment & student development"
      title="Understand Progress, Not Just Marks"
      description="Marks are useful, but they do not capture every aspect of a child's development. Assessment here exists to guide teaching and help every child improve."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {METHODS.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 0.07}>
              <article className="card-site h-full" data-testid={`assessment-method-${i + 1}`}>
                <h2 className="text-base sm:text-lg font-semibold text-[#123D62]">{m.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{m.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-[#C9DCF0] bg-[#F3F6FA] p-6 sm:p-8" data-testid="assessment-honest-note">
            <h2 className="text-lg sm:text-xl font-semibold text-[#123D62]">What we will not promise</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                "No child can be guaranteed a particular mark, rank or examination result.",
                "The exact examination schedule and report-card frequency will be finalised and shared before the session begins.",
                "Assessment will never be used to label or shame a child — only to help them.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-[#475569]">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#0756A5]" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
            <Link to="/parent-partnership" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0756A5] hover:gap-3 transition-[gap]" data-testid="assessment-parents-link">
              How parents stay involved <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default Assessment;
