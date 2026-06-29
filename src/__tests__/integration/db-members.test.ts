/**
 * @jest-environment node
 */

import { getAdminClient } from "./helpers"

describe("Database: members & subscriptions", () => {
  const supabase = getAdminClient()

  it("1. member aktif terdaftar dengan status ACTIVE atau SUBSCRIPTION", async () => {
    const { data } = await supabase
      .from("members")
      .select("id, member_code, member_type, status, user_id")
      .limit(20)

    expect(data).not.toBeNull()
    expect(data!.length).toBeGreaterThanOrEqual(3)

    const activeMembers = data!.filter((m) => m.status === "ACTIVE")
    expect(activeMembers.length).toBeGreaterThanOrEqual(1)
  })

  it("2. subscriptions terkait dengan member dan plan yang valid", async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, member_id, plan_id, status, start_date, end_date")
      .limit(20)

    expect(data).not.toBeNull()
    for (const sub of data ?? []) {
      expect(sub.member_id).toBeTruthy()
      expect(sub.plan_id).toBeTruthy()
      expect(new Date(sub.end_date) >= new Date(sub.start_date)).toBe(true)
    }
  })

  it("3. invoices memiliki status PAID untuk subscription aktif", async () => {
    const { data } = await supabase
      .from("invoices")
      .select("id, invoice_number, amount, status")
      .eq("status", "PAID")
      .limit(10)

    expect(data!.length).toBeGreaterThanOrEqual(3)
    for (const inv of data ?? []) {
      expect(Number(inv.amount)).toBeGreaterThan(0)
      expect(inv.invoice_number).toMatch(/^INV-/)
    }
  })

  it("4. payments terhubung dengan invoice melalui Midtrans", async () => {
    const { data } = await supabase
      .from("payments")
      .select("id, invoice_id, provider, amount, status")
      .limit(10)

    expect(data).not.toBeNull()
    for (const p of data ?? []) {
      expect(p.provider).toBe("Midtrans")
      expect(Number(p.amount)).toBeGreaterThan(0)
    }
  })
})
