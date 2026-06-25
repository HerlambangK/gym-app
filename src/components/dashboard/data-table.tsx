import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, rupiah } from "@/lib/format";
import { invoices, members } from "@/data/gym";

export function MemberTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Table</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expired</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.name}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.plan}</TableCell>
                <TableCell>
                  <Badge variant={member.status === "ACTIVE" ? "success" : member.status === "EXPIRING" ? "warning" : "muted"}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(member.endDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function InvoiceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice & Payment</CardTitle>
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
            {invoices.map((invoice) => (
              <TableRow key={invoice.number}>
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

