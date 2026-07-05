"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { deleteBlogPost, upsertBlogPost } from "@/lib/db/blog"
import { deletePlan, setPlanActive, upsertPlan } from "@/lib/db/plans"
import { requireRole } from "@/lib/server/guards"

export type OwnerActionState = {
  ok: boolean
  message: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3),
  code: z.string().trim().optional(),
  type: z.enum(["DAILY", "MONTHLY", "TRIAL"]),
  durationDays: z.coerce.number().int().min(1).max(730),
  price: z.coerce.number().min(0).max(100000000),
  description: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(true),
})

const planMutationSchema = z.object({
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

function logPlanActionError(action: string, error: unknown) {
  console.error(`Failed to ${action} subscription plan`, error)
}

function revalidatePlanSurfaces() {
  revalidatePath("/owner/subscriptions")
  revalidatePath("/pricing")
  revalidatePath("/member/billing")
}

export async function saveSubscriptionPlan(_prevState: OwnerActionState, formData: FormData): Promise<OwnerActionState> {
  await requireRole(["OWNER", "SUPER_ADMIN"])
  const parsed = planSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    type: formData.get("type"),
    durationDays: formData.get("durationDays"),
    price: formData.get("price"),
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive") === "on",
  })

  if (!parsed.success) {
    return { ok: false, message: "Periksa nama, durasi, harga, dan tipe paket." }
  }

  const code = normalizePlanCode(parsed.data.code || parsed.data.name)
  if (!code) {
    return { ok: false, message: "Kode paket wajib diisi atau bisa dibuat dari nama paket." }
  }

  try {
    await upsertPlan({
      id: parsed.data.id,
      name: parsed.data.name,
      code,
      type: parsed.data.type,
      durationDays: parsed.data.durationDays,
      price: parsed.data.price,
      description: parsed.data.description,
      isActive: parsed.data.isActive,
    })
  } catch (error) {
    if (isConstraintError(error)) {
      return { ok: false, message: "Kode paket sudah dipakai paket lain. Gunakan kode yang berbeda." }
    }
    logPlanActionError("save", error)
    return { ok: false, message: "Paket belum bisa disimpan. Periksa koneksi database lalu coba lagi." }
  }

  revalidatePlanSurfaces()
  return { ok: true, message: parsed.data.id ? "Paket subscription berhasil diperbarui." : "Paket subscription berhasil dibuat." }
}

export async function mutateSubscriptionPlan(_prevState: OwnerActionState, formData: FormData): Promise<OwnerActionState> {
  await requireRole(["OWNER", "SUPER_ADMIN"])
  const parsed = planMutationSchema.safeParse({
    id: formData.get("id"),
    intent: formData.get("intent"),
  })

  if (!parsed.success) {
    return { ok: false, message: "Aksi paket tidak valid." }
  }

  if (parsed.data.intent === "delete") {
    try {
      const deleted = await deletePlan(parsed.data.id)
      if (!deleted) return { ok: false, message: "Paket tidak ditemukan." }
    } catch (error) {
      if (isConstraintError(error)) {
        return { ok: false, message: "Paket sudah dipakai invoice/subscription. Arsipkan paket agar riwayat tetap aman." }
      }
      logPlanActionError("delete", error)
      return { ok: false, message: "Paket belum bisa dihapus. Periksa koneksi database lalu coba lagi." }
    }

    revalidatePlanSurfaces()
    return { ok: true, message: "Paket berhasil dihapus." }
  }

  const isActive = parsed.data.intent === "restore"
  let plan
  try {
    plan = await setPlanActive(parsed.data.id, isActive)
  } catch (error) {
    logPlanActionError(isActive ? "restore" : "archive", error)
    return { ok: false, message: "Status paket belum bisa diubah. Periksa koneksi database lalu coba lagi." }
  }
  if (!plan) return { ok: false, message: "Paket tidak ditemukan." }

  revalidatePlanSurfaces()
  return { ok: true, message: isActive ? "Paket berhasil diaktifkan kembali." : "Paket berhasil diarsipkan." }
}

export async function archiveSubscriptionPlan(formData: FormData) {
  await mutateSubscriptionPlan({ ok: false, message: "" }, appendIntent(formData, "archive"))
}

function appendIntent(formData: FormData, intent: "archive" | "restore" | "delete") {
  formData.set("intent", intent)
  return formData
}

const blogSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  accessType: z.enum(["PUBLIC", "SUBSCRIBER_ONLY"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
})

export async function saveBlogPost(_prevState: OwnerActionState, formData: FormData): Promise<OwnerActionState> {
  const { user } = await requireRole(["OWNER", "SUPER_ADMIN", "MARKETING"])
  const parsed = blogSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl") || "",
    accessType: formData.get("accessType"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { ok: false, message: "Judul dan konten blog wajib diisi dengan benar." }
  }

  await upsertBlogPost({
    id: parsed.data.id,
    title: parsed.data.title,
    slug: parsed.data.slug || slugify(parsed.data.title),
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    thumbnailUrl: parsed.data.thumbnailUrl || undefined,
    accessType: parsed.data.accessType,
    status: parsed.data.status,
    authorId: user.id,
  })

  revalidatePath("/owner/blog")
  revalidatePath("/blog")
  revalidatePath("/member/blog")
  return { ok: true, message: "Blog berhasil disimpan." }
}

export async function removeBlogPost(formData: FormData) {
  await requireRole(["OWNER", "SUPER_ADMIN", "MARKETING"])
  const id = String(formData.get("id") || "")
  if (!id) return

  await deleteBlogPost(id)
  revalidatePath("/owner/blog")
  revalidatePath("/blog")
  revalidatePath("/member/blog")
}
