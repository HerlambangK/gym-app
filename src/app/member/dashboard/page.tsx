import { CheckInPanel } from "@/components/member/check-in-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Page() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <CheckInPanel />
      <Card>
        <CardHeader>
          <Badge variant="success">ACTIVE</Badge>
          <CardTitle>Halo, Budi</CardTitle>
          <CardDescription>Plus Monthly berlaku sampai 24 Juli 2026.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Sisa hari</span>
              <span>29 hari</span>
            </div>
            <Progress value={82} />
          </div>
          <div className="grid gap-3">
            {["Premium Blog", "Nutrition Log", "Body Tracking"].map((item) => (
              <div key={item} className="rounded-md border border-border p-3 text-sm">{item} terbuka untuk Plus.</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

