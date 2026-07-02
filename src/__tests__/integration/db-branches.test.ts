/**
 * @jest-environment node
 */

import { describeDb, getAdminClient, measureQuery } from "./helpers"

jest.setTimeout(30000)

describeDb("Database: branches", () => {
  let supabase: ReturnType<typeof getAdminClient>

  beforeAll(() => {
    supabase = getAdminClient()
  })

  it("1. branch ForgeFit Studio HQ ada dengan koordinat operasional valid", async () => {
    const { data } = await measureQuery(
      "branches.by_id",
      supabase
        .from("branches")
        .select("*")
        .eq("id", "b0000000-0000-0000-0000-000000000001")
        .single(),
    )

    expect(data).not.toBeNull()
    expect(data!.name).toContain("ForgeFit")
    expect(Number(data!.latitude)).toBeGreaterThan(-8.0)
    expect(Number(data!.latitude)).toBeLessThan(-5.0)
    expect(Number(data!.longitude)).toBeGreaterThan(105.0)
    expect(Number(data!.longitude)).toBeLessThan(108.5)
    expect(data!.radius_meters).toBeGreaterThanOrEqual(20)
    expect(data!.radius_meters).toBeLessThanOrEqual(2000)
  })

  it("2. branding_settings terisi default", async () => {
    const { data } = await measureQuery(
      "branding_settings.first",
      supabase
        .from("branding_settings")
        .select("*")
        .limit(1)
        .single(),
    )

    expect(data).not.toBeNull()
    expect(data!.brand_name).toBe("ForgeFit Studio")
  })
})
