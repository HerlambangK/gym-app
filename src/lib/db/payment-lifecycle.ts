import { getPaymentLifecycle } from "@/lib/midtrans"
import { getInvoiceByNumber, updateInvoiceStatus } from "@/lib/db/invoices"
import { getPaymentByOrderId, updatePaymentStatus } from "@/lib/db/payments"
import {
  activateSubscriptionForInvoice,
  updateSubscriptionStatusForInvoice,
} from "@/lib/db/subscriptions"

type MidtransStatusPayload = Record<string, unknown>

function getString(payload: MidtransStatusPayload, key: string) {
  const value = payload[key]
  return typeof value === "string" ? value : undefined
}

export async function applyMidtransPaymentLifecycle(payload: MidtransStatusPayload) {
  const orderId = getString(payload, "order_id")
  if (!orderId) {
    return { ok: false as const, error: "Invalid or missing order_id" }
  }

  const invoice = await getInvoiceByNumber(orderId)
  if (!invoice) {
    return { ok: false as const, error: "Invoice not found" }
  }

  const lifecycle = getPaymentLifecycle(payload)
  const payment = await getPaymentByOrderId(orderId)
  const transactionId = getString(payload, "transaction_id")
  const alreadyPaid = invoice.status === "PAID"

  if (payment && (lifecycle.isSuccess || lifecycle.isFailure || !alreadyPaid)) {
    await updatePaymentStatus(payment.id, lifecycle.paymentStatus, transactionId, payload)
  }

  let subscriptionStatus = "PENDING_PAYMENT"

  if (lifecycle.isSuccess) {
    await updateInvoiceStatus(invoice.id, "PAID")
    const subscription = await activateSubscriptionForInvoice(invoice.id)
    subscriptionStatus = subscription ? "ACTIVE" : "PENDING_PAYMENT"
  } else if (lifecycle.isFailure) {
    await updateInvoiceStatus(invoice.id, lifecycle.invoiceStatus)
    const failedSubscriptionStatus = lifecycle.invoiceStatus === "EXPIRED" ? "EXPIRED" : "CANCELLED"
    await updateSubscriptionStatusForInvoice(invoice.id, failedSubscriptionStatus)
    subscriptionStatus = failedSubscriptionStatus
  } else if (!alreadyPaid) {
    await updateInvoiceStatus(invoice.id, lifecycle.invoiceStatus)
  } else {
    const subscription = await activateSubscriptionForInvoice(invoice.id)
    subscriptionStatus = subscription ? "ACTIVE" : "PENDING_PAYMENT"
  }

  return {
    ok: true as const,
    orderId,
    invoice,
    transactionStatus: getString(payload, "transaction_status"),
    paymentStatus: lifecycle.isSuccess || alreadyPaid ? "PAID" : lifecycle.paymentStatus,
    invoiceStatus: lifecycle.isSuccess || alreadyPaid ? "PAID" : lifecycle.isFailure ? lifecycle.invoiceStatus : lifecycle.invoiceStatus,
    subscriptionStatus,
  }
}
