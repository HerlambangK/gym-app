import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getAllAttendances } from "@/lib/db/attendances"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { redirect } from "next/navigation"
import { AttendanceChart } from "@/components/charts/revenue-chart"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const attendances = await getAllAttendances(20)

  return (
    <div className="space-y-6">
      <AttendanceChart />
      <Card>
        <CardHeader><CardTitle>Attendance Records</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendances.map((att: Record<string, unknown>) => {
                  const a = att as {
                    id: string; check_in_time: string; check_out_time: string | null;
                    duration_minutes: number | null; status: string;
                    members: { users: { name: string } };
                    branches: { name: string };
                  }
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{a.members?.users?.name || "Unknown"}</TableCell>
                      <TableCell>{a.branches?.name || "Unknown"}</TableCell>
                      <TableCell>{a.check_in_time ? new Date(a.check_in_time).toLocaleString("id-ID") : "-"}</TableCell>
                      <TableCell>{a.check_out_time ? new Date(a.check_out_time).toLocaleString("id-ID") : "Active"}</TableCell>
                      <TableCell>{a.duration_minutes ? `${a.duration_minutes}m` : "-"}</TableCell>
                      <TableCell>{a.status}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Check-in Rules</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["Role must be MEMBER", "Subscription must be ACTIVE", "GPS within branch radius", "Accuracy under 150m", "No active double session", "Within open hours"].map((rule) => (
            <div key={rule} className="rounded-md border border-border p-3 text-sm">{rule}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
