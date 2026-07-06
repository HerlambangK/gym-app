import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"
import { getMemberSubscriptionSummary, getMembers } from "@/lib/db/members"
import { MemberTable } from "@/components/dashboard/data-table"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
  if (!role || role === "MEMBER") redirect("/member/dashboard")

  const members = await getMembers({ limit: 50 })
  const mapped = members.map((m: Record<string, unknown>) => {
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
        eyebrow="Admin"
        status={`${mapped.length} data terbaru`}
        title="Manajemen Member"
        description="Pantau status member, paket aktif, dan data operasional yang dibutuhkan front desk."
      />
      <MemberTable members={mapped} />
    </div>
  )
}
