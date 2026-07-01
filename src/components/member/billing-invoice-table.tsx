"use client"

import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SubscribeButton, type NativePaymentResult } from "@/components/public/subscribe-button"
import { formatDate, rupiah } from "@/lib/format"

type BillingInvoice = {
  number: string
  plan: string
  planCode: string
  amount: number
  status: string
  method: string
  durationDays: number
  createdAt: string
  paymentResult?: NativePaymentResult | null
}

const statusLabel: Record<string, string> = {
  PAID: "Lunas",
  PENDING: "Pending",
  FAILED: "Gagal",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
}

function methodLabel(method: string) {
  const labels: Record<string, string> = {
    bca_va: "BCA VA",
    bni_va: "BNI VA",
    bri_va: "BRI VA",
    permata_va: "Permata VA",
    qris: "QRIS",
  }
  return labels[method] || method || "-"
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "PAID" ? "success" : status === "PENDING" ? "warning" : "muted"
  return <Badge variant={variant}>{statusLabel[status] || status}</Badge>
}

export function BillingInvoiceTable({ invoices }: { invoices: BillingInvoice[] }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Invoice</CardTitle>
        <span className="text-sm text-muted-foreground">({invoices.length})</span>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-44 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Invoice akan muncul setelah Anda memilih paket.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.number}>
                  <TableCell className="max-w-[11rem] truncate font-semibold" title={invoice.number}>
                    {invoice.number}
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate text-muted-foreground" title={invoice.plan}>
                    {invoice.plan}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums font-semibold">
                    {rupiah.format(invoice.amount)}
                  </TableCell>
                  <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{methodLabel(invoice.method)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.status === "PAID" ? `${invoice.durationDays} hari aktif` : "Aktif setelah lunas"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {invoice.status === "PENDING" && invoice.paymentResult ? (
                      <SubscribeButton
                        planCode={invoice.planCode}
                        label="Lanjut Bayar"
                        initialPaymentResult={invoice.paymentResult}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {invoice.status === "PAID" ? "Selesai" : "-"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
