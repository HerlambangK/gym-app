import crypto from "node:crypto"
import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-server"

const ALLOWED_ROLES = ["OWNER", "ADMIN"] as const

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export async function POST(request: Request) {
  const setupKey = process.env.SETUP_SECRET_KEY

  if (setupKey) {
    const authHeader = request.headers.get("authorization")
    const bodyKey = await request.clone().json().then((b) => b.setup_key).catch(() => null)
    const providedKey = authHeader?.replace("Bearer ", "") || bodyKey

    if (providedKey !== setupKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const { name, email, phone, password, roleCode } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 })
  }

  if (!ALLOWED_ROLES.includes(roleCode as typeof ALLOWED_ROLES[number])) {
    return NextResponse.json({ error: "role must be OWNER or ADMIN" }, { status: 400 })
  }

  const admin = await createAdminSupabaseClient()

  const { data: existing } = await admin.from("users").select("id").eq("email", email).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const { data: role } = await admin.from("roles").select("id").eq("code", roleCode).maybeSingle()
  if (!role) {
    return NextResponse.json({ error: `Role ${roleCode} not found in database. Run schema.sql first.` }, { status: 500 })
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }

  const passwordHash = hashPassword(password)

  const { error: profileError } = await admin.from("users").insert({
    id: authData.user.id,
    name,
    email,
    phone: phone || null,
    password_hash: passwordHash,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
  }

  const { error: roleError } = await admin.from("user_roles").insert({
    user_id: authData.user.id,
    role_id: role.id,
  })

  if (roleError) {
    await admin.from("users").delete().eq("id", authData.user.id)
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: `Failed to assign role: ${roleError.message}` }, { status: 500 })
  }

  return NextResponse.json({
    message: `${roleCode} account created successfully`,
    user: { id: authData.user.id, email, name, role: roleCode },
  })
}
