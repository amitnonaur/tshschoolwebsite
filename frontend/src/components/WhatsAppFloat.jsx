import { MessageCircle } from "lucide-react";
import { SCHOOL } from "../config/school";

const WhatsAppFloat = () => {
  if (!SCHOOL.whatsappConfigured) return null;
  const text = encodeURIComponent(
    `Namaste, I would like to know more about admission at ${SCHOOL.name} for ${SCHOOL.sessionLabel}.`
  );
  return (
    <a
      href={`https://wa.me/${SCHOOL.whatsappNumber}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with the school on WhatsApp"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white shadow-lg transition-colors"
      data-testid="whatsapp-floating-btn"
    >
      <MessageCircle size={24} aria-hidden="true" />
    </a>
  );
};

export default WhatsAppFloat;
