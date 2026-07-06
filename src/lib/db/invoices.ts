import { eq, and, desc, inArray, gte, isNotNull } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { invoices, members, users, membership_plans, payments, subscriptions } from "@/db/schema"

type InvoiceInsert = typeof invoices.$inferInsert
type InvoiceStatus = NonNullable<InvoiceInsert["status"]>

export async function createInvoice(input: {
  memberId: string
  planId: string
  amount: number
}) {
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`
  const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const [data] = await db
    .insert(invoices)
    .values({
      invoice_number: invoiceNumber,
      member_id: input.memberId,
      plan_id: input.planId,
      amount: input.amount,
      status: "PENDING",
      expired_at: paymentDeadline,
    })
    .returning()
  return data
}

export async function getInvoiceByNumber(number: string) {
  const rows = await db
    .select()
    .from(invoices)
    .innerJoin(members, eq(invoices.member_id, members.id))
    .innerJoin(membership_plans, eq(invoices.plan_id, membership_plans.id))
    .where(eq(invoices.invoice_number, number))
    .limit(1)

  if (rows.length === 0) return null
  const row = rows[0]
  return { ...row.invoices, members: row.members, membership_plans: row.membership_plans }
}

export async function getMemberInvoices(memberId: string, activeOnly = false) {
  const conditions = [eq(invoices.member_id, memberId)]
  if (activeOnly) {
    conditions.push(inArray(invoices.status, ["PAID", "PENDING"]))
  }

  const rows = await db
    .select()
    .from(invoices)
    .innerJoin(membership_plans, eq(invoices.plan_id, membership_plans.id))
    .leftJoin(payments, eq(invoices.id, payments.invoice_id))
    .leftJoin(subscriptions, eq(invoices.id, subscriptions.invoice_id))
    .where(and(...conditions))
    .orderBy(desc(invoices.created_at))

  return rows.map((row) => ({
    ...row.invoices,
    membership_plans: {
      name: row.membership_plans.name,
      code: row.membership_plans.code,
      duration_days: row.membership_plans.duration_days,
    },
    payments: row.payments
      ? { status: row.payments.status, method: row.payments.method, raw_callback: row.payments.raw_callback }
      : null,
    subscriptions: row.subscriptions
      ? { status: row.subscriptions.status, start_date: row.subscriptions.start_date, end_date: row.subscriptions.end_date }
      : null,
  }))
}

export async function getAllInvoices(options?: { limit?: number; offset?: number; status?: InvoiceStatus }) {
  const conditions = [isNotNull(invoices.id)]
  if (options?.status) conditions.push(eq(invoices.status, options.status))

  const query = db
    .select()
    .from(invoices)
    .innerJoin(members, eq(invoices.member_id, members.id))
    .innerJoin(users, eq(members.user_id, users.id))
    .innerJoin(membership_plans, eq(invoices.plan_id, membership_plans.id))
    .where(and(...conditions))
    .orderBy(desc(invoices.created_at))

  const rows = options?.limit
    ? await query.limit(options.limit).offset(options?.offset ?? 0)
    : await query

  return rows.map((row) => ({
    id: row.invoices.id,
    invoice_number: row.invoices.invoice_number,
    amount: row.invoices.amount,
    status: row.invoices.status,
    created_at: row.invoices.created_at,
    members: { users: { name: row.users.name } },
    membership_plans: { name: row.membership_plans.name },
  }))
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  await db
    .update(invoices)
    .set({ status, updated_at: new Date().toISOString() })
    .where(eq(invoices.id, id))
}

export async function getInvoiceStats() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const data = await db
    .select({ amount: invoices.amount, status: invoices.status })
    .from(invoices)
    .where(
      and(
        inArray(invoices.status, ["PAID", "PENDING"]),
        gte(invoices.created_at, startOfMonth.toISOString()),
      ),
    )

  const paidInvoices = data.filter((inv) => inv.status === "PAID")
  const pendingInvoices = data.filter((inv) => inv.status === "PENDING")

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
  return {
    totalRevenue,
    paidCount: paidInvoices.length,
    pendingCount: pendingInvoices.length,
  }
}
