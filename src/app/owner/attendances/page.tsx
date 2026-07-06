import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"
import { getAttendancesByDate } from "@/lib/db/attendances"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AttendanceChart } from "@/components/charts/revenue-chart"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Activity, CalendarDays, Clock, MapPin, Search, Timer, User, Wifi } from "lucide-react"

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

function getJakartaDateInput(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function isValidDateInput(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

function getDayRange(dateInput: string) {
  const start = new Date(`${dateInput}T00:00:00+07:00`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { startIso: start.toISOString(), endIso: end.toISOString() }
}

function formatDateLabel(dateInput: string) {
  return new Date(`${dateInput}T00:00:00+07:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  })
}

function shiftDateInput(dateInput: string, days: number) {
  const date = new Date(`${dateInput}T00:00:00+07:00`)
  date.setUTCDate(date.getUTCDate() + days)
  return getJakartaDateInput(date)
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

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const selectedDate = isValidDateInput(resolvedSearchParams?.date)
    ? resolvedSearchParams?.date as string
    : getJakartaDateInput()
  const { startIso, endIso } = getDayRange(selectedDate)
  const selectedDateLabel = formatDateLabel(selectedDate)
  const previousDate = shiftDateInput(selectedDate, -1)
  const nextDate = shiftDateInput(selectedDate, 1)

  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const data = await getAttendancesByDate(startIso, endIso)
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
        status={`${attendances.length} sesi pada ${selectedDateLabel}`}
        title="Attendance dan Kepadatan Gym"
        description="Lihat aktivitas check-in per hari, durasi latihan, dan aturan validasi yang menjaga operasional tetap tertib."
      />
      <AttendanceChart />
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Filter hari sesi latihan
            </div>
            <p className="text-3xl font-semibold tabular-nums">{attendances.length}</p>
            <p className="text-sm text-muted-foreground">Jumlah sesi latihan pada {selectedDateLabel}</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <form className="flex flex-col gap-2 sm:flex-row" action="/owner/attendances">
              <label htmlFor="attendance-date" className="sr-only">Tanggal attendance</label>
              <input
                id="attendance-date"
                name="date"
                type="date"
                defaultValue={selectedDate}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" /> Tampilkan
              </Button>
            </form>
            <div className="flex flex-wrap gap-2">
              <Link href={`/owner/attendances?date=${previousDate}`}>
                <Button type="button" variant="outline" size="sm">Kemarin</Button>
              </Link>
              <Link href={`/owner/attendances?date=${getJakartaDateInput()}`}>
                <Button type="button" variant="outline" size="sm">Hari ini</Button>
              </Link>
              <Link href={`/owner/attendances?date=${nextDate}`}>
                <Button type="button" variant="outline" size="sm">Besok</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Riwayat Attendance</CardTitle>
            <span className="ml-1 text-sm text-muted-foreground">({attendances.length} sesi)</span>
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
                      <p className="text-sm">Belum ada sesi latihan pada {selectedDateLabel}</p>
                      <p className="text-xs text-muted-foreground/60">Pilih tanggal lain atau tunggu member check-in.</p>
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
