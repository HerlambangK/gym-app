import Link from "next/link"
import { ArrowLeft, CircleDot, MapPin, Radar, ShieldCheck } from "lucide-react"
import { CheckInPanel } from "@/components/member/check-in-panel"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveSession } from "@/lib/db/attendances"
import { getDefaultBranch } from "@/lib/db/branches"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription } from "@/lib/db/subscriptions"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const branch = await getDefaultBranch()
  const activeSession = member ? await getActiveSession(member.id) : null
  const subscription = member ? await getActiveSubscription(member.id) : null

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Member"
        status={activeSession ? "Sesi aktif" : branch ? "GPS check-in" : "Lokasi belum diatur"}
        title="Check-in Gym"
        description="Halaman ini khusus untuk validasi lokasi, check-in, dan check-out. Ringkasan membership tetap ada di dashboard agar flow tidak bercampur."
        actions={
          <Link href="/member/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Dashboard
            </Button>
          </Link>
        }
      />
      <Card className={!subscription ? "border-amber-500/30" : ""}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Validasi Check-in</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">GPS, cabang aktif, dan akses member dalam satu ringkasan.</p>
            </div>
            <Badge variant={activeSession || subscription ? "success" : "warning"} className="gap-1">
              <CircleDot size={10} />
              {activeSession ? "SESI AKTIF" : subscription ? "ELIGIBLE" : "BUTUH PAKET"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 p-4 pt-0 min-[430px]:grid-cols-2 sm:p-6 sm:pt-0 lg:grid-cols-3">
          <CheckInfo
            icon={ShieldCheck}
            label="Validasi"
            value="GPS + radius"
            helper="Wajib di area gym"
          />
          <CheckInfo
            icon={MapPin}
            label="Cabang Aktif"
            value={branch?.name || "-"}
            helper={branch ? `Radius ${branch.radius_meters} meter` : "Lokasi belum disimpan"}
          />
          <CheckInfo
            icon={Radar}
            label="Akses Member"
            value={activeSession ? "Sedang latihan" : subscription ? "Siap check-in" : "Belum aktif"}
            helper={activeSession ? "Bisa checkout" : subscription ? "Server valid" : "Butuh paket"}
          />
        </CardContent>
      </Card>
      <CheckInPanel
        branch={branch ? {
          name: branch.name,
          address: branch.address,
          latitude: Number(branch.latitude),
          longitude: Number(branch.longitude),
          radiusMeters: Number(branch.radius_meters),
        } : null}
        initialActiveSession={activeSession ? { check_in_time: activeSession.check_in_time } : null}
      />
    </div>
  )
}

function CheckInfo({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary">
          <Icon size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold">{value}</p>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  )
}
