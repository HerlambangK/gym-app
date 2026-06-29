import { hasPermission, canAccessRole, requirePermission, rolePermissions } from "@/lib/rbac";
import type { PermissionCode, RoleCode } from "@/types/domain";

describe("hasPermission", () => {
  it("mengembalikan true jika permission ada di daftar", () => {
    const perms: PermissionCode[] = ["view_members", "manage_members"];
    expect(hasPermission(perms, "view_members")).toBe(true);
  });

  it("mengembalikan false jika permission tidak ada", () => {
    const perms: PermissionCode[] = ["view_members"];
    expect(hasPermission(perms, "manage_users")).toBe(false);
  });

  it("mengembalikan false untuk array kosong", () => {
    expect(hasPermission([], "manage_users")).toBe(false);
  });
});

describe("canAccessRole", () => {
  it("mengembalikan true jika role ada di allowed list", () => {
    expect(canAccessRole("ADMIN", ["ADMIN", "MANAGER"])).toBe(true);
  });

  it("mengembalikan false jika role tidak ada di allowed list", () => {
    expect(canAccessRole("MEMBER", ["ADMIN", "MANAGER"])).toBe(false);
  });

  it("mengembalikan true untuk single element array", () => {
    expect(canAccessRole("OWNER", ["OWNER"])).toBe(true);
  });
});

describe("requirePermission", () => {
  it("tidak throw jika role memiliki permission", () => {
    expect(() => requirePermission("OWNER", "manage_users")).not.toThrow();
  });

  it("throw error jika role tidak memiliki permission", () => {
    expect(() => requirePermission("MEMBER", "manage_users")).toThrow("Forbidden: missing manage_users");
  });

  it("throw error untuk MEMBER yang akses admin permission", () => {
    expect(() => requirePermission("MEMBER", "manage_members")).toThrow("Forbidden: missing manage_members");
  });
});

describe("rolePermissions matrix", () => {
  it("SUPER_ADMIN memiliki semua permission yang sama dengan OWNER", () => {
    expect(rolePermissions.SUPER_ADMIN).toEqual(rolePermissions.OWNER);
  });

  it("OWNER memiliki manage_users dan manage_roles", () => {
    expect(rolePermissions.OWNER).toContain("manage_users");
    expect(rolePermissions.OWNER).toContain("manage_roles");
  });

  it("MEMBER hanya memiliki permission member", () => {
    expect(rolePermissions.MEMBER).toEqual([
      "view_member_portal",
      "member_check_in",
      "member_check_out",
      "use_premium_blog",
      "use_nutrition_log",
      "use_workout_progress",
    ]);
  });

  it("MARKETING memiliki manage_branding dan manage_blog", () => {
    expect(rolePermissions.MARKETING).toContain("manage_branding");
    expect(rolePermissions.MARKETING).toContain("manage_blog");
    expect(rolePermissions.MARKETING).not.toContain("manage_users");
  });

  it("TRAINER memiliki view_members dan manage_attendance", () => {
    expect(rolePermissions.TRAINER).toEqual(["view_members", "manage_attendance"]);
  });
});
