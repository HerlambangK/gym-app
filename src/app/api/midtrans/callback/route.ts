import { applyMidtransPaymentLifecycle } from "@/lib/db/payment-lifecycle"
import { verifyMidtransSignature } from "@/lib/midtrans"

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

  if (!orderId || typeof orderId !== "string" || orderId.trim().length === 0) {
    return Response.json({ received: false, error: "Invalid or missing order_id" }, { status: 400 })
  }

  const result = await applyMidtransPaymentLifecycle(payload)
  if (!result.ok) {
    return Response.json({ received: false, error: result.error }, { status: 404 })
  }

  return Response.json({
    received: true,
    orderId,
    transactionStatus,
    paymentStatus: result.paymentStatus,
    invoiceStatus: result.invoiceStatus,
    subscriptionStatus: result.subscriptionStatus,
  })
}
