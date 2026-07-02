"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState, useTransition, type Dispatch, type SetStateAction } from "react"
import { ArrowRight, Dumbbell, Plus, Sparkles, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteWorkoutProgram, saveWorkoutProgram, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ExerciseRow = {
  id: string
  dayName: string
  exerciseName: string
  exerciseType: string
  sets: number
  reps: string
  loadNote: string
}

type WorkoutProgram = {
  title?: string | null
  goal?: string | null
  workout_sessions?: Array<{
    id: string
    day_name: string
    session_order: number
    workout_exercises?: Array<{
      id: string
      exercise_name: string
      exercise_type: string
      sets: number
      reps?: string | null
      load_note?: string | null
      exercise_order: number
    }>
  }>
} | null

type WorkoutProfile = {
  goal: string
  level: string
  days: string
  duration: string
  equipment: string
  limitations: string
}

const initialState: ActionState = { ok: false, message: "" }

const templateRows = [
  row("template-squat", "Senin", "Squat", "Strength", 3, "8-12", "RPE 7"),
  row("template-push-up", "Senin", "Push Up", "Strength", 3, "8-12", "Incline jika perlu"),
  row("template-lat-pulldown", "Rabu", "Lat Pulldown", "Strength", 3, "10-12", "Kontrol turun"),
  row("template-shoulder-press", "Rabu", "Shoulder Press", "Strength", 3, "8-10", "RPE 7"),
  row("template-leg-press", "Jumat", "Leg Press", "Strength", 3, "10-12", "Tambah beban jika mudah"),
  row("template-plank", "Jumat", "Plank", "Core", 3, "30-45 detik", "Jaga napas"),
]

export function WorkoutTreeForm({
  program,
  profile,
  profileIncomplete,
}: {
  program: WorkoutProgram
  profile: WorkoutProfile
  profileIncomplete: boolean
}) {
  const initialRows = useMemo(() => {
    const rows = [...(program?.workout_sessions ?? [])]
      .sort((a, b) => a.session_order - b.session_order)
      .flatMap((session) => [...(session.workout_exercises ?? [])]
        .sort((a, b) => a.exercise_order - b.exercise_order)
        .map((exercise) => ({
          id: exercise.id,
          dayName: session.day_name,
          exerciseName: exercise.exercise_name,
          exerciseType: exercise.exercise_type,
          sets: exercise.sets,
          reps: exercise.reps ?? "",
          loadNote: stripMeta(exercise.load_note),
        })))
    return rows.length ? rows : templateRows.map((item, index) => ({ ...item, id: `${item.id}-${index}` }))
  }, [program])

  const [rows, setRows] = useState<ExerciseRow[]>(initialRows)
  const [state, action, pending] = useActionState(saveWorkoutProgram, initialState)
  const [deleting, startDeleteTransition] = useTransition()
  const workoutGoal = profile.goal || "muscle_gain"
  const workoutLevel = profile.level || "beginner"
  const workoutDays = profile.days || "3"
  const workoutDuration = profile.duration || "45"
  const grouped = rows.reduce<Record<string, ExerciseRow[]>>((acc, item) => {
    acc[item.dayName || "Hari"] ||= []
    acc[item.dayName || "Hari"].push(item)
    return acc
  }, {})
  const totalSets = rows.reduce((sum, item) => sum + Number(item.sets || 0), 0)

  useEffect(() => {
    if (!state.message) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <div className="space-y-6">
      {profileIncomplete ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Program memakai default sementara</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Lengkapi goal, level, jadwal, alat, dan batasan gerak di Profile. Kamu tetap bisa membuat program di sini.
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

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Workout profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {workoutGoal} · {workoutLevel} · {workoutDays}x/minggu · {workoutDuration} menit
            </p>
          </div>
          <Badge variant="secondary">{totalSets} set/minggu</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Program Cepat</CardTitle>
                <CardDescription>Simple: pilih template, edit gerakan, simpan. Data target ada di Profile.</CardDescription>
              </div>
              {program ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={deleting}
                  onClick={() => {
                    startDeleteTransition(async () => {
                      try {
                        await deleteWorkoutProgram()
                        setRows(templateRows.map((item, index) => ({ ...item, id: `${item.id}-reset-${index}` })))
                        toast.success("Program latihan berhasil dihapus.")
                      } catch {
                        toast.error("Gagal menghapus program latihan.")
                      }
                    })
                  }}
                >
                    <Trash2 size={15} />
                    {deleting ? "Menghapus..." : "Hapus"}
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <input type="hidden" name="goal" value={workoutGoal} />
              <input type="hidden" name="level" value={workoutLevel} />
              <input type="hidden" name="weeklySessions" value={workoutDays} />
              <input type="hidden" name="sessionDurationMinutes" value={workoutDuration} />
              <input type="hidden" name="equipment" value={profile.equipment} />
              <input type="hidden" name="limitations" value={profile.limitations} />
              <input type="hidden" name="preference" value="gym" />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input name="title" defaultValue={program?.title || `${workoutGoal} ${workoutDays} Hari`} placeholder="Nama program" required />
                <Button type="button" variant="outline" onClick={() => setRows(templateRows.map((item, index) => ({ ...item, id: `${item.id}-copy-${index}` })))}>
                  Pakai Template
                </Button>
              </div>

              <div className="space-y-3">
                {rows.map((item) => (
                  <div key={item.id} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[0.7fr_1.2fr_0.8fr_0.45fr_0.65fr_0.9fr_auto]">
                    <RowInput name="dayName" value={item.dayName} onChange={(value) => updateRow(setRows, item.id, { dayName: value })} placeholder="Hari" />
                    <RowInput name="exerciseName" value={item.exerciseName} onChange={(value) => updateRow(setRows, item.id, { exerciseName: value })} placeholder="Latihan" />
                    <RowInput name="exerciseType" value={item.exerciseType} onChange={(value) => updateRow(setRows, item.id, { exerciseType: value })} placeholder="Jenis" />
                    <RowInput name="sets" type="number" value={String(item.sets)} onChange={(value) => updateRow(setRows, item.id, { sets: Number(value) || 1 })} placeholder="Set" />
                    <RowInput name="reps" value={item.reps} onChange={(value) => updateRow(setRows, item.id, { reps: value })} placeholder="Reps" />
                    <RowInput name="loadNote" value={item.loadNote} onChange={(value) => updateRow(setRows, item.id, { loadNote: value })} placeholder="Beban/RPE" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setRows((current) => current.filter((row) => row.id !== item.id))} disabled={rows.length === 1}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="gap-2" onClick={() => setRows((current) => [...current, row(`custom-${current.length + 1}`, "Senin", "", "Strength", 3, "8-12", "")])}>
                  <Plus size={16} />
                  Tambah
                </Button>
                <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Program"}</Button>
              </div>
              {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell size={18} />
              Preview Mingguan
            </CardTitle>
            <CardDescription>Ringkas dan mudah dibaca saat di gym.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="border-border/70">
              <CardContent className="flex items-start gap-3 p-4">
                <Sparkles size={18} className="mt-0.5 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">{coachNote(rows, workoutGoal)}</p>
              </CardContent>
            </Card>
            {Object.entries(grouped).map(([day, exercises]) => (
              <div key={day} className="rounded-lg border border-border">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                  <p className="font-medium">{day}</p>
                  <Badge variant="outline">{exercises.length} latihan</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Latihan</TableHead>
                      <TableHead className="text-center">Set</TableHead>
                      <TableHead className="text-center">Reps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercises.map((exercise) => (
                      <TableRow key={exercise.id}>
                        <TableCell className="font-medium">{exercise.exerciseName || "Latihan"}</TableCell>
                        <TableCell className="text-center tabular-nums">{exercise.sets}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{exercise.reps || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function row(id: string, dayName: string, exerciseName: string, exerciseType: string, sets: number, reps: string, loadNote: string): ExerciseRow {
  return { id, dayName, exerciseName, exerciseType, sets, reps, loadNote }
}

function stripMeta(note?: string | null) {
  if (!note) return ""
  const found = note.split("|").find((item) => item.startsWith("note:"))
  return found ? found.replace("note:", "") : note
}

function coachNote(rows: ExerciseRow[], goal: string) {
  const hasLegs = rows.some((item) => /squat|leg|lunges|kaki/i.test(item.exerciseName))
  const hasPull = rows.some((item) => /row|pull|punggung/i.test(item.exerciseName))
  if (!hasLegs) return "Tambahkan latihan kaki seperti squat, leg press, atau lunges agar program lebih seimbang."
  if (!hasPull) return "Tambahkan gerakan tarik seperti row atau lat pulldown untuk menjaga postur dan bahu."
  if (goal === "fat_loss") return "Untuk fat loss, jaga tempo latihan dan tambah cardio 8-12 menit setelah strength."
  return "Program sudah cukup seimbang. Jika terasa mudah, naikkan beban sedikit minggu depan."
}

function RowInput({ name, value, onChange, placeholder, type = "text" }: { name: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <Input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={name !== "loadNote"} />
}

function updateRow(setRows: Dispatch<SetStateAction<ExerciseRow[]>>, id: string, patch: Partial<ExerciseRow>) {
  setRows((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
}
