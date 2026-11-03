# PRD — The Study Home School Website

## Original problem statement
Build a complete, modern, responsive, admission-focused website for The Study Home School, a planned primary school in Arrah, Bhojpur, Bihar (Classes 1–5, proposed Academic Session 2027–28). 14 pages, working enquiry/contact forms stored in MongoDB, blue/navy brand palette (#0756A5 / #123D62), honest planned-school language, no fabricated claims, mobile-first for parents on Android, SEO + accessibility foundations, central config file. Award-level motion direction: masked hero reveal, Lenis smooth scroll, Framer Motion reveals, editorial marquee, custom SVG logo/favicon.

## User personas
- Parents in/near Arrah & Bhojpur comparing primary schools for Classes 1–5, mostly on Android phones with modest bandwidth.
- Families wanting affordable, transparent fees, English improvement, early computer education and individual attention.

## Architecture
- Frontend: React 19 + react-router-dom 7, Tailwind + shadcn/ui, Framer Motion, Lenis, sonner toasts, axios.
- Backend: FastAPI + Motor (MongoDB), routes prefixed /api.
- Central config: /app/frontend/src/config/school.js (school name, session, contacts, admission status, images, API base).
- Pages: /app/frontend/src/pages/*.jsx (14 routes). Components: Header, Footer, Layout, Logo, Reveal, PageHero, Marquee, EnquiryForm, ContactForm, WhatsAppFloat, SEO.
- Backend endpoints: POST /api/enquiries, POST /api/contact (honeypot + rate limit 5/min/IP + duplicate guard + Indian phone validation), GET /api/ health.

## Implemented (31 July 2026)
- All 14 routes: Home (16 sections), About, Academics, English & Communication, Computer Education, Experiential Learning, Sports, Assessment, Parent Partnership, Admissions (full enquiry form), FAQ (grouped accordions), Contact (form + WhatsApp button + map placeholder note), Privacy Policy, Terms, custom 404.
- Working admission enquiry + contact forms: client + server validation, success/error states, duplicate submission protection, spam honeypot, rate limiting.
- Brand system: blue/navy palette, Plus Jakarta Sans + Inter, custom SVG logo mark + favicon.
- Motion: masked line-by-line hero reveal, Lenis smooth scroll, scroll reveals, editorial marquee, subtle hero parallax, reduced-motion support.
- Mobile: sticky enquiry bar, hamburger menu, WhatsApp float, no horizontal overflow (verified at 375/768/1366px).
- SEO: unique titles/descriptions per page, OG tags, sitemap.xml, robots.txt, semantic headings, alt text.
- Contact details configured: South Bhelai Road, Krishna Nagar, Zero Mile, Arrah; +91 70116 15622 (WhatsApp assumed same); thestudyhomeschool@gmail.com.

## Core requirements (static)
- Never fabricate affiliation, recognition, staff, results, testimonials, fees or facilities.
- Planned-school language everywhere until launch is confirmed.
- All contact/session facts editable in src/config/school.js.

## Verified
- Backend: enquiry POST success, duplicate rejected (409), invalid phone rejected (422), contact POST success.
- Frontend: empty-submit validation errors shown; full form submission shows success state; FAQ accordion opens; 404 renders; desktop/tablet/mobile screenshots clean.

## Implemented (1 November 2026)
- Official TSH logo placed in header, footer, admin login and favicon (background removed, circular crop).
- Enquiry email alerts: every admission enquiry and contact message emails thestudyhomeschool@gmail.com via Emergent-managed email (verified 202 Accepted). Fire-and-forget — email failure never breaks form submission.
- Private Enquiry Dashboard at /admin (login at /admin/login): JWT cookie auth, bcrypt, 15-min brute-force lockout, tabs for admission enquiries + contact messages, status workflow (new/contacted/closed).
- Admissions Open Mode: one switch (admissionStatus in src/config/school.js) flips announcement bar and Admissions page wording to "Admissions Open".

## Implemented (1 November 2026 — round 2)
- Change Password: POST /api/auth/change-password (verifies current password, min 8 chars) + modal in the admin dashboard. Verified wrong current rejected, mismatch caught, login with new password works.
- Export Enquiries: one-tap CSV download (admission enquiries and contact messages separately), verified file download admission-enquiries-2026-11-01.csv.
- Deployment: first production deploy requested by user, 50 ECU charge confirmed, dispatched 1 Nov 2026.

## Implemented (1 November 2026 — round 3)
- Classes extended from 1–5 to 1–6 everywhere: config, backend validation, enquiry form dropdown, homepage grade cards (6 cards), hero trust line, About/Academics/FAQ/Admissions/Contact copy, page titles and meta descriptions. Verified Class 6 enquiry accepted by backend.
- Google Map embedded on Contact page (owner-verified coordinates 25.535501, 84.646393) with "Open in Google Maps" directions link.
- Custom domain: full connection guide given to user (Domain tab → Auto-link or manual A/CNAME records); domain thestudyhomeschool.in to be connected by user; sitemap/robots/FRONTEND_URL need updating to the new domain once connected.
- WhatsApp enquiry alerts: user chose to skip (email alerts suffice).

## Implemented (3 November 2026 — Admin Panel Phases 2–6)
- Admin shell: dark navy sidebar (#123D62) + teal active nav (#14B8A6), 15 nav items grouped MAIN/STUDENT MANAGEMENT/ACADEMICS/COMMUNICATION/FINANCE/SYSTEM, topbar with page title/date/admin, responsive mobile drawer.
- Registration IDs: TSH{session}{seq:04d} (e.g. TSH26270001), sequence continues across sessions; academic session rolls over every 1 April (2627 → 2728).
- New Admission: full form (student/parent/course/office), photo upload with preview (base64, max 2MB), auto course+fee defaults, roll uniqueness per class+session, Reg ID auto-generation, edit mode with change history, print/PDF via print CSS.
- Student List: search (name/reg/father/mobile), filters (course/class/session/status), pagination, CSV export, archive/restore (never delete).
- Student Profile: all sections incl. fee history + change history.
- Fee Manager: default annual fees per class (auto-fill), record payments (month/method/note), duplicate month payment blocked (unique index), dues list, summary cards; dashboard fee&due tracker + revenue chart + course doughnut — all from real DB records.
- Promote Batch: fetch, per-student decision (Promote/Hold Back/Transfer Out/Mark Inactive), auto/manual roll assignment with duplicate checks, confirmation, immutable promotion history; session dates update on promotion.
- Test Results: fetch batch, per-subject max marks, absent handling (blank=null), auto total/pct/grade (A+..F), standard competition tie ranking, save draft vs publish, reloads saved results, ranking card (top 3, top 10, averages, high/low), CSV export.
- Verified E2E: admitted Rohan Verma (TSH26270003), recorded May payment (due 18,000→16,500), promoted 2 students Class 2→3 (rolls auto-assigned 1,2) + held back 1, history shows 3 rows, profile sessions consistent.
- Placeholders (explicitly deferred per user spec, no invented logic): Materials, Videos, Announcements, Finance Tracker, User Management.
- Note: MongoDB standalone → no multi-doc transactions; promotion uses pre-validation + sequential writes with full history records.

## Implemented (3 November 2026 — Phases 7–9)
- Online Exams (full): admin exam builder (name/course/class/subject/schedule/duration/attempts/instructions/negative marking +2/-0.5 defaults, shuffle), question builder (MCQ 4-option + True/False) with validation, question bank (class/subject/chapter/difficulty), statuses draft→scheduled→published→live→completed/cancelled, live monitor (students/started/submitted, extend time, cancel, publish results), activity log. Student interface at /exam-login (Reg ID + DOB JWT), /exam list, /exam/:id/take with server-enforced deadline + auto-submit + shuffled Q&A, result only after admin publishes. Verified: Aarav scored 4/4, attempt limit enforced, wrong DOB rejected.
- Bulk Import: CSV/XLSX template download, preview with per-row validation (dob format, gender, mobile, class, duplicate Reg IDs in file and DB), confirm import with skip-not-overwrite, import history. Verified: 2 imported (TSH26270004/05), 1 bad row skipped with clear errors.
- Materials: upload (title/class/subject/desc/file ≤5MB), list with class filter, download, delete.
- Announcements: post with audience (All/class), list, delete.
- Videos, Finance Tracker, User Management remain placeholders pending owner workflow rules.

## Implemented (3 November 2026 — Phase 10: Videos, Finance, Staff)
- Videos: YouTube-link module — admin pastes watch/share/shorts URL per class+subject, thumbnails auto-loaded, class filter, delete. URL validated server-side.
- Finance Tracker: two sections — Investment (furniture/building/computers/books/play area/electrical/other) and Operational Cost (salaries/rent/utilities/stationery/maintenance/transport/events/internet/other). Summary cards: fee collection, investment, operational, net. Entries + CSV export, session-tagged.
- Staff accounts: roles admin/accountant/teacher; create users (bcrypt), activate/deactivate, role-filtered sidebar, backend require_roles enforcement (finance admin+accountant; videos admin+teacher; users admin-only). Login now accepts any role (was admin-only).
- Placeholder module count is now zero — all 15 sidebar modules are functional.

## Implemented (3 November 2026 — Public portal, gallery, receipts)
- Student Result Portal: /results — student logs in at /exam-login (Reg ID + DOB) and sees published monthly test results (marks per subject, total, %, grade, rank, class average) and published online exam scores. Header has My Exams + Logout links.
- Public Video Gallery: /videos — class filter chips, YouTube thumbnails, watch links; fed by the admin Videos module. Added to header Parents dropdown + footer.
- Fee Receipts: /admin/receipt/:paymentId — branded A4 receipt (logo, school details, receipt no, student/class/father, month, method, amount in words via num-to-words, signature line), print/PDF via print CSS. "Receipt" link per payment in student profile fee history.

## Implemented (3 November 2026 — Attendance + Admission Print)
- Attendance Register: /admin/attendance — class+date picker, per-student Present/Absent/Leave buttons, mark-all-present, saved per class+date (unique index), re-editable, marked badge; monthly summary (P/A/L counts + %) with day grid on student profile. Sidebar item added under Academics (admin+teacher roles).
- Admission Form PDF: /admin/admission-print/:regId — branded A4 form (logo, reg ID badge, photo box, all student/course/office fields, declaration, 3 signature lines), print/PDF via print CSS; linked from student profile header.

## Implemented (3 November 2026 — Reminders, attendance report, parent portal)
- Fee Due WhatsApp Reminders: green "Remind" button per student in Fee Manager dues table opens WhatsApp with pre-written message (parent name, student, reg ID, class, pending months, outstanding amount) to their primary mobile.
- Attendance Report: /admin/attendance-report — class+month picker, per-student P/A/L/% + day grid, CSV export; sidebar item under Academics.
- Parent Portal: public /parents page — 3-step login explanation, feature cards, help box; linked from Parents dropdown + footer.

## Backlog
- P0: Owner verification of WhatsApp number (currently assumed = phone number) in school.js.
- P1: Replace sitemap/robots preview domain with production domain after deployment; add canonical URLs.
- P1: Replace stock photos with real school photos when available; update privacy policy analytics note.
- P1: Enquiry CSV export from dashboard.
- P2: Hindi language version (Devanagari font support already planned).
- P2: When domain connects, update sitemap.xml/robots.txt domain, backend FRONTEND_URL, and add canonical URLs.

## Next tasks (Admin Panel remaining phases)
1. Phase 7: Online Exams (question bank, schedule/publish, live monitor, student Reg ID + DOB login at a public exam URL, server-timed attempts, auto-evaluation, result publication).
2. Phase 8: Materials / Videos / Announcements / Finance Tracker / User Management — build only after user confirms each workflow (user explicitly forbade inventing business logic).
3. Phase 9: Bulk data import (Excel/CSV template download, column mapping, preview, validation, duplicate detection, import history).
4. Phase 10: Full integration testing + responsive testing; redeploy to live site.
5. Owner: upload Admin Panel reference screenshots (paper admission form, fee manager, etc.) for pixel-matching.
