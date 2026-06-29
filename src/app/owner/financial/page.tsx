import { MetricCard } from "@/components/dashboard/metric-card"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getInvoiceStats } from "@/lib/db/invoices"
import { getTotalExpensesThisMonth } from "@/lib/db/expenses"
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
    { label: "Revenue this month", value: revenue.totalRevenue, helper: `${revenue.paidCount} paid invoices` },
    { label: "Expenses this month", value: expenses, helper: "Operating costs" },
    { label: "Net profit", value: revenue.totalRevenue - expenses, helper: "Revenue minus expenses" },
    { label: "Pending invoices", value: revenue.pendingCount, helper: "Awaiting payment" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => <MetricCard key={item.label} {...item} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart />
      </div>
    </div>
  )
}
