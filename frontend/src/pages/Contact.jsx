import { MapPin, Phone, Mail, MessageCircle, CalendarDays, School } from "lucide-react";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import ContactForm from "../components/ContactForm";
import { SCHOOL } from "../config/school";

const Contact = () => {
  const waText = encodeURIComponent(`Namaste, I would like to know more about ${SCHOOL.name} (${SCHOOL.sessionLabel}).`);
  return (
    <div data-testid="contact-page">
      <SEO
        title="Contact Us | The Study Home School, Arrah Bhojpur"
        description={`Contact The Study Home School, ${SCHOOL.address}. Phone ${SCHOOL.phone}, email ${SCHOOL.email}. Ask about the proposed ${SCHOOL.sessionLabel} for Classes 1–5.`}
      />
      <PageHero
        eyebrow="Contact us"
        title="Talk to Us — We Answer Honestly"
        description="Questions about the school, the proposed session or admissions? Reach out by phone, WhatsApp, email or the form below."
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="container-site grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">School details</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#123D62]">Reach The Study Home School</h2>
            <ul className="mt-7 space-y-5">
              <li className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0"><School size={20} aria-hidden="true" /></div>
                <div>
                  <p className="text-sm font-semibold text-[#123D62]">School name</p>
                  <p className="text-sm text-[#475569]" data-testid="contact-school-name">{SCHOOL.name}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0"><MapPin size={20} aria-hidden="true" /></div>
                <div>
                  <p className="text-sm font-semibold text-[#123D62]">Address</p>
                  <p className="text-sm text-[#475569]" data-testid="contact-address">{SCHOOL.address}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0"><Phone size={20} aria-hidden="true" /></div>
                <div>
                  <p className="text-sm font-semibold text-[#123D62]">Phone</p>
                  <a href={SCHOOL.phoneHref} className="text-sm text-[#0756A5] font-medium hover:underline" data-testid="contact-phone-link">{SCHOOL.phone}</a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0"><Mail size={20} aria-hidden="true" /></div>
                <div>
                  <p className="text-sm font-semibold text-[#123D62]">Email</p>
                  <a href={SCHOOL.emailHref} className="text-sm text-[#0756A5] font-medium hover:underline break-all" data-testid="contact-email-link">{SCHOOL.email}</a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F3F6FA] flex items-center justify-center text-[#0756A5] shrink-0"><CalendarDays size={20} aria-hidden="true" /></div>
                <div>
                  <p className="text-sm font-semibold text-[#123D62]">Proposed session</p>
                  <p className="text-sm text-[#475569]" data-testid="contact-session">{SCHOOL.sessionLabel} (proposed)</p>
                </div>
              </li>
            </ul>

            {SCHOOL.whatsappConfigured ? (
              <a href={`https://wa.me/${SCHOOL.whatsappNumber}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold px-6 py-3.5 transition-colors"
                data-testid="contact-whatsapp-btn">
                <MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp
              </a>
            ) : (
              <p className="mt-8 text-sm text-[#64748B] rounded-xl border border-slate-200 bg-[#F3F6FA] p-4" data-testid="contact-whatsapp-fallback">
                WhatsApp contact will be available soon. Meanwhile, please call {SCHOOL.phone} or use the form.
              </p>
            )}

            <div className="mt-8 rounded-2xl border border-[#C9DCF0] bg-[#F3F6FA] p-5" data-testid="contact-map-note">
              <p className="text-sm leading-relaxed text-[#475569]">
                <strong className="text-[#123D62]">Map & visiting:</strong> a location map will be
                published once the school's exact premises details are verified. Please call ahead
                before planning a visit — the school is in the planning stage and does not yet keep
                regular visiting hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <p className="eyebrow">Send a message</p>
            <h2 className="mt-2 mb-5 text-xl sm:text-2xl font-bold text-[#123D62]">Write to the School</h2>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Contact;
