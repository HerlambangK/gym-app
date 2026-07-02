import Link from "next/link"
import { ArrowRight, CalendarCheck2, Dumbbell, MapPin, Timer, Utensils } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription, getCurrentAndUpcomingSubscriptions, getSubscriptionExpiryInfo } from "@/lib/db/subscriptions"
import { getActiveSession, getMemberAttendances } from "@/lib/db/attendances"
import { getDefaultBranch } from "@/lib/db/branches"
import { getActiveWorkoutProgram } from "@/lib/db/workouts"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/format"
import { SubscriptionExpiryDialog } from "@/components/member/subscription-expiry-dialog"

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
  const workoutProgram = member ? await getActiveWorkoutProgram(member.id) : null

  const expiryInfo = getSubscriptionExpiryInfo(subscription)
  const remainingDays = expiryInfo.remainingDays
  const membershipTiming = subscription
    ? getMembershipTiming(subscription.start_date, subscription.end_date, subscription.membership_plans?.duration_days || 30)
    : null
  const progress = membershipTiming?.remainingProgress ?? 0
  const isPremium = member?.member_type === "PREMIUM" || (Boolean(subscription) && subscription?.membership_plans?.code !== "DAILY_PASS")
  const planName = (subscription?.membership_plans as { name?: string } | null)?.name || "Subscription"
  const completedSessions = recentAttendances.filter((item) => item.status === "CHECKED_OUT" || item.status === "AUTO_CHECKED_OUT").length
  const totalMinutes = recentAttendances.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0)
  const workoutStats = getWorkoutStats(workoutProgram)

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
              {activeSession ? "Sesi Latihan" : "Check-in Gym"}
              <ArrowRight size={16} />
            </Button>
          </Link>
        }
      />

      {subscription ? (
        <SubscriptionExpiryDialog
          subscriptionId={subscription.id}
          planName={planName}
          endDate={subscription.end_date}
        />
      ) : null}

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
                {planName} aktif sampai {formatDate(subscription.end_date)} ({membershipTiming?.countdownLabel || `${remainingDays} hari lagi`}).
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

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Ringkasan Member</CardTitle>
          <CardDescription>Semua status utama dimuat ringkas dalam satu card agar mobile tidak terlalu panjang.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 p-4 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0 xl:grid-cols-4">
          <CompactInfo
            icon={Timer}
            label="Status Sesi"
            value={activeSession ? "Sedang aktif" : "Belum check-in"}
            helper={activeSession ? `Mulai ${new Date(activeSession.check_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : "Mulai di area gym"}
          />
          <CompactInfo
            icon={CalendarCheck2}
            label="Masa Aktif"
            value={membershipTiming?.shortLabel || "-"}
            helper={subscription ? `${planName} sampai ${formatDate(subscription.end_date)}` : "Belum ada paket"}
          />
          <CompactInfo
            icon={Dumbbell}
            label="Latihan"
            value={`${completedSessions} sesi`}
            helper={totalMinutes > 0 ? `${totalMinutes} menit tercatat` : "Menunggu check-out"}
          />
          <CompactInfo
            icon={MapPin}
            label="Cabang"
            value={branch?.name || "-"}
            helper={branch ? `Radius ${branch.radius_meters}m` : "Lokasi belum diatur"}
          />
        </CardContent>
        {activeSession ? (
          <div className="border-t border-border p-4 pt-3 sm:px-6">
            <Link href="/member/check-in">
              <Button size="sm" variant="outline" className="w-full justify-between sm:w-auto">
                Sesi Latihan
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        ) : null}
      </Card>

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
                      {planName}
                    </span>
                    <span className={expiryInfo.isCritical ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                      {membershipTiming?.countdownLabel || `${remainingDays} hari lagi`}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={expiryInfo.isCritical ? "bg-red-200 [&>div]:bg-red-500" : expiryInfo.isExpiringSoon ? "bg-amber-200 [&>div]:bg-amber-500" : ""}
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Mulai {formatDate(subscription.start_date)}</span>
                    <span>Sisa {progress}%</span>
                  </div>
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
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Progress Workout</CardTitle>
              <CardDescription>{workoutStats.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <MiniWorkoutStat label="Hari" value={String(workoutStats.days)} />
                <MiniWorkoutStat label="Latihan" value={String(workoutStats.exercises)} />
                <MiniWorkoutStat label="Set" value={String(workoutStats.sets)} />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Balance program</span>
                  <span className="font-medium">{workoutStats.balance}%</span>
                </div>
                <Progress value={workoutStats.balance} />
              </div>
              <Link href="/member/workouts">
                <Button variant="outline" className="w-full justify-between">
                  Lihat calendar latihan
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

function getWorkoutStats(program: Awaited<ReturnType<typeof getActiveWorkoutProgram>>) {
  const sessions = program?.workout_sessions ?? []
  const exercises = sessions.flatMap((session) => session.workout_exercises ?? [])
  const muscleCount = new Set(exercises.map((exercise) => {
    const note = exercise.load_note || ""
    const muscle = note.split("|").find((item) => item.startsWith("muscle:"))?.replace("muscle:", "")
    return muscle || exercise.exercise_type || "General"
  })).size

  return {
    title: program?.title || "Belum ada program aktif",
    days: sessions.length,
    exercises: exercises.length,
    sets: exercises.reduce((sum, exercise) => sum + Number(exercise.sets || 0), 0),
    balance: exercises.length ? Math.min(100, Math.round((muscleCount / 8) * 100)) : 0,
  }
}

function MiniWorkoutStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function CompactInfo({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Timer
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-primary">
          <Icon size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-base font-semibold">{value}</p>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function getMembershipTiming(startDate: string, endDate: string, fallbackDurationDays: number) {
  const now = Date.now()
  const startAt = new Date(`${startDate}T00:00:00`).getTime()
  const endAt = new Date(`${endDate}T23:59:59`).getTime()
  const totalMs = Math.max(1, endAt - startAt)
  const remainingMs = Math.max(0, endAt - now)
  const remainingProgress = Math.min(100, Math.max(0, Math.round((remainingMs / totalMs) * 100)))
  const durationDays = Math.max(1, Math.round(totalMs / 86400000) || fallbackDurationDays)
  const countdownLabel = `${formatRemainingMembership(remainingMs, durationDays)} lagi`
  const shortLabel = durationDays <= 1
    ? formatDailyCountdown(remainingMs)
    : formatRemainingMembership(remainingMs, durationDays)

  return { remainingProgress, countdownLabel, shortLabel }
}

function formatRemainingMembership(ms: number, durationDays: number) {
  const totalDays = Math.max(0, Math.ceil(ms / 86400000))
  if (durationDays <= 1) return formatDailyCountdown(ms)
  const months = Math.floor(totalDays / 30)
  const weeks = Math.floor((totalDays % 30) / 7)
  const days = totalDays % 7
  const parts = [
    months ? `${months} bulan` : "",
    weeks ? `${weeks} minggu` : "",
    days ? `${days} hari` : "",
  ].filter(Boolean)
  return parts.length ? parts.join(" ") : formatDailyCountdown(ms)
}

function formatDailyCountdown(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours} jam ${minutes} menit`
  return `${minutes} menit`
}
