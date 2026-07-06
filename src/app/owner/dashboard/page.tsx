import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"
import { getAllInvoices } from "@/lib/db/invoices"
import { getMemberSubscriptionSummary, getMembers } from "@/lib/db/members"
import { getInvoiceStats } from "@/lib/db/invoices"
import { getActiveSubscriptionCount } from "@/lib/db/subscriptions"
import { getTodayCheckInCount } from "@/lib/db/attendances"
import { getTotalExpensesThisMonth } from "@/lib/db/expenses"
import { InvoiceTable, MemberTable } from "@/components/dashboard/data-table"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { MetricCard } from "@/components/dashboard/metric-card"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const [revenue, expenses, activeMembers, todayCheckIns, invoicesData, membersData] = await Promise.all([
    getInvoiceStats(),
    getTotalExpensesThisMonth(),
    getActiveSubscriptionCount(),
    getTodayCheckInCount(),
    getAllInvoices({ limit: 5 }),
    getMembers({ limit: 5 }),
  ])

  const mappedInvoices = invoicesData.map((inv: Record<string, unknown>) => ({
    number: inv.invoice_number as string,
    member: (inv as { members: { users: { name: string } } }).members?.users?.name || "Unknown",
    plan: (inv as { membership_plans: { name: string } }).membership_plans?.name || "Unknown",
    amount: Number(inv.amount),
    status: inv.status as string,
    method: "Midtrans",
  }))

  const mappedMembers = membersData.map((m: Record<string, unknown>) => {
    const subscription = getMemberSubscriptionSummary(m)
    return {
      name: (m as { users: { name: string } }).users?.name || "Unknown",
      plan: subscription.plan,
      status: m.status as string,
      endDate: subscription.endDate,
    }
  })

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        title="Ringkasan Bisnis Gym"
        description="Pantau pendapatan, biaya, member aktif, dan aktivitas check-in dari satu layar operasional."
        status="Data bulan berjalan"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pendapatan bulan ini" value={revenue.totalRevenue} helper={`${revenue.paidCount} invoice lunas`} />
        <MetricCard label="Check-in hari ini" value={todayCheckIns} helper="Sesi aktif hari ini" />
        <MetricCard label="Pengeluaran bulan ini" value={expenses} helper="Biaya operasional" />
        <MetricCard label="Laba bersih" value={revenue.totalRevenue - expenses} helper="Pendapatan dikurangi biaya" />
        <MetricCard label="Member aktif" value={activeMembers} helper="Dengan subscription aktif" />
        <MetricCard label="Invoice pending" value={revenue.pendingCount} helper="Menunggu pembayaran" />
      </div>
      <RevenueChart />
      <div className="grid gap-6 xl:grid-cols-2">
        <MemberTable members={mappedMembers} />
        <InvoiceTable invoices={mappedInvoices} />
      </div>
    </div>
  )
}
