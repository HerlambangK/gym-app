import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { InvoiceTable } from "@/components/dashboard/data-table"
import { SubscribeButton } from "@/components/public/subscribe-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMemberInvoices } from "@/lib/db/invoices"
import { getMemberByUserId } from "@/lib/db/members"
import { getPlans } from "@/lib/db/plans"
import { getActiveSubscription } from "@/lib/db/subscriptions"
import { rupiah } from "@/lib/format"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  if (!member) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Lengkapi registrasi untuk melihat billing.
      </div>
    )
  }

  const [invoices, plans, subscription] = await Promise.all([
    getMemberInvoices(member.id),
    getPlans(),
    getActiveSubscription(member.id),
  ])

  const mapped = invoices.map((inv: Record<string, unknown>) => ({
    number: inv.invoice_number as string,
    member: user.email || "Member",
    plan: (inv as { membership_plans: { name: string } }).membership_plans?.name || "Unknown",
    amount: Number(inv.amount),
    status: inv.status as string,
    method: "Midtrans",
  }))

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Billing"
        status={subscription ? "Subscription aktif" : "Belum aktif"}
        title="Pembelian Subscription"
        description="Pilih paket membership, lanjutkan pembayaran via Midtrans, dan pantau invoice dari satu halaman."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {plans.map((plan: Record<string, unknown>) => {
          const p = plan as {
            id: string
            name: string
            code: string
            description?: string
            price: number
            duration_days: number
          }
          const activePlan = subscription?.membership_plans?.code === p.code

          return (
            <Card key={p.id} className={activePlan ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{p.name}</CardTitle>
                  {activePlan ? <Badge variant="success">Aktif</Badge> : null}
                </div>
                <CardDescription>{p.description || `${p.duration_days} hari akses gym`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold">{rupiah.format(Number(p.price))}</p>
                  <p className="text-sm text-muted-foreground">{p.duration_days} hari</p>
                </div>
                <SubscribeButton planCode={p.code} label={activePlan ? "Perpanjang Paket" : "Bayar via Midtrans"} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <InvoiceTable invoices={mapped} />
    </div>
  )
}
