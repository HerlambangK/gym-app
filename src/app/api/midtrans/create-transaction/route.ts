import { z } from "zod"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createCoreCharge } from "@/lib/midtrans"
import { getMemberByUserId } from "@/lib/db/members"
import { getPlanByCode } from "@/lib/db/plans"
import { createInvoice } from "@/lib/db/invoices"
import { createPayment, updatePaymentStatus } from "@/lib/db/payments"
import { createSubscription, getNextSubscriptionPreview } from "@/lib/db/subscriptions"

const schema = z.object({
  planCode: z.string().min(2),
  paymentMethod: z.enum(["bca_va", "bni_va", "bri_va", "permata_va", "qris"]),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const member = await getMemberByUserId(user.id)
  if (!member) return Response.json({ error: "Complete registration first" }, { status: 400 })

  const customerName = parsed.data.customerName || user.user_metadata?.name as string || member.member_code || "Member"

  const plan = await getPlanByCode(parsed.data.planCode)
  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 })

  const invoice = await createInvoice({
    memberId: member.id,
    planId: plan.id,
    amount: Number(plan.price),
  })

  const { startDate, endDate } = await getNextSubscriptionPreview(member.id, Number(plan.duration_days || 1))

  const subscription = await createSubscription({
    memberId: member.id,
    planId: plan.id,
    invoiceId: invoice.id,
    startDate,
    endDate,
  })

  const orderId = invoice.invoice_number

  const payment = await createPayment({
    invoiceId: invoice.id,
    provider: "midtrans",
    providerOrderId: orderId,
    method: parsed.data.paymentMethod,
    amount: Number(plan.price),
  })

  const result = await createCoreCharge({
    orderId,
    grossAmount: Number(plan.price),
    paymentMethod: parsed.data.paymentMethod,
    customer: {
      first_name: customerName,
      email: parsed.data.customerEmail || user.email,
      phone: parsed.data.customerPhone || user.user_metadata?.phone as string,
    },
    items: [{
      id: plan.code,
      name: plan.name,
      price: Number(plan.price),
      quantity: 1,
    }],
  })

  if (result.ok) {
    await updatePaymentStatus(
      payment.id,
      "PENDING",
      typeof result.data.transaction_id === "string" ? result.data.transaction_id : undefined,
      result.data,
    )
  }

  return Response.json({
    invoiceNumber: invoice.invoice_number,
    subscriptionId: subscription.id,
    paymentMethod: parsed.data.paymentMethod,
    charge: result.ok ? result.data : null,
    error: result.ok ? null : result.data,
  }, { status: result.ok ? 200 : 422 })
}
