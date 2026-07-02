import Link from "next/link"
import { ArrowRight, CalendarCheck2, Dumbbell, MapPin, Timer, Utensils } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription, getCurrentAndUpcomingSubscriptions, getSubscriptionExpiryInfo } from "@/lib/db/subscriptions"
import { getActiveSession, getMemberAttendances } from "@/lib/db/attendances"
import { getDefaultBranch } from "@/lib/db/branches"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/format"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const subscription = member ? await getActiveSubscription(member.id) : null
  const branch = await getDefaultBranch()
  const activeSession = member ? await getActiveSession(member.id) : null
  const recentAttendances = member ? await getMemberAttendances(member.id, 4) : []
  const subStack = member ? await getCurrentAndUpcomingSubscriptions(member.id) : { current: null, upcoming: [] }

  const expiryInfo = getSubscriptionExpiryInfo(subscription)
  const remainingDays = expiryInfo.remainingDays
  const progress = subscription
    ? Math.min(100, Math.round((remainingDays / (subscription.membership_plans?.duration_days || 30)) * 100))
    : 0
  const isPremium = member?.member_type === "PREMIUM" || (Boolean(subscription) && subscription?.membership_plans?.code !== "DAILY_PASS")
  const planName = (subscription?.membership_plans as { name?: string } | null)?.name || "Subscription"
  const completedSessions = recentAttendances.filter((item) => item.status === "CHECKED_OUT" || item.status === "AUTO_CHECKED_OUT").length
  const totalMinutes = recentAttendances.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0)

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Member"
        title="Dashboard Member"
        description="Ringkasan membership, aktivitas latihan terakhir, dan pintasan fitur. Check-in GPS dipisahkan agar halaman ini tetap cepat dibaca."
        status={subscription ? "Membership aktif" : "Belum aktif"}
        actions={
          <Link href="/member/check-in">
            <Button className="gap-2">
              Check-in Gym
              <ArrowRight size={16} />
            </Button>
          </Link>
        }
      />

      {subscription && expiryInfo.isExpiringSoon ? (
        <div className={`rounded-xl border p-4 text-sm ${
          expiryInfo.isCritical
            ? "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200"
            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-100"
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">
                {expiryInfo.isCritical ? "Subscription akan segera berakhir!" : "Subscription akan berakhir"}
              </p>
              <p className="mt-1">
                {planName} aktif sampai {formatDate(subscription.end_date)} ({remainingDays} hari lagi).
              </p>
            </div>
            <Link href="/member/billing">
              <Button variant="outline" size="sm" className={expiryInfo.isCritical ? "border-red-500/50 text-red-700 hover:bg-red-500/10 dark:text-red-300" : ""}>
                Perpanjang Sekarang
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {isPremium ? (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-50 via-yellow-50 to-background p-4 shadow-sm dark:from-amber-950/30 dark:via-yellow-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-950 dark:text-amber-100">Akun premium aktif</p>
              <p className="mt-1 text-sm text-amber-900/75 dark:text-amber-100/75">
                Benefit premium, konten khusus, dan fitur member lanjutan sudah terbuka.
              </p>
            </div>
            <Badge className="premium-gold-badge">MEMBER PREMIUM</Badge>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Status Sesi</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
                <Timer size={17} />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{activeSession ? "Sedang aktif" : "Belum check-in"}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activeSession
                ? `Mulai ${new Date(activeSession.check_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}. Check-out dari halaman check-in.`
                : "Mulai sesi saat tiba di area gym."}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Masa Aktif</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-200">
                <CalendarCheck2 size={17} />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{subscription ? `${remainingDays} hari` : "-"}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {subscription ? `${planName} sampai ${formatDate(subscription.end_date)}.` : "Aktifkan paket untuk mulai memakai akses gym."}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Latihan Terakhir</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-200">
                <Dumbbell size={17} />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{completedSessions} sesi</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {totalMinutes > 0 ? `${totalMinutes} menit dari catatan terbaru.` : "Riwayat latihan akan muncul setelah check-out."}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">Cabang</CardTitle>
              <span className="flex size-9 items-center justify-center rounded-md bg-zinc-500/10 text-zinc-700 dark:text-zinc-200">
                <MapPin size={17} />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="truncate text-2xl font-semibold tracking-tight">{branch?.name || "-"}</p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {branch ? `${branch.address}. Radius check-in ${branch.radius_meters}m.` : "Lokasi gym belum diatur."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Membership</CardTitle>
                <CardDescription>
                  {subscription
                    ? `${planName} aktif sampai ${formatDate(subscription.end_date)}`
                    : "Belum ada subscription aktif"}
                </CardDescription>
              </div>
              {subscription ? (
                <Badge variant={expiryInfo.isCritical ? "destructive" : expiryInfo.isExpiringSoon ? "warning" : "success"}>
                  {expiryInfo.isCritical ? "Hampir Habis" : expiryInfo.isExpiringSoon ? "Segera Habis" : "Aktif"}
                </Badge>
              ) : (
                <Badge variant="muted">TANPA SUBSCRIPTION</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="max-w-xl">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className={expiryInfo.isCritical ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                      Sisa hari
                    </span>
                    <span className={expiryInfo.isCritical ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                      {remainingDays} hari
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={expiryInfo.isCritical ? "bg-red-200 [&>div]:bg-red-500" : expiryInfo.isExpiringSoon ? "bg-amber-200 [&>div]:bg-amber-500" : ""}
                  />
                </div>

                {subStack.upcoming.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Berikutnya</p>
                    {subStack.upcoming.map((sub) => {
                      const subPlan = Array.isArray(sub.membership_plans)
                        ? sub.membership_plans[0]
                        : sub.membership_plans
                      return (
                        <div key={sub.id} className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{subPlan?.name || "Paket"}</span>
                            <Badge variant="outline" className="text-xs">Tertunda</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Aktif mulai {formatDate(sub.start_date)} sampai {formatDate(sub.end_date)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-3">
                  <Link href="/member/blog" className="rounded-lg border border-border p-3 text-sm transition hover:border-primary/40 hover:bg-muted/50">
                    Blog premium tersedia.
                  </Link>
                  <Link href="/member/nutrition" className="rounded-lg border border-border p-3 text-sm transition hover:border-primary/40 hover:bg-muted/50">
                    Log nutrisi tersedia.
                  </Link>
                  <Link href="/member/workouts" className="rounded-lg border border-border p-3 text-sm transition hover:border-primary/40 hover:bg-muted/50">
                    Program workout tersedia.
                  </Link>
                </div>
                {expiryInfo.isExpiringSoon ? (
                  <Link href="/member/billing">
                    <Button className="w-full" variant={expiryInfo.isCritical ? "destructive" : "default"}>
                      Perpanjang Subscription
                    </Button>
                  </Link>
                ) : null}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Belum ada subscription aktif. Pilih paket untuk mulai check-in dan membuka fitur member.
                </p>
                <Link href="/pricing">
                  <Button className="w-full">Lihat Paket</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Aktivitas Terakhir</CardTitle>
              <CardDescription>Riwayat singkat attendance tanpa membuka modul check-in.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendances.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendances.map((attendance) => {
                    const branchInfo = Array.isArray(attendance.branches) ? attendance.branches[0] : attendance.branches
                    return (
                      <div key={attendance.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{formatDate(attendance.check_in_time)}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {branchInfo?.name || "Cabang"} · {attendance.duration_minutes ? `${attendance.duration_minutes} menit` : "Belum check-out"}
                            </p>
                          </div>
                          <Badge variant={attendance.status === "CHECKED_IN" ? "success" : "muted"}>{attendance.status}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-5 text-sm leading-6 text-muted-foreground">
                  Belum ada aktivitas. Gunakan halaman check-in saat tiba di gym, lalu riwayat sesi akan tampil di sini.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="min-w-0 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Utensils size={18} />
                </span>
                <div>
                  <CardTitle>Fokus Hari Ini</CardTitle>
                  <CardDescription>Nutrisi dan workout dipisah dari attendance agar progress lebih jelas.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <Link href="/member/nutrition">
                <Button variant="outline" className="w-full justify-between">
                  Catat nutrisi
                  <ArrowRight size={15} />
                </Button>
              </Link>
              <Link href="/member/workouts">
                <Button variant="outline" className="w-full justify-between">
                  Buka workout
                  <ArrowRight size={15} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
