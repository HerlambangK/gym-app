import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription } from "@/lib/db/subscriptions"
import { getDefaultBranch } from "@/lib/db/branches"
import { CheckInPanel } from "@/components/member/check-in-panel"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const subscription = member ? await getActiveSubscription(member.id) : null
  const branch = await getDefaultBranch()

  const nowMs = new Date().getTime()
  const remainingDays = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - nowMs) / 86400000))
    : 0

  const progress = subscription ? Math.min(100, Math.round((remainingDays / (subscription.membership_plans?.duration_days || 30)) * 100)) : 0

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Member"
        title="Portal Latihan"
        description="Check-in saat tiba di gym, pantau masa aktif membership, dan akses fitur premium sesuai paket."
        status={subscription ? "Membership aktif" : "Belum aktif"}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <CheckInPanel
          branch={branch ? {
            name: branch.name,
            address: branch.address,
            latitude: Number(branch.latitude),
            longitude: Number(branch.longitude),
            radiusMeters: Number(branch.radius_meters),
          } : null}
        />
        <Card>
          <CardHeader>
            <Badge variant={subscription ? "success" : "muted"}>
              {subscription?.status || "TANPA SUBSCRIPTION"}
            </Badge>
            <CardTitle>{user.user_metadata?.name || user.email}</CardTitle>
            <CardDescription>
              {subscription
                ? `${subscription.membership_plans?.name || "Subscription"} aktif sampai ${new Date(subscription.end_date).toLocaleDateString("id-ID")}`
                : "Belum ada subscription aktif"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Sisa hari</span>
                    <span>{remainingDays} hari</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="grid gap-3">
                  {["Blog premium", "Log nutrisi", "Body tracking"].map((item) => (
                    <div key={item} className="rounded-md border border-border p-3 text-sm">{item} tersedia.</div>
                  ))}
                </div>
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
    </div>
  )
}
