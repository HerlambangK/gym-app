"use server"

import crypto from "node:crypto"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { canAccessDashboardPath, getDashboardPathForRole } from "@/lib/auth-routing"
import { createMember } from "@/lib/db/members"
import { ensureUserRole, getUserRoleOrAssignDefault, upsertUserProfile, setVerificationSentAt } from "@/lib/db/users"

export type ActionResult = { error?: string; redirectTo?: string; cooldown?: boolean; cooldownSeconds?: number }

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string) {
  return phone === "" || /^[+]?[\d\s()-]{8,20}$/.test(phone)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const cause = (error as { cause?: unknown }).cause
    return error.message + (cause ? ` (cause: ${JSON.stringify(cause)})` : "")
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string") return message
  }
  return "Unknown database error"
}

export async function registerAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string

  if (!name || name.trim().length < 2) return { error: "Nama lengkap minimal 2 karakter." }
  if (!email) return { error: "Email wajib diisi." }
  if (!validateEmail(email)) return { error: "Format email tidak valid." }
  if (phone && !validatePhone(phone)) return { error: "Nomor WhatsApp tidak valid." }
  if (!password) return { error: "Password wajib diisi." }
  if (password.length < 6) return { error: "Password minimal 6 karakter." }

  const supabase = await createServerSupabaseClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (authError) {
    const msg = authError.message.toLowerCase()
    if (msg.includes("already registered") || msg.includes("already exists")) {
      return { error: "Email sudah terdaftar. Silakan cek email untuk verifikasi.", cooldown: true, cooldownSeconds: 30 }
    }
    if (msg.includes("password")) {
      return { error: "Password terlalu lemah. Gunakan minimal 6 karakter." }
    }
    if (msg.includes("email")) {
      return { error: "Format email tidak valid." }
    }
    return { error: `Gagal mendaftar: ${authError.message}` }
  }

  if (!authData.user) {
    return { error: "Email sudah terdaftar. Silakan cek email untuk verifikasi.", cooldown: true, cooldownSeconds: 30 }
  }

  const passwordHash = hashPassword(password)

  try {
    await upsertUserProfile({
      id: authData.user.id,
      name,
      email,
      phone,
      passwordHash,
    })
    await setVerificationSentAt(authData.user.id)
    await ensureUserRole(authData.user.id, "MEMBER")
    await createMember(authData.user.id, "TRIAL")
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("registerAction profile/role/member error:", error)
    if (message.includes("already exists") || message.includes("duplicate")) {
      return { error: "Email sudah terdaftar. Silakan cek email untuk verifikasi.", cooldown: true, cooldownSeconds: 30 }
    }
    if (message.includes("does not exist") || message.includes("relation")) {
      console.error("DB schema not ready:", message)
      return { error: "Database belum siap. Jalankan schema dan seed role terlebih dahulu." }
    }
    return { error: `Gagal menyimpan profil dan role member: ${message}` }
  }

  return { redirectTo: "/" }
}

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const nextPath = formData.get("next") as string | null

  if (!email) return { error: "Email wajib diisi." }
  if (!validateEmail(email)) return { error: "Format email tidak valid." }
  if (!password) return { error: "Password wajib diisi." }
  if (password.length < 6) return { error: "Password minimal 6 karakter." }

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes("invalid login credentials")) {
      return { error: "Email atau password salah." }
    }
    if (msg.includes("email not confirmed")) {
      return { error: "Email belum diverifikasi. Silakan cek email Anda." }
    }
    return { error: `Login gagal: ${error.message}` }
  }

  const userId = data.user?.id
  if (!userId) return { error: "Gagal mendapatkan data pengguna." }

  if (!data.user?.email_confirmed_at) {
    await supabase.auth.signOut()
    return { error: "Email belum diverifikasi. Silakan cek email Anda." }
  }

  try {
    await upsertUserProfile({
      id: userId,
      name: (data.user.user_metadata?.name as string | undefined) || data.user.email || "Member Gym",
      email: data.user.email || `${userId}@unknown.local`,
      phone: (data.user.user_metadata?.phone as string | undefined) || null,
    })
  } catch (error) {
    const message = getErrorMessage(error)
    return { error: `Login berhasil, tetapi profil aplikasi gagal disiapkan: ${message}` }
  }

  const role = await getUserRoleOrAssignDefault(userId, "MEMBER")
  if (role === "MEMBER") {
    try {
      await createMember(userId, "TRIAL")
    } catch (error) {
      const message = getErrorMessage(error)
      return { error: `Login berhasil, tetapi profil member gagal disiapkan: ${message}` }
    }
  }

  const safeNextPath = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null
  const redirectTo = safeNextPath && canAccessDashboardPath(safeNextPath, role)
    ? safeNextPath
    : getDashboardPathForRole(role)

  return { redirectTo }
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}
