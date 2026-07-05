import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"
import { deletePlan, setPlanActive, upsertPlan } from "@/lib/db/plans"
import { getUserRole } from "@/lib/db/users"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const savePlanSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3),
  code: z.string().trim().optional(),
  type: z.enum(["DAILY", "MONTHLY", "TRIAL"]),
  durationDays: z.coerce.number().int().min(1).max(730),
  price: z.coerce.number().min(0).max(100000000),
  description: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true),
})

const mutatePlanSchema = z.object({
  id: z.string().uuid(),
  intent: z.enum(["archive", "restore", "delete"]),
})

function normalizePlanCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function isConstraintError(error: unknown) {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && ["23503", "23505"].includes(String((error as { code?: unknown }).code))
}

function revalidatePlanSurfaces() {
  revalidatePath("/owner/subscriptions")
  revalidatePath("/pricing")
  revalidatePath("/member/billing")
}

async function requireOwnerApi() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { ok: true as const }
}

export async function POST(request: Request) {
  const auth = await requireOwnerApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const parsed = savePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Periksa nama, durasi, harga, dan tipe paket." }, { status: 400 })
  }

  const code = normalizePlanCode(parsed.data.code || parsed.data.name)
  if (!code) {
    return NextResponse.json({ error: "Kode paket wajib diisi atau bisa dibuat dari nama paket." }, { status: 400 })
  }

  try {
    const plan = await upsertPlan({
      id: parsed.data.id,
      name: parsed.data.name,
      code,
      type: parsed.data.type,
      durationDays: parsed.data.durationDays,
      price: parsed.data.price,
      description: parsed.data.description,
      isActive: parsed.data.isActive,
    })

    revalidatePlanSurfaces()
    return NextResponse.json({
      message: parsed.data.id ? "Paket subscription berhasil diperbarui." : "Paket subscription berhasil dibuat.",
      plan,
    })
  } catch (error) {
    if (isConstraintError(error)) {
      return NextResponse.json({ error: "Kode paket sudah dipakai paket lain. Gunakan kode yang berbeda." }, { status: 409 })
    }

    console.error("Failed to save subscription plan", error)
    return NextResponse.json({ error: "Paket belum bisa disimpan. Periksa koneksi database lalu coba lagi." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const auth = await requireOwnerApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const parsed = mutatePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Aksi paket tidak valid." }, { status: 400 })
  }

  if (parsed.data.intent === "delete") {
    try {
      const deleted = await deletePlan(parsed.data.id)
      if (!deleted) return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 })

      revalidatePlanSurfaces()
      return NextResponse.json({ message: "Paket berhasil dihapus.", plan: deleted })
    } catch (error) {
      if (isConstraintError(error)) {
        return NextResponse.json({ error: "Paket sudah dipakai invoice/subscription. Arsipkan paket agar riwayat tetap aman." }, { status: 409 })
      }

      console.error("Failed to delete subscription plan", error)
      return NextResponse.json({ error: "Paket belum bisa dihapus. Periksa koneksi database lalu coba lagi." }, { status: 500 })
    }
  }

  const isActive = parsed.data.intent === "restore"
  try {
    const plan = await setPlanActive(parsed.data.id, isActive)
    if (!plan) return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 })

    revalidatePlanSurfaces()
    return NextResponse.json({
      message: isActive ? "Paket berhasil diaktifkan kembali." : "Paket berhasil diarsipkan.",
      plan,
    })
  } catch (error) {
    console.error("Failed to change subscription plan status", error)
    return NextResponse.json({ error: "Status paket belum bisa diubah. Periksa koneksi database lalu coba lagi." }, { status: 500 })
  }
}
