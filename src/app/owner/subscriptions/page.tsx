import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { SubscriptionPlanManager } from "@/components/owner/subscription-plan-manager"
import { Card, CardContent } from "@/components/ui/card"
import { getAllPlans } from "@/lib/db/plans"
import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const planResult = await getSubscriptionPlansForOwner()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status={planResult.ok ? `${planResult.plans.length} paket` : "Data belum tersedia"}
        title="Subscription CRUD"
        description="Buat, edit, arsipkan, dan atur harga paket membership yang dipakai pricing dan billing."
      />
      {planResult.ok ? (
        <SubscriptionPlanManager plans={planResult.plans} />
      ) : (
        <Card className="border-amber-500/30">
          <CardContent className="space-y-2 py-8">
            <p className="font-medium text-amber-800 dark:text-amber-100">Data paket belum bisa dimuat.</p>
            <p className="text-sm text-muted-foreground">
              Periksa koneksi database atau migrasi tabel membership_plans, lalu muat ulang halaman ini.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

async function getSubscriptionPlansForOwner() {
  try {
    return { ok: true as const, plans: await getAllPlans() }
  } catch (error) {
    console.error("Failed to load owner subscription plans", error)
    return { ok: false as const, plans: [] }
  }
}
