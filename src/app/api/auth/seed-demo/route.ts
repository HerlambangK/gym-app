import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-server"
import { demoAccounts } from "@/lib/demo-accounts"
import { ensureUserRole, upsertUserProfile } from "@/lib/db/users"

async function getExistingAuthUserIdByEmail(email: string) {
  const admin = await createAdminSupabaseClient()
  const { data: profile } = await admin.from("users").select("id").eq("email", email).maybeSingle()
  return profile?.id as string | undefined
}

export async function POST(request: Request) {
  const setupKey = process.env.SETUP_SECRET_KEY
  const body = await request.json().catch(() => ({}))

  if (setupKey) {
    const authHeader = request.headers.get("authorization")
    const providedKey = authHeader?.replace("Bearer ", "") || body.setup_key

    if (providedKey !== setupKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const admin = await createAdminSupabaseClient()
  const seeded = []

  for (const account of demoAccounts) {
    let userId = await getExistingAuthUserIdByEmail(account.email)

    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          demo_role: account.role,
        },
      })

      if (error) {
        return NextResponse.json({
          error: `Failed to create ${account.role} demo account: ${error.message}`,
        }, { status: 500 })
      }

      userId = data.user?.id
    } else {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          demo_role: account.role,
        },
      })

      if (error) {
        return NextResponse.json({
          error: `Failed to update ${account.role} demo account: ${error.message}`,
        }, { status: 500 })
      }
    }

    if (!userId) {
      return NextResponse.json({
        error: `Failed to resolve ${account.role} demo user id`,
      }, { status: 500 })
    }

    await upsertUserProfile({
      id: userId,
      name: account.name,
      email: account.email,
    })
    await ensureUserRole(userId, account.role)

    seeded.push({
      role: account.role,
      email: account.email,
      dashboardPath: account.dashboardPath,
    })
  }

  return NextResponse.json({
    message: "Demo accounts seeded",
    accounts: seeded,
  })
}
