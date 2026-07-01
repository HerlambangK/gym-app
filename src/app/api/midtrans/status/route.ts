import { z } from "zod"
import { applyMidtransPaymentLifecycle } from "@/lib/db/payment-lifecycle"
import { getInvoiceByNumber } from "@/lib/db/invoices"
import { getTransactionStatus } from "@/lib/midtrans"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"

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
  if (invoice.member_id !== member.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const result = await getTransactionStatus(parsed.data.orderId)
  if (!result.ok) {
    return Response.json({ error: result.data }, { status: result.status })
  }

  const lifecycleResult = await applyMidtransPaymentLifecycle(result.data)
  if (!lifecycleResult.ok) {
    return Response.json({ error: lifecycleResult.error }, { status: 404 })
  }

  return Response.json({
    orderId: parsed.data.orderId,
    transactionStatus: lifecycleResult.transactionStatus,
    paymentStatus: lifecycleResult.paymentStatus,
    invoiceStatus: lifecycleResult.invoiceStatus,
    subscriptionStatus: lifecycleResult.subscriptionStatus,
    raw: result.data,
  })
}
