jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
}));

jest.mock("@/lib/db/users", () => ({
  ensureUserRole: jest.fn(),
  upsertUserProfile: jest.fn(),
}));

jest.mock("@/lib/db/members", () => ({
  createMember: jest.fn(),
}));

import { registerAction } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ensureUserRole, upsertUserProfile } from "@/lib/db/users";
import { createMember } from "@/lib/db/members";

function formData(values: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

function setupMocks(options?: {
  signUpError?: string;
  insertError?: string;
  roleFound?: boolean;
}) {
  const signUp = jest.fn().mockResolvedValue(
    options?.signUpError
      ? { data: { user: null }, error: { message: options.signUpError } }
      : { data: { user: { id: "00000000-0000-0000-0000-000000000002" } }, error: null },
  );
  if (options?.insertError) {
    (upsertUserProfile as jest.Mock).mockRejectedValue(new Error(options.insertError));
  } else {
    (upsertUserProfile as jest.Mock).mockResolvedValue(undefined);
  }
  (ensureUserRole as jest.Mock).mockResolvedValue("MEMBER");
  (createMember as jest.Mock).mockResolvedValue({ id: "member-id" });

  (createServerSupabaseClient as jest.Mock).mockResolvedValue({
    auth: { signUp },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Register Scenario", () => {
  it("Skenario 1: Registrasi sukses - data valid → redirect", async () => {
    setupMocks();
    const result = await registerAction(null, formData({
      name: "Budi Santoso", email: "budi@test.com",
      phone: "08123456789", password: "rahasia123",
    }));
    expect(result).toEqual({ redirectTo: "/" });
  });

  it("Skenario 2: Registrasi gagal - nama < 2 karakter", async () => {
    setupMocks();
    const result = await registerAction(null, formData({
      name: "A", email: "budi@test.com",
      phone: "08123456789", password: "rahasia123",
    }));
    expect(result).toEqual({ error: "Nama lengkap minimal 2 karakter." });
  });

  it("Skenario 3: Registrasi gagal - email tidak valid", async () => {
    setupMocks();
    const result = await registerAction(null, formData({
      name: "Budi", email: "invalid-email",
      phone: "08123456789", password: "rahasia123",
    }));
    expect(result).toEqual({ error: "Format email tidak valid." });
  });

  it("Skenario 4: Registrasi gagal - password < 6 karakter", async () => {
    setupMocks();
    const result = await registerAction(null, formData({
      name: "Budi", email: "budi@test.com",
      phone: "08123456789", password: "12345",
    }));
    expect(result).toEqual({ error: "Password minimal 6 karakter." });
  });

  it("Skenario 5: Registrasi gagal - email sudah terdaftar", async () => {
    setupMocks({ signUpError: "User already registered" });
    const result = await registerAction(null, formData({
      name: "Budi", email: "existing@test.com",
      phone: "08123456789", password: "rahasia123",
    }));
    expect(result.error).toContain("Email sudah terdaftar");
    expect(result.cooldown).toBe(true);
  });

  it("Skenario 6: Registrasi gagal - nama kosong", async () => {
    setupMocks();
    const result = await registerAction(null, formData({
      name: "", email: "budi@test.com",
      phone: "08123456789", password: "rahasia123",
    }));
    expect(result).toEqual({ error: "Nama lengkap minimal 2 karakter." });
  });

  it("Skenario 7: Registrasi gagal - password kosong", async () => {
    setupMocks();
    const result = await registerAction(null, formData({
      name: "Budi", email: "budi@test.com",
      phone: "08123456789", password: "",
    }));
    expect(result).toEqual({ error: "Password wajib diisi." });
  });
});
