import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000,
) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) })
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: fetchWithTimeout },
  })
}
