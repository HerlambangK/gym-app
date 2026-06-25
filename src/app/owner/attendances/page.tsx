import { AttendanceChart } from "@/components/charts/revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-6">
      <AttendanceChart />
      <Card>
        <CardHeader><CardTitle>Attendance Rules</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {["Role MEMBER", "Subscription ACTIVE", "GPS radius <= 100m", "Accuracy <= 150m", "No active double session", "Open hours valid"].map((rule) => (
            <div key={rule} className="rounded-md border border-border p-3 text-sm">{rule}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

