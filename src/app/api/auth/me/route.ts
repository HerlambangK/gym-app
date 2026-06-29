import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserPermissions, getUserRole } from "@/lib/db/users"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ user: null }, { status: 401 })
  }

  const role = await getUserRole(user.id)
  const permissions = await getUserPermissions(user.id)

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      phone: user.user_metadata?.phone || null,
      role,
      permissions,
    },
  })
}
