import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { BranchLocationForm } from "@/components/location/branch-location-form"
import { getDefaultBranch } from "@/lib/db/branches"
import { requireRole } from "@/lib/server/guards"

export default async function Page() {
  await requireRole(["ADMIN", "OWNER"])
  const branch = await getDefaultBranch()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin"
        status="Cabang"
        title="Lokasi & Radius Check-in"
        description="Atur titik lokasi gym yang dipakai untuk validasi check-in member dan tampilan peta di portal member."
      />
      <BranchLocationForm branch={branch} />
    </div>
  )
}
