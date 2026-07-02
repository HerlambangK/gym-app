"use client"

import { useActionState, useEffect, useMemo, useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, Apple, Dumbbell, Pencil, UserRound } from "lucide-react"
import { toast } from "sonner"
import { saveMemberProfile, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { parseWorkoutNotes } from "@/lib/member-fitness-profile"

const initialState: ActionState = { ok: false, message: "" }

type NutritionTarget = {
  height_cm?: number | null
  age?: number | null
  gender?: string | null
  goal?: string | null
  activity_level?: string | null
  meals_per_day?: number | null
  target_weight_kg?: number | null
  target_calories?: number | null
  target_protein_gram?: number | null
  target_carbs_gram?: number | null
  target_fat_gram?: number | null
  target_water_ml?: number | null
  notes?: string | null
} | null

type ProfileDraft = {
  name: string
  phone: string
  weightKg: string
  heightCm: string
  age: string
  gender: string
  nutritionGoal: string
  activityLevel: string
  mealsPerDay: string
  targetCalories: string
  targetProteinGram: string
  targetCarbsGram: string
  targetFatGram: string
  targetWaterMl: string
  workoutGoal: string
  workoutLevel: string
  workoutDays: string
  workoutDuration: string
  workoutEquipment: string
  workoutLimitations: string
}

type DraftAction =
  | { type: "set"; field: keyof ProfileDraft; value: string }
  | { type: "reset"; value: ProfileDraft }

export function ProfileForm({
  profile,
  member,
  target,
  email,
  verified,
}: {
  profile: { name?: string | null; phone?: string | null } | null
  member: { member_code?: string | null; status?: string | null; member_type?: string | null } | null
  target: NutritionTarget
  email: string
  verified: boolean
}) {
  const [state, action, pending] = useActionState(saveMemberProfile, initialState)
  const router = useRouter()
  const isPremium = member?.member_type === "PREMIUM"
  const workout = useMemo(() => parseWorkoutNotes(target?.notes), [target?.notes])
  const initialDraft = useMemo(() => createDraft(profile, target, workout), [profile, target, workout])
  const [draft, dispatch] = useReducer(profileReducer, initialDraft)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    dispatch({ type: "reset", value: initialDraft })
  }, [initialDraft])

  useEffect(() => {
    if (!state.message) return
    if (state.ok) {
      toast.success(state.message)
      const timeout = window.setTimeout(() => {
        setEditOpen(false)
        router.refresh()
      }, 0)
      return () => window.clearTimeout(timeout)
    }
    toast.error(state.message)
  }, [state, router])

  const completion = getProfileCompletion(draft)

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] xl:gap-6">
      <div className="space-y-4 xl:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Ringkasan Akun</CardTitle>
                <CardDescription>Status akun, member code, dan tipe membership.</CardDescription>
              </div>
              {isPremium ? <Badge className="premium-gold-badge w-fit">MEMBER PREMIUM</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
            <ProfileRow label="Nama" value={draft.name || "Belum diisi"} />
            <ProfileRow label="Email" value={email} />
            <ProfileRow label="Member Code" value={member?.member_code || "-"} />
            <ProfileRow label="Tipe" value={isPremium ? "Member Premium" : member?.member_type || "MEMBER"} />
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex flex-wrap gap-2">
                {isPremium ? <Badge className="premium-gold-badge">GOLD ACTIVE</Badge> : null}
                <Badge variant={member?.status === "ACTIVE" ? "success" : "muted"}>{member?.status || "ACTIVE"}</Badge>
                <Badge variant={verified ? "success" : "warning"}>{verified ? "VERIFIED" : "UNVERIFIED"}</Badge>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={() => setEditOpen(true)}>
              <Pencil size={16} />
              Edit Profile & Target
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              Kesiapan Data
            </CardTitle>
            <CardDescription>Profile, nutrition, dan workout memakai data ini sebagai pusat pengaturan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Kelengkapan profile</span>
                <span className="font-medium">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniStat label="Target kalori" value={draft.targetCalories ? `${draft.targetCalories} kcal` : "Belum diisi"} />
              <MiniStat label="Workout goal" value={draft.workoutGoal || "Belum diisi"} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:gap-6">
        <SummaryCard icon={UserRound} title="Body Profile" items={[
          ["Berat", draft.weightKg ? `${draft.weightKg} kg` : "-"],
          ["Tinggi", draft.heightCm ? `${draft.heightCm} cm` : "-"],
          ["Umur", draft.age ? `${draft.age} tahun` : "-"],
          ["Gender", draft.gender || "-"],
        ]} />
        <SummaryCard icon={Apple} title="Target Nutrisi" items={[
          ["Goal", goalLabel(draft.nutritionGoal)],
          ["Kalori", `${draft.targetCalories || 0} kcal`],
          ["Protein", `${draft.targetProteinGram || 0} gram`],
          ["Air", `${draft.targetWaterMl || 0} ml`],
        ]} />
        <SummaryCard icon={Dumbbell} title="Workout" items={[
          ["Goal", draft.workoutGoal || "-"],
          ["Level", draft.workoutLevel || "-"],
          ["Jadwal", `${draft.workoutDays || 0} hari/minggu`],
          ["Durasi", `${draft.workoutDuration || 0} menit/sesi`],
        ]} />
        <SummaryCard icon={Activity} title="Preferensi" items={[
          ["Aktivitas", draft.activityLevel || "-"],
          ["Makan", `${draft.mealsPerDay || 0} kali/hari`],
          ["Alat", draft.workoutEquipment || "-"],
          ["Batasan", draft.workoutLimitations || "-"],
        ]} />
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Profile & Target</DialogTitle>
            <DialogDescription>Satu modal untuk data akun, target nutrisi, dan preferensi workout.</DialogDescription>
          </DialogHeader>

          <form action={action} className="space-y-5">
            <section className="space-y-3">
              <SectionTitle icon={UserRound} title="Identitas & Body" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field name="name" label="Nama lengkap" value={draft.name} onChange={(value) => dispatch({ type: "set", field: "name", value })} required />
                <Field name="phone" label="Nomor telepon" value={draft.phone} onChange={(value) => dispatch({ type: "set", field: "phone", value })} placeholder="08xxxxxxxxxx" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field name="weightKg" label="Berat sekarang (kg)" type="number" step="0.1" value={draft.weightKg} onChange={(value) => dispatch({ type: "set", field: "weightKg", value })} />
                <Field name="heightCm" label="Tinggi badan (cm)" type="number" step="0.1" value={draft.heightCm} onChange={(value) => dispatch({ type: "set", field: "heightCm", value })} />
                <Field name="age" label="Umur" type="number" value={draft.age} onChange={(value) => dispatch({ type: "set", field: "age", value })} />
                <SelectField name="gender" label="Gender" value={draft.gender} onChange={(value) => dispatch({ type: "set", field: "gender", value })} options={[["", "Pilih"], ["male", "Laki-laki"], ["female", "Perempuan"]]} />
              </div>
            </section>

            <section className="space-y-3">
              <SectionTitle icon={Apple} title="Target Nutrisi" />
              <div className="grid gap-3 sm:grid-cols-3">
                <SelectField name="nutritionGoal" label="Tujuan" value={draft.nutritionGoal} onChange={(value) => dispatch({ type: "set", field: "nutritionGoal", value })} options={[["fat_loss", "Turun berat"], ["muscle_gain", "Naik otot"], ["maintenance", "Jaga badan"]]} />
                <SelectField name="activityLevel" label="Aktivitas" value={draft.activityLevel} onChange={(value) => dispatch({ type: "set", field: "activityLevel", value })} options={[["low", "Rendah"], ["moderate", "Sedang"], ["high", "Tinggi"]]} />
                <Field name="mealsPerDay" label="Makan/hari" type="number" value={draft.mealsPerDay} onChange={(value) => dispatch({ type: "set", field: "mealsPerDay", value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Field name="targetCalories" label="Kalori (kcal)" type="number" value={draft.targetCalories} onChange={(value) => dispatch({ type: "set", field: "targetCalories", value })} />
                <Field name="targetProteinGram" label="Protein (gram)" type="number" value={draft.targetProteinGram} onChange={(value) => dispatch({ type: "set", field: "targetProteinGram", value })} />
                <Field name="targetCarbsGram" label="Karbo (gram)" type="number" value={draft.targetCarbsGram} onChange={(value) => dispatch({ type: "set", field: "targetCarbsGram", value })} />
                <Field name="targetFatGram" label="Lemak (gram)" type="number" value={draft.targetFatGram} onChange={(value) => dispatch({ type: "set", field: "targetFatGram", value })} />
                <Field name="targetWaterMl" label="Air (mililiter)" type="number" value={draft.targetWaterMl} onChange={(value) => dispatch({ type: "set", field: "targetWaterMl", value })} />
              </div>
            </section>

            <section className="space-y-3">
              <SectionTitle icon={Dumbbell} title="Preferensi Workout" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField name="workoutGoal" label="Goal" value={draft.workoutGoal} onChange={(value) => dispatch({ type: "set", field: "workoutGoal", value })} options={[["fat_loss", "Fat loss"], ["muscle_gain", "Muscle gain"], ["strength", "Strength"], ["general_fitness", "General fitness"]]} />
                <SelectField name="workoutLevel" label="Level" value={draft.workoutLevel} onChange={(value) => dispatch({ type: "set", field: "workoutLevel", value })} options={[["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]]} />
                <Field name="workoutDays" label="Hari/minggu" type="number" value={draft.workoutDays} onChange={(value) => dispatch({ type: "set", field: "workoutDays", value })} />
                <Field name="workoutDuration" label="Menit/sesi" type="number" value={draft.workoutDuration} onChange={(value) => dispatch({ type: "set", field: "workoutDuration", value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextareaField name="workoutEquipment" label="Alat tersedia" value={draft.workoutEquipment} onChange={(value) => dispatch({ type: "set", field: "workoutEquipment", value })} placeholder="Dumbbell, cable, treadmill" />
                <TextareaField name="workoutLimitations" label="Cedera/batasan" value={draft.workoutLimitations} onChange={(value) => dispatch({ type: "set", field: "workoutLimitations", value })} placeholder="Contoh: lutut, lower back, bahu" />
              </div>
            </section>

            {state.message ? (
              <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Profile & Target"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function createDraft(
  profile: { name?: string | null; phone?: string | null } | null,
  target: NutritionTarget,
  workout: ReturnType<typeof parseWorkoutNotes>,
): ProfileDraft {
  return {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    weightKg: toStringValue(target?.target_weight_kg),
    heightCm: toStringValue(target?.height_cm),
    age: toStringValue(target?.age),
    gender: target?.gender ?? "",
    nutritionGoal: target?.goal ?? "maintenance",
    activityLevel: target?.activity_level ?? "moderate",
    mealsPerDay: toStringValue(target?.meals_per_day ?? 3),
    targetCalories: toStringValue(target?.target_calories ?? 2200),
    targetProteinGram: toStringValue(target?.target_protein_gram ?? 140),
    targetCarbsGram: toStringValue(target?.target_carbs_gram ?? 250),
    targetFatGram: toStringValue(target?.target_fat_gram ?? 70),
    targetWaterMl: toStringValue(target?.target_water_ml ?? 2500),
    workoutGoal: workout.goal || "muscle_gain",
    workoutLevel: workout.level || "beginner",
    workoutDays: String(workout.days || 3),
    workoutDuration: String(workout.duration || 45),
    workoutEquipment: workout.equipment || "",
    workoutLimitations: workout.limitations || "",
  }
}

function profileReducer(state: ProfileDraft, action: DraftAction): ProfileDraft {
  if (action.type === "reset") return action.value
  return { ...state, [action.field]: action.value }
}

function toStringValue(value?: string | number | null) {
  return value === null || typeof value === "undefined" ? "" : String(value)
}

function getProfileCompletion(draft: ProfileDraft) {
  const fields: Array<keyof ProfileDraft> = [
    "name",
    "phone",
    "weightKg",
    "heightCm",
    "age",
    "nutritionGoal",
    "targetCalories",
    "targetProteinGram",
    "workoutGoal",
    "workoutLevel",
    "workoutDays",
    "workoutDuration",
  ]
  const filled = fields.filter((field) => Boolean(draft[field])).length
  return Math.round((filled / fields.length) * 100)
}

function goalLabel(value: string) {
  return {
    fat_loss: "Turun berat",
    muscle_gain: "Naik otot",
    maintenance: "Jaga badan",
  }[value] || value || "-"
}

function SectionTitle({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2">
      <Icon size={17} className="text-muted-foreground" />
      <p className="font-semibold">{title}</p>
    </div>
  )
}

function Field({
  name,
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
  placeholder,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  step?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <Input id={name} name={name} type={type} min={type === "number" ? 0 : undefined} step={step} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} />
    </div>
  )
}

function SelectField({ name, label, value, onChange, options }: { name: string; label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <select id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </div>
  )
}

function TextareaField({ name, label, value, onChange, placeholder }: { name: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <Textarea id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-sm font-medium sm:text-right">{value}</span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function SummaryCard({ icon: Icon, title, items }: { icon: typeof UserRound; title: string; items: string[][] }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon size={17} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="max-w-[60%] break-words text-right font-medium">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
