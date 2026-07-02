import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { users, roles, user_roles, role_permissions, permissions } from "@/db/schema"
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
  const [data] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!data) throw new Error("User not found")
  return data
}

export async function getUserByEmail(email: string) {
  const [data] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return data || null
}

export async function createUserProfile(userId: string, name: string, email: string, phone?: string) {
  await upsertUserProfile({ id: userId, name, email, phone })
}

export async function upsertUserProfile(input: UserProfileInput) {
  const now = new Date().toISOString()
  await db
    .insert(users)
    .values({
      id: input.id,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      password_hash: input.passwordHash || null,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        ...(input.passwordHash ? { password_hash: input.passwordHash } : {}),
        updated_at: now,
      },
    })
}

export async function ensureRole(roleCode: RoleCode) {
  const seed = roleSeed[roleCode]
  const now = new Date().toISOString()
  const [data] = await db
    .insert(roles)
    .values({
      code: roleCode,
      name: seed.name,
      description: seed.description,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: roles.code,
      set: { name: seed.name, description: seed.description, updated_at: now },
    })
    .returning({ id: roles.id, code: roles.code })

  return data
}

export async function assignRole(userId: string, roleCode: string) {
  return ensureUserRole(userId, roleCode as RoleCode)
}

export async function ensureUserRole(userId: string, roleCode: RoleCode) {
  const role = await ensureRole(roleCode)
  await db
    .insert(user_roles)
    .values({ user_id: userId, role_id: role.id })
    .onConflictDoNothing()
  return roleCode
}

export async function getUserRole(userId: string): Promise<string | null> {
  const [data] = await db
    .select({ code: roles.code })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(user_roles.user_id, userId))
    .limit(1)

  if (!data) return null
  return extractRoleCode({ roles: data })
}

export async function getUserRoleOrAssignDefault(userId: string, defaultRole: RoleCode = "MEMBER") {
  const existingRole = await getUserRole(userId)
  if (existingRole) return existingRole
  return ensureUserRole(userId, defaultRole)
}

export async function setVerificationSentAt(userId: string) {
  await db
    .update(users)
    .set({ verification_sent_at: new Date().toISOString() })
    .where(eq(users.id, userId))
}

export async function deleteUserById(userId: string) {
  await db.delete(users).where(eq(users.id, userId))
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const rows = await db
    .select({ code: permissions.code })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .innerJoin(role_permissions, eq(roles.id, role_permissions.role_id))
    .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
    .where(eq(user_roles.user_id, userId))

  return rows.map((r) => r.code)
}
