import { Link } from "react-router-dom";
import { CheckCircle2, Info, ListChecks, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import EnquiryForm from "../components/EnquiryForm";
import { SCHOOL } from "../config/school";

const STEPS = [
  { step: "1", title: "Register your interest", text: "Submit the enquiry form below, call the school, or message on WhatsApp. This simply tells the school you would like to be kept informed." },
  { step: "2", title: "Talk with the school", text: "The school will contact you on your preferred method to understand your child's needs and answer your questions honestly." },
  { step: "3", title: "Receive updates", text: "As the proposed 2027–28 session approaches, you will receive clear information about the admission process, fees and next steps." },
  { step: "4", title: "Decide with full information", text: "Admission details — documents, process and timelines — will be shared transparently before you make any decision or payment." },
];

const CHECKLIST = [
  "Child's recent photograph and basic identity details",
  "Birth certificate or age proof",
  "Previous school records or report card (if the child has studied before)",
  "Parent/guardian identity and contact details",
  "Any medical information the school should know for the child's safety",
];

const Admissions = () => (
  <div data-testid="admissions-page">
    <SEO
      title={`Admissions ${SCHOOL.session} | The Study Home School, Arrah Bhojpur`}
      description={`Register your interest for Classes 1–5 at The Study Home School, Arrah, Bhojpur — proposed for ${SCHOOL.sessionLabel}. Enquire about the admission process, fees and the school's approach.`}
    />
    <PageHero
      eyebrow={`Admissions — proposed ${SCHOOL.session}`}
      title="Register Your Interest for 2027–28"
      description="The Study Home School is planned for Classes 1–5, proposed for Academic Session 2027–28. Admissions are not yet open — submit an enquiry and the school will keep you informed."
    />

    <section className="py-14 sm:py-20 bg-white" data-testid="admissions-intro-section">
      <div className="container-site grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow">The educational approach</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">What Your Child's Day Will Be Built Around</h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#475569]">
              Strong foundations in Mathematics, English, Hindi and Environmental Studies; English
              communication built through everyday practice; age-appropriate computer education;
              learning by doing; and character developed through discipline, sports and care.
              The school is being developed in phases — planned for {SCHOOL.plannedCapacity} across
              {" "}{SCHOOL.plannedPremises} — with honest communication at every step.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C9DCF0] bg-[#F3F6FA] p-5" data-testid="admissions-status-note">
              <Info size={18} className="mt-0.5 shrink-0 text-[#0756A5]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-[#475569]">
                <strong className="text-[#123D62]">Current status:</strong> the admission process
                has not officially opened. No admission date, fee or seat count has been finalised.
                Enquiring now registers your interest only — it creates no obligation on either side.
              </p>
            </div>

            <p className="eyebrow mt-12">How it will work</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">From Enquiry to Admission</h2>
            <div className="mt-6 space-y-4">
              {STEPS.map((s) => (
                <div key={s.step} className="flex gap-4" data-testid={`admissions-step-${s.step}`}>
                  <div className="w-9 h-9 rounded-full bg-[#0756A5] text-white flex items-center justify-center font-bold text-sm shrink-0" aria-hidden="true">{s.step}</div>
                  <div>
                    <h3 className="text-base font-semibold text-[#123D62]">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#475569]">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="eyebrow mt-12">Be prepared</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">Information You May Eventually Need</h2>
            <p className="mt-3 text-sm text-[#64748B]">
              A typical checklist for school admissions — the final list will be confirmed when the admission process opens.
            </p>
            <ul className="mt-4 space-y-2.5">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-[#1E293B]">
                  <ListChecks size={17} className="mt-0.5 shrink-0 text-[#0756A5]" aria-hidden="true" />{c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-5" id="enquiry-form">
          <Reveal delay={0.1}>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Admission enquiry form</p>
              <h2 className="mt-2 mb-5 text-xl sm:text-2xl font-bold text-[#123D62]">Enquire About the Proposed {SCHOOL.session} Session</h2>
              <EnquiryForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <section className="py-14 sm:py-16 bg-[#123D62]" data-testid="admissions-faq-cta">
      <div className="container-site flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Have questions before enquiring?</h2>
          <p className="mt-1.5 text-sm text-[#C9D9E8]">Read answers to the questions parents ask most often.</p>
        </div>
        <Link to="/faq"
          className="inline-flex items-center gap-2 rounded-full bg-white text-[#123D62] hover:bg-[#EAF0F8] text-sm font-semibold px-7 py-3.5 transition-colors shrink-0"
          data-testid="admissions-faq-link">
          Read the FAQ <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </section>
  </div>
);

export default Admissions;
