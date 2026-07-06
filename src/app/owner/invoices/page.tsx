import { getCurrentUserId, getCurrentUserRole } from "@/lib/current-user"
import { getAllInvoices } from "@/lib/db/invoices"
import { InvoiceTable } from "@/components/dashboard/data-table"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const role = await getCurrentUserRole()
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

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Owner"
        status={`${mapped.length} invoice terbaru`}
        title="Invoice dan Revenue"
        description="Pantau invoice yang sudah dibayar, masih pending, atau perlu tindak lanjut operasional."
      />
      <InvoiceTable invoices={mapped} />
    </div>
  )
}
