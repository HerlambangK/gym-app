import { OwnerShell } from "@/components/dashboard/shells";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OwnerShell>{children}</OwnerShell>;
}

