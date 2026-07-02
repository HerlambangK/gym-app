import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

type BrowserSupabaseClient = SupabaseClient

function createGuestBrowserClient(): BrowserSupabaseClient {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
    },
  } as unknown as BrowserSupabaseClient
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 15000,
) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) })
}

export function createBrowserSupabaseClient(): BrowserSupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createGuestBrowserClient()
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: fetchWithTimeout },
  }) as BrowserSupabaseClient
}
