/**
 * @jest-environment node
 */

import { describeDb, getAdminClient, measureQuery } from "./helpers"

jest.setTimeout(30000)

describeDb("Database: attendances & check-in flow", () => {
  let supabase: ReturnType<typeof getAdminClient>

  beforeAll(() => {
    supabase = getAdminClient()
  })

  it("1. tabel attendances dapat diakses", async () => {
    const { data } = await measureQuery(
      "attendances.list",
      supabase
        .from("attendances")
        .select("id, member_id, branch_id, check_in_time, status")
        .limit(10),
    )

    expect(data).not.toBeNull()
    for (const a of data ?? []) {
      expect(a.member_id).toBeTruthy()
      expect(a.branch_id).toBeTruthy()
      expect(["CHECKED_IN", "CHECKED_OUT", "AUTO_CHECKED_OUT", "FAILED"]).toContain(a.status)
    }
  })

  it("2. struktur durasi attendance valid jika ada data", async () => {
    const { data } = await measureQuery(
      "attendances.checked_out_duration",
      supabase
        .from("attendances")
        .select("duration_minutes")
        .in("status", ["CHECKED_OUT", "AUTO_CHECKED_OUT"])
        .not("duration_minutes", "is", null)
        .limit(20),
    )

    for (const a of data ?? []) {
      expect(a.duration_minutes).toBeGreaterThanOrEqual(0)
      expect(a.duration_minutes).toBeLessThanOrEqual(1440)
    }
  })
})
