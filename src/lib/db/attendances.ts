import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getActiveSession(memberId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("attendances")
    .select("*")
    .eq("member_id", memberId)
    .eq("status", "CHECKED_IN")
    .is("check_out_time", null)
    .single()
  return data
}

export async function createCheckIn(input: {
  memberId: string
  branchId: string
  subscriptionId?: string
  latitude: number
  longitude: number
  accuracy: number
  distance: number
}) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("attendances")
    .insert({
      member_id: input.memberId,
      branch_id: input.branchId,
      subscription_id: input.subscriptionId || null,
      check_in_latitude: input.latitude,
      check_in_longitude: input.longitude,
      check_in_accuracy: input.accuracy,
      distance_meters: input.distance,
      status: "CHECKED_IN",
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createCheckOut(attendanceId: string, latitude?: number, longitude?: number, accuracy?: number) {
  const supabase = await createAdminSupabaseClient()
  const now = new Date().toISOString()
  const { data: attendance } = await supabase
    .from("attendances")
    .select("check_in_time")
    .eq("id", attendanceId)
    .single()

  if (!attendance) throw new Error("Attendance not found")
  const checkIn = new Date(attendance.check_in_time)
  const durationMinutes = Math.round((Date.now() - checkIn.getTime()) / 60000)

  const update: Record<string, unknown> = {
    check_out_time: now,
    duration_minutes: durationMinutes,
    status: "CHECKED_OUT",
  }
  if (latitude) update.check_out_latitude = latitude
  if (longitude) update.check_out_longitude = longitude
  if (accuracy) update.check_out_accuracy = accuracy

  const { error } = await supabase.from("attendances").update(update).eq("id", attendanceId)
  if (error) throw error
  return { durationMinutes, checkedOutAt: now }
}

export async function getMemberAttendances(memberId: string, limit = 20) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("attendances")
    .select("*, branches(name)")
    .eq("member_id", memberId)
    .order("check_in_time", { ascending: false })
    .limit(limit)
  return data || []
}

export async function getTodayCheckInCount() {
  const supabase = await createAdminSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  const { count } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .gte("check_in_time", today)
  return count || 0
}

export async function getAllAttendances(limit = 50) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("attendances")
    .select("*, members(users(name)), branches(name)")
    .order("check_in_time", { ascending: false })
    .limit(limit)
  return data || []
}
