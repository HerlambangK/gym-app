import Link from "next/link"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getPlans } from "@/lib/db/plans"
import { SiteHeader } from "@/components/public/site-header"
import { SubscribeButton } from "@/components/public/subscribe-button"
import { MarketingPlanCard } from "@/components/public/marketing-plan-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { gymProfile, whatsappUrl } from "@/data/company-profile"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: `Paket Member | ${gymProfile.name}`,
  description: `Pilihan paket member ${gymProfile.name}: harian, bulanan, dan paket latihan jangka panjang dengan benefit yang jelas.`,
}

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const plans = await getPlans()

  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="outline">Paket Member</Badge>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Paket fleksibel untuk mulai latihan.</h1>
            <p className="mt-4 leading-8 text-muted-foreground">Pilih paket harian untuk trial, paket bulanan untuk rutinitas, atau tanya admin jika butuh personal trainer.</p>
          </div>
          <Link href={whatsappUrl("Halo, saya ingin bertanya paket membership ForgeFit Studio.")}>
            <Button variant="outline">Tanya Admin</Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {plans.length === 0 ? (
            <p className="col-span-4 text-center text-muted-foreground py-12">
              Belum ada paket tersedia.
            </p>
          ) : (
            plans.map((plan: Record<string, unknown>) => {
              const p = plan as {
                id: string; name: string; code: string; description: string;
                price: number; duration_days: number; type: string
              }
              const isPopular = p.code === "PLUS_MONTHLY"
              return (
                <MarketingPlanCard
                  key={p.id}
                  plan={{
                    name: p.name,
                    code: p.code,
                    description: p.description,
                    price: p.price,
                    durationDays: p.duration_days,
                    highlighted: isPopular,
                  }}
                  isLoggedIn={Boolean(user)}
                  action={user ? <SubscribeButton planCode={p.code} label="Pilih Pembayaran" /> : undefined}
                />
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}
