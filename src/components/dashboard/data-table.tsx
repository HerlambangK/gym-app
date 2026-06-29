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
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.plan}</TableCell>
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
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.member}</TableCell>
                  <TableCell>{invoice.plan}</TableCell>
                  <TableCell>{rupiah.format(invoice.amount)}</TableCell>
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
