"use client"

import { useActionState, useEffect } from "react"
import { Activity, Apple, Dumbbell, UserRound } from "lucide-react"
import { toast } from "sonner"
import { saveMemberProfile, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const isPremium = member?.member_type === "PREMIUM"
  const workout = parseWorkoutNotes(target?.notes)

  useEffect(() => {
    if (!state.message) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Ringkasan Akun</CardTitle>
              {isPremium ? <Badge className="premium-gold-badge">MEMBER PREMIUM</Badge> : null}
            </div>
            <CardDescription>Status akun, member code, dan tipe membership.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProfileRow label="Email" value={email} />
            <ProfileRow label="Member Code" value={member?.member_code || "-"} />
            <ProfileRow label="Tipe" value={isPremium ? "Member Premium" : member?.member_type || "MEMBER"} />
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex flex-wrap justify-end gap-2">
                {isPremium ? <Badge className="premium-gold-badge">GOLD ACTIVE</Badge> : null}
                <Badge variant={member?.status === "ACTIVE" ? "success" : "muted"}>{member?.status || "ACTIVE"}</Badge>
                <Badge variant={verified ? "success" : "warning"}>{verified ? "VERIFIED" : "UNVERIFIED"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} />
              Dipakai Fitur
            </CardTitle>
            <CardDescription>Nutrition dan Workout membaca target dari profile ini.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <MiniStat label="Target kalori" value={target?.target_calories ? `${target.target_calories} kcal` : "Belum diisi"} />
            <MiniStat label="Workout goal" value={workout.goal || "Belum diisi"} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile & Target</CardTitle>
          <CardDescription>Isi sekali di sini. Nutrition dan Workout cukup fokus ke input harian.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            <section className="space-y-4">
              <SectionTitle icon={UserRound} title="Identitas" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field name="name" label="Nama lengkap" defaultValue={profile?.name} required />
                <Field name="phone" label="Nomor telepon" defaultValue={profile?.phone} placeholder="08xxxxxxxxxx" />
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Field name="weightKg" label="Berat sekarang" type="number" step="0.1" defaultValue={target?.target_weight_kg} />
                <Field name="heightCm" label="Tinggi badan" type="number" step="0.1" defaultValue={target?.height_cm} />
                <Field name="age" label="Umur" type="number" defaultValue={target?.age} />
                <SelectField name="gender" label="Gender" defaultValue={target?.gender || ""} options={[["", "Pilih"], ["male", "Laki-laki"], ["female", "Perempuan"]]} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle icon={Apple} title="Target Nutrisi" />
              <div className="grid gap-3 sm:grid-cols-3">
                <SelectField name="nutritionGoal" label="Tujuan" defaultValue={target?.goal || "maintenance"} options={[["fat_loss", "Turun berat"], ["muscle_gain", "Naik otot"], ["maintenance", "Jaga badan"]]} />
                <SelectField name="activityLevel" label="Aktivitas" defaultValue={target?.activity_level || "moderate"} options={[["low", "Rendah"], ["moderate", "Sedang"], ["high", "Tinggi"]]} />
                <Field name="mealsPerDay" label="Makan/hari" type="number" defaultValue={target?.meals_per_day ?? 3} />
              </div>
              <div className="grid gap-3 sm:grid-cols-5">
                <Field name="targetCalories" label="Kalori" type="number" defaultValue={target?.target_calories ?? 2200} />
                <Field name="targetProteinGram" label="Protein" type="number" defaultValue={target?.target_protein_gram ?? 140} />
                <Field name="targetCarbsGram" label="Karbo" type="number" defaultValue={target?.target_carbs_gram ?? 250} />
                <Field name="targetFatGram" label="Lemak" type="number" defaultValue={target?.target_fat_gram ?? 70} />
                <Field name="targetWaterMl" label="Air ml" type="number" defaultValue={target?.target_water_ml ?? 2500} />
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle icon={Dumbbell} title="Preferensi Workout" />
              <div className="grid gap-3 sm:grid-cols-4">
                <SelectField name="workoutGoal" label="Goal" defaultValue={workout.goal || "muscle_gain"} options={[["fat_loss", "Fat loss"], ["muscle_gain", "Muscle gain"], ["strength", "Strength"], ["general_fitness", "General fitness"]]} />
                <SelectField name="workoutLevel" label="Level" defaultValue={workout.level || "beginner"} options={[["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]]} />
                <Field name="workoutDays" label="Hari/minggu" type="number" defaultValue={workout.days || 3} />
                <Field name="workoutDuration" label="Menit/sesi" type="number" defaultValue={workout.duration || 45} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextareaField name="workoutEquipment" label="Alat tersedia" defaultValue={workout.equipment} placeholder="Dumbbell, cable, treadmill" />
                <TextareaField name="workoutLimitations" label="Cedera/batasan" defaultValue={workout.limitations} placeholder="Contoh: lutut, lower back, bahu" />
              </div>
            </section>

            {state.message ? (
              <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Profile & Target"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
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
  defaultValue,
  type = "text",
  step,
  required,
  placeholder,
}: {
  name: string
  label: string
  defaultValue?: string | number | null
  type?: string
  step?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <Input id={name} name={name} type={type} step={step} defaultValue={defaultValue ?? ""} placeholder={placeholder} required={required} />
    </div>
  )
}

function SelectField({ name, label, defaultValue, options }: { name: string; label: string; defaultValue?: string; options: string[][] }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring">
        {options.map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
      </select>
    </div>
  )
}

function TextareaField({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue?: string | null; placeholder?: string }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <Textarea id={name} name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} />
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-sm font-medium">{value}</span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}
