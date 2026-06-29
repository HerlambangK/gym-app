import type { RoleCode } from "@/types/domain"

export const roleDashboardPath: Record<RoleCode, string> = {
  SUPER_ADMIN: "/owner/dashboard",
  OWNER: "/owner/dashboard",
  MANAGER: "/admin/dashboard",
  ADMIN: "/admin/dashboard",
  MARKETING: "/admin/dashboard",
  TRAINER: "/admin/dashboard",
  MEMBER: "/member/dashboard",
}

export const fallbackDashboardPath = "/member/dashboard"

type RoleRelation =
  | { code?: string | null }
  | Array<{ code?: string | null }>
  | null
  | undefined

type RoleQueryRow = {
  roles?: RoleRelation
} | null

export function normalizeRoleCode(role: string | null | undefined): RoleCode | null {
  const allowedRoles: RoleCode[] = [
    "SUPER_ADMIN",
    "OWNER",
    "MANAGER",
    "ADMIN",
    "MARKETING",
    "TRAINER",
    "MEMBER",
  ]

  return allowedRoles.includes(role as RoleCode) ? (role as RoleCode) : null
}

export function extractRoleCode(row: RoleQueryRow): RoleCode | null {
  const relation = row?.roles
  const rawRole = Array.isArray(relation) ? relation[0]?.code : relation?.code
  return normalizeRoleCode(rawRole)
}

export function getDashboardPathForRole(role: string | null | undefined): string {
  const normalizedRole = normalizeRoleCode(role)
  if (!normalizedRole) return fallbackDashboardPath
  return roleDashboardPath[normalizedRole]
}

export function canAccessDashboardPath(pathname: string, role: string | null | undefined): boolean {
  const normalizedRole = normalizeRoleCode(role)
  if (!normalizedRole) return false

  if (pathname.startsWith("/owner")) {
    return normalizedRole === "OWNER" || normalizedRole === "SUPER_ADMIN"
  }

  if (pathname.startsWith("/admin")) {
    return ["OWNER", "SUPER_ADMIN", "MANAGER", "ADMIN", "MARKETING", "TRAINER"].includes(normalizedRole)
  }

  if (pathname.startsWith("/member")) {
    return true
  }

  return true
}
