import { AlertTriangle, Brain, Clock, CreditCard, TrendingUp, Users } from "lucide-react"
import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"
import { getOwnerIntelligence } from "@/lib/db/owner-intelligence"
import { rupiah } from "@/lib/format"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const intelligence = await getOwnerIntelligence()

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status="Rule-based AI MVP"
        title="Business Intelligence"
        description="Insight praktis untuk churn risk, forecast check-in, revenue signal, dan prioritas follow-up member."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard icon={Users} label="Member terpantau" value={String(intelligence.summary.memberCount)} helper="Data member + subscription" />
        <InsightCard icon={AlertTriangle} label="High risk" value={String(intelligence.summary.highRiskCount)} helper={`${intelligence.summary.mediumRiskCount} medium risk`} tone="warning" />
        <InsightCard icon={Clock} label="Forecast check-in" value={String(intelligence.summary.todayForecast)} helper={`Jam ramai ${intelligence.summary.busiestHourLabel}`} />
        <InsightCard icon={CreditCard} label="Pending revenue" value={rupiah.format(intelligence.summary.pendingRevenue)} helper={`Paid ${rupiah.format(intelligence.summary.paidRevenue)}`} />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={18} />
            Owner Recommendation Engine
          </CardTitle>
          <CardDescription>Aturan MVP dari konsep AI/ML: belum model ML, tapi sudah memberi keputusan operasional.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {intelligence.recommendations.map((recommendation) => (
            <div key={recommendation} className="rounded-lg border border-border bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
              {recommendation}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trainer Follow-up Queue</CardTitle>
            <CardDescription>Member yang sebaiknya dihubungi lebih dulu berdasarkan aktivitas dan sisa membership.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Check-in 30d</TableHead>
                  <TableHead className="text-right">Sisa</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intelligence.riskMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Belum ada data member untuk dianalisis.
                    </TableCell>
                  </TableRow>
                ) : intelligence.riskMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.reason}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.plan}</TableCell>
                    <TableCell className="text-right tabular-nums">{member.checkins30d}</TableCell>
                    <TableCell className="text-right tabular-nums">{member.daysLeft} hari</TableCell>
                    <TableCell>
                      <Badge variant={member.risk === "HIGH" ? "destructive" : member.risk === "MEDIUM" ? "warning" : "success"}>
                        {member.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} />
              AI/ML Roadmap
            </CardTitle>
            <CardDescription>Tahapan cerdas yang realistis untuk gym.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["1", "Rule-based AI", "Sudah aktif: rekomendasi nutrisi, workout, dan owner follow-up."],
              ["2", "Regression", "Prediksi check-in, revenue, berat badan, dan rekomendasi beban."],
              ["3", "Classification", "Churn risk, progress status, nutrition status, injury risk."],
              ["4", "Supervised Learning", "Butuh label historis: churn/no churn, progress/not progress."],
            ].map(([step, title, description]) => (
              <div key={step} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{step}</Badge>
                  <p className="font-medium">{title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InsightCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: typeof Users
  label: string
  value: string
  helper: string
  tone?: "default" | "warning"
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className={`flex size-9 items-center justify-center rounded-md ${tone === "warning" ? "bg-amber-500/10 text-amber-700 dark:text-amber-200" : "bg-primary/10 text-primary"}`}>
            <Icon size={17} />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}

