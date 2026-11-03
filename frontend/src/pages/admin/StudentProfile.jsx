import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Printer, Phone, Archive, RotateCcw, IndianRupee } from "lucide-react";
import { API } from "../../config/school";

const fmtInr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const Section = ({ title, children, testId }) => (
  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6" data-testid={testId}>
    <h2 className="text-base font-bold text-[#123D62] mb-4">{title}</h2>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-slate-100 last:border-0 text-sm">
    <span className="w-44 shrink-0 font-semibold text-[#64748B]">{label}</span>
    <span className="text-[#123D62]">{value || "—"}</span>
  </div>
);

const StudentProfile = () => {
  const { regId } = useParams();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, f] = await Promise.all([
          axios.get(`${API}/students/${regId}`, { withCredentials: true }),
          axios.get(`${API}/fees/student/${regId}`, { withCredentials: true }),
        ]);
        setStudent(s.data);
        setFees(f.data);
      } catch {
        toast.error("Student not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [regId]);

  const setStatus = async (status) => {
    try {
      await axios.patch(`${API}/students/${regId}/status`, { status }, { withCredentials: true });
      setStudent((s) => ({ ...s, status }));
      toast.success(`Student marked ${status}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#0756A5] border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>;
  if (!student) return <p className="text-sm text-[#64748B] py-10 text-center" data-testid="profile-not-found">Student not found.</p>;

  return (
    <div className="max-w-5xl space-y-5" data-testid="student-profile-page">
      {/* Header card — printable */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 print:shadow-none" data-testid="profile-header">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-24 h-28 rounded-xl bg-[#EAF0F8] overflow-hidden flex items-center justify-center text-[#0756A5] text-3xl font-bold shrink-0">
            {student.photo ? <img src={student.photo} alt={student.full_name} className="w-full h-full object-cover" /> : student.full_name.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-[#123D62]" data-testid="profile-name">{student.full_name}</h2>
            <p className="font-mono text-sm text-[#64748B]" data-testid="profile-reg-id">{student.reg_id}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[#EAF0F8] text-[#0756A5] font-semibold px-3 py-1">{student.course} • {student.class_name}</span>
              <span className={`rounded-full font-semibold px-3 py-1 ${student.status === "Active" ? "bg-[#EDF9F0] text-[#16A34A]" : "bg-[#FDF6EC] text-[#D97706]"}`}>{student.status}</span>
              <span className="rounded-full bg-slate-100 text-[#475569] font-semibold px-3 py-1">Session 20{student.session.slice(0, 2)}–20{student.session.slice(2)}</span>
              {student.roll_number && <span className="rounded-full bg-slate-100 text-[#475569] font-semibold px-3 py-1">Roll {student.roll_number}</span>}
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 print:hidden">
            <Link to={`/admin/admission/${student.reg_id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-xs font-semibold px-4 py-2"
              data-testid="profile-edit-btn">
              <Pencil size={13} aria-hidden="true" /> Edit
            </Link>
            <button type="button" onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white text-[#123D62] text-xs font-semibold px-4 py-2 hover:bg-slate-50"
              data-testid="profile-print-btn">
              <Printer size={13} aria-hidden="true" /> Print / PDF
            </button>
            {student.status === "Archived" ? (
              <button type="button" onClick={() => setStatus("Active")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#16A34A] text-[#16A34A] text-xs font-semibold px-4 py-2 hover:bg-[#EDF9F0]"
                data-testid="profile-restore-btn">
                <RotateCcw size={13} aria-hidden="true" /> Restore
              </button>
            ) : (
              <button type="button" onClick={() => { if (window.confirm("Archive this student? Records are preserved, never deleted.")) setStatus("Archived"); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 text-[#64748B] text-xs font-semibold px-4 py-2 hover:bg-slate-50"
                data-testid="profile-archive-btn">
                <Archive size={13} aria-hidden="true" /> Archive
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Personal Information" testId="profile-personal">
          <Row label="Date of Birth" value={student.dob} />
          <Row label="Gender" value={student.gender} />
          <Row label="Address" value={student.address} />
          <Row label="Previous School" value={student.previous_school} />
        </Section>
        <Section title="Parent / Guardian" testId="profile-parents">
          <Row label="Father's Name" value={student.father_name} />
          <Row label="Mother's Name" value={student.mother_name} />
          <Row label="Primary Mobile" value={<a href={`tel:+91${student.mobile_primary}`} className="text-[#0756A5] hover:underline inline-flex items-center gap-1"><Phone size={12} aria-hidden="true" />{student.mobile_primary}</a>} />
          <Row label="Alt. Mobile" value={student.mobile_alt} />
        </Section>
        <Section title="Admission Details" testId="profile-admission">
          <Row label="Admission Date" value={student.admission_date} />
          <Row label="Admission Status" value={student.admission_status} />
          <Row label="Session" value={`${student.session_start} to ${student.session_end}`} />
          <Row label="Admitted By" value={student.created_by} />
        </Section>
        <Section title="Course & Class" testId="profile-course">
          <Row label="Course" value={student.course} />
          <Row label="Class" value={student.class_name} />
          <Row label="Roll Number" value={student.roll_number} />
          <Row label="Subjects" value={(student.subjects || []).join(", ")} />
          <Row label="Annual Fee" value={fmtInr(student.annual_fee)} />
        </Section>
      </div>

      <Section title="Fee History" testId="profile-fees">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-5 text-sm">
            <span className="text-[#475569]">Paid: <strong className="text-[#16A34A]">{fmtInr(fees?.total_paid)}</strong></span>
            <span className="text-[#475569]">Due: <strong className="text-[#D97706]">{fmtInr(fees?.due)}</strong></span>
          </div>
          <Link to={`/admin/fees?student=${student.reg_id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2" data-testid="profile-record-payment-btn">
            <IndianRupee size={13} aria-hidden="true" /> Record Payment
          </Link>
        </div>
        {!fees || fees.payments.length === 0 ? (
          <p className="text-sm text-[#64748B]">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="profile-fee-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[#64748B] border-b border-slate-200">
                  <th className="py-2.5 pr-4">Month</th><th className="py-2.5 pr-4">Amount</th><th className="py-2.5 pr-4">Method</th><th className="py-2.5 pr-4">Date</th><th className="py-2.5">Note</th>
                </tr>
              </thead>
              <tbody>
                {fees.payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4 font-medium text-[#123D62]">{p.month}</td>
                    <td className="py-2.5 pr-4">{fmtInr(p.amount)}</td>
                    <td className="py-2.5 pr-4">{p.method}</td>
                    <td className="py-2.5 pr-4">{p.date}</td>
                    <td className="py-2.5 text-[#64748B]">{p.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Test Results & Exams" testId="profile-results">
        <p className="text-sm text-[#64748B]">Monthly test results and online exam history will appear here as they are recorded (Phases 5–6).</p>
      </Section>

      {student.edit_history?.length > 0 && (
        <Section title="Change History" testId="profile-history">
          <ul className="space-y-2 text-xs text-[#64748B]">
            {student.edit_history.slice(-5).reverse().map((h, i) => (
              <li key={i}>{new Date(h.at).toLocaleString("en-IN")} — {h.by} changed {h.changes.map((c) => c.field).join(", ")}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
};

export default StudentProfile;
