import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { SCHOOL } from "../config/school";

const GROUPS = [
  {
    category: "The school & session",
    faqs: [
      { q: "Which classes are planned?", a: "Classes 1 to 6 at launch. Growth to further classes will be gradual, and parents will be informed transparently as plans develop." },
      { q: "When will the school open?", a: `The proposed opening is ${SCHOOL.sessionLabel}. This is a planned session, not a confirmed opening date. Families who register their interest will be updated as plans are confirmed.` },
      { q: "Where will the school be located?", a: `The planned premises are at ${SCHOOL.address}, with eight rooms plus a play area, and an initial planned capacity of approximately 100 students.` },
      { q: "Is the school affiliated or recognised?", a: "The school is being planned and does not yet claim any board affiliation, recognition or registration. Curriculum planning may refer to widely used resources such as NCERT publications, which does not imply affiliation. Any future affiliation will be shared honestly once formally confirmed." },
    ],
  },
  {
    category: "Teaching & learning",
    faqs: [
      { q: "What is the teaching approach?", a: "Understanding over memorising. Strong foundations in Mathematics, English and Hindi are combined with practical activities, computer education, sports and character development." },
      { q: "How will English communication be developed?", a: "Through regular listening, speaking, reading and writing: storytelling, presentations, role-play, everyday classroom conversation and patient, gradual practice. Hindi and other subjects receive full attention alongside." },
      { q: "Will computer education be included?", a: "Yes. Age-appropriate computer education is part of the plan: basic operations, typing, digital safety, creative activities and gradual logical thinking, progressing as children are ready." },
      { q: "How will my child's progress be assessed?", a: "Through a balanced mix of written and oral assessments, classwork, observation, projects and portfolios — used to find strengths and gaps and guide teaching, not to pressure children." },
    ],
  },
  {
    category: "Fees & practical matters",
    faqs: [
      { q: "What will the fees be?", a: "Fee details have not been finalised and will be shared openly with parents before any admission decision. The school is committed to sensible costs and transparent communication about every school-related expense." },
      { q: "Are books, uniform and stationery included in fees?", a: "This has not been finalised. What is and is not included will be stated clearly in writing before admission, so there are no surprises." },
      { q: "Is transport available?", a: "Transport arrangements have not been confirmed. Any transport plan will be communicated before the session begins." },
    ],
  },
  {
    category: "Admissions & contact",
    faqs: [
      { q: "How can I enquire about admission?", a: "Submit the enquiry form on the Admissions page, call the school, or message on WhatsApp. Enquiring registers your interest — it does not commit you to admission." },
      { q: "Is there an entrance test?", a: "No admission process has been finalised. If any readiness conversation or assessment is introduced, it will be age-appropriate and communicated clearly in advance." },
      { q: "How will the school communicate with parents?", a: "Planned practices include parent meetings, progress updates and clear phone/WhatsApp communication, introduced as the school begins operations." },
    ],
  },
];

const FAQ = () => (
  <div data-testid="faq-page">
    <SEO
      title="FAQ | The Study Home School, Arrah Bhojpur"
      description="Answers to common questions about The Study Home School: planned classes, the proposed 2027–28 session, teaching approach, English and computer education, fees and admissions."
    />
    <PageHero
      eyebrow="Frequently asked questions"
      title="Honest Answers to Honest Questions"
      description="Everything here reflects confirmed information or clearly identified plans. Where something is not yet finalised, we say so."
    />

    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site max-w-3xl">
        {GROUPS.map((g, gi) => (
          <Reveal key={g.category} delay={gi * 0.05}>
            <div className={gi > 0 ? "mt-12" : ""}>
              <h2 className="text-xl sm:text-2xl font-bold text-[#123D62] mb-4">{g.category}</h2>
              <Accordion type="single" collapsible data-testid={`faq-group-${gi}`}>
                {g.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`faq-${gi}-${i}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-[#123D62]" data-testid={`faq-trigger-${gi}-${i}`}>{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-[#475569]" data-testid={`faq-content-${gi}-${i}`}>{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
        ))}
        <Reveal delay={0.1}>
          <div className="mt-12 rounded-2xl bg-[#123D62] p-6 sm:p-8 text-center" data-testid="faq-cta-card">
            <h2 className="text-lg sm:text-xl font-bold text-white">Didn't find your question?</h2>
            <p className="mt-2 text-sm text-[#C9D9E8]">Ask directly — the school will answer honestly.</p>
            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-[#123D62] hover:bg-[#EAF0F8] text-sm font-semibold px-6 py-3 transition-colors" data-testid="faq-contact-cta">
                Contact the School
              </Link>
              <Link to="/admissions#enquiry-form" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-6 py-3 transition-colors" data-testid="faq-enquiry-cta">
                Submit an Enquiry <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
);

export default FAQ;
