import { createClient } from "@supabase/supabase-js"
import type { WebSocketLikeConstructor } from "@supabase/realtime-js"
import WebSocket from "ws"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
export const TEST_PREFIX = process.env.CI_TEST_PREFIX || "ci_test_"

export function hasSupabaseIntegrationEnv() {
  return Boolean(supabaseUrl && serviceRoleKey)
}

export const describeDb = hasSupabaseIntegrationEnv() ? describe : describe.skip

if (!hasSupabaseIntegrationEnv()) {
  process.stdout.write(
    "[db-query] skipped: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required\n",
  )
}

export function getAdminClient() {
  if (!hasSupabaseIntegrationEnv()) {
    throw new Error(
      "Supabase integration env is required: set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY.",
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    realtime: { transport: WebSocket as unknown as WebSocketLikeConstructor },
  })
}

export function testEmail(name: string) {
  return `${TEST_PREFIX}${name}@test.gym`
}

export async function measureQuery<T>(label: string, query: PromiseLike<T>) {
  const start = performance.now()
  const result = await query
  const durationMs = performance.now() - start
  process.stdout.write(`[db-query] ${label}: ${durationMs.toFixed(1)}ms\n`)
  return result
}

let cleanupIds: string[] = []

export function trackCleanup(table: string, id: string) {
  cleanupIds.push(`${table}:${id}`)
}

export async function runCleanup() {
  const supabase = getAdminClient()
  for (const entry of cleanupIds) {
    const [table, id] = entry.split(":")
    await supabase.from(table).delete().eq("id", id)
  }
  cleanupIds = []
}

afterAll(async () => {
  if (!hasSupabaseIntegrationEnv()) return
  await runCleanup()
})
