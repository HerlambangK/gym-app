import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getInvoiceStats } from "@/lib/db/invoices"
import { getActiveSubscriptionCount } from "@/lib/db/subscriptions"
import { getTodayCheckInCount } from "@/lib/db/attendances"
import { getTotalExpensesThisMonth } from "@/lib/db/expenses"
import { OwnerOverview, type SummaryItem } from "@/components/dashboard/pages"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
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
    { label: "Pendapatan bulan ini", value: revenue.totalRevenue, helper: `${revenue.paidCount} invoice lunas` },
    { label: "Check-in hari ini", value: todayCheckIns, helper: "Sesi aktif hari ini" },
    { label: "Pengeluaran bulan ini", value: expenses, helper: "Biaya operasional" },
    { label: "Laba bersih", value: revenue.totalRevenue - expenses, helper: "Pendapatan dikurangi biaya" },
    { label: "Member aktif", value: activeMembers, helper: "Dengan subscription aktif" },
    { label: "Invoice pending", value: revenue.pendingCount, helper: "Menunggu pembayaran" },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        title="Ringkasan Bisnis Gym"
        description="Pantau pendapatan, biaya, member aktif, dan aktivitas check-in dari satu layar operasional."
        status="Data bulan berjalan"
      />
      <OwnerOverview summary={summary} />
    </div>
  )
}
