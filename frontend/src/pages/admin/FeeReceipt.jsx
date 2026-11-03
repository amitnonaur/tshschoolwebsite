import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Printer, ArrowLeft } from "lucide-react";
import { API } from "../../config/school";
import { LogoMark } from "../../components/Logo";

const fmtInr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const numToWords = (n) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x) => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : ""));
  const three = (x) => (x >= 100 ? ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x));
  if (n === 0) return "Zero";
  let words = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) words += three(crore) + " Crore ";
  if (lakh) words += two(lakh) + " Lakh ";
  if (thousand) words += two(thousand) + " Thousand ";
  if (n) words += three(n);
  return words.trim() + " Rupees Only";
};

const FeeReceipt = () => {
  const { paymentId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/fees/receipts/${paymentId}`, { withCredentials: true });
        setData(data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Receipt not found.");
      }
    })();
  }, [paymentId]);

  if (error) return <p className="text-sm text-red-600 py-10 text-center" data-testid="receipt-error">{error}</p>;
  if (!data) return <div className="flex justify-center py-20"><div className="w-7 h-7 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>;

  const { payment: p, student: s } = data;

  return (
    <div className="max-w-2xl mx-auto" data-testid="fee-receipt-page">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link to={`/admin/students/${p.reg_id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0756A5] hover:underline" data-testid="receipt-back-link">
          <ArrowLeft size={15} aria-hidden="true" /> Back to Student
        </Link>
        <button type="button" onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-6 py-2.5"
          data-testid="receipt-print-btn">
          <Printer size={15} aria-hidden="true" /> Print / Save as PDF
        </button>
      </div>

      <div className="rounded-2xl bg-white border-2 border-[#123D62] p-8 sm:p-10 print:border-2" data-testid="receipt-document">
        <div className="flex items-center justify-between border-b-2 border-[#123D62] pb-5">
          <div className="flex items-center gap-3">
            <LogoMark size={52} />
            <div>
              <p className="font-extrabold text-[#123D62] uppercase tracking-tight">The Study Home School</p>
              <p className="text-xs text-[#64748B]">South Bhelai Road, Krishna Nagar, Zero Mile, Arrah, Bihar</p>
              <p className="text-xs text-[#64748B]">+91 70116 15622 • thestudyhomeschool@gmail.com</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#64748B]">Fee Receipt</p>
            <p className="font-mono text-xs text-[#123D62]" data-testid="receipt-no">#{p.id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><p className="text-xs text-[#64748B]">Receipt Date</p><p className="font-semibold text-[#123D62]" data-testid="receipt-date">{p.date}</p></div>
          <div><p className="text-xs text-[#64748B]">Fee Month</p><p className="font-semibold text-[#123D62]" data-testid="receipt-month">{p.month}</p></div>
          <div><p className="text-xs text-[#64748B]">Student Name</p><p className="font-semibold text-[#123D62]" data-testid="receipt-student">{s.full_name}</p></div>
          <div><p className="text-xs text-[#64748B]">Registration ID</p><p className="font-mono font-semibold text-[#123D62]">{s.reg_id}</p></div>
          <div><p className="text-xs text-[#64748B]">Class</p><p className="font-semibold text-[#123D62]">{s.class_name}</p></div>
          <div><p className="text-xs text-[#64748B]">Father's Name</p><p className="font-semibold text-[#123D62]">{s.father_name}</p></div>
        </div>

        <table className="mt-6 w-full text-sm border border-slate-300">
          <thead>
            <tr className="bg-[#F3F6FA] text-left">
              <th className="py-2.5 px-4 border-b border-slate-300">Description</th>
              <th className="py-2.5 px-4 border-b border-slate-300">Method</th>
              <th className="py-2.5 px-4 border-b border-slate-300 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 px-4">Tuition fee — {p.month} (Session {p.session}){p.note ? ` — ${p.note}` : ""}</td>
              <td className="py-3 px-4">{p.method}</td>
              <td className="py-3 px-4 text-right font-bold text-[#123D62]" data-testid="receipt-amount">{fmtInr(p.amount)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-sm text-[#475569]" data-testid="receipt-words">In words: <em>{numToWords(Math.round(p.amount))}</em></p>

        <div className="mt-10 flex items-end justify-between">
          <p className="text-xs text-[#64748B]">This is a computer-generated receipt.<br />Received by: {p.recorded_by}</p>
          <div className="text-center">
            <div className="w-40 border-b border-slate-400 mb-1.5 h-10" />
            <p className="text-xs font-semibold text-[#123D62]">Authorised Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;
