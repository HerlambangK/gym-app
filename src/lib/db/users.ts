import { createAdminSupabaseClient } from "@/lib/supabase-server"
import { extractRoleCode } from "@/lib/auth-routing"
import type { RoleCode } from "@/types/domain"

const roleSeed: Record<RoleCode, { name: string; description: string }> = {
  SUPER_ADMIN: { name: "Super Admin", description: "Platform operator" },
  OWNER: { name: "Owner", description: "Gym owner" },
  MANAGER: { name: "Manager", description: "Branch manager" },
  ADMIN: { name: "Admin", description: "Front desk and cashier" },
  MARKETING: { name: "Marketing", description: "Content and promo" },
  TRAINER: { name: "Trainer", description: "Trainer access" },
  MEMBER: { name: "Member", description: "Gym member" },
}

type UserProfileInput = {
  id: string
  name: string
  email: string
  phone?: string | null
  passwordHash?: string | null
}

export async function getUserById(id: string) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function getUserByEmail(email: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("users").select("*").eq("email", email).single()
  return data
}

export async function createUserProfile(userId: string, name: string, email: string, phone?: string) {
  await upsertUserProfile({ id: userId, name, email, phone })
}

export async function upsertUserProfile(input: UserProfileInput) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from("users").upsert({
    id: input.id,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    ...(input.passwordHash ? { password_hash: input.passwordHash } : {}),
  }, {
    onConflict: "id",
  })
  if (error) throw error
}

export async function ensureRole(roleCode: RoleCode) {
  const supabase = await createAdminSupabaseClient()
  const seed = roleSeed[roleCode]
  const { data, error } = await supabase
    .from("roles")
    .upsert({
      code: roleCode,
      name: seed.name,
      description: seed.description,
    }, {
      onConflict: "code",
    })
    .select("id, code")
    .single()

  if (error) throw error
  return data
}

export async function assignRole(userId: string, roleCode: string) {
  return ensureUserRole(userId, roleCode as RoleCode)
}

export async function ensureUserRole(userId: string, roleCode: RoleCode) {
  const supabase = await createAdminSupabaseClient()
  const role = await ensureRole(roleCode)
  const { error } = await supabase.from("user_roles").upsert({
    user_id: userId,
    role_id: role.id,
  }, {
    onConflict: "user_id,role_id",
  })

  if (error) throw error
  return roleCode
}

export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Failed to resolve user role:", error.message)
    return null
  }

  return extractRoleCode(data)
}

export async function getUserRoleOrAssignDefault(userId: string, defaultRole: RoleCode = "MEMBER") {
  const existingRole = await getUserRole(userId)
  if (existingRole) return existingRole
  return ensureUserRole(userId, defaultRole)
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("user_roles")
    .select("roles(role_permissions(permissions(code)))")
    .eq("user_id", userId)
    .single()

  if (!data) return []
  const roleData = data as unknown as {
    roles: { role_permissions: Array<{ permissions: { code: string } }> }
  }
  return roleData.roles?.role_permissions?.map((rp) => rp.permissions.code) ?? []
}
