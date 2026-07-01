import { z } from "zod"
import { getInvoiceByNumber, updateInvoiceStatus } from "@/lib/db/invoices"
import { getMemberByUserId } from "@/lib/db/members"
import { getPaymentByOrderId, updatePaymentStatus } from "@/lib/db/payments"
import { updateSubscriptionStatusForInvoice } from "@/lib/db/subscriptions"
import { cancelTransaction } from "@/lib/midtrans"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const schema = z.object({
  orderId: z.string().min(6),
})

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const member = await getMemberByUserId(user.id)
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 })

  const invoice = await getInvoiceByNumber(parsed.data.orderId)
  if (!invoice) return Response.json({ error: "Invoice not found" }, { status: 404 })
  if (invoice.member_id !== member.id) return Response.json({ error: "Forbidden" }, { status: 403 })
  if (invoice.status === "PAID") {
    return Response.json({ error: "Invoice already paid" }, { status: 409 })
  }

  const cancelResult = await cancelTransaction(parsed.data.orderId)
  if (!cancelResult.ok && cancelResult.status !== 404) {
    return Response.json({ error: cancelResult.data }, { status: cancelResult.status })
  }

  const payment = await getPaymentByOrderId(parsed.data.orderId)
  if (payment) {
    await updatePaymentStatus(
      payment.id,
      "CANCELLED",
      typeof cancelResult.data.transaction_id === "string" ? cancelResult.data.transaction_id : undefined,
      cancelResult.data,
    )
  }

  await updateInvoiceStatus(invoice.id, "CANCELLED")
  await updateSubscriptionStatusForInvoice(invoice.id, "CANCELLED")

  return Response.json({
    orderId: parsed.data.orderId,
    invoiceStatus: "CANCELLED",
    paymentStatus: "CANCELLED",
  })
}
