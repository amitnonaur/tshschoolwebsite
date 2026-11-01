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

## Backlog
- P0: Owner verification of WhatsApp number (currently assumed = phone number) in school.js.
- P1: Replace sitemap/robots preview domain with production domain after deployment; add canonical URLs.
- P1: Replace stock photos with real school photos when available; update privacy policy analytics note.
- P1: Enquiry CSV export from dashboard.
- P2: Hindi language version (Devanagari font support already planned).
- P2: When domain connects, update sitemap.xml/robots.txt domain, backend FRONTEND_URL, and add canonical URLs.

## Next tasks
1. Confirm WhatsApp number with owner.
2. Flip admissionStatus to "open" when admissions formally open.
3. Production domain → update sitemap/robots + canonical URLs.
