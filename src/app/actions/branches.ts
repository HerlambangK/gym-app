"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { upsertBranchLocation } from "@/lib/db/branches"
import { requireRole } from "@/lib/server/guards"

export type BranchLocationState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[] | undefined>
}

const branchLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nama cabang minimal 2 karakter"),
  address: z.string().min(8, "Alamat cabang terlalu pendek"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().int().min(20).max(2000),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
})

export async function saveBranchLocation(
  _prevState: BranchLocationState,
  formData: FormData,
): Promise<BranchLocationState> {
  await requireRole(["OWNER", "ADMIN"])

  const parsed = branchLocationSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali data lokasi cabang.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await upsertBranchLocation({
      id: parsed.data.id || undefined,
      name: parsed.data.name,
      address: parsed.data.address,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      radiusMeters: parsed.data.radiusMeters,
      phone: parsed.data.phone,
      email: parsed.data.email,
    })
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error
        ? `Gagal menyimpan lokasi: ${error.message}`
        : "Gagal menyimpan lokasi gym.",
    }
  }

  revalidatePath("/owner/settings")
  revalidatePath("/admin/settings")
  revalidatePath("/admin/dashboard")
  revalidatePath("/member/dashboard")
  revalidatePath("/member/check-in")

  return {
    ok: true,
    message: "Lokasi gym berhasil disimpan.",
  }
}
