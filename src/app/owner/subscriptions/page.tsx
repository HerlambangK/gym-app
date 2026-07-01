import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { SubscriptionPlanManager } from "@/components/owner/subscription-plan-manager"
import { getAllPlans } from "@/lib/db/plans"
import { getUserRole } from "@/lib/db/users"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const plans = await getAllPlans()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status={`${plans.length} paket`}
        title="Subscription CRUD"
        description="Buat, edit, arsipkan, dan atur harga paket membership yang dipakai pricing dan billing."
      />
      <SubscriptionPlanManager plans={plans} />
    </div>
  )
}
