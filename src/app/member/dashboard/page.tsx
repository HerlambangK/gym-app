import Link from "next/link"
import { ArrowRight, CalendarCheck2, Dumbbell, MapPin, Timer, Utensils } from "lucide-react"
import { getCurrentUserId } from "@/lib/current-user"
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
import { formatDate, formatMinutes } from "@/lib/format"
import { SubscriptionExpiryDialog } from "@/components/member/subscription-expiry-dialog"
import { WorkoutBodyIntensity, type WorkoutMuscleIntensity } from "@/components/member/workout-body-intensity"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const member = await getMemberByUserId(userId)
  if (!member) redirect("/login")

  const [
    subscription,
    branch,
    activeSession,
    recentAttendances,
    subStack,
    workoutProgram,
  ] = await Promise.all([
    getActiveSubscription(member.id).catch(() => null),
    getDefaultBranch().catch(() => null),
    getActiveSession(member.id).catch(() => null),
    getMemberAttendances(member.id, 20).catch(() => []),
    getCurrentAndUpcomingSubscriptions(member.id).catch(() => ({ current: null, upcoming: [] })),
    getActiveWorkoutProgram(member.id).catch(() => null),
  ])

  const expiryInfo = getSubscriptionExpiryInfo(subscription)
  const remainingDays = expiryInfo.remainingDays
  const membershipTiming = subscription
    ? getMembershipTiming(subscription.start_date, subscription.end_date, subscription.membership_plans?.duration_days || 30)
    : null
  const progress = membershipTiming?.remainingProgress ?? 0
  const isPremium = member?.member_type === "PREMIUM" || (Boolean(subscription) && subscription?.membership_plans?.code !== "DAILY_PASS")
  const planName = (subscription?.membership_plans as { name?: string } | null)?.name || "Subscription"
  const workoutStats = getWorkoutStats(workoutProgram)
  const workoutIntensity = getWorkoutIntensity(workoutProgram)
  const todayWorkout = getTodayWorkoutInfo(workoutProgram)
  const completedWithDuration = recentAttendances.filter(
    (a) => (a.status === "CHECKED_OUT" || a.status === "AUTO_CHECKED_OUT") && a.duration_minutes,
  )
  const avgMinutes = completedWithDuration.length > 0
    ? Math.round(completedWithDuration.reduce((s, a) => s + Number(a.duration_minutes), 0) / completedWithDuration.length)
    : null

  return (
    <div className="space-y-3 sm:space-y-6">
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
        <div className={`rounded-xl border p-3 text-sm sm:p-4 ${
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
        <CardHeader className="p-3 pb-2 sm:p-6">
          <CardTitle>Ringkasan Member</CardTitle>
          <CardDescription>Semua status utama dimuat ringkas dalam satu card agar mobile tidak terlalu panjang.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 p-3 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0 xl:grid-cols-4">
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
          <Link href="/member/workouts" className="block rounded-lg border border-primary/40 bg-primary/[0.03] transition hover:border-primary hover:bg-primary/[0.06]">
            <CompactInfo
              icon={Dumbbell}
              label="Latihan Hari Ini"
              value={todayWorkout ? toLabel(workoutProgram?.title || "Program") : toLabel(workoutProgram?.title || "Belum ada program")}
              helper={todayWorkout
                ? `${todayWorkout.exerciseList}${avgMinutes ? ` · ~${formatMinutes(avgMinutes)}` : ""}`
                : workoutProgram ? "Atur jadwal latihan" : "Buat program workout"}
            />
          </Link>
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

      <div className="grid items-start gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <Card className="min-w-0">
          <CardHeader className="p-3 pb-2 sm:p-6">
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
          <CardContent className="space-y-3 p-3 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
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

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <Link href="/member/blog" className="rounded-lg border border-border p-2 text-xs leading-5 transition hover:border-primary/40 hover:bg-muted/50 sm:p-3 sm:text-sm">
                    Blog premium tersedia.
                  </Link>
                  <Link href="/member/nutrition" className="rounded-lg border border-border p-2 text-xs leading-5 transition hover:border-primary/40 hover:bg-muted/50 sm:p-3 sm:text-sm">
                    Log nutrisi tersedia.
                  </Link>
                  <Link href="/member/workouts" className="rounded-lg border border-border p-2 text-xs leading-5 transition hover:border-primary/40 hover:bg-muted/50 sm:p-3 sm:text-sm">
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
            <CardHeader className="p-3 pb-2 sm:p-6">
              <CardTitle>Aktivitas Terakhir</CardTitle>
              <CardDescription>Riwayat singkat attendance tanpa membuka modul check-in.</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
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
                              {branchInfo?.name || "Cabang"} · {attendance.duration_minutes ? formatMinutes(attendance.duration_minutes) : "Belum check-out"}
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
            <CardHeader className="p-3 pb-2 sm:p-6">
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
          <CardContent className="grid gap-2 p-3 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0">
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

      <Card className="min-w-0">
        <CardHeader className="p-3 pb-2 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Progress Workout</CardTitle>
              <CardDescription>{workoutStats.title}</CardDescription>
            </div>
            <Badge variant="secondary">{workoutStats.sets} set/minggu</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-3 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
          <WorkoutBodyIntensity data={workoutIntensity} />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_auto] lg:items-end">
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
              <Button variant="outline" className="w-full justify-between lg:w-auto lg:min-w-56">
                Lihat calendar latihan
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const muscleBodyMap: Record<string, string[]> = {
  Chest: ["chest"],
  Back: ["upper-back", "trapezius"],
  Shoulders: ["front-deltoids"],
  "Rear Shoulders": ["back-deltoids"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Core: ["abs", "obliques"],
  Quads: ["quadriceps"],
  "Lower Back": ["lower-back"],
  Hamstrings: ["hamstring"],
  Glutes: ["gluteal"],
  Calves: ["calves"],
  Cardio: ["quadriceps", "hamstring", "calves"],
  "Full Body": ["chest", "upper-back", "quadriceps", "hamstring", "abs"],
}

function getWorkoutIntensity(program: Awaited<ReturnType<typeof getActiveWorkoutProgram>>): WorkoutMuscleIntensity[] {
  const areaMap = new Map<string, WorkoutMuscleIntensity>()
  for (const session of program?.workout_sessions ?? []) {
    for (const exercise of session.workout_exercises ?? []) {
      const meta = parseWorkoutMeta(exercise.load_note)
      const label = normalizeMuscleLabel(meta.muscle || exercise.exercise_type || "Full Body")
      const muscles = muscleBodyMap[label] ?? muscleBodyMap["Full Body"]
      const current = areaMap.get(label) ?? { label, count: 0, muscles, exercises: [] }
      current.count += Math.max(1, Number(exercise.sets || 1))
      if (!current.exercises.includes(exercise.exercise_name)) current.exercises.push(exercise.exercise_name)
      areaMap.set(label, current)
    }
  }
  return Array.from(areaMap.values()).sort((a, b) => b.count - a.count)
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

function parseWorkoutMeta(note?: string | null) {
  if (!note) return { muscle: "" }
  const values = Object.fromEntries(note.split("|").map((item) => {
    const [key, ...value] = item.split(":")
    return [key, value.join(":")]
  }))
  return { muscle: values.muscle || "" }
}

function normalizeMuscleLabel(value: string) {
  const cleaned = value.trim().toLowerCase()
  const found = Object.keys(muscleBodyMap).find((label) => label.toLowerCase() === cleaned)
  if (found) return found
  if (/quad|leg press|squat|lunge/.test(cleaned)) return "Quads"
  if (/hamstring|leg curl|romanian/.test(cleaned)) return "Hamstrings"
  if (/glute|hip thrust/.test(cleaned)) return "Glutes"
  if (/back|row|pull/.test(cleaned)) return "Back"
  if (/chest|bench|push/.test(cleaned)) return "Chest"
  if (/shoulder|press|raise/.test(cleaned)) return "Shoulders"
  if (/bicep|curl/.test(cleaned)) return "Biceps"
  if (/tricep|dips/.test(cleaned)) return "Triceps"
  if (/core|abs|plank|crunch/.test(cleaned)) return "Core"
  if (/calf|calves/.test(cleaned)) return "Calves"
  if (/cardio|run|cycling|stair|rowing|hiit/.test(cleaned)) return "Cardio"
  return "Full Body"
}

function MiniWorkoutStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-2.5 text-center sm:p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums sm:mt-1">{value}</p>
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
    <div className="min-w-0 rounded-lg border border-border bg-muted/20 p-2 sm:p-3">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-primary sm:size-8">
          <Icon size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-sm font-semibold sm:mt-1 sm:text-base">{value}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function toLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getTodayWorkoutInfo(program: Awaited<ReturnType<typeof getActiveWorkoutProgram>>): { count: number; exerciseList: string } | null {
  if (!program?.workout_sessions?.length) return null

  const dayNames = [
    "minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu",
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  ]
  const todayIndex = new Date().getDay()
  const todayVariants = [
    dayNames[todayIndex],
    dayNames[todayIndex + 7],
  ]

  const todaySession = program.workout_sessions.find((s) => {
    const name = s.day_name?.toLowerCase().trim() || ""
    return todayVariants.some((v) => name === v || name.startsWith(v))
  })

  if (!todaySession) return null

  const types = new Set(todaySession.workout_exercises.map((e) => toLabel(e.exercise_type || e.exercise_name)))
  const list = Array.from(types).slice(0, 5).join(", ")
  return {
    count: types.size,
    exerciseList: types.size > 5 ? `${list}, +${types.size - 5} lagi` : list,
  }
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
