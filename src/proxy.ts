import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { canAccessDashboardPath, getDashboardPathForRole } from "@/lib/auth-routing"
import { getUserRole } from "@/lib/db/users"

const protectedPrefixes = ["/owner", "/admin", "/member"]

function copySetCookieHeaders(source: Headers, target: Headers) {
  source.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      target.append("set-cookie", value)
    }
  })
}

function withIdentityHeaders(
  originalResponse: NextResponse,
  request: NextRequest,
  userId: string,
  userRole: string,
  email: string,
  verified: boolean,
): NextResponse {
  const reqHeaders = new Headers(request.headers)
  reqHeaders.set("x-authed-user-id", userId)
  reqHeaders.set("x-authed-user-role", userRole)
  reqHeaders.set("x-authed-user-email", email)
  reqHeaders.set("x-authed-user-verified", String(verified))

  const response = NextResponse.next({ request: { headers: reqHeaders } })
  copySetCookieHeaders(originalResponse.headers, response.headers)
  return response
}

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

    return withIdentityHeaders(supabaseResponse, request, user.id, userRole, user.email || "", Boolean(user.email_confirmed_at))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/owner/:path*", "/admin/:path*", "/member/:path*", "/api/auth/me", "/auth/callback"],
}
