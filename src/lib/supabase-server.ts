import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000,
) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) })
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options)
        }
      },
    },
    global: { fetch: fetchWithTimeout },
  })
}

export async function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const { createClient } = await import("@supabase/supabase-js")
  const { default: WebSocket } = await import("ws")
  type SupabaseOptions = NonNullable<Parameters<typeof createClient>[2]>
  type RealtimeTransport = NonNullable<NonNullable<SupabaseOptions["realtime"]>["transport"]>

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket as unknown as RealtimeTransport },
    global: { fetch: fetchWithTimeout },
  })
}
