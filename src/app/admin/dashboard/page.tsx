import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getAllInvoices } from "@/lib/db/invoices"
import { getMembers } from "@/lib/db/members"
import { InvoiceTable, MemberTable } from "@/components/dashboard/data-table"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AttendanceChart } from "@/components/charts/revenue-chart"
import { redirect } from "next/navigation"
import { getTodayCheckInCount } from "@/lib/db/attendances"
import { getActiveSubscriptionCount } from "@/lib/db/subscriptions"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (!role || role === "MEMBER") redirect("/member/dashboard")

  const [todayCheckIns, activeMembers, invoicesData, membersData] = await Promise.all([
    getTodayCheckInCount(),
    getActiveSubscriptionCount(),
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

  const mappedMembers = membersData.map((m: Record<string, unknown>) => ({
    name: (m as { users: { name: string } }).users?.name || "Unknown",
    plan: (m as { membership_plans: { name: string } }).membership_plans?.name || "N/A",
    status: m.status as string,
    endDate: m.created_at as string,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Check-ins Today" value={todayCheckIns} helper="Real-time from attendance" />
        <MetricCard label="Active Members" value={activeMembers} helper="Active subscriptions" />
        <MetricCard label="Pending Invoices" value={0} helper="Unpaid" />
      </div>
      <AttendanceChart />
      <div className="grid gap-6 xl:grid-cols-2">
        <MemberTable members={mappedMembers} />
        <InvoiceTable invoices={mappedInvoices} />
      </div>
    </div>
  )
}
