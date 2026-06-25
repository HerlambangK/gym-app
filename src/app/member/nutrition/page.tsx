import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Log</CardTitle>
        <CardDescription>Feature gated untuk Plus dan Pro member.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        {[
          ["Calories", 2100, 78],
          ["Protein", 145, 82],
          ["Carbs", 250, 64],
          ["Water", 2600, 74],
        ].map(([label, value, progress]) => (
          <div key={label} className="rounded-md border border-border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <Progress value={Number(progress)} className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

