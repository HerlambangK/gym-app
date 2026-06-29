import { PremiumFeatureManager } from "@/components/admin/premium-feature-manager"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { getFeatures } from "@/lib/db/features"
import { requireRole } from "@/lib/server/guards"

export default async function Page() {
  await requireRole(["ADMIN", "OWNER"])
  const features = await getFeatures()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        status="Feature Control"
        title="Premium Features"
        description="Kelola fitur premium yang akan tersedia untuk paket member dan portal premium."
      />
      <PremiumFeatureManager features={features} />
    </div>
  )
}
