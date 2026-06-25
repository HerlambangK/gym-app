import { dashboardSummary } from "@/data/gym";

export async function GET() {
  return Response.json({
    summary: dashboardSummary,
    source: "Supabase views: invoices paid minus expenses",
  });
}

