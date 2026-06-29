import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserRole } from "@/lib/db/users"
import { getAllInvoices } from "@/lib/db/invoices"
import { InvoiceTable } from "@/components/dashboard/data-table"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const role = await getUserRole(user.id)
  if (role !== "OWNER" && role !== "SUPER_ADMIN") redirect("/member/dashboard")

  const invoices = await getAllInvoices({ limit: 20 })
  const mapped = invoices.map((inv: Record<string, unknown>) => ({
    number: inv.invoice_number as string,
    member: (inv as { members: { users: { name: string } } }).members?.users?.name || "Unknown",
    plan: (inv as { membership_plans: { name: string } }).membership_plans?.name || "Unknown",
    amount: Number(inv.amount),
    status: inv.status as string,
    method: "Midtrans",
  }))

  return <InvoiceTable invoices={mapped} />
}
