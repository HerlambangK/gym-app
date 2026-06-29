/**
 * @jest-environment node
 */

import { getAdminClient } from "./helpers"

describe("Database: branches", () => {
  const supabase = getAdminClient()

  it("1. branch ForgeFit Studio HQ ada dengan koordinat Jakarta", async () => {
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("id", "b0000000-0000-0000-0000-000000000001")
      .single()

    expect(data).not.toBeNull()
    expect(data!.name).toContain("ForgeFit")
    expect(Number(data!.latitude)).toBeCloseTo(-6.2387, 2)
    expect(Number(data!.longitude)).toBeCloseTo(106.7986, 2)
    expect(data!.radius_meters).toBe(100)
  })

  it("2. branding_settings terisi default", async () => {
    const { data } = await supabase
      .from("branding_settings")
      .select("*")
      .limit(1)
      .single()

    expect(data).not.toBeNull()
    expect(data!.brand_name).toBe("ForgeFit Studio")
  })
})
