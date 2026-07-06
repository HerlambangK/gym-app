import { headers } from "next/headers"
import { cache } from "react"
import { createServerSupabaseClient } from "./supabase-server"

async function getHeader(key: string): Promise<string | null> {
  const h = await headers()
  return h.get(key)
}

export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const userId = await getHeader("x-authed-user-id")
  if (userId) return userId

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
})

export const getCurrentUserRole = cache(async (): Promise<string | null> => {
  const role = await getHeader("x-authed-user-role")
  if (role) return role

  const id = await getCurrentUserId()
  if (!id) return null
  const { getUserRole } = await import("@/lib/db/users")
  return getUserRole(id)
})

export const getCurrentUserEmail = cache(async (): Promise<string | null> => {
  return getHeader("x-authed-user-email")
})

export const getCurrentUserVerified = cache(async (): Promise<boolean> => {
  return getHeader("x-authed-user-verified").then((v) => v === "true")
})

export async function requireCurrentUserId(): Promise<string> {
  const id = await getCurrentUserId()
  if (!id) throw new Error("Not authenticated")
  return id
}
