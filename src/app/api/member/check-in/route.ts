import { attendanceLocationSchema } from "@/lib/validators";
import { canUseFeature } from "@/lib/feature-gate";
import { getDistanceMeters } from "@/lib/haversine";

const branch = { latitude: -6.2279, longitude: 106.8099, radiusMeters: 100 };

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = attendanceLocationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const distance = getDistanceMeters(parsed.data, branch);
  const allowed = canUseFeature("PLUS", "attendance_check_in") && distance <= branch.radiusMeters;

  if (!allowed) {
    return Response.json({ error: "Outside branch radius or feature locked", distance }, { status: 403 });
  }

  return Response.json({
    status: "CHECKED_IN",
    distance: Math.round(distance),
    checkedInAt: new Date().toISOString(),
  });
}

