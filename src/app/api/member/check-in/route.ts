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
  if (!member) return Response.json({ error: "Member not found", code: "MEMBER_NOT_FOUND" }, { status: 404 })
  if (member.status !== "ACTIVE") return Response.json({ error: "Akun member tidak aktif", code: "MEMBER_INACTIVE" }, { status: 403 })

  const subscription = await getActiveSubscription(member.id)
  if (!subscription) return Response.json({ error: "Tidak ada langganan aktif", code: "NO_ACTIVE_SUBSCRIPTION" }, { status: 403 })

  const activeSession = await getActiveSession(member.id)
  if (activeSession) return Response.json({ error: "Sudah check-in", code: "ALREADY_CHECKED_IN" }, { status: 409 })

  const branch = await getDefaultBranch()
  if (!branch) return Response.json({ error: "Belum ada cabang dikonfigurasi", code: "NO_BRANCH" }, { status: 500 })

  const distance = getDistanceMeters(parsed.data, {
    latitude: Number(branch.latitude),
    longitude: Number(branch.longitude),
  })

  if (distance > branch.radius_meters) {
    return Response.json({
      error: "Di luar radius cabang",
      distance: Math.round(distance),
      radius: branch.radius_meters,
      code: "OUTSIDE_RADIUS",
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
