import { rupiah, number } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  const normalizedLabel = label.toLowerCase();
  const isMoney = ["revenue", "expense", "profit", "pendapatan", "pengeluaran", "laba", "biaya"].some((term) =>
    normalizedLabel.includes(term),
  );
  const formatted = isMoney ? rupiah.format(value) : number.format(value);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="truncate text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <p className="truncate text-xl font-semibold tabular-nums sm:text-2xl" title={formatted}>
          {formatted}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground" title={helper}>{helper}</p>
      </CardContent>
    </Card>
  );
}
