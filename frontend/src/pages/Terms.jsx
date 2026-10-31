import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { SCHOOL } from "../config/school";

const SECTIONS = [
  {
    title: "About this website",
    body: `This website belongs to ${SCHOOL.name}, a planned primary school in ${SCHOOL.city}, proposed for ${SCHOOL.sessionLabel}. By using this website you accept these terms of use.`,
  },
  {
    title: "Information presented as plans",
    body: `The school is in the planning stage. Descriptions of classes, teaching approaches, facilities and activities on this website describe intentions and plans, not currently operating services. Words such as "planned", "proposed" and "intended" are used deliberately and should be read as such.`,
  },
  {
    title: "No admission guarantee",
    body: `Submitting an enquiry or contact form does not create any admission right, reservation or obligation on either side. Admission terms, eligibility, fees and processes will be published and communicated when the admission process officially opens.`,
  },
  {
    title: "Photographs and content",
    body: `Photographs on this website are licensed stock images used for illustration. They do not depict the actual school premises, teachers or students, and must not be understood as such. All text and design content belongs to the school and may not be copied for commercial use without permission.`,
  },
  {
    title: "Accuracy and changes",
    body: `The school works to keep information accurate and current, but details may change as planning progresses. The school may update any page at any time without prior notice. For the latest confirmed information, please contact the school directly at ${SCHOOL.phone} or ${SCHOOL.email}.`,
  },
  {
    title: "Acceptable use",
    body: `You agree not to misuse this website: no submitting false or misleading enquiries, no attempting to disrupt the site or its forms, and no automated scraping of content. Enquiry forms are protected by basic anti-spam and rate-limiting measures.`,
  },
  {
    title: "Liability",
    body: `This website is provided in good faith "as is". To the extent permitted by law, the school is not liable for decisions made solely on the basis of website content. Nothing on this website constitutes a binding offer of admission or services.`,
  },
  {
    title: "Governing area",
    body: `These terms are governed by the laws of India, and any disputes shall be subject to the jurisdiction of the courts in Bhojpur, Bihar. Last updated: July 2026.`,
  },
];

const Terms = () => (
  <div data-testid="terms-page">
    <SEO
      title="Terms of Use | The Study Home School"
      description="Terms of use for The Study Home School website — planned-school disclosures, enquiry terms, content ownership and acceptable use."
    />
    <PageHero eyebrow="Terms of use" title="Clear Terms, Honestly Stated" />
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site max-w-3xl space-y-8">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.03}>
            <article data-testid={`terms-section-${i + 1}`}>
              <h2 className="text-lg sm:text-xl font-semibold text-[#123D62]">{s.title}</h2>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#475569]">{s.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  </div>
);

export default Terms;
