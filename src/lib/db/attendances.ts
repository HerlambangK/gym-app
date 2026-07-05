import { eq, and, isNull, desc, gte, count, lt } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { attendances, branches, members, users } from "@/db/schema"

export async function getActiveSession(memberId: string) {
  const [data] = await db
    .select()
    .from(attendances)
    .where(
      and(
        eq(attendances.member_id, memberId),
        eq(attendances.status, "CHECKED_IN"),
        isNull(attendances.check_out_time),
      ),
    )
    .orderBy(desc(attendances.check_in_time))
    .limit(1)
  return data || null
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
  const [data] = await db
    .insert(attendances)
    .values({
      member_id: input.memberId,
      branch_id: input.branchId,
      subscription_id: input.subscriptionId || null,
      check_in_latitude: input.latitude,
      check_in_longitude: input.longitude,
      check_in_accuracy: input.accuracy,
      distance_meters: input.distance,
      status: "CHECKED_IN",
    })
    .returning()
  return data
}

export async function createCheckOut(attendanceId: string, latitude?: number, longitude?: number, accuracy?: number) {
  const [attendance] = await db
    .select({ check_in_time: attendances.check_in_time })
    .from(attendances)
    .where(eq(attendances.id, attendanceId))
    .limit(1)

  if (!attendance) throw new Error("Attendance not found")
  const checkIn = new Date(attendance.check_in_time)
  const durationMinutes = Math.round((Date.now() - checkIn.getTime()) / 60000)
  const now = new Date().toISOString()

  const update: Record<string, unknown> = {
    check_out_time: now,
    duration_minutes: durationMinutes,
    status: "CHECKED_OUT",
  }
  if (latitude) update.check_out_latitude = latitude
  if (longitude) update.check_out_longitude = longitude
  if (accuracy) update.check_out_accuracy = accuracy

  await db.update(attendances).set(update).where(eq(attendances.id, attendanceId))
  return { durationMinutes, checkedOutAt: now }
}

export async function getMemberAttendances(memberId: string, limit = 20) {
  const rows = await db
    .select()
    .from(attendances)
    .leftJoin(branches, eq(attendances.branch_id, branches.id))
    .where(eq(attendances.member_id, memberId))
    .orderBy(desc(attendances.check_in_time))
    .limit(limit)

  return rows.map((row) => ({
    ...row.attendances,
    branches: row.branches ? { name: row.branches.name } : null,
  }))
}

export async function getTodayCheckInCount() {
  const today = new Date().toISOString().split("T")[0]
  const [result] = await db
    .select({ value: count() })
    .from(attendances)
    .where(gte(attendances.check_in_time, today))
  return result?.value ?? 0
}

export async function getAllAttendances(limit = 50) {
  const rows = await db
    .select()
    .from(attendances)
    .leftJoin(members, eq(attendances.member_id, members.id))
    .leftJoin(users, eq(members.user_id, users.id))
    .leftJoin(branches, eq(attendances.branch_id, branches.id))
    .orderBy(desc(attendances.check_in_time))
    .limit(limit)

  return rows.map((row) => ({
    id: row.attendances.id,
    check_in_time: row.attendances.check_in_time,
    check_out_time: row.attendances.check_out_time,
    duration_minutes: row.attendances.duration_minutes,
    status: row.attendances.status,
    members: row.members ? { users: { name: row.users?.name } } : null,
    branches: row.branches ? { name: row.branches.name } : null,
  }))
}

export async function getAttendancesByDate(startIso: string, endIso: string, limit = 200) {
  const rows = await db
    .select()
    .from(attendances)
    .leftJoin(members, eq(attendances.member_id, members.id))
    .leftJoin(users, eq(members.user_id, users.id))
    .leftJoin(branches, eq(attendances.branch_id, branches.id))
    .where(and(
      gte(attendances.check_in_time, startIso),
      lt(attendances.check_in_time, endIso),
    ))
    .orderBy(desc(attendances.check_in_time))
    .limit(limit)

  return rows.map((row) => ({
    id: row.attendances.id,
    check_in_time: row.attendances.check_in_time,
    check_out_time: row.attendances.check_out_time,
    duration_minutes: row.attendances.duration_minutes,
    status: row.attendances.status,
    members: row.members ? { users: { name: row.users?.name } } : null,
    branches: row.branches ? { name: row.branches.name } : null,
  }))
}
