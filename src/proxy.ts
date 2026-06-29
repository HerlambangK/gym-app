import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { canAccessDashboardPath, getDashboardPathForRole } from "@/lib/auth-routing"
import { getUserRole } from "@/lib/db/users"

const protectedPrefixes = ["/owner", "/admin", "/member"]

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("action", "login")
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }

    const userRole = await getUserRole(user.id)

    if (!userRole) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      url.searchParams.set("action", "login")
      url.searchParams.set("error", "role_missing")
      return NextResponse.redirect(url)
    }

    if (!canAccessDashboardPath(pathname, userRole)) {
      const url = request.nextUrl.clone()
      url.pathname = getDashboardPathForRole(userRole)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
