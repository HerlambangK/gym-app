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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Validasi</CardTitle>
              <ShieldCheck size={18} className="text-emerald-700 dark:text-emerald-200" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">GPS + radius cabang</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Check-in hanya valid jika posisi berada di dalam radius gym yang disimpan owner/admin.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Cabang Aktif</CardTitle>
              <MapPin size={18} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="truncate text-xl font-semibold">{branch?.name || "-"}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {branch ? `${branch.address}. Radius ${branch.radius_meters} meter.` : "Owner/admin perlu menyimpan lokasi cabang dulu."}
            </p>
          </CardContent>
        </Card>
        <Card className={!subscription ? "border-amber-500/30 bg-amber-500/5" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Akses Member</CardTitle>
              <Radar size={18} className="text-amber-700 dark:text-amber-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold">{activeSession ? "Sedang latihan" : subscription ? "Siap check-in" : "Belum aktif"}</p>
              <Badge variant={activeSession || subscription ? "success" : "warning"} className="gap-1">
                <CircleDot size={10} />
                {activeSession ? "SESI AKTIF" : subscription ? "ELIGIBLE" : "BUTUH PAKET"}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activeSession
                ? "Akhiri sesi dari tombol check-out setelah latihan selesai."
                : subscription
                  ? "Tekan izinkan lokasi saat popup muncul, lalu check-in jika berada di area gym."
                  : "Aktifkan paket membership lebih dulu. Tombol check-in bisa tampil siap secara GPS, tetapi server tetap menolak akun tanpa subscription aktif."}
            </p>
          </CardContent>
        </Card>
      </div>
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
