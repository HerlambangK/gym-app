/**
 * @jest-environment node
 */

import { getAdminClient, measureQuery } from "./helpers"

jest.setTimeout(30000)

describe("Database: members & subscriptions", () => {
  const supabase = getAdminClient()

  it("1. tabel members dapat diakses", async () => {
    const { data } = await measureQuery(
      "members.list",
      supabase
        .from("members")
        .select("id, member_code, member_type, status, user_id")
        .limit(20),
    )

    expect(data).not.toBeNull()
    for (const m of data ?? []) {
      expect(m.member_code).toBeTruthy()
      expect(["ACTIVE", "INACTIVE", "FROZEN", "BANNED", "SUSPENDED"]).toContain(m.status)
    }
  })

  it("2. tabel subscriptions dapat diakses", async () => {
    const { data } = await measureQuery(
      "subscriptions.list",
      supabase
        .from("subscriptions")
        .select("id, member_id, plan_id, status, start_date, end_date")
        .limit(20),
    )

    expect(data).not.toBeNull()
    for (const sub of data ?? []) {
      expect(sub.member_id).toBeTruthy()
      expect(sub.plan_id).toBeTruthy()
      expect(new Date(sub.end_date) >= new Date(sub.start_date)).toBe(true)
    }
  })

  it("3. tabel invoices dapat diakses", async () => {
    const { data } = await measureQuery(
      "invoices.list",
      supabase
        .from("invoices")
        .select("id, invoice_number, amount, status")
        .limit(10),
    )

    expect(data).not.toBeNull()
    for (const inv of data ?? []) {
      expect(Number(inv.amount)).toBeGreaterThan(0)
      expect(inv.invoice_number).toMatch(/^INV-/)
    }
  })

  it("4. tabel payments dapat diakses", async () => {
    const { data } = await measureQuery(
      "payments.list",
      supabase
        .from("payments")
        .select("id, invoice_id, provider, amount, status")
        .limit(10),
    )

    expect(data).not.toBeNull()
    for (const p of data ?? []) {
      expect(p.provider.toLowerCase()).toBe("midtrans")
      expect(Number(p.amount)).toBeGreaterThan(0)
    }
  })
})
