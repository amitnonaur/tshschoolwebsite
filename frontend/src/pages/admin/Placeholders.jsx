const Placeholder = ({ title, note }) => (
  <div className="max-w-2xl" data-testid={`placeholder-${title.toLowerCase().replace(/\s/g, "-")}`}>
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
      <h2 className="text-lg font-bold text-[#123D62]">{title}</h2>
      <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{note}</p>
    </div>
  </div>
);

export const Materials = () => (
  <Placeholder title="Materials"
    note="Study-material management will be built in a later phase with your exact workflow — per your instruction, no business logic will be invented here. The existing website content is untouched." />
);

export const Videos = () => (
  <Placeholder title="Videos"
    note="Video management will be built in a later phase with your exact workflow — per your instruction, no business logic will be invented here." />
);

export const Announcements = () => (
  <Placeholder title="Announcements"
    note="Announcement publishing will be built in a later phase with your exact workflow — per your instruction, no publication workflow will be invented here." />
);

export const FinanceTracker = () => (
  <Placeholder title="Finance Tracker"
    note="Full finance tracking (expenses, categories, reports) will be built in a later phase once you confirm the financial rules. Fee collection tracking is live in Fee Manager and the Dashboard." />
);

export const OnlineExams = () => (
  <Placeholder title="Online Exams"
    note="The online examination system (question bank, scheduling, live monitor, student exam interface with Reg ID + DOB login, auto-evaluation) is the largest module and is being built in the final phase." />
);

export const UserManagement = () => (
  <Placeholder title="User Management"
    note="Role-based user management (Super Admin, Administrator, Accountant, Teacher) will be activated when you add staff accounts. Your primary administrator account already has full access." />
);
