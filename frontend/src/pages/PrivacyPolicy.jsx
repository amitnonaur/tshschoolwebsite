import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { SCHOOL } from "../config/school";

const SECTIONS = [
  {
    title: "What this policy covers",
    body: `This privacy policy explains what information ${SCHOOL.name} ("the school") collects through this website, why it is collected, and how it is used. The school is in the planning stage; this policy applies to enquiries made through this website.`,
  },
  {
    title: "Information we collect",
    body: `When you submit the admission enquiry form, we collect: parent/guardian name, child's name (optional), class of interest, mobile number, email address (optional), preferred contact method, and your message (optional). When you submit the contact form, we collect your name, mobile number, enquiry type and message. We do not collect children's photographs, birth certificates, medical details or home addresses through this website.`,
  },
  {
    title: "How your information is used",
    body: `Your information is used only to respond to your enquiry and to share updates about the proposed ${SCHOOL.sessionLabel} and the admission process when it opens. It is stored securely in the school's enquiry database. We do not sell, rent or share your personal information with third parties for marketing.`,
  },
  {
    title: "Children's privacy",
    body: `Children's privacy is treated as a priority. The enquiry form asks for minimal information about the child (first name and class of interest only, both optional at the initial stage). The school will never publish identifiable photographs, records or details of any student without appropriate written permission from a parent or guardian.`,
  },
  {
    title: "Cookies and analytics",
    body: `This website uses basic, privacy-conscious analytics to understand how visitors use the site (for example, which pages are read most). No advertising trackers are used, and no personal profiles are built. [Owner to confirm the final analytics setup before publication.]`,
  },
  {
    title: "Data retention and your rights",
    body: `Enquiry details are kept until they are no longer needed for admission communication, after which they are deleted. You may ask the school at any time to view, correct or delete the information you have submitted by writing to ${SCHOOL.email} or calling ${SCHOOL.phone}.`,
  },
  {
    title: "Changes to this policy",
    body: `This policy may be updated as the school's services are confirmed (for example, when email notifications or official communication channels are introduced). The current version will always be available on this page. Last updated: July 2026.`,
  },
];

const PrivacyPolicy = () => (
  <div data-testid="privacy-policy-page">
    <SEO
      title="Privacy Policy | The Study Home School"
      description="How The Study Home School collects, uses and protects the information you share through enquiry and contact forms on this website."
    />
    <PageHero eyebrow="Privacy policy" title="Your Information, Handled with Care" />
    <section className="py-14 sm:py-20 bg-white">
      <div className="container-site max-w-3xl space-y-8">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.03}>
            <article data-testid={`privacy-section-${i + 1}`}>
              <h2 className="text-lg sm:text-xl font-semibold text-[#123D62]">{s.title}</h2>
              <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#475569]">{s.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  </div>
);

export default PrivacyPolicy;
