"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Archive, Edit3, Plus, RefreshCw, RotateCcw, Trash2 } from "lucide-react"
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

type MessageState = {
  ok: boolean
  message: string
}

export function SubscriptionPlanManager({ plans }: { plans: Plan[] }) {
  const router = useRouter()
  const [items, setItems] = useState(plans)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [formVersion, setFormVersion] = useState(0)
  const [pending, setPending] = useState(false)
  const [mutatingId, setMutatingId] = useState<string | null>(null)
  const [state, setState] = useState<MessageState>({ ok: false, message: "" })
  const [mutationState, setMutationState] = useState<MessageState>({ ok: false, message: "" })

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.price) - Number(b.price)),
    [items],
  )

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setState({ ok: false, message: "" })

    const formData = new FormData(event.currentTarget)
    const payload = {
      id: String(formData.get("id") || "") || undefined,
      name: String(formData.get("name") || ""),
      code: String(formData.get("code") || "") || undefined,
      type: String(formData.get("type") || "MONTHLY"),
      durationDays: Number(formData.get("durationDays") || 0),
      price: Number(formData.get("price") || 0),
      description: String(formData.get("description") || "") || undefined,
      isActive: formData.get("isActive") === "on",
    }

    try {
      const res = await fetch("/api/owner/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setState({ ok: false, message: typeof data.error === "string" ? data.error : "Paket belum bisa disimpan." })
        return
      }

      const savedPlan = data.plan as Plan
      setItems((current) => {
        const exists = current.some((plan) => plan.id === savedPlan.id)
        return exists
          ? current.map((plan) => plan.id === savedPlan.id ? savedPlan : plan)
          : [...current, savedPlan]
      })
      setEditing(null)
      setFormVersion((value) => value + 1)
      setState({ ok: true, message: data.message || "Paket subscription berhasil disimpan." })
      router.refresh()
    } catch {
      setState({ ok: false, message: "Gagal menghubungi server. Coba lagi." })
    } finally {
      setPending(false)
    }
  }

  async function mutatePlan(plan: Plan, intent: "archive" | "restore" | "delete") {
    if (intent === "delete" && !window.confirm(`Hapus paket ${plan.name}? Paket yang sudah dipakai transaksi akan ditolak otomatis.`)) {
      return
    }

    setMutatingId(plan.id)
    setMutationState({ ok: false, message: "" })

    try {
      const res = await fetch("/api/owner/subscription-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, intent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMutationState({ ok: false, message: typeof data.error === "string" ? data.error : "Aksi paket gagal." })
        return
      }

      if (intent === "delete") {
        setItems((current) => current.filter((item) => item.id !== plan.id))
        if (editing?.id === plan.id) setEditing(null)
      } else {
        const updatedPlan = data.plan as Plan
        setItems((current) => current.map((item) => item.id === updatedPlan.id ? updatedPlan : item))
        if (editing?.id === updatedPlan.id) setEditing(updatedPlan)
      }
      setMutationState({ ok: true, message: data.message || "Aksi paket berhasil." })
      router.refresh()
    } catch {
      setMutationState({ ok: false, message: "Gagal menghubungi server. Coba lagi." })
    } finally {
      setMutatingId(null)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{editing ? "Edit Paket" : "Paket Baru"}</CardTitle>
              <CardDescription>Atur harga, durasi, dan status paket yang muncul di pricing dan billing member.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => {
                setEditing(null)
                setFormVersion((value) => value + 1)
              }}
              aria-label="Paket baru"
            >
              <Plus size={15} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form key={`${editing?.id ?? "new-plan"}-${formVersion}`} onSubmit={submitPlan} className="space-y-4">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="name" label="Nama paket" defaultValue={editing?.name ?? ""} placeholder="Plus Monthly" />
              <Field name="code" label="Kode" defaultValue={editing?.code ?? ""} placeholder="PLUS_MONTHLY" required={false} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="grid gap-2">
                <label htmlFor="plan-type" className="text-sm font-medium">Tipe</label>
                <select id="plan-type" name="type" defaultValue={editing?.type ?? "MONTHLY"} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="DAILY">Daily</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="TRIAL">Trial</option>
                </select>
              </div>
              <Field name="durationDays" label="Durasi (hari)" type="number" min={0} defaultValue={String(editing?.duration_days ?? 30)} />
              <Field name="price" label="Harga (rupiah)" type="number" min={0} defaultValue={String(editing?.price ?? 0)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="plan-description" className="text-sm font-medium">Deskripsi</label>
              <Textarea id="plan-description" name="description" defaultValue={editing?.description ?? ""} placeholder="Benefit utama paket ini" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={editing?.is_active ?? true} />
              Tampilkan sebagai paket aktif
            </label>
            {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending} className="gap-2">
                <RefreshCw size={15} /> {pending ? "Menyimpan..." : editing ? "Update Paket" : "Simpan Paket"}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    setEditing(null)
                    setFormVersion((value) => value + 1)
                  }}
                >
                  Batal
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {mutationState.message ? (
          <p className={mutationState.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{mutationState.message}</p>
        ) : null}
        {sortedItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">Belum ada paket subscription.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedItems.map((plan) => (
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={mutatingId === plan.id}
                      onClick={() => void mutatePlan(plan, plan.is_active ? "archive" : "restore")}
                    >
                      {plan.is_active ? <Archive size={14} /> : <RotateCcw size={14} />}
                      {plan.is_active ? "Arsip" : "Aktifkan"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      disabled={mutatingId === plan.id}
                      onClick={() => void mutatePlan(plan, "delete")}
                    >
                      <Trash2 size={14} /> Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, required = true, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = props.id || `plan-${props.name}`
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input {...props} id={id} required={required} />
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
