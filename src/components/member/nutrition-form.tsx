"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import { Apple, ArrowRight, Flame, Pencil, Plus, Settings2, Trash2, Utensils, X } from "lucide-react"
import { toast } from "sonner"
import { deleteNutritionEntry, saveNutritionEntry, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getNutritionDefaults } from "@/lib/member-fitness-profile"

type NutritionLog = {
  id: string
  log_date: string
  meal_type?: string | null
  food_name?: string | null
  portion?: string | null
  calories?: number | null
  protein_gram?: number | null
  carbs_gram?: number | null
  fat_gram?: number | null
  water_ml?: number | null
}

type NutritionTarget = {
  height_cm?: number | null
  age?: number | null
  goal?: string | null
  target_calories?: number | null
  target_protein_gram?: number | null
  target_carbs_gram?: number | null
  target_fat_gram?: number | null
  target_water_ml?: number | null
  meals_per_day?: number | null
} | null

const initialState: ActionState = { ok: false, message: "" }

const templates = [
  { name: "Nasi + ayam bakar", portion: "1 porsi", calories: 560, protein: 38, carbs: 62, fat: 16 },
  { name: "Telur + tempe + nasi", portion: "1 piring", calories: 520, protein: 28, carbs: 58, fat: 18 },
  { name: "Soto ayam", portion: "1 mangkuk", calories: 420, protein: 28, carbs: 42, fat: 13 },
  { name: "Ikan + sayur + nasi", portion: "1 piring", calories: 500, protein: 34, carbs: 54, fat: 14 },
]

export function NutritionForm({
  today,
  logs,
  target,
  profileIncomplete,
}: {
  today: string
  logs: NutritionLog[]
  target: NutritionTarget
  profileIncomplete: boolean
}) {
  const [state, action, pending] = useActionState(saveNutritionEntry, initialState)
  const [meal, setMeal] = useState("LUNCH")
  const [foodName, setFoodName] = useState("")
  const [portion, setPortion] = useState("")
  const [calories, setCalories] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [showTarget, setShowTarget] = useState(false)
  const [editingLogId, setEditingLogId] = useState<string | null>(null)

  const todayLogs = useMemo(() => logs.filter((log) => log.log_date === today), [logs, today])
  const totals = useMemo(() => summarize(todayLogs), [todayLogs])
  const defaults = getNutritionDefaults(target)
  const targetCalories = defaults.calories
  const targetProtein = defaults.proteinGram
  const targetCarbs = defaults.carbsGram
  const targetFat = defaults.fatGram
  const targetWater = defaults.waterMl
  const suggestion = getSuggestion(totals, targetCalories, targetProtein, targetFat)

  useEffect(() => {
    if (!state.message) return
    if (state.ok) {
      toast.success(state.message)
      clearForm()
    } else {
      toast.error(state.message)
    }
  }, [state])

  function applyTemplate(item: typeof templates[number]) {
    setEditingLogId(null)
    setFoodName(item.name)
    setPortion(item.portion)
    setCalories(String(item.calories))
    setProtein(String(item.protein))
    setCarbs(String(item.carbs))
    setFat(String(item.fat))
  }

  function editLog(log: NutritionLog) {
    setEditingLogId(log.id)
    setMeal(log.meal_type || "LUNCH")
    setFoodName(log.food_name || "")
    setPortion(log.portion || "")
    setCalories(log.calories ? String(log.calories) : "")
    setProtein(log.protein_gram ? String(log.protein_gram) : "")
    setCarbs(log.carbs_gram ? String(log.carbs_gram) : "")
    setFat(log.fat_gram ? String(log.fat_gram) : "")
  }

  function clearForm() {
    setEditingLogId(null)
    setMeal("LUNCH")
    setFoodName("")
    setPortion("")
    setCalories("")
    setProtein("")
    setCarbs("")
    setFat("")
  }

  return (
    <div className="space-y-6">
      {profileIncomplete ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Target memakai default sementara</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Lengkapi berat, tinggi, umur, dan target di Profile supaya rekomendasi lebih akurat. Kamu tetap bisa catat makanan di sini.
              </p>
            </div>
            <Link href="/member/profile">
              <Button variant="outline" className="gap-2">
                Lengkapi Profile
                <ArrowRight size={15} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard label="Kalori" value={`${totals.calories}/${targetCalories}`} helper={`Sisa ${Math.max(0, targetCalories - totals.calories)} kcal`} />
        <MetricCard label="Protein" value={`${totals.protein}/${targetProtein}g`} helper={gap(totals.protein, targetProtein, "g")} />
        <MetricCard label="Karbo" value={`${totals.carbs}/${targetCarbs}g`} helper={gap(totals.carbs, targetCarbs, "g")} />
        <MetricCard label="Lemak" value={`${totals.fat}/${targetFat}g`} helper={totals.fat > targetFat ? "Berlebih" : "Aman"} />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Smart suggestion</p>
            <p className="mt-1 text-sm text-muted-foreground">{suggestion}</p>
          </div>
          <Badge variant="secondary">{todayLogs.length}/{target?.meals_per_day || 3} makan</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Input Makanan</CardTitle>
                <CardDescription>Cukup catat makanan utama. Target detail tetap di Profile.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setShowTarget((value) => !value)}>
                <Settings2 size={15} />
                Target
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <input type="hidden" name="logDate" value={today} />
              <input type="hidden" name="logId" value={editingLogId || ""} />
              <input type="hidden" name="mealType" value={meal} />
              <input type="hidden" name="targetCalories" value={targetCalories} />
              <input type="hidden" name="targetProteinGram" value={targetProtein} />
              <input type="hidden" name="targetCarbsGram" value={targetCarbs} />
              <input type="hidden" name="targetFatGram" value={targetFat} />
              <input type="hidden" name="targetWaterMl" value={targetWater} />
              <input type="hidden" name="nutritionGoal" value={target?.goal || "maintenance"} />
              <input type="hidden" name="mealsPerDay" value={target?.meals_per_day || 3} />

              {showTarget ? (
                <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-5">
                  <MiniInput name="targetCalories" label="Kalori" defaultValue={targetCalories} />
                  <MiniInput name="targetProteinGram" label="Protein" defaultValue={targetProtein} />
                  <MiniInput name="targetCarbsGram" label="Karbo" defaultValue={targetCarbs} />
                  <MiniInput name="targetFatGram" label="Lemak" defaultValue={targetFat} />
                  <MiniInput name="targetWaterMl" label="Air" defaultValue={targetWater} />
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-[0.7fr_1.4fr_0.8fr]">
                <select value={meal} onChange={(event) => setMeal(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="BREAKFAST">Sarapan</option>
                  <option value="LUNCH">Siang</option>
                  <option value="DINNER">Malam</option>
                  <option value="SNACK">Snack</option>
                  <option value="DRINK">Minuman</option>
                </select>
                <Input name="foodName" value={foodName} onChange={(event) => setFoodName(event.target.value)} placeholder="Nasi ayam, telur, tempe" required />
                <Input name="portion" value={portion} onChange={(event) => setPortion(event.target.value)} placeholder="1 porsi" />
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                <Input name="calories" type="number" value={calories} onChange={(event) => setCalories(event.target.value)} placeholder="Kalori" required />
                <Input name="proteinGram" type="number" value={protein} onChange={(event) => setProtein(event.target.value)} placeholder="Protein" />
                <Input name="carbsGram" type="number" value={carbs} onChange={(event) => setCarbs(event.target.value)} placeholder="Karbo" />
                <Input name="fatGram" type="number" value={fat} onChange={(event) => setFat(event.target.value)} placeholder="Lemak" />
                <Input name="waterMl" type="number" placeholder="Air ml" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {templates.map((item) => (
                  <button key={item.name} type="button" onClick={() => applyTemplate(item)} className="rounded-lg border border-border px-3 py-2 text-left text-sm transition hover:border-primary/50 hover:bg-muted/50">
                    <span className="font-medium">{item.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{item.calories} kcal · P {item.protein}g</span>
                  </button>
                ))}
              </div>

              {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending} className="gap-2">
                  {editingLogId ? <Pencil size={16} /> : <Plus size={16} />}
                  {pending ? "Menyimpan..." : editingLogId ? "Simpan Perubahan" : "Tambah"}
                </Button>
                {editingLogId ? (
                  <Button type="button" variant="outline" className="gap-2" onClick={clearForm}>
                    <X size={16} />
                    Batal Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils size={18} />
              Diary Hari Ini
            </CardTitle>
            <CardDescription>{formatDate(today)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressLine icon={Flame} label="Kalori" value={totals.calories} target={targetCalories} />
            <ProgressLine icon={Apple} label="Protein" value={totals.protein} target={targetProtein} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Makanan</TableHead>
                  <TableHead className="text-right">Kcal</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Belum ada makanan hari ini.</TableCell>
                  </TableRow>
                ) : todayLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant="outline">{mealLabel(log.meal_type)}</Badge></TableCell>
                    <TableCell>
                      <p className="font-medium">{log.food_name}</p>
                      <p className="text-xs text-muted-foreground">{log.portion || "-"}</p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{log.calories || 0}</TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="icon" aria-label="Edit diary" onClick={() => editLog(log)}>
                        <Pencil size={15} />
                      </Button>
                      <DeleteNutritionButton logId={log.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function summarize(logs: NutritionLog[]) {
  return logs.reduce((sum, log) => ({
    calories: sum.calories + Number(log.calories || 0),
    protein: sum.protein + Number(log.protein_gram || 0),
    carbs: sum.carbs + Number(log.carbs_gram || 0),
    fat: sum.fat + Number(log.fat_gram || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
}

function getSuggestion(totals: ReturnType<typeof summarize>, targetCalories: number, targetProtein: number, targetFat: number) {
  if (totals.calories > targetCalories) return "Kalori sudah lewat target. Pilih makan malam ringan: sayur, sup, telur rebus, atau ayam tanpa kulit."
  if (targetProtein - totals.protein > 25) return `Protein kurang ${targetProtein - totals.protein}g. Tambahkan ayam, telur, ikan, tempe, atau tahu.`
  if (totals.fat > targetFat) return "Lemak sudah tinggi. Hindari gorengan dan santan untuk sisa hari ini."
  return "Pola hari ini aman. Jaga air minum dan penuhi protein sampai target."
}

function gap(value: number, target: number, suffix: string) {
  if (value >= target) return "Tercapai"
  return `Kurang ${target - value}${suffix}`
}

function mealLabel(value?: string | null) {
  return {
    BREAKFAST: "Sarapan",
    LUNCH: "Siang",
    DINNER: "Malam",
    SNACK: "Snack",
    DRINK: "Minum",
  }[value || ""] || "Meal"
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date))
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}

function ProgressLine({ icon: Icon, label, value, target }: { icon: typeof Flame; label: string; value: number; target: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2"><Icon size={15} /> {label}</span>
        <span className="tabular-nums text-muted-foreground">{value}/{target}</span>
      </div>
      <Progress value={Math.min(100, Math.round((value / target) * 100))} />
    </div>
  )
}

function MiniInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: number }) {
  return (
    <div className="grid gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input name={name} type="number" defaultValue={defaultValue} />
    </div>
  )
}

function DeleteNutritionButton({ logId }: { logId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Hapus diary"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            const formData = new FormData()
            formData.set("logId", logId)
            await deleteNutritionEntry(formData)
            toast.success("Log nutrisi berhasil dihapus.")
          } catch {
            toast.error("Gagal menghapus log nutrisi.")
          }
        })
      }}
    >
      <Trash2 size={15} />
    </Button>
  )
}
