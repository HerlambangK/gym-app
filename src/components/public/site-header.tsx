import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { logoutAction } from "@/lib/auth"
import { extractRoleCode, getDashboardPathForRole } from "@/lib/auth-routing"
import { Dumbbell, LogIn, User, LogOut } from "lucide-react"
import { brand, navItems } from "@/data/gym"
import { Button } from "@/components/ui/button"
import { PublicMobileNav } from "@/components/public/mobile-nav"

export async function SiteHeader() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function getDashboardLink() {
    if (!user) return null
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", user.id)
      .maybeSingle()
    return getDashboardPathForRole(extractRoleCode(roleData))
  }

  const dashboardLink = await getDashboardLink()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <Dumbbell size={20} />
          </span>
          <span className="font-semibold text-foreground">{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {dashboardLink && (
                <Link href={dashboardLink}>
                  <Button size="sm" variant="outline"><User size={16} /> Dashboard</Button>
                </Link>
              )}
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm" aria-label="Keluar"><LogOut size={16} /></Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/?action=login" className="hidden sm:block">
                <Button variant="ghost" size="sm"><LogIn size={16} /> Masuk</Button>
              </Link>
              <Link href="/?action=register">
                <Button size="sm">Daftar</Button>
              </Link>
            </>
          )}
          <PublicMobileNav navItems={navItems} dashboardLink={dashboardLink} />
        </div>
      </div>
    </header>
  )
}
