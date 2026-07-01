import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getMemberSubscriptionSummary, getMembers } from "@/lib/db/members"
import { MemberTable } from "@/components/dashboard/data-table"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
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
