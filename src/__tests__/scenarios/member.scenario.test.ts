/**
 * @jest-environment node
 */
jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock("@/lib/db/members", () => ({ getMemberByUserId: jest.fn() }));
jest.mock("@/lib/db/subscriptions", () => ({ getActiveSubscription: jest.fn() }));
jest.mock("@/lib/db/attendances", () => ({
  getActiveSession: jest.fn(), createCheckIn: jest.fn(), createCheckOut: jest.fn(),
}));
jest.mock("@/lib/db/branches", () => ({ getDefaultBranch: jest.fn() }));

import { POST as checkInPost } from "@/app/api/member/check-in/route";
import { POST as checkOutPost } from "@/app/api/member/check-out/route";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getMemberByUserId } from "@/lib/db/members";
import { getActiveSubscription } from "@/lib/db/subscriptions";
import { getActiveSession, createCheckIn, createCheckOut } from "@/lib/db/attendances";
import { getDefaultBranch } from "@/lib/db/branches";
import { canAccessRole, hasPermission } from "@/lib/rbac";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/member/check-in", {
    method: "POST", body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const baseLocation = { latitude: -6.2146, longitude: 106.8451, accuracy: 10 };

function setupMocks(options?: {
  noUser?: boolean;
  memberNotActive?: boolean;
  noSubscription?: boolean;
  alreadyCheckedIn?: boolean;
  outsideRadius?: boolean;
}) {
  (createServerSupabaseClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue(
        options?.noUser
          ? { data: { user: null } }
          : { data: { user: { id: "user-123" } } },
      ),
    },
  });
  (getMemberByUserId as jest.Mock).mockResolvedValue(
    options?.memberNotActive
      ? null
      : { id: "member-1", status: "ACTIVE" },
  );
  (getActiveSubscription as jest.Mock).mockResolvedValue(
    options?.noSubscription ? null : { id: "sub-1" },
  );
  (getActiveSession as jest.Mock).mockResolvedValue(
    options?.alreadyCheckedIn ? { id: "active-session" } : null,
  );
  (getDefaultBranch as jest.Mock).mockResolvedValue(
    options?.outsideRadius
      ? { id: "branch-1", latitude: -6.2, longitude: 106.8, radius_meters: 10 }
      : { id: "branch-1", latitude: -6.2146, longitude: 106.8451, radius_meters: 100 },
  );
  (createCheckIn as jest.Mock).mockResolvedValue({
    id: "att-1", check_in_time: "2026-06-28T10:00:00Z",
  });
  (createCheckOut as jest.Mock).mockResolvedValue({
    durationMinutes: 45, checkedOutAt: "2026-06-28T10:45:00Z",
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Member Scenario", () => {
  it("Skenario 1: Check-in sukses dalam radius branch", async () => {
    setupMocks();
    const res = await checkInPost(jsonRequest(baseLocation));
    const body = await res.json();
    expect(body.status).toBe("CHECKED_IN");
    expect(res.status).toBe(200);
  });

  it("Skenario 2: Check-in ditolak - di luar radius branch", async () => {
    setupMocks({ outsideRadius: true });
    const res = await checkInPost(jsonRequest(baseLocation));
    const body = await res.json();
    expect(body.error).toBe("Outside branch radius");
    expect(res.status).toBe(403);
  });

  it("Skenario 3: Check-in ditolak - tanpa subscription aktif", async () => {
    setupMocks({ noSubscription: true });
    const res = await checkInPost(jsonRequest(baseLocation));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("No active subscription");
  });

  it("Skenario 4: Check-in ditolak - sudah check-in", async () => {
    setupMocks({ alreadyCheckedIn: true });
    const res = await checkInPost(jsonRequest(baseLocation));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Already checked in");
  });

  it("Skenario 5: Check-in ditolak - tanpa auth", async () => {
    setupMocks({ noUser: true });
    const res = await checkInPost(jsonRequest(baseLocation));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("Skenario 6: Check-out sukses", async () => {
    setupMocks({ alreadyCheckedIn: true });
    const req = new Request("http://localhost:3000/api/member/check-out", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await checkOutPost(req);
    const body = await res.json();
    expect(body.status).toBe("CHECKED_OUT");
    expect(body.durationMinutes).toBe(45);
  });

  it("Skenario 7: Check-out gagal - tanpa session aktif", async () => {
    setupMocks();
    const req = new Request("http://localhost:3000/api/member/check-out", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await checkOutPost(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("No active check-in session");
  });

  it("Skenario 8: Route guard - MEMBER tidak bisa akses /admin", () => {
    expect(canAccessRole("MEMBER", ["OWNER", "SUPER_ADMIN", "MANAGER", "ADMIN"])).toBe(false);
  });

  it("Skenario 9: Route guard - MEMBER bisa akses /member", () => {
    expect(canAccessRole("MEMBER", ["MEMBER", "OWNER", "SUPER_ADMIN", "ADMIN"])).toBe(true);
  });

  it("Skenario 10: MEMBER memiliki permission member_check_in", () => {
    const perms = [
      "view_member_portal", "member_check_in", "member_check_out",
      "use_premium_blog", "use_nutrition_log", "use_workout_progress",
    ] as const;
    expect(hasPermission(perms as any, "member_check_in")).toBe(true);
    expect(hasPermission(perms as any, "manage_users")).toBe(false);
  });
});
