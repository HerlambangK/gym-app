import { MetricCard } from "@/components/dashboard/metric-card"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getInvoiceStats } from "@/lib/db/invoices"
import { getTotalExpensesThisMonth } from "@/lib/db/expenses"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const [revenue, expenses] = await Promise.all([
    getInvoiceStats(),
    getTotalExpensesThisMonth(),
  ])

  const items = [
    { label: "Pendapatan bulan ini", value: revenue.totalRevenue, helper: `${revenue.paidCount} invoice lunas` },
    { label: "Pengeluaran bulan ini", value: expenses, helper: "Biaya operasional" },
    { label: "Laba bersih", value: revenue.totalRevenue - expenses, helper: "Pendapatan dikurangi biaya" },
    { label: "Invoice pending", value: revenue.pendingCount, helper: "Menunggu pembayaran" },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status="Bulan berjalan"
        title="Kesehatan Finansial"
        description="Ringkas pendapatan, biaya, laba bersih, dan invoice yang masih perlu follow-up."
      />
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => <MetricCard key={item.label} {...item} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart />
      </div>
    </div>
  )
}
