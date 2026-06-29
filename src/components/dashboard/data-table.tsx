import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, rupiah } from "@/lib/format"

type MemberRow = {
  name: string
  plan: string
  status: string
  endDate: string
}

type InvoiceRow = {
  number: string
  member: string
  plan: string
  amount: number
  status: string
  method: string
}

export function MemberTable({ members = [] }: { members?: MemberRow[] }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Member</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[42rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-card">Nama</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Berakhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Belum ada member
                </TableCell>
              </TableRow>
            ) : (
              members.map((member, i) => (
                <TableRow key={i}>
                  <TableCell className="sticky left-0 z-10 max-w-[12rem] truncate bg-card font-medium" title={member.name}>{member.name}</TableCell>
                  <TableCell className="max-w-[12rem] truncate" title={member.plan}>{member.plan}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "ACTIVE" ? "success" : member.status === "EXPIRING" ? "warning" : "muted"}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(member.endDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function InvoiceTable({ invoices = [] }: { invoices?: InvoiceRow[] }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Invoice</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-card">Invoice</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Belum ada invoice
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice, i) => (
                <TableRow key={i}>
                  <TableCell className="sticky left-0 z-10 max-w-[10rem] truncate bg-card font-medium" title={invoice.number}>{invoice.number}</TableCell>
                  <TableCell className="max-w-[12rem] truncate" title={invoice.member}>{invoice.member}</TableCell>
                  <TableCell className="max-w-[12rem] truncate" title={invoice.plan}>{invoice.plan}</TableCell>
                  <TableCell className="text-right tabular-nums">{rupiah.format(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "PAID" ? "success" : invoice.status === "PENDING" ? "warning" : "muted"}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.method}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
