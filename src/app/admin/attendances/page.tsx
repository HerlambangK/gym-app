import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { AttendanceChart } from "@/components/charts/revenue-chart"
import { DashboardPageHeader } from "@/components/dashboard/page-header"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
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
