import { AdminShell } from "@/components/dashboard/shells";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

