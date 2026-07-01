import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { CheckInPanel } from "@/components/member/check-in-panel"
import { getDefaultBranch } from "@/lib/db/branches"

export default async function Page() {
  const branch = await getDefaultBranch()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        status="Manual"
        title="Manual Check-in"
        description="Bantu validasi check-in member dengan lokasi cabang yang sama seperti portal member."
      />
      <CheckInPanel
        context="admin"
        branch={branch ? {
          name: branch.name,
          address: branch.address,
          latitude: Number(branch.latitude),
          longitude: Number(branch.longitude),
          radiusMeters: Number(branch.radius_meters),
        } : null}
      />
    </div>
  )
}
