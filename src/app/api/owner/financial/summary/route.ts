import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getInvoiceStats } from "@/lib/db/invoices"
import { getActiveSubscriptionCount } from "@/lib/db/subscriptions"
import { getTodayCheckInCount } from "@/lib/db/attendances"
import { getTotalExpensesThisMonth } from "@/lib/db/expenses"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const [revenue, expenses, activeMembers, todayCheckIns] = await Promise.all([
    getInvoiceStats(),
    getTotalExpensesThisMonth(),
    getActiveSubscriptionCount(),
    getTodayCheckInCount(),
  ])

  return Response.json({
    summary: {
      totalRevenue: revenue.totalRevenue,
      paidInvoices: revenue.paidCount,
      pendingInvoices: revenue.pendingCount,
      totalExpenses: expenses,
      netProfit: revenue.totalRevenue - expenses,
      activeMembers,
      todayCheckIns,
    },
  })
}
