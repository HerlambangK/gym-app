import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getMemberInvoices } from "@/lib/db/invoices"
import { InvoiceTable } from "@/components/dashboard/data-table"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  if (!member) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Complete your registration to view billing.
      </div>
    )
  }

  const invoices = await getMemberInvoices(member.id)
  const mapped = invoices.map((inv: Record<string, unknown>) => ({
    number: inv.invoice_number as string,
    member: user.email || "Unknown",
    plan: (inv as { membership_plans: { name: string } }).membership_plans?.name || "Unknown",
    amount: Number(inv.amount),
    status: inv.status as string,
    method: "Midtrans",
  }))

  return <InvoiceTable invoices={mapped} />
}
