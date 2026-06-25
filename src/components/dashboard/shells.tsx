import { AppShell, type ShellItem } from "@/components/dashboard/app-shell";

const ownerItems: ShellItem[] = [
  { label: "Overview", href: "/owner/dashboard", icon: "dashboard" },
  { label: "Financial", href: "/owner/financial", icon: "money" },
  { label: "Members", href: "/owner/members", icon: "users" },
  { label: "Invoices", href: "/owner/invoices", icon: "money" },
  { label: "Attendances", href: "/owner/attendances", icon: "attendance" },
  { label: "Premium Features", href: "/owner/premium-features", icon: "shield" },
  { label: "Settings", href: "/owner/settings", icon: "settings" },
];

const adminItems: ShellItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Members", href: "/admin/members", icon: "users" },
  { label: "Payments", href: "/admin/payments", icon: "money" },
  { label: "Invoices", href: "/admin/invoices", icon: "money" },
  { label: "Attendances", href: "/admin/attendances", icon: "attendance" },
  { label: "Manual Check-in", href: "/admin/check-in-manual", icon: "gym" },
];

const memberItems: ShellItem[] = [
  { label: "Dashboard", href: "/member/dashboard", icon: "dashboard" },
  { label: "Check-in", href: "/member/check-in", icon: "attendance" },
  { label: "Billing", href: "/member/billing", icon: "money" },
  { label: "Nutrition", href: "/member/nutrition", icon: "gym" },
  { label: "Workouts", href: "/member/workouts", icon: "gym" },
  { label: "Blog Premium", href: "/member/blog", icon: "shield" },
  { label: "Profile", href: "/member/profile", icon: "settings" },
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  return <AppShell role="OWNER" items={ownerItems}>{children}</AppShell>;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <AppShell role="ADMIN" items={adminItems}>{children}</AppShell>;
}

export function MemberShell({ children }: { children: React.ReactNode }) {
  return <AppShell role="MEMBER" items={memberItems}>{children}</AppShell>;
}
