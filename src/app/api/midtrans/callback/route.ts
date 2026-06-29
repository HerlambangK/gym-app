import { verifyMidtransSignature } from "@/lib/midtrans"
import { getInvoiceByNumber, updateInvoiceStatus } from "@/lib/db/invoices"
import { getPaymentByOrderId, updatePaymentStatus } from "@/lib/db/payments"
import { activateSubscription } from "@/lib/db/subscriptions"
import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const payload = await request.json()
  const signatureValid = verifyMidtransSignature(payload)

  if (!signatureValid) {
    return Response.json(
      { received: false, error: "Invalid Midtrans signature" },
      { status: 401 },
    )
  }

  const orderId = payload.order_id
  const transactionStatus = payload.transaction_status
  const fraudStatus = payload.fraud_status

  if (!orderId) {
    return Response.json({ received: false, error: "Missing order_id" }, { status: 400 })
  }

  const invoice = await getInvoiceByNumber(orderId)
  if (!invoice) {
    return Response.json({ received: false, error: "Invoice not found" }, { status: 404 })
  }

  const payment = await getPaymentByOrderId(orderId)

  const isSuccess =
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept")
  const isFailure =
    transactionStatus === "deny" ||
    transactionStatus === "cancel" ||
    transactionStatus === "expire"

  if (isSuccess && payment) {
    await updatePaymentStatus(payment.id, "PAID", payload.transaction_id, payload)
    await updateInvoiceStatus(invoice.id, "PAID")

    const adminSupabase = await createAdminSupabaseClient()
    const { data: sub } = await adminSupabase
      .from("subscriptions")
      .select("id")
      .eq("invoice_id", invoice.id)
      .single()

    if (sub) {
      await activateSubscription(sub.id)
    }
  } else if (isFailure) {
    if (payment) await updatePaymentStatus(payment.id, "FAILED")
    await updateInvoiceStatus(invoice.id, "FAILED")
  }

  return Response.json({
    received: true,
    orderId,
    transactionStatus,
    invoiceStatus: isSuccess ? "PAID" : isFailure ? "FAILED" : invoice.status,
  })
}
