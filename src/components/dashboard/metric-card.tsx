import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rupiah, number } from "@/lib/format";

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  const isMoney = label.toLowerCase().includes("revenue") || label.toLowerCase().includes("expense") || label.toLowerCase().includes("profit");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{isMoney ? rupiah.format(value) : number.format(value)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

