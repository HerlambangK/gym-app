import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 10000,
) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) })
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: null, supabaseResponse, user: null }
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
    global: { fetch: fetchWithTimeout },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, supabaseResponse, user }
}
