import type { FeatureCode, InvoiceStatus, RoleCode } from "@/types/domain";
import type { PlanTier } from "@/lib/feature-gate";

export const brand = {
  name: "ForgeFit Studio",
  tagline: "Membership gym premium dengan operasional digital penuh.",
  whatsapp: "+62 812-9000-2026",
  address: "Jl. Senopati No. 21, Jakarta Selatan",
  instagram: "@forgefit.studio",
};

export const navItems = [
  { label: "Paket", href: "/pricing" },
  { label: "Fasilitas", href: "/#facilities" },
  { label: "Trainer", href: "/#trainers" },
  { label: "Blog", href: "/blog" },
  { label: "Kontak", href: "/contact" },
];

export const membershipPlans: Array<{
  name: string;
  code: string;
  tier: PlanTier;
  type: "DAILY" | "MONTHLY";
  durationDays: number;
  price: number;
  description: string;
  features: FeatureCode[];
  highlighted?: boolean;
}> = [
  {
    name: "Daily Pass",
    code: "DAILY_PASS",
    tier: "DAILY",
    type: "DAILY",
    durationDays: 1,
    price: 45000,
    description: "Latihan harian dengan check-in lokasi.",
    features: ["attendance_check_in", "attendance_check_out", "billing_history"],
  },
  {
    name: "Basic Monthly",
    code: "BASIC_MONTHLY",
    tier: "BASIC",
    type: "MONTHLY",
    durationDays: 30,
    price: 299000,
    description: "Membership bulanan untuk rutinitas stabil.",
    features: [
      "attendance_check_in",
      "attendance_check_out",
      "attendance_history",
      "billing_history",
    ],
  },
  {
    name: "Plus Monthly",
    code: "PLUS_MONTHLY",
    tier: "PLUS",
    type: "MONTHLY",
    durationDays: 30,
    price: 449000,
    description: "Akses gizi, blog premium, dan body tracking.",
    features: [
      "attendance_check_in",
      "attendance_check_out",
      "attendance_history",
      "billing_history",
      "premium_blog",
      "nutrition_log",
      "body_weight_tracking",
    ],
    highlighted: true,
  },
  {
    name: "Pro 3 Months",
    code: "PRO_3_MONTHS",
    tier: "PRO",
    type: "MONTHLY",
    durationDays: 90,
    price: 1199000,
    description: "Semua fitur Pro untuk progres jangka panjang.",
    features: [
      "attendance_check_in",
      "attendance_check_out",
      "attendance_history",
      "billing_history",
      "premium_blog",
      "nutrition_log",
      "body_weight_tracking",
      "workout_progress",
      "trainer_notes",
      "priority_support",
    ],
  },
];

export const dashboardSummary = [
  { label: "Revenue bulan ini", value: 128750000, helper: "+18% dari bulan lalu" },
  { label: "Revenue hari ini", value: 6250000, helper: "41 transaksi paid" },
  { label: "Expense bulan ini", value: 42700000, helper: "Payroll, sewa, listrik" },
  { label: "Net profit", value: 86175000, helper: "Margin 67%" },
  { label: "Active members", value: 742, helper: "38 baru bulan ini" },
  { label: "Check-in hari ini", value: 186, helper: "Peak jam 18:00" },
  { label: "Pending invoices", value: 23, helper: "Butuh follow-up admin" },
  { label: "Expiring 7 hari", value: 54, helper: "Siapkan campaign renewal" },
];

export const revenueSeries = [
  { label: "Sen", revenue: 9600000, expense: 2100000, attendance: 132 },
  { label: "Sel", revenue: 11200000, expense: 1800000, attendance: 149 },
  { label: "Rab", revenue: 8700000, expense: 2400000, attendance: 126 },
  { label: "Kam", revenue: 14800000, expense: 3200000, attendance: 178 },
  { label: "Jum", revenue: 16700000, expense: 3600000, attendance: 205 },
  { label: "Sab", revenue: 19400000, expense: 2800000, attendance: 238 },
  { label: "Min", revenue: 12300000, expense: 1700000, attendance: 166 },
];

export const members = [
  { name: "Budi Santoso", plan: "Plus Monthly", status: "ACTIVE", endDate: "2026-07-24" },
  { name: "Nadia Putri", plan: "Pro 3 Months", status: "ACTIVE", endDate: "2026-09-19" },
  { name: "Raka Wirawan", plan: "Daily Pass", status: "ACTIVE", endDate: "2026-06-25" },
  { name: "Maya Sari", plan: "Basic Monthly", status: "EXPIRING", endDate: "2026-06-30" },
  { name: "Dimas Pratama", plan: "Plus Monthly", status: "FROZEN", endDate: "2026-08-02" },
];

export const invoices: Array<{
  number: string;
  member: string;
  plan: string;
  amount: number;
  status: InvoiceStatus;
  method: string;
}> = [
  { number: "INV-2026-0625-001", member: "Budi Santoso", plan: "Plus Monthly", amount: 449000, status: "PAID", method: "QRIS" },
  { number: "INV-2026-0625-002", member: "Nadia Putri", plan: "Pro 3 Months", amount: 1199000, status: "PAID", method: "VA BCA" },
  { number: "INV-2026-0625-003", member: "Raka Wirawan", plan: "Daily Pass", amount: 45000, status: "PENDING", method: "Midtrans" },
  { number: "INV-2026-0625-004", member: "Maya Sari", plan: "Basic Monthly", amount: 299000, status: "EXPIRED", method: "VA Mandiri" },
];

export const premiumFeatures = [
  { code: "premium_blog", name: "Blog Premium", category: "Content", active: true },
  { code: "nutrition_log", name: "Nutrition Log", category: "Health", active: true },
  { code: "body_weight_tracking", name: "Body Tracking", category: "Health", active: true },
  { code: "workout_progress", name: "Workout Progress", category: "Training", active: true },
  { code: "class_booking", name: "Class Booking", category: "Operation", active: false },
];

export const roleCards: Array<{ role: RoleCode; summary: string }> = [
  { role: "OWNER", summary: "Full business control, financial, branding, roles." },
  { role: "ADMIN", summary: "Daily operations: members, invoices, payments, attendance." },
  { role: "MEMBER", summary: "Portal, billing, check-in, and plan-based premium features." },
];

export const blogPosts = [
  { title: "Cara Membaca Progress Tanpa Terjebak Timbangan", access: "PUBLIC", minutes: 5 },
  { title: "Meal Prep 7 Hari untuk Member Plus", access: "SUBSCRIBER_ONLY", minutes: 8 },
  { title: "Latihan Push Pull Legs untuk Fase Cutting", access: "SUBSCRIBER_ONLY", minutes: 10 },
];

