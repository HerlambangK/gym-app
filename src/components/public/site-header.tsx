import Link from "next/link";
import { Dumbbell, LogIn, Menu } from "lucide-react";
import { brand, navItems } from "@/data/gym";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/75 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell size={20} />
          </span>
          <span className="font-semibold text-white">{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-zinc-300 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm"><LogIn size={16} /> Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Daftar</Button>
          </Link>
          <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}

