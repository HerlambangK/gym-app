import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { BillingInvoiceTable } from "@/components/member/billing-invoice-table"
import type { NativePaymentResult } from "@/components/public/subscribe-button"
import { SubscribeButton } from "@/components/public/subscribe-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMemberInvoices } from "@/lib/db/invoices"
import { getMemberByUserId } from "@/lib/db/members"
import { getPlans } from "@/lib/db/plans"
import { getActiveSubscription, getSubscriptionStackPreview } from "@/lib/db/subscriptions"
import { rupiah, formatDate } from "@/lib/format"
import { getCurrentUserId } from "@/lib/current-user"
import { getSubscriptionTiming } from "@/lib/subscription-timing"

function getFirst<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function buildPaymentResult(invoice: Record<string, unknown>) {
  const payment = getFirst(invoice.payments as Array<Record<string, unknown>> | Record<string, unknown> | null)
  const subscription = getFirst(invoice.subscriptions as Array<Record<string, unknown>> | Record<string, unknown> | null)
  const charge = payment?.raw_callback
  if (!payment || !charge || typeof charge !== "object") return null

  return {
    invoiceNumber: invoice.invoice_number as string,
    paymentMethod: (payment.method as NativePaymentResult["paymentMethod"]) || "bca_va",
    charge: charge as NativePaymentResult["charge"],
    status: {
      paymentStatus: payment.status as string,
      invoiceStatus: invoice.status as string,
      subscriptionStatus: (subscription?.status as string) || "PENDING_PAYMENT",
      transactionStatus: (charge as { transaction_status?: string }).transaction_status,
    },
  } satisfies NativePaymentResult
}

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const member = await getMemberByUserId(userId)
  if (!member) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Lengkapi registrasi untuk melihat billing.
      </div>
    )
  }

  const [invoices, plans, subscription] = await Promise.all([
    getMemberInvoices(member.id, true),
    getPlans(),
    getActiveSubscription(member.id),
  ])

  const activeEndDate = subscription?.end_date || null
  const activePlanName = (subscription?.membership_plans as { name?: string } | null)?.name || null
  const subscriptionTiming = subscription
    ? getSubscriptionTiming({ startDate: subscription.start_date, endDate: subscription.end_date })
    : null

  const mapped = invoices.map((inv: Record<string, unknown>) => {
    const plan = getFirst((inv as { membership_plans?: { name: string; code: string; duration_days: number } | Array<{ name: string; code: string; duration_days: number }> }).membership_plans)
    const payment = getFirst(inv.payments as Array<Record<string, unknown>> | Record<string, unknown> | null)
    const invoiceSubscription = getFirst(inv.subscriptions as Array<Record<string, unknown>> | Record<string, unknown> | null)

    return {
      number: inv.invoice_number as string,
      plan: plan?.name || "Unknown",
      planCode: plan?.code || "",
      amount: Number(inv.amount),
      status: inv.status as string,
      method: (payment?.method as string) || "Midtrans",
      durationDays: Number(plan?.duration_days || 0),
      createdAt: inv.created_at as string,
      subscriptionStatus: (invoiceSubscription?.status as string) || null,
      subscriptionStartDate: (invoiceSubscription?.start_date as string) || null,
      subscriptionEndDate: (invoiceSubscription?.end_date as string) || null,
      paymentResult: buildPaymentResult(inv),
    }
  })

  return (
    <div className="space-y-3 sm:space-y-6">
      <DashboardPageHeader
        eyebrow="Billing"
        status={subscription ? "Subscription aktif" : "Belum aktif"}
        title="Pembelian Subscription"
        description="Pilih paket membership, lanjutkan pembayaran via Midtrans, dan pantau invoice dari satu halaman."
      />

      {subscription && subscriptionTiming?.isExpiringSoon ? (
        <div className={`rounded-xl border p-3 text-sm sm:p-4 ${
          subscriptionTiming.isCritical
            ? "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200"
            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-100"
        }`}>
          <p className="font-semibold">
            {subscriptionTiming.alertTitle}
          </p>
          <p className="mt-1">
            {activePlanName} aktif sampai {formatDate(activeEndDate!)} ({subscriptionTiming.summaryLabel}).
            Perpanjang sekarang agar masa aktif tidak terputus.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          const stack = subscription ? getSubscriptionStackPreview(subscription, p.duration_days) : null

          return (
            <Card key={p.id} className={activePlan ? "border-primary" : ""}>
              <CardHeader className="p-4 pb-2 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{p.name}</CardTitle>
                  {activePlan ? <Badge variant="success">Aktif</Badge> : null}
                </div>
                <CardDescription>{p.description || `${p.duration_days} hari akses gym`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                <div>
                  <p className="text-xl font-semibold sm:text-2xl">{rupiah.format(Number(p.price))}</p>
                  <p className="text-sm text-muted-foreground">{p.duration_days} hari</p>
                </div>
                {stack && !activePlan ? (
                  <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground sm:p-3">
                    <p>Subscription saat ini aktif sampai <span className="font-medium text-foreground">{formatDate(activeEndDate!)}</span> ({subscriptionTiming?.summaryLabel || "masa aktif berjalan"}).</p>
                    <p>Paket baru akan aktif: <span className="font-medium text-foreground">{formatDate(stack.startDate)}</span> – <span className="font-medium text-foreground">{formatDate(stack.endDate)}</span></p>
                  </div>
                ) : null}
                <SubscribeButton
                  planCode={p.code}
                  label={activePlan ? "Perpanjang Paket" : "Pilih Pembayaran"}
                  activeSubEndDate={activeEndDate}
                  planName={p.name}
                  remainingLabel={subscriptionTiming?.summaryLabel || ""}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <BillingInvoiceTable invoices={mapped} />
    </div>
  )
}
