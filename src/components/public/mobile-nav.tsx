"use client"

import Link from "next/link"
import { Menu, User, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { logoutAction } from "@/lib/auth"

export function PublicMobileNav({
  navItems,
  dashboardLink,
}: {
  navItems: Array<{ href: string; label: string }>
  dashboardLink: string | null
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" className="md:hidden" aria-label="Buka menu navigasi" />
        }
      >
        <Menu size={18} />
      </SheetTrigger>
      <SheetContent className="w-[min(22rem,calc(100vw-2rem))]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 px-4">
          {navItems.map((item) => (
            <SheetClose key={item.href} render={<Link href={item.href} />}>
              <span className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                {item.label}
              </span>
            </SheetClose>
          ))}
        </div>
        <div className="mt-auto grid gap-2 border-t border-border p-4">
          {dashboardLink ? (
            <>
              <SheetClose render={<Link href={dashboardLink} />}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User size={16} /> Dashboard
                </Button>
              </SheetClose>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" className="w-full justify-start gap-2">
                  <LogOut size={16} /> Keluar
                </Button>
              </form>
            </>
          ) : (
            <>
              <SheetClose render={<Link href="/?action=login" />}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <LogIn size={16} /> Masuk
                </Button>
              </SheetClose>
              <SheetClose render={<Link href="/?action=register" />}>
                <Button className="w-full">Daftar</Button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
