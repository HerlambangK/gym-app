"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { deleteBlogPost, upsertBlogPost } from "@/lib/db/blog"
import { setPlanActive, upsertPlan } from "@/lib/db/plans"
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
  name: z.string().min(3),
  code: z.string().optional(),
  type: z.enum(["DAILY", "MONTHLY", "TRIAL"]),
  durationDays: z.coerce.number().int().min(1).max(730),
  price: z.coerce.number().min(0).max(100000000),
  description: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
})

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

  await upsertPlan({
    id: parsed.data.id,
    name: parsed.data.name,
    code: parsed.data.code || slugify(parsed.data.name).toUpperCase().replace(/-/g, "_"),
    type: parsed.data.type,
    durationDays: parsed.data.durationDays,
    price: parsed.data.price,
    description: parsed.data.description,
    isActive: parsed.data.isActive,
  })

  revalidatePath("/owner/subscriptions")
  revalidatePath("/pricing")
  revalidatePath("/member/billing")
  return { ok: true, message: "Paket subscription berhasil disimpan." }
}

export async function archiveSubscriptionPlan(formData: FormData) {
  await requireRole(["OWNER", "SUPER_ADMIN"])
  const id = String(formData.get("id") || "")
  if (!id) return

  await setPlanActive(id, false)
  revalidatePath("/owner/subscriptions")
  revalidatePath("/pricing")
  revalidatePath("/member/billing")
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
