import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getBrandingSettings } from "@/lib/db/branding"
import { getMemberByUserId } from "@/lib/db/members"
import { getUserPermissions, getUserRole } from "@/lib/db/users"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ user: null }, { status: 401 })
  }

  const role = await getUserRole(user.id)
  const permissions = await getUserPermissions(user.id)
  const member = role === "MEMBER" ? await getMemberByUserId(user.id) : null

  let brandingFavicon: string | null = null
  try {
    const branding = await getBrandingSettings()
    brandingFavicon = branding?.favicon_url || null
  } catch {
    // non-blocking
  }

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      phone: user.user_metadata?.phone || null,
      role,
      memberType: member?.member_type || null,
      memberStatus: member?.status || null,
      permissions,
    },
    branding: {
      faviconUrl: brandingFavicon,
    },
  })
}
