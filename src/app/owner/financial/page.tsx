import { AttendanceChart, RevenueChart } from "@/components/charts/revenue-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { dashboardSummary } from "@/data/gym";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {dashboardSummary.slice(0, 4).map((item) => <MetricCard key={item.label} {...item} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart />
        <AttendanceChart />
      </div>
    </div>
  );
}

