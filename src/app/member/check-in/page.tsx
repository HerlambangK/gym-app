import { CheckInPanel } from "@/components/member/check-in-panel"
import { getDefaultBranch } from "@/lib/db/branches"

export default async function Page() {
  const branch = await getDefaultBranch()

  return (
    <CheckInPanel
      branch={branch ? {
        name: branch.name,
        address: branch.address,
        latitude: Number(branch.latitude),
        longitude: Number(branch.longitude),
        radiusMeters: Number(branch.radius_meters),
      } : null}
    />
  )
}
