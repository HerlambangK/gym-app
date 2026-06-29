import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveSession, createCheckOut } from "@/lib/db/attendances"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const member = await getMemberByUserId(user.id)
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 })

  const activeSession = await getActiveSession(member.id)
  if (!activeSession) return Response.json({ error: "No active check-in session" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const result = await createCheckOut(
    activeSession.id,
    body.latitude,
    body.longitude,
    body.accuracy,
  )

  return Response.json({
    status: "CHECKED_OUT",
    durationMinutes: result.durationMinutes,
    checkedOutAt: result.checkedOutAt,
  })
}
