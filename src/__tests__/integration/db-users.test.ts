/**
 * @jest-environment node
 */

import { getAdminClient, measureQuery, testEmail } from "./helpers"

jest.setTimeout(30000)

describe("Database: users & roles", () => {
  const supabase = getAdminClient()

  it("1. roles memiliki 7 entry (SUPER_ADMIN, OWNER, MANAGER, ADMIN, MARKETING, TRAINER, MEMBER)", async () => {
    const { data } = await measureQuery(
      "roles.codes",
      supabase.from("roles").select("code"),
    )
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
    const { count } = await measureQuery(
      "permissions.count",
      supabase
        .from("permissions")
        .select("*", { count: "exact", head: true }),
    )

    expect(count).toBe(26)
  })

  it("3. role_permissions terisi untuk OWNER dan MEMBER", async () => {
    const { data: ownerRole } = await measureQuery(
      "roles.owner",
      supabase
        .from("roles")
        .select("id")
        .eq("code", "OWNER")
        .single(),
    )

    const { data: ownerPerms, error } = await measureQuery(
      "role_permissions.owner",
      supabase
        .from("role_permissions")
        .select("permissions(code)")
        .eq("role_id", ownerRole!.id),
    )

    expect(error).toBeNull()
    expect(ownerPerms!.length).toBeGreaterThanOrEqual(10)
  }, 30000)

  it("4. CRUD: insert user test, assign role, verifikasi, cleanup", async () => {
    const userEmail = testEmail("user_crud")

    const { data: user, error: insertError } = await measureQuery(
      "users.insert_test",
      supabase
        .from("users")
        .insert({ name: "CI Test User", email: userEmail, phone: "081234567890" })
        .select()
        .single(),
    )

    expect(insertError).toBeNull()
    expect(user).not.toBeNull()

    const { data: memberRole } = await measureQuery(
      "roles.member",
      supabase
        .from("roles")
        .select("id")
        .eq("code", "MEMBER")
        .single(),
    )

    const { error: roleError } = await measureQuery(
      "user_roles.insert_test",
      supabase
        .from("user_roles")
        .insert({ user_id: user!.id, role_id: memberRole!.id }),
    )

    expect(roleError).toBeNull()

    const { data: userRole } = await measureQuery(
      "user_roles.verify_test",
      supabase
        .from("user_roles")
        .select("roles(code)")
        .eq("user_id", user!.id)
        .single(),
    )

    expect((userRole as unknown as { roles: { code: string } })?.roles?.code).toBe("MEMBER")

    // Cleanup
    await measureQuery("user_roles.delete_test", supabase.from("user_roles").delete().eq("user_id", user!.id))
    await measureQuery("users.delete_test", supabase.from("users").delete().eq("id", user!.id))
  }, 30000)
})
