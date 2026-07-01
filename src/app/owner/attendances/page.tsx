import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getAllAttendances } from "@/lib/db/attendances"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { redirect } from "next/navigation"
import { AttendanceChart } from "@/components/charts/revenue-chart"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Activity, Clock, MapPin, Timer, User, Wifi } from "lucide-react"

type AttendanceRow = {
  id: string
  check_in_time: string
  check_out_time: string | null
  duration_minutes: number | null
  status: string
  member_name: string
  branch_name: string
}

function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === 0) return "-"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}j ${m}m`
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; variant: "success" | "warning" | "muted" | "default" }> = {
    ACTIVE: { label: "Aktif", variant: "success" },
    CHECKED_OUT: { label: "Selesai", variant: "muted" },
    COMPLETED: { label: "Selesai", variant: "success" },
    PENDING: { label: "Pending", variant: "warning" },
    MISSED: { label: "Missed", variant: "muted" },
  }
  const cfg = map[status] ?? { label: status, variant: "muted" as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const data = await getAllAttendances(20)
  const attendances: AttendanceRow[] = data.map((att: Record<string, unknown>) => {
    const a = att as {
      id: string; check_in_time: string; check_out_time: string | null;
      duration_minutes: number | null; status: string;
      members: { users: { name: string } };
      branches: { name: string };
    }
    return {
      id: a.id,
      check_in_time: a.check_in_time,
      check_out_time: a.check_out_time,
      duration_minutes: a.duration_minutes,
      status: a.status,
      member_name: a.members?.users?.name || "Unknown",
      branch_name: a.branches?.name || "Unknown",
    }
  })

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status={`${attendances.length} sesi terbaru`}
        title="Attendance dan Kepadatan Gym"
        description="Lihat aktivitas check-in, durasi latihan, dan aturan validasi yang menjaga operasional tetap tertib."
      />
      <AttendanceChart />
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Riwayat Attendance</CardTitle>
            <span className="ml-1 text-sm text-muted-foreground">({attendances.length})</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead><User className="mr-1.5 inline h-3.5 w-3.5" />Member</TableHead>
                <TableHead><MapPin className="mr-1.5 inline h-3.5 w-3.5" />Branch</TableHead>
                <TableHead><Clock className="mr-1.5 inline h-3.5 w-3.5" />Check-in</TableHead>
                <TableHead><Clock className="mr-1.5 inline h-3.5 w-3.5" />Check-out</TableHead>
                <TableHead><Timer className="mr-1.5 inline h-3.5 w-3.5" />Durasi</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Activity className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm">Belum ada riwayat attendance</p>
                      <p className="text-xs text-muted-foreground/60">Data akan muncul setelah member check-in</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attendances.map((att, i) => (
                  <TableRow key={att.id}>
                    <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{att.member_name}</TableCell>
                    <TableCell className="text-muted-foreground">{att.branch_name}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatDateTime(att.check_in_time)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {att.check_out_time ? formatDateTime(att.check_out_time) : (
                        <span className="text-xs font-medium text-emerald-600">Aktif</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{formatDuration(att.duration_minutes)}</TableCell>
                    <TableCell>{statusBadge(att.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Aturan Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: User, label: "Role harus MEMBER", desc: "Hanya user dengan role MEMBER" },
              { icon: Wifi, label: "Subscription harus ACTIVE", desc: "Paket masih aktif" },
              { icon: MapPin, label: "GPS di dalam radius cabang", desc: "Lokasi sesuai branch" },
              { icon: MapPin, label: "Akurasi di bawah 150m", desc: "GPS akurat" },
              { icon: Activity, label: "Tidak ada sesi ganda aktif", desc: "Satu sesi per member" },
              { icon: Clock, label: "Sesuai jam operasional", desc: "Dalam jam buka gym" },
            ].map((rule) => (
              <div key={rule.label} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <rule.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{rule.label}</p>
                  <p className="text-xs text-muted-foreground">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
