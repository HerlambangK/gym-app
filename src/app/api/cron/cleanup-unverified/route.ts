import { NextRequest, NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase-server"
import { deleteUserById } from "@/lib/db/users"

export const maxDuration = 120

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const admin = await createAdminSupabaseClient()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    let deleted = 0
    let failed = 0
    let currentPage = 1
    let hasMore = true

    while (hasMore) {
      const { data, error } = await admin.auth.admin.listUsers({ page: currentPage, perPage: 100 })

      if (error) {
        console.error("cleanup-unverified: listUsers error", error)
        return NextResponse.json({ error: "Failed to list users" }, { status: 500 })
      }

      for (const authUser of data.users) {
        if (authUser.email_confirmed_at) continue
        if (!authUser.created_at || authUser.created_at >= oneHourAgo) continue
        const userId = authUser.id

        try {
          await admin.auth.admin.deleteUser(userId)
          await deleteUserById(userId).catch(() => {})
          deleted++
        } catch (err) {
          console.error(`cleanup-unverified: failed to delete ${userId}`, err)
          failed++
        }
      }

      currentPage++
      if (!data.nextPage) hasMore = false
    }

    return NextResponse.json({
      success: true,
      deleted,
      failed,
      message: `Deleted ${deleted} unverified users, ${failed} failed.`,
    })
  } catch (err) {
    console.error("cleanup-unverified: error", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
