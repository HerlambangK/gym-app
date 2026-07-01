import { CheckInPanel } from "@/components/member/check-in-panel"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { getDefaultBranch } from "@/lib/db/branches"

export default async function Page() {
  const branch = await getDefaultBranch()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Member"
        status={branch ? "Lokasi cabang aktif" : "Lokasi belum diatur"}
        title="Check-in Gym"
        description="Gunakan GPS saat tiba di area gym untuk mencatat sesi latihan dan menjaga validasi attendance."
      />
      <CheckInPanel
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
