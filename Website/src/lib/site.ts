// Central site configuration for the Nexli marketing website.
// Copy and contact values that change often live here so pages stay declarative.

export const SITE = {
  name: "Nexli",
  tagline: "Bringing clarity to complexity",
  description:
    "Nexli is the School Operating System for modern education — manage admissions, academics, attendance, fees, compliance, communication, safety, HR, transport, hostel, and operations from a single platform.",
  // TODO: set to the real production domain.
  url: "https://www.nexli.app",
  locale: "en_IN",
};

// --- WhatsApp click-to-chat (primary "Contact Now" CTA) -----------------------
// TODO: replace with the real WhatsApp Business number — country code first, digits only,
// no "+", spaces, or dashes (e.g. "919812345678").
export const WHATSAPP_NUMBER = "91XXXXXXXXXX";
export const WHATSAPP_MESSAGE =
  "Hi Nexli team, I'd like to learn more about Nexli — the School Operating System — for my school.";

export function whatsappHref(message: string = WHATSAPP_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// --- "Free Live Demo" CTA -----------------------------------------------------
// Placeholder for now; the interactive live demo is a later phase.
export const DEMO_HREF = "/demo";

// --- Primary navigation -------------------------------------------------------
export const NAV: { label: string; href: string }[] = [
  { label: "Platform", href: "/platform" },
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

// --- Module pillars (homepage) ------------------------------------------------
export const MODULES: { icon: string; title: string; desc: string }[] = [
  { icon: "admissions", title: "Admissions", desc: "Enquiry to enrolment — online forms, merit lists, and document checks." },
  { icon: "academics", title: "Academics", desc: "Timetables, lesson plans, exams, gradebooks, and report cards." },
  { icon: "attendance", title: "Attendance", desc: "Daily, period-wise, and biometric attendance with instant alerts." },
  { icon: "fees", title: "Fees & Finance", desc: "Fee plans, invoices, receipts, refunds, and GST-ready accounting." },
  { icon: "compliance", title: "Compliance", desc: "DPDP, POCSO, RTE, CBSE, and UDISE+ — handled by design." },
  { icon: "communication", title: "Communication", desc: "Announcements, notices, and parent messaging in one place." },
  { icon: "safety", title: "Safety & Wellbeing", desc: "Incident logs, health records, counselling, and POCSO workflows." },
  { icon: "hr", title: "HR & Payroll", desc: "Staff records, leave, payroll with PF / ESI / TDS, and payslips." },
  { icon: "transport", title: "Transport", desc: "Routes, stops, live bus tracking, and driver / conductor tools." },
  { icon: "hostel", title: "Hostel", desc: "Room allocation, roll-call, mess, gate-pass, and warden tools." },
  { icon: "operations", title: "Operations", desc: "Inventory, library, certificates, visitors, and asset tracking." },
  { icon: "analytics", title: "Analytics", desc: "Live dashboards for every role, from the classroom to management." },
];

// --- Compliance highlights ----------------------------------------------------
export const COMPLIANCE: { icon: string; title: string; desc: string }[] = [
  { icon: "shield", title: "DPDP Act 2023", desc: "Consent-first data handling, data-residency in India, and erasure registers." },
  { icon: "safety", title: "POCSO", desc: "Child-safety incident workflows with a 24-hour reporting SLA and audit trail." },
  { icon: "academics", title: "RTE", desc: "25% EWS quota management with a transparent, CSPRNG-backed lottery." },
  { icon: "compliance", title: "CBSE & UDISE+", desc: "TC Appendix-V generation and UDISE+ infrastructure reporting fields." },
];

// --- Knowledge-base categories (the 20-section structure) ---------------------
// Display metadata; article pages are wired from Web/Blog/ in the content phase.
export const KB_CATEGORIES: { slug: string; title: string; icon: string }[] = [
  { slug: "01-school-admin", title: "School Administration", icon: "operations" },
  { slug: "02-student-admissions", title: "Student Admissions", icon: "admissions" },
  { slug: "03-academics", title: "Academics", icon: "academics" },
  { slug: "04-attendance", title: "Attendance", icon: "attendance" },
  { slug: "05-finance", title: "Finance & Fees", icon: "fees" },
  { slug: "06-communication", title: "Communication", icon: "communication" },
  { slug: "07-compliance", title: "Compliance", icon: "shield" },
  { slug: "08-technology", title: "Technology", icon: "operations" },
  { slug: "09-leadership", title: "Leadership", icon: "analytics" },
  { slug: "10-safety", title: "Safety & Wellbeing", icon: "safety" },
  { slug: "11-erp-comparison", title: "ERP Comparison", icon: "compliance" },
  { slug: "12-erp-pricing", title: "ERP Pricing", icon: "fees" },
  { slug: "13-school-types", title: "School Types", icon: "academics" },
  { slug: "14-location", title: "Locations", icon: "globe" },
  { slug: "15-marketing", title: "School Marketing", icon: "communication" },
  { slug: "16-hr", title: "HR & Payroll", icon: "hr" },
  { slug: "17-templates", title: "Templates", icon: "book" },
  { slug: "18-research", title: "Research", icon: "analytics" },
  { slug: "19-innovation", title: "Innovation", icon: "sparkle" },
  { slug: "20-success", title: "Success Stories", icon: "check" },
];
