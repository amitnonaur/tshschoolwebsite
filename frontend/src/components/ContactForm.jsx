import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { API, SCHOOL } from "../config/school";

const PHONE_RE = /^(?:\+91|91|0)?[6-9]\d{9}$/;
const TYPES = ["General", "Admission", "Fees", "Academics", "Visit"];

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", phone: "", enquiry_type: "General", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim() || form.name.trim().length < 2) er.name = "Please enter your name.";
    if (!PHONE_RE.test(form.phone.replace(/[\s-]/g, ""))) er.phone = "Please enter a valid 10-digit mobile number.";
    if (!form.message.trim() || form.message.trim().length < 5) er.message = "Please write a short message.";
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) return setErrors(er);
    setState("submitting");
    try {
      await axios.post(`${API}/contact`, form);
      setState("success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setState("error");
      toast.error("Message not sent", { description: msg });
    }
  };

  if (state === "success") {
    return (
      <div className="card-site text-center !p-10" role="status" data-testid="contact-success-state">
        <CheckCircle2 size={44} className="mx-auto text-[#16A34A]" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-[#123D62]">Message received</h3>
        <p className="mt-2 text-sm text-[#475569]">Thank you. We will get back to you soon.</p>
        <button type="button" className="mt-5 text-sm font-semibold text-[#0756A5] hover:underline"
          onClick={() => { setState("idle"); setForm({ name: "", phone: "", enquiry_type: "General", message: "", website: "" }); }}
          data-testid="contact-send-another-btn">
          Send another message
        </button>
      </div>
    );
  }

  const inputCls = (er) =>
    `w-full rounded-xl border px-4 py-3 text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]/40 ${
      er ? "border-red-400" : "border-slate-300"
    }`;

  return (
    <form onSubmit={onSubmit} noValidate className="card-site !p-6 sm:!p-8" data-testid="contact-form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="c_name" className="block text-sm font-semibold text-[#123D62] mb-1.5">
            Your name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="c_name" type="text" autoComplete="name" value={form.name} onChange={set("name")}
            className={inputCls(errors.name)} aria-invalid={!!errors.name} data-testid="contact-input-name" />
          {errors.name && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="contact-error-name">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="c_phone" className="block text-sm font-semibold text-[#123D62] mb-1.5">
            Mobile number <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="c_phone" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")}
            className={inputCls(errors.phone)} aria-invalid={!!errors.phone} data-testid="contact-input-phone" />
          {errors.phone && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="contact-error-phone">{errors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c_type" className="block text-sm font-semibold text-[#123D62] mb-1.5">Enquiry type</label>
          <select id="c_type" value={form.enquiry_type} onChange={set("enquiry_type")}
            className={inputCls(false)} data-testid="contact-select-type">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c_message" className="block text-sm font-semibold text-[#123D62] mb-1.5">
            Message <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea id="c_message" rows={4} value={form.message} onChange={set("message")}
            className={inputCls(errors.message)} aria-invalid={!!errors.message} data-testid="contact-textarea-message" />
          {errors.message && <p className="mt-1 text-xs text-red-600" role="alert" data-testid="contact-error-message">{errors.message}</p>}
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="c_website">Website</label>
          <input id="c_website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
        </div>
      </div>
      {state === "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700" role="alert" data-testid="contact-error-banner">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>Your message could not be sent. Please try again, or call {SCHOOL.phone}.</span>
        </div>
      )}
      <button type="submit" disabled={state === "submitting"}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] disabled:opacity-60 text-white font-semibold text-sm sm:text-base px-6 py-3.5 transition-colors"
        data-testid="contact-submit-btn">
        {state === "submitting" && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {state === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
