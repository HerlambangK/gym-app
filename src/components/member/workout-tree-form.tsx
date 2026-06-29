"use client"

import { useActionState, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { Plus, Trash2 } from "lucide-react"
import { saveWorkoutProgram, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

const initialState: ActionState = { ok: false, message: "" }

export function WorkoutTreeForm({ program }: { program: WorkoutProgram }) {
  const initialRows = useMemo(() => {
    const sessions = [...(program?.workout_sessions ?? [])].sort((a, b) => a.session_order - b.session_order)
    const rows = sessions.flatMap((session) =>
      [...(session.workout_exercises ?? [])]
        .sort((a, b) => a.exercise_order - b.exercise_order)
        .map((exercise) => ({
          id: exercise.id,
          dayName: session.day_name,
          exerciseName: exercise.exercise_name,
          exerciseType: exercise.exercise_type,
          sets: exercise.sets,
          reps: exercise.reps ?? "",
          loadNote: exercise.load_note ?? "",
        })),
    )

    return rows.length ? rows : [newRow()]
  }, [program])

  const [rows, setRows] = useState<ExerciseRow[]>(initialRows)
  const [state, action, pending] = useActionState(saveWorkoutProgram, initialState)
  const grouped = rows.reduce<Record<string, ExerciseRow[]>>((acc, row) => {
    acc[row.dayName || "Hari Latihan"] ||= []
    acc[row.dayName || "Hari Latihan"].push(row)
    return acc
  }, {})

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Program Latihan</CardTitle>
          <CardDescription>Susun latihan sebagai tree: program, hari, lalu exercise.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Nama program</label>
                <Input id="title" name="title" defaultValue={program?.title ?? "Program Hypertrophy"} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="goal" className="text-sm font-medium">Target</label>
                <Input id="goal" name="goal" defaultValue={program?.goal ?? ""} placeholder="Strength, fat loss, endurance" />
              </div>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.id} className="grid gap-3 rounded-xl border border-border p-3 lg:grid-cols-[1fr_1.2fr_1fr_0.5fr_0.8fr_1fr_auto]">
                  <InputField name="dayName" label="Hari" value={row.dayName} onChange={(value) => updateRow(setRows, row.id, { dayName: value })} />
                  <InputField name="exerciseName" label="Latihan" value={row.exerciseName} onChange={(value) => updateRow(setRows, row.id, { exerciseName: value })} />
                  <InputField name="exerciseType" label="Jenis" value={row.exerciseType} onChange={(value) => updateRow(setRows, row.id, { exerciseType: value })} />
                  <InputField name="sets" label="Set" type="number" value={String(row.sets)} onChange={(value) => updateRow(setRows, row.id, { sets: Number(value) || 1 })} />
                  <InputField name="reps" label="Reps" value={row.reps} onChange={(value) => updateRow(setRows, row.id, { reps: value })} />
                  <InputField name="loadNote" label="Beban" value={row.loadNote} onChange={(value) => updateRow(setRows, row.id, { loadNote: value })} />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Hapus latihan ${index + 1}`}
                      onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                      disabled={rows.length === 1}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" className="gap-2" onClick={() => setRows((current) => [...current, newRow()])}>
                <Plus size={16} /> Tambah Latihan
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Program"}
              </Button>
            </div>

            {state.message ? (
              <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tree Preview</CardTitle>
          <CardDescription>Struktur yang akan tersimpan sebagai program aktif.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(grouped).map(([day, exercises]) => (
            <div key={day} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{day}</p>
                <Badge variant="secondary">{exercises.length} latihan</Badge>
              </div>
              <div className="mt-4 space-y-3 border-l border-border pl-4">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="rounded-lg bg-muted/60 p-3">
                    <p className="font-medium">{exercise.exerciseName || "Nama latihan"}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.exerciseType || "Jenis"} - {exercise.sets || 1} set - {exercise.reps || "reps bebas"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function InputField({
  name,
  label,
  value,
  onChange,
  type = "text",
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={name !== "reps" && name !== "loadNote"} />
    </div>
  )
}

function newRow(): ExerciseRow {
  return {
    id: crypto.randomUUID(),
    dayName: "Senin",
    exerciseName: "",
    exerciseType: "Strength",
    sets: 3,
    reps: "8-12",
    loadNote: "",
  }
}

function updateRow(
  setRows: Dispatch<SetStateAction<ExerciseRow[]>>,
  id: string,
  patch: Partial<ExerciseRow>,
) {
  setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row))
}
