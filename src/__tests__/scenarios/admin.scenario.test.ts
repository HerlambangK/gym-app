import { canAccessRole, rolePermissions } from "@/lib/rbac";
import type { PermissionCode } from "@/types/domain";

describe("Admin Scenario - Route Access", () => {
  it("Skenario 1: ADMIN bisa akses /admin", () => {
    expect(canAccessRole("ADMIN", ["OWNER", "SUPER_ADMIN", "MANAGER", "ADMIN"])).toBe(true);
  });

  it("Skenario 2: MEMBER tidak bisa akses /admin", () => {
    expect(canAccessRole("MEMBER", ["OWNER", "SUPER_ADMIN", "MANAGER", "ADMIN"])).toBe(false);
  });

  it("Skenario 3: TRAINER tidak bisa akses /admin", () => {
    expect(canAccessRole("TRAINER", ["OWNER", "SUPER_ADMIN", "MANAGER", "ADMIN"])).toBe(false);
  });

  it("Skenario 4: MANAGER bisa akses /admin", () => {
    expect(canAccessRole("MANAGER", ["OWNER", "SUPER_ADMIN", "MANAGER", "ADMIN"])).toBe(true);
  });
});

describe("Admin Scenario - Permissions", () => {
  it("Skenario 5: ADMIN memiliki permission member management", () => {
    const perms = rolePermissions.ADMIN;
    expect(perms).toContain("manage_members");
    expect(perms).toContain("view_members");
    expect(perms).toContain("manage_invoices");
    expect(perms).toContain("manage_payments");
    expect(perms).toContain("manage_attendance");
  });

  it("Skenario 6: ADMIN tidak memiliki permission owner", () => {
    const perms: PermissionCode[] = rolePermissions.ADMIN;
    expect(perms).not.toContain("manage_users");
    expect(perms).not.toContain("manage_roles");
    expect(perms).not.toContain("manage_branding");
    expect(perms).not.toContain("manage_premium_features");
  });

  it("Skenario 7: MARKETING hanya punya branding dan blog", () => {
    expect(rolePermissions.MARKETING).toEqual(["manage_branding", "manage_blog"]);
  });
});
