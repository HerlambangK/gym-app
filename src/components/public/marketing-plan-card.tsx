import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { Lock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { gymProfile, packageMarketing, whatsappUrl } from "@/data/company-profile"
import { rupiah } from "@/lib/format"

type MarketingPlan = {
  name: string
  code: string
  description?: string | null
  price: number
  durationDays: number
  highlighted?: boolean
}

export function MarketingPlanCard({
  plan,
  isLoggedIn = false,
  action,
}: {
  plan: MarketingPlan
  isLoggedIn?: boolean
  action?: ReactNode
}) {
  const content = packageMarketing[plan.code] ?? {
    image: "https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=900&q=80",
    eyebrow: "Paket member",
    headline: plan.description || "Mulai latihan dengan paket yang sesuai targetmu.",
    copy: "Hubungi admin untuk detail benefit dan rekomendasi paket terbaik.",
    cta: "Tanya Paket",
  }
  const showPrice = isLoggedIn || plan.code === "DAILY_PASS"

  return (
    <article className={`group overflow-hidden rounded-lg border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.highlighted ? "border-red-600 shadow-red-600/10" : "border-border"}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={content.image}
          alt={plan.name}
          fill
          sizes="(min-width: 1024px) 25vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-black/10 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <Badge className={plan.highlighted ? "bg-red-600 text-white" : "bg-white/92 text-neutral-950 hover:bg-white/92"}>
            {content.eyebrow}
          </Badge>
          {!showPrice ? (
            <span className="grid size-9 place-items-center rounded-md bg-black/45 text-white backdrop-blur">
              <Lock size={16} />
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold leading-tight">{plan.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/70">{plan.durationDays} hari akses</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-lg font-semibold leading-7">{content.headline}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{content.copy}</p>
        <div className="mt-5 rounded-lg border border-border bg-muted/45 p-4">
          {showPrice ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mulai dari</p>
              <p className="mt-1 text-2xl font-bold">{rupiah.format(plan.price)}</p>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-background text-red-600">
                <Lock size={16} />
              </span>
              <div>
                <p className="font-semibold">Harga khusus member</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Login dulu untuk melihat harga dan melanjutkan pembayaran paket ini.</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-5">
          {action ?? (
            <Link href={showPrice ? whatsappUrl(`Halo ${gymProfile.name}, saya ingin ambil paket ${plan.name}.`) : "/?action=login"}>
              <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                {showPrice ? (
                  <>
                    {content.cta} <MessageCircle size={16} />
                  </>
                ) : (
                  content.cta
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
