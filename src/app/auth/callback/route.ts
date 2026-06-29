import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { canAccessDashboardPath, getDashboardPathForRole } from "@/lib/auth-routing"
import { getUserRole } from "@/lib/db/users"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    let response = NextResponse.redirect(`${origin}/member/dashboard`)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.redirect(response.headers.get("location") ?? `${origin}/member/dashboard`)
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user ? await getUserRole(user.id) : null
      const safeNextPath = next?.startsWith("/") && !next.startsWith("//") ? next : null
      const dashboardPath = safeNextPath && canAccessDashboardPath(safeNextPath, role)
        ? safeNextPath
        : getDashboardPathForRole(role)
      response.headers.set("location", `${origin}${dashboardPath}`)
      return response
    }
  }

  return NextResponse.redirect(`${origin}/?error=verifikasi_gagal`)
}
