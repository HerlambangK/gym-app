import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const TEST_PREFIX = process.env.CI_TEST_PREFIX || "ci_test_"

export function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

export function testEmail(name: string) {
  return `${TEST_PREFIX}${name}@test.gym`
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
  await runCleanup()
})
