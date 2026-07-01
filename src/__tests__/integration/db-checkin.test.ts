/**
 * @jest-environment node
 */

import { getAdminClient } from "./helpers"

jest.setTimeout(30000)

describe("Database: attendances & check-in flow", () => {
  const supabase = getAdminClient()

  it("1. tabel attendances dapat diakses", async () => {
    const { data } = await supabase
      .from("attendances")
      .select("id, member_id, branch_id, check_in_time, status")
      .limit(10)

    expect(data).not.toBeNull()
    for (const a of data ?? []) {
      expect(a.member_id).toBeTruthy()
      expect(a.branch_id).toBeTruthy()
      expect(["CHECKED_IN", "CHECKED_OUT"]).toContain(a.status)
    }
  })

  it("2. struktur durasi attendance valid jika ada data", async () => {
    const { data } = await supabase
      .from("attendances")
      .select("duration_minutes")
      .eq("status", "CHECKED_OUT")
      .not("duration_minutes", "is", null)
      .limit(20)

    for (const a of data ?? []) {
      expect(a.duration_minutes).toBeGreaterThanOrEqual(30)
      expect(a.duration_minutes).toBeLessThanOrEqual(180)
    }
  })
})
