/**
 * @jest-environment node
 */
jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock("@/lib/db/users", () => ({ getUserRole: jest.fn() }));
jest.mock("@/lib/db/invoices", () => ({ getInvoiceStats: jest.fn() }));
jest.mock("@/lib/db/subscriptions", () => ({ getActiveSubscriptionCount: jest.fn() }));
jest.mock("@/lib/db/attendances", () => ({ getTodayCheckInCount: jest.fn() }));
jest.mock("@/lib/db/expenses", () => ({ getTotalExpensesThisMonth: jest.fn() }));

import { GET as financialSummary } from "@/app/api/owner/financial/summary/route";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserRole } from "@/lib/db/users";
import { getInvoiceStats } from "@/lib/db/invoices";
import { getActiveSubscriptionCount } from "@/lib/db/subscriptions";
import { getTodayCheckInCount } from "@/lib/db/attendances";
import { getTotalExpensesThisMonth } from "@/lib/db/expenses";
import { canAccessRole, rolePermissions } from "@/lib/rbac";

function setupMocks(options?: {
  noUser?: boolean;
  role?: string;
}) {
  (createServerSupabaseClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue(
        options?.noUser
          ? { data: { user: null } }
          : { data: { user: { id: "owner-123" } } },
      ),
    },
  });
  (getUserRole as jest.Mock).mockResolvedValue(options?.role ?? "OWNER");
  (getInvoiceStats as jest.Mock).mockResolvedValue({
    totalRevenue: 50000000, paidCount: 25, pendingCount: 5,
  });
  (getActiveSubscriptionCount as jest.Mock).mockResolvedValue(120);
  (getTodayCheckInCount as jest.Mock).mockResolvedValue(42);
  (getTotalExpensesThisMonth as jest.Mock).mockResolvedValue(8000000);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Owner Scenario - Route Access", () => {
  it("Skenario 1: OWNER bisa akses /owner", () => {
    expect(canAccessRole("OWNER", ["OWNER", "SUPER_ADMIN"])).toBe(true);
  });

  it("Skenario 2: ADMIN tidak bisa akses /owner", () => {
    expect(canAccessRole("ADMIN", ["OWNER", "SUPER_ADMIN"])).toBe(false);
  });

  it("Skenario 3: SUPER_ADMIN bisa akses /owner", () => {
    expect(canAccessRole("SUPER_ADMIN", ["OWNER", "SUPER_ADMIN"])).toBe(true);
  });
});

describe("Owner Scenario - Financial Summary", () => {
  it("Skenario 4: Owner bisa melihat financial summary", async () => {
    setupMocks();
    const res = await financialSummary();
    const body = await res.json();
    expect(body.summary).toBeDefined();
    expect(body.summary.totalRevenue).toBe(50000000);
    expect(body.summary.totalExpenses).toBe(8000000);
    expect(body.summary.netProfit).toBe(42000000);
    expect(body.summary.activeMembers).toBe(120);
    expect(body.summary.todayCheckIns).toBe(42);
  });

  it("Skenario 5: Admin tidak bisa melihat financial summary (403)", async () => {
    setupMocks({ role: "ADMIN" });
    const res = await financialSummary();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });

  it("Skenario 6: Unauthorized user ditolak (401)", async () => {
    setupMocks({ noUser: true });
    const res = await financialSummary();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});

describe("Owner Scenario - Permissions", () => {
  it("Skenario 7: ADMIN tidak memiliki akses owner", () => {
    expect(canAccessRole("ADMIN", ["OWNER", "SUPER_ADMIN"])).toBe(false);
  });

  it("Skenario 8: OWNER memiliki semua permission", () => {
    const perms = rolePermissions.OWNER;
    expect(perms).toContain("manage_users");
    expect(perms).toContain("manage_roles");
    expect(perms).toContain("manage_branches");
    expect(perms).toContain("manage_branding");
    expect(perms).toContain("manage_members");
    expect(perms).toContain("view_financial");
    expect(perms).toContain("manage_expenses");
    expect(perms).toContain("manage_premium_features");
    expect(perms).toContain("manage_attendance");
  });

  it("Skenario 9: SUPER_ADMIN memiliki permission yang sama dengan OWNER", () => {
    expect(rolePermissions.SUPER_ADMIN).toEqual(rolePermissions.OWNER);
  });
});
