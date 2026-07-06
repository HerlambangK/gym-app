import { applyMidtransPaymentLifecycle } from "@/lib/db/payment-lifecycle"
import { verifyMidtransSignature } from "@/lib/midtrans"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const signatureValid = verifyMidtransSignature(payload)

    if (!signatureValid) {
      console.warn("[midtrans/notification] Invalid signature")
      return new Response("OK", { status: 200 })
    }

    const orderId = payload.order_id

    if (!orderId || typeof orderId !== "string" || orderId.trim().length === 0) {
      console.warn("[midtrans/notification] Missing order_id")
      return new Response("OK", { status: 200 })
    }

    const result = await applyMidtransPaymentLifecycle(payload)
    if (!result.ok) {
      console.error("[midtrans/notification] Lifecycle error:", result.error)
      return new Response("OK", { status: 200 })
    }

    console.log("[midtrans/notification] Processed", orderId, "->", result.paymentStatus)
    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("[midtrans/notification] Internal error:", err)
    return new Response("OK", { status: 200 })
  }
}
