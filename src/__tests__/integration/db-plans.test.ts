/**
 * @jest-environment node
 */

import { describeDb, getAdminClient, measureQuery, TEST_PREFIX } from "./helpers"

jest.setTimeout(30000)

describeDb("Database: membership_plans", () => {
  let supabase: ReturnType<typeof getAdminClient>

  beforeAll(() => {
    supabase = getAdminClient()
  })

  it("1. getPlans mengembalikan plan aktif terurut berdasarkan harga", async () => {
    const { data } = await measureQuery(
      "membership_plans.active_ordered",
      supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true)
        .order("price"),
    )

    expect(data?.length).toBeGreaterThanOrEqual(4)
    for (let i = 1; i < (data?.length ?? 0); i++) {
      expect(Number(data![i].price)).toBeGreaterThanOrEqual(Number(data![i - 1].price))
    }
  })

  it("2. plan DAILY_PASS memiliki duration_days = 1", async () => {
    const { data } = await measureQuery(
      "membership_plans.daily_pass",
      supabase
        .from("membership_plans")
        .select("*")
        .eq("code", "DAILY_PASS")
        .single(),
    )

    expect(data).not.toBeNull()
    expect(data!.duration_days).toBe(1)
    expect(data!.type).toBe("DAILY")
  })

  it("3. semua plan memiliki harga positif", async () => {
    const { data } = await measureQuery(
      "membership_plans.all",
      supabase.from("membership_plans").select("*"),
    )
    for (const plan of data ?? []) {
      expect(Number(plan.price)).toBeGreaterThan(0)
    }
  })

  it("4. CRUD: insert plan test, lalu hapus", async () => {
    const { data: insertData, error: insertError } = await measureQuery(
      "membership_plans.insert_test",
      supabase
        .from("membership_plans")
        .insert({
          name: `${TEST_PREFIX}Test Plan`,
          code: `${TEST_PREFIX}TEST_PLAN`,
          type: "DAILY",
          duration_days: 7,
          price: 100000,
          description: "Test plan for CI",
          is_active: true,
        })
        .select()
        .single(),
    )

    expect(insertError).toBeNull()
    expect(insertData).not.toBeNull()
    expect(insertData!.name).toContain(TEST_PREFIX)

    const { error: deleteError } = await measureQuery(
      "membership_plans.delete_test",
      supabase
        .from("membership_plans")
        .delete()
        .eq("id", insertData!.id),
    )

    expect(deleteError).toBeNull()
  })
})
