import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription, getCurrentAndUpcomingSubscriptions, getSubscriptionExpiryInfo } from "@/lib/db/subscriptions"
import { getActiveSession } from "@/lib/db/attendances"
import { getDefaultBranch } from "@/lib/db/branches"
import { CheckInPanel } from "@/components/member/check-in-panel"
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
  const subStack = member ? await getCurrentAndUpcomingSubscriptions(member.id) : { current: null, upcoming: [] }

  const expiryInfo = getSubscriptionExpiryInfo(subscription)
  const remainingDays = expiryInfo.remainingDays
  const progress = subscription
    ? Math.min(100, Math.round((remainingDays / (subscription.membership_plans?.duration_days || 30)) * 100))
    : 0
  const isPremium = member?.member_type === "PREMIUM" || (Boolean(subscription) && subscription?.membership_plans?.code !== "DAILY_PASS")
  const planName = (subscription?.membership_plans as { name?: string } | null)?.name || "Subscription"

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Member"
        title="Portal Latihan"
        description="Check-in saat tiba di gym, pantau masa aktif membership, dan akses fitur premium sesuai paket."
        status={subscription ? "Membership aktif" : "Belum aktif"}
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

      <Card>
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
                {["Blog premium", "Log nutrisi", "Body tracking"].map((item) => (
                  <div key={item} className="rounded-lg border border-border p-3 text-sm">{item} tersedia.</div>
                ))}
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
    </div>
  )
}
