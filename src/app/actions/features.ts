"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { toggleFeature } from "@/lib/db/features"
import { requireRole } from "@/lib/server/guards"

const featureSchema = z.object({
  featureId: z.string().min(1),
  isActive: z.enum(["true", "false"]),
})

export async function togglePremiumFeature(formData: FormData) {
  await requireRole(["OWNER", "ADMIN"])
  const parsed = featureSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    console.warn("togglePremiumFeature: invalid input", parsed.error.flatten())
    return
  }

  await toggleFeature(parsed.data.featureId, parsed.data.isActive === "true")
  revalidatePath("/owner/premium-features")
  revalidatePath("/admin/premium-features")
  revalidatePath("/member/dashboard")
}
