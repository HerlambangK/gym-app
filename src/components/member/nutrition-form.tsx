"use client"

import { useActionState } from "react"
import { saveNutritionEntry, type ActionState } from "@/app/actions/member"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Apple } from "lucide-react"

type NutritionLog = {
  id: string
  log_date: string
  food_name?: string | null
  calories?: number | null
  protein_gram?: number | null
  carbs_gram?: number | null
  fat_gram?: number | null
  water_ml?: number | null
  weight_kg?: number | null
  notes?: string | null
}

type NutritionTarget = {
  target_bmi?: number | null
  target_calories?: number | null
  target_weight_kg?: number | null
  target_protein_gram?: number | null
  notes?: string | null
} | null

const initialState: ActionState = { ok: false, message: "" }

export function NutritionForm({
  today,
  logs,
  target,
}: {
  today: string
  logs: NutritionLog[]
  target: NutritionTarget
}) {
  const [state, action, pending] = useActionState(saveNutritionEntry, initialState)
  const todayLog = logs.find((log) => log.log_date === today)
  const targetCalories = Number(target?.target_calories ?? 2500)
  const calories = Number(todayLog?.calories ?? 0)

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Input Nutrisi Harian</CardTitle>
          <CardDescription>Catat makanan, kalori, target BMI, dan target kalori harian.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="foodName" className="text-sm font-medium">Makanan</label>
                <Input id="foodName" name="foodName" defaultValue={todayLog?.food_name ?? ""} placeholder="Nasi ayam, telur, sayur" required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="logDate" className="text-sm font-medium">Tanggal</label>
                <Input id="logDate" name="logDate" type="date" defaultValue={today} required />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <MetricInput id="calories" label="Kalori" defaultValue={todayLog?.calories} required />
              <MetricInput id="proteinGram" label="Protein (g)" defaultValue={todayLog?.protein_gram} />
              <MetricInput id="carbsGram" label="Karbo (g)" defaultValue={todayLog?.carbs_gram} />
              <MetricInput id="fatGram" label="Lemak (g)" defaultValue={todayLog?.fat_gram} />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <MetricInput id="waterMl" label="Air (ml)" defaultValue={todayLog?.water_ml} />
              <MetricInput id="weightKg" label="Berat (kg)" defaultValue={todayLog?.weight_kg} step="0.1" />
              <MetricInput id="targetBmi" label="Target BMI" defaultValue={target?.target_bmi} step="0.1" />
              <MetricInput id="targetCalories" label="Target kalori" defaultValue={target?.target_calories} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricInput id="targetWeightKg" label="Target berat (kg)" defaultValue={target?.target_weight_kg} step="0.1" />
              <MetricInput id="targetProteinGram" label="Target protein (g)" defaultValue={target?.target_protein_gram} />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Catatan</label>
              <Input id="notes" name="notes" defaultValue={todayLog?.notes ?? target?.notes ?? ""} placeholder="Contoh: kurangi gula, tambah sayur" />
            </div>

            {state.message ? (
              <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}

            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Menyimpan..." : "Simpan Nutrisi"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Hari Ini</CardTitle>
            <CardDescription>{todayLog?.food_name || "Belum ada makanan tercatat hari ini."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>Kalori</span>
                <span className="tabular-nums">{calories} / {targetCalories} kcal</span>
              </div>
              <Progress value={Math.min(100, Math.round((calories / targetCalories) * 100))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Target BMI" value={target?.target_bmi ?? "-"} />
              <MiniStat label="Target Berat" value={target?.target_weight_kg ? `${target.target_weight_kg} kg` : "-"} />
              <MiniStat label="Target Protein" value={target?.target_protein_gram ? `${target.target_protein_gram} g` : "-"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Riwayat Nutrisi</CardTitle>
              <span className="ml-1 text-sm text-muted-foreground">({logs.length})</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Makanan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Kalori</TableHead>
                  <TableHead className="text-right">Protein</TableHead>
                  <TableHead className="text-right">Karbo</TableHead>
                  <TableHead className="text-right">Lemak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Apple className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm">Belum ada log nutrisi</p>
                        <p className="text-xs text-muted-foreground/60">Catat asupan harian untuk mulai melacak pola makan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, i) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{log.food_name || "Makanan"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.log_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{log.calories || 0}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{log.protein_gram || "-"}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{log.carbs_gram || "-"}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{log.fat_gram || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricInput({
  id,
  label,
  defaultValue,
  required,
  step,
}: {
  id: string
  label: string
  defaultValue?: number | null
  required?: boolean
  step?: string
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <Input id={id} name={id} type="number" step={step} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}
