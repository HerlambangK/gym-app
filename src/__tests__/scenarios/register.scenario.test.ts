jest.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: jest.fn(),
  createAdminSupabaseClient: jest.fn(),
}));

import { registerAction } from "@/lib/auth";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

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
  const insert = jest.fn().mockResolvedValue(
    options?.insertError
      ? { error: { message: options.insertError } }
      : { error: null },
  );
  const maybeSingle = jest.fn().mockResolvedValue(
    options?.roleFound === false
      ? { data: null }
      : { data: { id: "role-id" } },
  );
  const upsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: "role-id", code: "MEMBER" }, error: null }),
    }),
    error: null,
  });

  (createServerSupabaseClient as jest.Mock).mockResolvedValue({
    auth: { signUp },
  });
  (createAdminSupabaseClient as jest.Mock).mockResolvedValue({
    from: jest.fn().mockReturnValue({
      insert,
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
