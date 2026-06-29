import { attendanceLocationSchema } from "@/lib/validators"
import { getDistanceMeters } from "@/lib/haversine"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSubscription } from "@/lib/db/subscriptions"
import { getActiveSession, createCheckIn } from "@/lib/db/attendances"
import { getDefaultBranch } from "@/lib/db/branches"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = attendanceLocationSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const member = await getMemberByUserId(user.id)
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 })
  if (member.status !== "ACTIVE") return Response.json({ error: "Member is not active" }, { status: 403 })

  const subscription = await getActiveSubscription(member.id)
  if (!subscription) return Response.json({ error: "No active subscription" }, { status: 403 })

  const activeSession = await getActiveSession(member.id)
  if (activeSession) return Response.json({ error: "Already checked in" }, { status: 409 })

  const branch = await getDefaultBranch()
  if (!branch) return Response.json({ error: "No branch configured" }, { status: 500 })

  const distance = getDistanceMeters(parsed.data, {
    latitude: Number(branch.latitude),
    longitude: Number(branch.longitude),
  })

  if (distance > branch.radius_meters) {
    return Response.json({
      error: "Outside branch radius",
      distance: Math.round(distance),
      radius: branch.radius_meters,
    }, { status: 403 })
  }

  const attendance = await createCheckIn({
    memberId: member.id,
    branchId: branch.id,
    subscriptionId: subscription.id,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    accuracy: parsed.data.accuracy,
    distance: Math.round(distance),
  })

  return Response.json({
    status: "CHECKED_IN",
    distance: Math.round(distance),
    checkedInAt: attendance.check_in_time,
  })
}
