import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getPlans } from "@/lib/db/plans"
import { SiteHeader } from "@/components/public/site-header"
import { SubscribeButton } from "@/components/public/subscribe-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { rupiah } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const plans = await getPlans()

  return (
    <main>
      <SiteHeader />
      <section className="section-wrap py-16">
        <Badge variant="secondary">Membership</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Pilih paket yang tepat untuk Anda.</h1>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
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
                <Card key={p.id} className={isPopular ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-3xl font-semibold">{rupiah.format(p.price)}</p>
                    <p className="text-sm text-muted-foreground">{p.duration_days} hari</p>
                    {user ? (
                      <SubscribeButton planCode={p.code} />
                    ) : (
                      <Link href="/?action=register">
                        <Button className="w-full">Daftar</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </section>
    </main>
  )
}
