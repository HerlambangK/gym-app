import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { redirect } from "next/navigation"
import { AttendanceChart } from "@/components/charts/revenue-chart"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (!role || role === "MEMBER") redirect("/member/dashboard")

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        status="Grafik harian"
        title="Attendance Member"
        description="Pantau pola check-in untuk membantu penjadwalan staff dan kapasitas area latihan."
      />
      <AttendanceChart />
    </div>
  )
}
