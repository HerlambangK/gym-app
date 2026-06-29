import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import type { RoleCode } from "@/types/domain"

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireUser() {
  const user = await getAuthenticatedUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(allowedRoles: RoleCode[]) {
  const user = await requireUser()
  const role = await getUserRole(user.id)

  if (!role || !allowedRoles.includes(role as RoleCode)) {
    redirect("/member/dashboard")
  }

  return { user, role: role as RoleCode }
}
