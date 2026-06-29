import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getMembers } from "@/lib/db/members"
import { MemberTable } from "@/components/dashboard/data-table"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (!role || role === "MEMBER") redirect("/member/dashboard")

  const members = await getMembers({ limit: 50 })
  const mapped = members.map((m: Record<string, unknown>) => ({
    name: (m as { users: { name: string } }).users?.name || "Unknown",
    plan: (m as { membership_plans: { name: string } }).membership_plans?.name || "N/A",
    status: m.status as string,
    endDate: m.created_at as string,
  }))

  return <MemberTable members={mapped} />
}
