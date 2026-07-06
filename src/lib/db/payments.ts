import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { payments } from "@/db/schema"

export async function createPayment(input: {
  invoiceId: string
  provider: string
  providerOrderId: string
  amount: number
  method?: string
}) {
  const [data] = await db
    .insert(payments)
    .values({
      invoice_id: input.invoiceId,
      provider: input.provider,
      provider_order_id: input.providerOrderId,
      method: input.method || null,
      amount: input.amount,
      status: "PENDING",
    })
    .returning()
  return data
}

export async function getPaymentByOrderId(orderId: string) {
  const [data] = await db
    .select()
    .from(payments)
    .where(eq(payments.provider_order_id, orderId))
    .limit(1)
  return data || null
}

export async function updatePaymentStatus(id: string, status: string, transactionId?: string, rawCallback?: unknown) {
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (transactionId) update.provider_transaction_id = transactionId
  if (rawCallback) update.raw_callback = rawCallback
  if (status === "PAID" || status === "settlement") {
    update.paid_at = new Date().toISOString()
  }
  await db.update(payments).set(update).where(eq(payments.id, id))
}
