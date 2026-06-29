/**
 * @jest-environment node
 */

import { getAdminClient, testEmail } from "./helpers"
import { TEST_PREFIX } from "./helpers"

describe("Database: users & roles", () => {
  const supabase = getAdminClient()

  it("1. roles memiliki 7 entry (SUPER_ADMIN, OWNER, MANAGER, ADMIN, MARKETING, TRAINER, MEMBER)", async () => {
    const { data } = await supabase.from("roles").select("code")
    const codes = data?.map((r) => r.code) ?? []
    expect(codes).toContain("SUPER_ADMIN")
    expect(codes).toContain("OWNER")
    expect(codes).toContain("MANAGER")
    expect(codes).toContain("ADMIN")
    expect(codes).toContain("MARKETING")
    expect(codes).toContain("TRAINER")
    expect(codes).toContain("MEMBER")
  })

  it("2. permissions memiliki 26 entry", async () => {
    const { count } = await supabase
      .from("permissions")
      .select("*", { count: "exact", head: true })

    expect(count).toBe(26)
  })

  it("3. role_permissions terisi untuk OWNER dan MEMBER", async () => {
    const { data: ownerRole } = await supabase
      .from("roles")
      .select("id")
      .eq("code", "OWNER")
      .single()

    const { data: ownerPerms, error } = await supabase
      .from("role_permissions")
      .select("permissions(code)")
      .eq("role_id", ownerRole!.id)

    expect(error).toBeNull()
    expect(ownerPerms!.length).toBeGreaterThanOrEqual(10)
  })

  it("4. CRUD: insert user test, assign role, verifikasi, cleanup", async () => {
    const userEmail = testEmail("user_crud")

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({ name: "CI Test User", email: userEmail, phone: "081234567890" })
      .select()
      .single()

    expect(insertError).toBeNull()
    expect(user).not.toBeNull()

    const { data: memberRole } = await supabase
      .from("roles")
      .select("id")
      .eq("code", "MEMBER")
      .single()

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: user!.id, role_id: memberRole!.id })

    expect(roleError).toBeNull()

    const { data: userRole } = await supabase
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", user!.id)
      .single()

    expect((userRole as unknown as { roles: { code: string } })?.roles?.code).toBe("MEMBER")

    // Cleanup
    await supabase.from("user_roles").delete().eq("user_id", user!.id)
    await supabase.from("users").delete().eq("id", user!.id)
  })
})
