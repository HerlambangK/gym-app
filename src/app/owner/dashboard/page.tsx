import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getInvoiceStats } from "@/lib/db/invoices"
import { getActiveSubscriptionCount } from "@/lib/db/subscriptions"
import { getTodayCheckInCount } from "@/lib/db/attendances"
import { getTotalExpensesThisMonth } from "@/lib/db/expenses"
import { OwnerOverview, type SummaryItem } from "@/components/dashboard/pages"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const [revenue, expenses, activeMembers, todayCheckIns] = await Promise.all([
    getInvoiceStats(),
    getTotalExpensesThisMonth(),
    getActiveSubscriptionCount(),
    getTodayCheckInCount(),
  ])

  const summary: SummaryItem[] = [
    { label: "Revenue this month", value: revenue.totalRevenue, helper: `${revenue.paidCount} paid invoices` },
    { label: "Today check-ins", value: todayCheckIns, helper: "Active sessions today" },
    { label: "Expenses this month", value: expenses, helper: "Operating costs" },
    { label: "Net profit", value: revenue.totalRevenue - expenses, helper: "Revenue minus expenses" },
    { label: "Active members", value: activeMembers, helper: "With active subscription" },
    { label: "Pending invoices", value: revenue.pendingCount, helper: "Awaiting payment" },
  ]

  return <OwnerOverview summary={summary} />
}
