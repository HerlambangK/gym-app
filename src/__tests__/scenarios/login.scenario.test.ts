jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
  createAdminSupabaseClient: jest.fn(),
}));

import { loginAction } from "@/lib/auth";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

function formData(values: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

function setupMocks(options: {
  signInError?: string;
  emailConfirmed?: boolean;
  role?: string;
}) {
  const signInWithPassword = jest.fn().mockResolvedValue(
    options.signInError
      ? { data: { user: null }, error: { message: options.signInError } }
      : {
          data: {
            user: {
              id: "user-123",
              email_confirmed_at: options.emailConfirmed !== false ? "2026-01-01" : null,
            },
            session: { access_token: "token" },
          },
          error: null,
        },
  );
  const signOut = jest.fn().mockResolvedValue({ error: null });
  const maybeSingle = jest.fn().mockResolvedValue(
    options.role ? { data: { roles: { code: options.role } } } : { data: null },
  );
  const upsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: "role-id", code: "MEMBER" }, error: null }),
    }),
    error: null,
  });

  (createServerSupabaseClient as jest.Mock).mockResolvedValue({
    auth: {
      signInWithPassword,
      signOut,
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        maybeSingle,
      }),
    }),
  });

  (createAdminSupabaseClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({
      upsert,
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle,
    }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Login Scenario", () => {
  it("Skenario 1: Login MEMBER sukses → /member/dashboard", async () => {
    setupMocks({ role: "MEMBER" });
    const result = await loginAction(null, formData({
      email: "member@test.com", password: "password123",
    }));
    expect(result).toEqual({ redirectTo: "/member/dashboard" });
  });

  it("Skenario 2: Login ADMIN sukses → /admin/dashboard", async () => {
    setupMocks({ role: "ADMIN" });
    const result = await loginAction(null, formData({
      email: "admin@test.com", password: "password123",
    }));
    expect(result).toEqual({ redirectTo: "/admin/dashboard" });
  });

  it("Skenario 3: Login OWNER sukses → /owner/dashboard", async () => {
    setupMocks({ role: "OWNER" });
    const result = await loginAction(null, formData({
      email: "owner@test.com", password: "password123",
    }));
    expect(result).toEqual({ redirectTo: "/owner/dashboard" });
  });

  it("Skenario 4: Login SUPER_ADMIN sukses → /owner/dashboard", async () => {
    setupMocks({ role: "SUPER_ADMIN" });
    const result = await loginAction(null, formData({
      email: "super@test.com", password: "password123",
    }));
    expect(result).toEqual({ redirectTo: "/owner/dashboard" });
  });

  it("Skenario 5: Login gagal - password salah", async () => {
    setupMocks({ signInError: "Invalid login credentials", role: "MEMBER" });
    const result = await loginAction(null, formData({
      email: "user@test.com", password: "salah123",
    }));
    expect(result).toEqual({ error: "Email atau password salah." });
  });

  it("Skenario 6: Login gagal - email belum diverifikasi", async () => {
    setupMocks({ emailConfirmed: false, role: "MEMBER" });
    const result = await loginAction(null, formData({
      email: "unverified@test.com", password: "password123",
    }));
    expect(result.error).toContain("Email belum diverifikasi");
  });

  it("Skenario 7: Login gagal - email kosong", async () => {
    setupMocks({ role: "MEMBER" });
    const result = await loginAction(null, formData({
      email: "", password: "password123",
    }));
    expect(result).toEqual({ error: "Email wajib diisi." });
  });

  it("Skenario 8: Login gagal - password < 6 karakter", async () => {
    setupMocks({ role: "MEMBER" });
    const result = await loginAction(null, formData({
      email: "user@test.com", password: "12",
    }));
    expect(result).toEqual({ error: "Password minimal 6 karakter." });
  });

  it("Skenario 9: Login user tanpa role otomatis menjadi MEMBER", async () => {
    setupMocks({});
    const result = await loginAction(null, formData({
      email: "norole@test.com", password: "password123",
    }));
    expect(result).toEqual({ redirectTo: "/member/dashboard" });
  });

  it("Skenario 10: Login OWNER mengikuti next path yang aman dan diizinkan", async () => {
    setupMocks({ role: "OWNER" });
    const result = await loginAction(null, formData({
      email: "owner@test.com", password: "password123", next: "/owner/financial",
    }));
    expect(result).toEqual({ redirectTo: "/owner/financial" });
  });

  it("Skenario 11: Login MEMBER tidak boleh dipaksa ke owner dashboard", async () => {
    setupMocks({ role: "MEMBER" });
    const result = await loginAction(null, formData({
      email: "member@test.com", password: "password123", next: "/owner/dashboard",
    }));
    expect(result).toEqual({ redirectTo: "/member/dashboard" });
  });
});
