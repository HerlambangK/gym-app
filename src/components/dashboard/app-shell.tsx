import Link from "next/link";
import { Activity, CreditCard, Dumbbell, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";
import { brand } from "@/data/gym";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  money: CreditCard,
  attendance: Activity,
  settings: Settings,
  shield: ShieldCheck,
  gym: Dumbbell,
};

export type ShellItem = {
  label: string;
  href: string;
  icon: keyof typeof iconMap;
};

export function AppShell({
  role,
  items,
  children,
}: {
  role: string;
  items: ShellItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-card/80 p-5 backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell size={20} />
          </div>
          <div>
            <p className="font-semibold">{brand.name}</p>
            <p className="text-xs text-muted-foreground">Gym Management</p>
          </div>
        </Link>
        <Badge variant="outline" className="mt-5">{role}</Badge>
        <nav className="mt-6 space-y-1">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                  index === 0 && "bg-muted text-foreground",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur">
          <div>
            <p className="text-xs uppercase text-muted-foreground">{role}</p>
            <h1 className="text-lg font-semibold">Control Center</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">RBAC Active</Badge>
            <Badge variant="warning">Supabase Ready</Badge>
          </div>
        </header>
        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

