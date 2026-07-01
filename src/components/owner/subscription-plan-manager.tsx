"use client"

import { useActionState, useState } from "react"
import { Archive, Edit3, Plus, RefreshCw } from "lucide-react"
import { archiveSubscriptionPlan, saveSubscriptionPlan, type OwnerActionState } from "@/app/actions/owner-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { rupiah } from "@/lib/format"

type Plan = {
  id: string
  name: string
  code: string
  type: "DAILY" | "MONTHLY" | "TRIAL"
  duration_days: number
  price: number
  description?: string | null
  is_active: boolean
}

const initialState: OwnerActionState = { ok: false, message: "" }

export function SubscriptionPlanManager({ plans }: { plans: Plan[] }) {
  const [editing, setEditing] = useState<Plan | null>(null)
  const [state, action, pending] = useActionState(saveSubscriptionPlan, initialState)

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{editing ? "Edit Paket" : "Paket Baru"}</CardTitle>
              <CardDescription>Atur harga, durasi, dan status paket yang muncul di pricing dan billing member.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="icon-sm" onClick={() => setEditing(null)} aria-label="Paket baru">
              <Plus size={15} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="name" label="Nama paket" defaultValue={editing?.name ?? ""} placeholder="Plus Monthly" />
              <Field name="code" label="Kode" defaultValue={editing?.code ?? ""} placeholder="PLUS_MONTHLY" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tipe</label>
                <select name="type" defaultValue={editing?.type ?? "MONTHLY"} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="DAILY">Daily</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>
              <Field name="durationDays" label="Durasi hari" type="number" defaultValue={String(editing?.duration_days ?? 30)} />
              <Field name="price" label="Harga" type="number" defaultValue={String(editing?.price ?? 0)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea name="description" defaultValue={editing?.description ?? ""} placeholder="Benefit utama paket ini" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={editing?.is_active ?? true} />
              Tampilkan sebagai paket aktif
            </label>
            {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}
            <Button type="submit" disabled={pending} className="gap-2">
              <RefreshCw size={15} /> {pending ? "Menyimpan..." : "Simpan Paket"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.is_active ? "" : "opacity-70"}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <CardDescription>{plan.code}</CardDescription>
                </div>
                <Badge variant={plan.is_active ? "success" : "muted"}>{plan.is_active ? "Aktif" : "Arsip"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Mini label="Harga" value={rupiah.format(Number(plan.price))} />
                <Mini label="Durasi" value={`${plan.duration_days} hari`} />
              </div>
              <p className="min-h-10 text-sm text-muted-foreground">{plan.description || "Belum ada deskripsi."}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setEditing(plan)}>
                  <Edit3 size={14} /> Edit
                </Button>
                {plan.is_active ? (
                  <form action={archiveSubscriptionPlan}>
                    <input type="hidden" name="id" value={plan.id} />
                    <Button type="submit" variant="outline" size="sm" className="gap-2">
                      <Archive size={14} /> Arsip
                    </Button>
                  </form>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Input {...props} required={props.name !== "code"} />
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}
