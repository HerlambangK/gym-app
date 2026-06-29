/**
 * @jest-environment node
 */

import { getAdminClient } from "./helpers"

describe("Database: attendances & check-in flow", () => {
  const supabase = getAdminClient()

  it("1. attendances terisi untuk 7 hari terakhir", async () => {
    const { data } = await supabase
      .from("attendances")
      .select("id, member_id, branch_id, check_in_time, status")
      .gte("check_in_time", (new Date(Date.now() - 7 * 86400000)).toISOString())
      .limit(30)

    expect(data).not.toBeNull()
    expect(data!.length).toBeGreaterThanOrEqual(5)

    for (const a of data ?? []) {
      expect(a.member_id).toBeTruthy()
      expect(a.branch_id).toBeTruthy()
      expect(["CHECKED_IN", "CHECKED_OUT"]).toContain(a.status)
    }
  })

  it("2. setiap attendance memiliki durasi antara 30-180 menit", async () => {
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
