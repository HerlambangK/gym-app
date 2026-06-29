import { z } from "zod"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { createSnapTransaction } from "@/lib/midtrans"
import { getMemberByUserId } from "@/lib/db/members"
import { getPlanByCode } from "@/lib/db/plans"
import { createInvoice } from "@/lib/db/invoices"
import { createPayment } from "@/lib/db/payments"
import { createSubscription } from "@/lib/db/subscriptions"

const schema = z.object({
  planCode: z.string().min(2),
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

  const startDate = new Date().toISOString().split("T")[0]
  const endDate = new Date(Date.now() + plan.duration_days * 86400000).toISOString().split("T")[0]

  const subscription = await createSubscription({
    memberId: member.id,
    planId: plan.id,
    invoiceId: invoice.id,
    startDate,
    endDate,
  })

  const orderId = invoice.invoice_number

  await createPayment({
    invoiceId: invoice.id,
    provider: "midtrans",
    providerOrderId: orderId,
    amount: Number(plan.price),
  })

  const result = await createSnapTransaction({
    orderId,
    grossAmount: Number(plan.price),
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

  return Response.json({
    invoiceNumber: invoice.invoice_number,
    subscriptionId: subscription.id,
    midtrans: result.ok ? result.data : null,
    error: result.ok ? null : result.data,
  }, { status: result.ok ? 200 : 422 })
}
