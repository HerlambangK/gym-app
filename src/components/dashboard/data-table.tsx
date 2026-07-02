"use client"

import { useState, useMemo } from "react"
import { Search, Users, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, rupiah } from "@/lib/format"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

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

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "muted" | "default"; dot: string }> = {
  ACTIVE: { label: "Aktif", variant: "success", dot: "bg-emerald-500" },
  EXPIRING: { label: "Segera Habis", variant: "warning", dot: "bg-amber-500" },
  EXPIRED: { label: "Kadaluarsa", variant: "muted", dot: "bg-muted-foreground" },
  PAID: { label: "Lunas", variant: "success", dot: "bg-emerald-500" },
  PENDING: { label: "Pending", variant: "warning", dot: "bg-amber-500" },
  FAILED: { label: "Gagal", variant: "muted", dot: "bg-destructive" },
  CANCELLED: { label: "Dibatalkan", variant: "muted", dot: "bg-muted-foreground" },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, variant: "muted" as const, dot: "bg-muted-foreground" }
  return (
    <Badge variant={cfg.variant} className="gap-1.5 px-2.5 py-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </Badge>
  )
}

function EmptyState({ icon: Icon, message, action }: { icon: React.ElementType; message: string; action?: string }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
          {action && <p className="text-xs text-muted-foreground/60">{action}</p>}
        </div>
      </td>
    </tr>
  )
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-9"
      />
    </div>
  )
}

export function MemberTable({ members = [] }: { members?: MemberRow[] }) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 200)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return members
    const q = debouncedSearch.toLowerCase()
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.plan.toLowerCase().includes(q) || m.status.toLowerCase().includes(q))
  }, [members, debouncedSearch])

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Member</CardTitle>
          <span className="ml-1 text-sm text-muted-foreground">({filtered.length})</span>
        </div>
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari member..." />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Berakhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <EmptyState icon={Users} message="Belum ada member" action={search ? "Coba kata kunci lain" : "Tunggu registrasi member baru"} />
            ) : (
              filtered.map((member, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="max-w-[14rem] truncate font-semibold" title={member.name}>{member.name}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-muted-foreground" title={member.plan}>{member.plan}</TableCell>
                  <TableCell><StatusBadge status={member.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums text-muted-foreground">{formatDate(member.endDate)}</TableCell>
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
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 200)

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return invoices
    const q = debouncedSearch.toLowerCase()
    return invoices.filter(
      (inv) =>
        inv.number.toLowerCase().includes(q) ||
        inv.member.toLowerCase().includes(q) ||
        inv.plan.toLowerCase().includes(q) ||
        inv.status.toLowerCase().includes(q),
    )
  }, [invoices, debouncedSearch])

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Invoice</CardTitle>
          <span className="ml-1 text-sm text-muted-foreground">({filtered.length})</span>
        </div>
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari invoice..." />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Metode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <EmptyState icon={FileText} message="Belum ada invoice" action={search ? "Coba kata kunci lain" : "Invoice akan muncul setelah pembelian paket"} />
            ) : (
              filtered.map((invoice, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="max-w-[10rem] truncate font-semibold" title={invoice.number}>{invoice.number}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-muted-foreground" title={invoice.member}>{invoice.member}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-muted-foreground" title={invoice.plan}>{invoice.plan}</TableCell>
                  <TableCell className="whitespace-nowrap text-right tabular-nums font-semibold">{rupiah.format(invoice.amount)}</TableCell>
                  <TableCell><StatusBadge status={invoice.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{invoice.method}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
