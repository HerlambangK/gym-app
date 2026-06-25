import type { PermissionCode, RoleCode } from "@/types/domain";

const ownerPermissions: PermissionCode[] = [
  "manage_users",
  "manage_roles",
  "manage_permissions",
  "manage_branches",
  "manage_branding",
  "manage_theme",
  "manage_members",
  "view_members",
  "manage_memberships",
  "manage_plans",
  "manage_invoices",
  "manage_payments",
  "manage_refunds",
  "view_financial",
  "manage_expenses",
  "view_reports",
  "manage_attendance",
  "manual_check_in",
  "manage_blog",
  "manage_premium_features",
];

export const rolePermissions: Record<RoleCode, PermissionCode[]> = {
  SUPER_ADMIN: [...ownerPermissions],
  OWNER: ownerPermissions,
  MANAGER: [
    "manage_branches",
    "manage_members",
    "view_members",
    "manage_memberships",
    "manage_invoices",
    "manage_payments",
    "view_financial",
    "manage_expenses",
    "view_reports",
    "manage_attendance",
    "manual_check_in",
  ],
  ADMIN: [
    "manage_members",
    "view_members",
    "manage_memberships",
    "manage_invoices",
    "manage_payments",
    "view_reports",
    "manage_attendance",
    "manual_check_in",
  ],
  MARKETING: ["manage_branding", "manage_blog"],
  TRAINER: ["view_members", "manage_attendance"],
  MEMBER: [
    "view_member_portal",
    "member_check_in",
    "member_check_out",
    "use_premium_blog",
    "use_nutrition_log",
    "use_workout_progress",
  ],
};

export function hasPermission(
  permissions: PermissionCode[],
  permission: PermissionCode,
) {
  return permissions.includes(permission);
}

export function canAccessRole(role: RoleCode, allowedRoles: RoleCode[]) {
  return allowedRoles.includes(role);
}

export function requirePermission(role: RoleCode, permission: PermissionCode) {
  if (!hasPermission(rolePermissions[role], permission)) {
    throw new Error(`Forbidden: missing ${permission}`);
  }
}

