import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription } from "@/lib/db/subscriptions"
import { CheckInPanel } from "@/components/member/check-in-panel"
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

  const remainingDays = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / 86400000))
    : 0

  const progress = subscription ? Math.min(100, Math.round((remainingDays / (subscription.membership_plans?.duration_days || 30)) * 100)) : 0

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <CheckInPanel />
      <Card>
        <CardHeader>
          <Badge variant={subscription ? "success" : "muted"}>
            {subscription?.status || "NO SUBSCRIPTION"}
          </Badge>
          <CardTitle>{user.user_metadata?.name || user.email}</CardTitle>
          <CardDescription>
            {subscription
              ? `${subscription.membership_plans?.name || "Subscription"} until ${new Date(subscription.end_date).toLocaleDateString("id-ID")}`
              : "No active subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Remaining days</span>
                  <span>{remainingDays} days</span>
                </div>
                <Progress value={progress} />
              </div>
              <div className="grid gap-3">
                {["Premium Blog", "Nutrition Log", "Body Tracking"].map((item) => (
                  <div key={item} className="rounded-md border border-border p-3 text-sm">{item} available.</div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No active subscription. Please purchase a plan to start.
              </p>
              <Link href="/pricing">
                <Button className="w-full">View Plans</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
