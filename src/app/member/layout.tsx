import { MemberShell } from "@/components/dashboard/shells";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MemberShell>{children}</MemberShell>;
}

