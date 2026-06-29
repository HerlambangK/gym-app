import { RevenueChart } from "@/components/charts/revenue-chart"
import { InvoiceTable, MemberTable } from "@/components/dashboard/data-table"
import { MetricCard } from "@/components/dashboard/metric-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { premiumFeatures, roleCards } from "@/data/gym"
import { rolePermissions } from "@/lib/rbac"

export type SummaryItem = {
  label: string
  value: number
  helper: string
}

export function OwnerOverview({ summary }: { summary: SummaryItem[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <InvoiceTable />
        <MemberTable />
      </div>
    </div>
  )
}

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Check-ins Today" value={0} helper="Real-time from attendance" />
        <MetricCard label="Active Members" value={0} helper="Active subscriptions" />
        <MetricCard label="Pending Invoices" value={0} helper="Unpaid" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <MemberTable />
        <InvoiceTable />
      </div>
    </div>
  )
}

export function FeatureManagement() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {premiumFeatures.map((feature) => (
        <Card key={feature.code}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{feature.name}</CardTitle>
              <Badge variant={feature.active ? "success" : "muted"}>
                {feature.active ? "ON" : "OFF"}
              </Badge>
            </div>
            <CardDescription>{feature.category} - {feature.code}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Owner can toggle system features. If OFF, the feature is locked even if the plan supports it.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SettingsOverview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Branding and Theme</CardTitle>
          <CardDescription>Dynamic CSS variables loaded from Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Premium Dark", "Clean Light", "Red Energy", "Luxury Gold", "Green Performance", "Blue Corporate"].map((theme) => (
            <div key={theme} className="flex items-center justify-between rounded-md border border-border p-3">
              <span>{theme}</span>
              <Badge variant={theme === "Premium Dark" ? "warning" : "outline"}>{theme === "Premium Dark" ? "Default" : "Preset"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>RBAC Matrix</CardTitle>
          <CardDescription>Server guard uses requirePermission helper.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {roleCards.map((role) => (
            <div key={role.role} className="rounded-md border border-border p-3">
              <Badge>{role.role}</Badge>
              <p className="mt-3 text-sm text-muted-foreground">{role.summary}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {rolePermissions[role.role].length} permissions
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
