"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flame,
  History,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { deleteWorkoutProgram, saveWorkoutProgram, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ExerciseRow = {
  id: string
  dayName: string
  exerciseName: string
  exerciseType: string
  muscleGroup: string
  focus: string
  equipmentRow: string
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

type ExerciseTemplate = {
  name: string
  type: string
  muscle: string
  focus: string
  equipment: string
  reps: string
  side: "front" | "back" | "both"
}

const initialState: ActionState = { ok: false, message: "" }
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
const tabs = [
  { id: "program", label: "Workout", icon: Dumbbell },
  { id: "history", label: "History Log", icon: History },
  { id: "daily", label: "Daily Workout", icon: CalendarDays },
] as const

const exerciseLibrary: ExerciseTemplate[] = [
  { name: "Bench Press", type: "Strength", muscle: "Chest", focus: "Push", equipment: "Barbell", reps: "8-10", side: "front" },
  { name: "Incline Dumbbell Press", type: "Hypertrophy", muscle: "Chest", focus: "Upper chest", equipment: "Dumbbell", reps: "8-12", side: "front" },
  { name: "Cable Fly", type: "Hypertrophy", muscle: "Chest", focus: "Chest isolation", equipment: "Cable", reps: "12-15", side: "front" },
  { name: "Push Up", type: "Strength", muscle: "Chest", focus: "Push", equipment: "Bodyweight", reps: "AMRAP", side: "front" },
  { name: "Lat Pulldown", type: "Strength", muscle: "Back", focus: "Vertical pull", equipment: "Cable", reps: "10-12", side: "back" },
  { name: "Seated Row", type: "Strength", muscle: "Back", focus: "Horizontal pull", equipment: "Cable", reps: "10-12", side: "back" },
  { name: "Pull Up", type: "Strength", muscle: "Back", focus: "Vertical pull", equipment: "Bodyweight", reps: "6-10", side: "back" },
  { name: "Romanian Deadlift", type: "Strength", muscle: "Back", focus: "Posterior chain", equipment: "Barbell", reps: "8-10", side: "back" },
  { name: "Shoulder Press", type: "Strength", muscle: "Shoulders", focus: "Overhead press", equipment: "Dumbbell", reps: "8-10", side: "front" },
  { name: "Lateral Raise", type: "Hypertrophy", muscle: "Shoulders", focus: "Side delt", equipment: "Dumbbell", reps: "12-15", side: "front" },
  { name: "Face Pull", type: "Mobility", muscle: "Shoulders", focus: "Rear delt", equipment: "Cable", reps: "12-15", side: "back" },
  { name: "Rear Delt Fly", type: "Hypertrophy", muscle: "Shoulders", focus: "Rear delt", equipment: "Machine", reps: "12-15", side: "back" },
  { name: "Barbell Curl", type: "Hypertrophy", muscle: "Biceps", focus: "Elbow flexion", equipment: "Barbell", reps: "10-12", side: "front" },
  { name: "Hammer Curl", type: "Hypertrophy", muscle: "Biceps", focus: "Brachialis", equipment: "Dumbbell", reps: "10-12", side: "front" },
  { name: "Triceps Pushdown", type: "Hypertrophy", muscle: "Triceps", focus: "Elbow extension", equipment: "Cable", reps: "10-15", side: "back" },
  { name: "Overhead Triceps Extension", type: "Hypertrophy", muscle: "Triceps", focus: "Long head", equipment: "Cable", reps: "10-12", side: "back" },
  { name: "Squat", type: "Strength", muscle: "Quads", focus: "Knee dominant", equipment: "Barbell", reps: "8-12", side: "front" },
  { name: "Leg Press", type: "Strength", muscle: "Quads", focus: "Knee dominant", equipment: "Machine", reps: "10-12", side: "front" },
  { name: "Leg Extension", type: "Hypertrophy", muscle: "Quads", focus: "Quad isolation", equipment: "Machine", reps: "12-15", side: "front" },
  { name: "Walking Lunge", type: "Strength", muscle: "Quads", focus: "Single leg", equipment: "Dumbbell", reps: "10/side", side: "front" },
  { name: "Leg Curl", type: "Hypertrophy", muscle: "Hamstrings", focus: "Knee flexion", equipment: "Machine", reps: "12-15", side: "back" },
  { name: "Hip Thrust", type: "Strength", muscle: "Glutes", focus: "Hip extension", equipment: "Barbell", reps: "8-12", side: "back" },
  { name: "Cable Kickback", type: "Hypertrophy", muscle: "Glutes", focus: "Glute isolation", equipment: "Cable", reps: "12-15", side: "back" },
  { name: "Standing Calf Raise", type: "Hypertrophy", muscle: "Calves", focus: "Calves", equipment: "Machine", reps: "12-20", side: "back" },
  { name: "Plank", type: "Core", muscle: "Core", focus: "Stability", equipment: "Bodyweight", reps: "30-60 detik", side: "front" },
  { name: "Cable Crunch", type: "Core", muscle: "Core", focus: "Flexion", equipment: "Cable", reps: "12-15", side: "front" },
  { name: "Hanging Leg Raise", type: "Core", muscle: "Core", focus: "Lower abs", equipment: "Bodyweight", reps: "8-12", side: "front" },
  { name: "Pallof Press", type: "Core", muscle: "Core", focus: "Anti rotation", equipment: "Cable", reps: "10/side", side: "front" },
  { name: "Treadmill Intervals", type: "Cardio", muscle: "Cardio", focus: "Conditioning", equipment: "Treadmill", reps: "12-18 menit", side: "both" },
  { name: "Rowing Machine", type: "Cardio", muscle: "Cardio", focus: "Conditioning", equipment: "Rower", reps: "10-15 menit", side: "both" },
  { name: "Battle Rope", type: "Conditioning", muscle: "Full Body", focus: "Power endurance", equipment: "Rope", reps: "8 rounds", side: "both" },
  { name: "Kettlebell Swing", type: "Conditioning", muscle: "Full Body", focus: "Hip power", equipment: "Kettlebell", reps: "12-15", side: "both" },
]

const templateRows = [
  row("template-bench", "Senin", "Bench Press", "Strength", "Chest", "Push", "Barbell", 3, "8-10", "RPE 7"),
  row("template-squat", "Senin", "Squat", "Strength", "Quads", "Knee dominant", "Barbell", 3, "8-12", "RPE 7"),
  row("template-lat-pulldown", "Rabu", "Lat Pulldown", "Strength", "Back", "Vertical pull", "Cable", 3, "10-12", "Kontrol turun"),
  row("template-shoulder-press", "Rabu", "Shoulder Press", "Strength", "Shoulders", "Overhead press", "Dumbbell", 3, "8-10", "RPE 7"),
  row("template-leg-curl", "Jumat", "Leg Curl", "Hypertrophy", "Hamstrings", "Knee flexion", "Machine", 3, "12-15", "Tempo pelan"),
  row("template-plank", "Jumat", "Plank", "Core", "Core", "Stability", "Bodyweight", 3, "30-60 detik", "Jaga napas"),
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
        .map((exercise) => {
          const meta = parseMeta(exercise.load_note)
          return {
            id: exercise.id,
            dayName: session.day_name,
            exerciseName: exercise.exercise_name,
            exerciseType: exercise.exercise_type,
            muscleGroup: meta.muscle || guessMuscle(exercise.exercise_name),
            focus: meta.focus || guessFocus(exercise.exercise_name),
            equipmentRow: meta.equipment || guessEquipment(exercise.exercise_name),
            sets: exercise.sets,
            reps: exercise.reps ?? "",
            loadNote: meta.note,
          }
        }))
    return rows.length ? rows : templateRows.map((item, index) => ({ ...item, id: `${item.id}-${index}` }))
  }, [program])

  const [rows, setRows] = useState<ExerciseRow[]>(initialRows)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("program")
  const [editingRow, setEditingRow] = useState<ExerciseRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMuscle, setSelectedMuscle] = useState("Chest")
  const [bodySide, setBodySide] = useState<"front" | "back">("front")
  const [state, action, pending] = useActionState(saveWorkoutProgram, initialState)
  const [deleting, startDeleteTransition] = useTransition()
  const workoutGoal = profile.goal || "muscle_gain"
  const workoutLevel = profile.level || "beginner"
  const workoutDays = profile.days || "3"
  const workoutDuration = profile.duration || "45"
  const grouped = useMemo(() => groupRows(rows), [rows])
  const dashboard = useMemo(() => getWorkoutDashboard(rows, grouped), [rows, grouped])
  const calendar = useMemo(() => buildMonthCalendar(new Date(), grouped), [grouped])
  const coachNoteText = useMemo(() => coachNote(rows, workoutGoal), [rows, workoutGoal])
  const filteredLibrary = useMemo(() => exerciseLibrary.filter((item) => item.muscle === selectedMuscle), [selectedMuscle])
  const visibleLibrary = filteredLibrary.length
    ? filteredLibrary
    : exerciseLibrary.filter((item) => item.side === bodySide || item.side === "both").slice(0, 10)

  useEffect(() => {
    if (!state.message) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  function openCreateDialog() {
    const firstExercise = exerciseLibrary.find((item) => item.muscle === selectedMuscle)
    setEditingRow(row(
      `custom-${Date.now()}`,
      dashboard.todayName,
      firstExercise?.name || "",
      firstExercise?.type || "Strength",
      selectedMuscle,
      firstExercise?.focus || "",
      firstExercise?.equipment || "",
      3,
      firstExercise?.reps || "8-12",
      "",
    ))
    setDialogOpen(true)
  }

  function openEditDialog(item: ExerciseRow) {
    const template = exerciseLibrary.find((exercise) => exercise.name.toLowerCase() === item.exerciseName.toLowerCase())
    setBodySide(template?.side === "back" ? "back" : "front")
    setSelectedMuscle(item.muscleGroup || "Chest")
    setEditingRow(item)
    setDialogOpen(true)
  }

  function applyExercise(item: ExerciseTemplate) {
    setBodySide(item.side === "back" ? "back" : "front")
    setSelectedMuscle(item.muscle)
    setEditingRow((current) => ({
      ...(current ?? row(`custom-${Date.now()}`, dashboard.todayName, "", "Strength", item.muscle, item.focus, item.equipment, 3, item.reps, "")),
      exerciseName: item.name,
      exerciseType: item.type,
      muscleGroup: item.muscle,
      focus: item.focus,
      equipmentRow: item.equipment,
      reps: item.reps,
    }))
  }

  function saveDialogRow() {
    if (!editingRow?.exerciseName.trim()) {
      toast.error("Nama latihan wajib diisi.")
      return
    }
    setRows((current) => {
      const exists = current.some((item) => item.id === editingRow.id)
      return exists
        ? current.map((item) => item.id === editingRow.id ? editingRow : item)
        : [...current, editingRow]
    })
    setDialogOpen(false)
    setEditingRow(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {profileIncomplete ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="font-semibold">Program memakai default sementara</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Lengkapi goal, level, jadwal, alat, dan batasan gerak di Profile. Kamu tetap bisa membuat program di sini.
              </p>
            </div>
            <Link href="/member/profile">
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                Lengkapi Profile
                <ArrowRight size={15} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WorkoutStat icon={Dumbbell} label="Latihan" value={`${rows.length}`} helper={`${dashboard.trainingDays} hari aktif`} />
        <WorkoutStat icon={Flame} label="Volume" value={`${dashboard.totalSets} set`} helper={`${dashboard.avgSetsPerDay} set/hari latihan`} />
        <WorkoutStat icon={CheckCircle2} label="Balance" value={`${dashboard.balanceScore}%`} helper={`${dashboard.muscleCount} area otot`} />
        <WorkoutStat icon={CalendarDays} label="Hari ini" value={dashboard.todayCount ? `${dashboard.todayCount} latihan` : "Rest"} helper={dashboard.todayName} />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="font-semibold">Workout profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {workoutGoal} · {workoutLevel} · {workoutDays}x/minggu · {workoutDuration} menit
            </p>
          </div>
          <Badge variant="secondary">{dashboard.totalSets} set/minggu</Badge>
        </CardContent>
      </Card>

      <div className="flex gap-2 overflow-x-auto rounded-lg border border-border bg-muted/25 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "program" ? (
        <form action={action} className="space-y-4 sm:space-y-6">
          <input type="hidden" name="goal" value={workoutGoal} />
          <input type="hidden" name="level" value={workoutLevel} />
          <input type="hidden" name="weeklySessions" value={workoutDays} />
          <input type="hidden" name="sessionDurationMinutes" value={workoutDuration} />
          <input type="hidden" name="equipment" value={profile.equipment} />
          <input type="hidden" name="limitations" value={profile.limitations} />
          <input type="hidden" name="preference" value="gym" />
          {rows.map((item) => (
            <div key={item.id} className="hidden">
              <input name="dayName" value={item.dayName} readOnly />
              <input name="focus" value={item.focus} readOnly />
              <input name="exerciseName" value={item.exerciseName} readOnly />
              <input name="exerciseType" value={item.exerciseType} readOnly />
              <input name="muscleGroup" value={item.muscleGroup} readOnly />
              <input name="equipmentRow" value={item.equipmentRow} readOnly />
              <input name="sets" value={item.sets} readOnly />
              <input name="reps" value={item.reps} readOnly />
              <input name="loadNote" value={item.loadNote} readOnly />
            </div>
          ))}

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>Program Latihan</CardTitle>
                  <CardDescription>Input lewat anatomy selector, daftar program tetap ringkas untuk mobile dan desktop.</CardDescription>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:flex">
                  <Button type="button" variant="outline" onClick={() => setRows(templateRows.map((item, index) => ({ ...item, id: `${item.id}-copy-${index}` })))}>
                    Pakai Template
                  </Button>
                  <Button type="button" className="gap-2" onClick={openCreateDialog}>
                    <Plus size={16} />
                    Tambah Latihan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input name="title" defaultValue={program?.title || `${workoutGoal} ${workoutDays} Hari`} placeholder="Nama program" required />
                <Button type="submit" disabled={pending || rows.length === 0}>
                  {pending ? "Menyimpan..." : "Simpan Program"}
                </Button>
              </div>

              <div className="space-y-3 md:hidden">
                {rows.map((item) => (
                  <ExerciseMobileCard
                    key={item.id}
                    item={item}
                    canDelete={rows.length > 1}
                    onEdit={() => openEditDialog(item)}
                    onDelete={() => setRows((current) => current.filter((rowItem) => rowItem.id !== item.id))}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hari</TableHead>
                      <TableHead>Latihan</TableHead>
                      <TableHead>Otot</TableHead>
                      <TableHead className="text-center">Set</TableHead>
                      <TableHead className="text-center">Reps</TableHead>
                      <TableHead className="w-24 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell><Badge variant="outline">{item.dayName}</Badge></TableCell>
                        <TableCell>
                          <p className="font-medium">{item.exerciseName || "Latihan"}</p>
                          <p className="text-xs text-muted-foreground">{item.exerciseType} · {item.equipmentRow || "Alat bebas"}</p>
                        </TableCell>
                        <TableCell>{item.muscleGroup || "-"}</TableCell>
                        <TableCell className="text-center tabular-nums">{item.sets}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.reps || "-"}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button type="button" variant="ghost" size="icon" aria-label="Edit latihan" onClick={() => openEditDialog(item)}>
                              <Pencil size={15} />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" aria-label="Hapus latihan" onClick={() => setRows((current) => current.filter((rowItem) => rowItem.id !== item.id))} disabled={rows.length === 1}>
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {state.message ? <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p> : <span />}
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
                    {deleting ? "Menghapus..." : "Hapus Program"}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </form>
      ) : null}

      {activeTab === "history" ? (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <History size={18} />
              Preview Mingguan
            </CardTitle>
            <CardDescription>Ringkasan program mingguan, distribusi otot, dan catatan coach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <Card className="border-border/70">
              <CardContent className="flex items-start gap-3 p-4">
                <Sparkles size={18} className="mt-0.5 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">{coachNoteText}</p>
              </CardContent>
            </Card>

            <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium">Distribusi otot</p>
                <div className="mt-4 space-y-3">
                  {dashboard.muscleDistribution.map((item) => (
                    <div key={item.name}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">{item.count} latihan</span>
                      </div>
                      <Progress value={item.percent} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(grouped).map(([day, exercises]) => (
                  <div key={day} className="rounded-lg border border-border">
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                      <p className="font-medium">{day}</p>
                      <Badge variant="outline">{exercises.length} latihan</Badge>
                    </div>
                    <div className="divide-y divide-border">
                      {exercises.map((exercise) => (
                        <button key={exercise.id} type="button" onClick={() => openEditDialog(exercise)} className="grid w-full gap-1 px-4 py-3 text-left text-sm transition hover:bg-muted/35 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                          <span className="font-medium">{exercise.exerciseName || "Latihan"}</span>
                          <span className="text-muted-foreground">{exercise.focus || exercise.muscleGroup || "-"}</span>
                          <span className="tabular-nums text-muted-foreground">{exercise.sets} set · {exercise.reps || "-"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "daily" ? (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays size={18} />
              Calendar Latihan
            </CardTitle>
            <CardDescription>{calendar.monthLabel}. Jadwal dibuat dari hari latihan di program aktif.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="hidden grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground sm:grid">
              {days.map((day) => <span key={day}>{day.slice(0, 3)}</span>)}
            </div>
            <div className="grid gap-2 sm:grid-cols-7">
              {calendar.cells.map((cell) => (
                <div key={cell.key} className={`min-h-28 rounded-lg border p-3 ${cell.inMonth ? "border-border bg-background" : "border-border/50 bg-muted/20 text-muted-foreground"} ${cell.isToday ? "ring-2 ring-primary/50" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground sm:hidden">{cell.dayName}</p>
                      <p className="font-semibold tabular-nums">{cell.date.getDate()}</p>
                    </div>
                    {cell.items.length ? <Badge variant="secondary">{cell.items.length}</Badge> : null}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {cell.items.slice(0, 3).map((item) => (
                      <button key={item.id} type="button" onClick={() => openEditDialog(item)} className="w-full rounded-md bg-primary/5 px-2 py-1.5 text-left text-xs transition hover:bg-primary/10">
                        <span className="block truncate font-medium">{item.exerciseName}</span>
                        <span className="text-muted-foreground">{item.sets} set · {item.reps || "reps"}</span>
                      </button>
                    ))}
                    {!cell.items.length ? <p className="text-xs text-muted-foreground">Rest</p> : null}
                    {cell.items.length > 3 ? <p className="text-xs text-muted-foreground">+{cell.items.length - 3} lagi</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{rows.some((item) => item.id === editingRow?.id) ? "Edit Latihan" : "Tambah Latihan"}</DialogTitle>
            <DialogDescription>Pilih human body depan/belakang, pilih latihan gym, lalu rapikan detail set dan reps.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 xl:grid-cols-[1fr_1.05fr]">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/25 p-1">
                <button type="button" onClick={() => setBodySide("front")} className={`h-9 rounded-md text-sm font-medium ${bodySide === "front" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                  Human depan
                </button>
                <button type="button" onClick={() => setBodySide("back")} className={`h-9 rounded-md text-sm font-medium ${bodySide === "back" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                  Human belakang
                </button>
              </div>
              <HumanBodyPicker side={bodySide} selected={selectedMuscle} onSelect={(muscle) => {
                setSelectedMuscle(muscle)
                setEditingRow((current) => current ? { ...current, muscleGroup: muscle } : current)
              }} />
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Pilih latihan {selectedMuscle}</label>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-border p-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {visibleLibrary.map((item) => (
                      <button key={item.name} type="button" onClick={() => applyExercise(item)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${editingRow?.exerciseName === item.name ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                        <span className="font-medium">{item.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{item.muscle} · {item.equipment} · {item.reps}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {editingRow ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField label="Hari" value={editingRow.dayName} onChange={(value) => setEditingRow({ ...editingRow, dayName: value })} options={days} />
                  <SelectField label="Jenis" value={editingRow.exerciseType} onChange={(value) => setEditingRow({ ...editingRow, exerciseType: value })} options={["Strength", "Hypertrophy", "Cardio", "Core", "Mobility", "Conditioning"]} />
                  <TextField label="Nama latihan" value={editingRow.exerciseName} onChange={(value) => setEditingRow({ ...editingRow, exerciseName: value })} />
                  <TextField label="Alat" value={editingRow.equipmentRow} onChange={(value) => setEditingRow({ ...editingRow, equipmentRow: value })} />
                  <TextField label="Fokus" value={editingRow.focus} onChange={(value) => setEditingRow({ ...editingRow, focus: value })} />
                  <TextField label="Reps" value={editingRow.reps} onChange={(value) => setEditingRow({ ...editingRow, reps: value })} />
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Set</label>
                    <Input type="number" min={0} value={editingRow.sets} onChange={(event) => setEditingRow({ ...editingRow, sets: Math.max(0, Number(event.target.value) || 0) })} />
                  </div>
                  <TextField label="Catatan beban/RPE" value={editingRow.loadNote} onChange={(value) => setEditingRow({ ...editingRow, loadNote: value })} />
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                <Button type="button" onClick={saveDialogRow}>Simpan Latihan</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function row(
  id: string,
  dayName: string,
  exerciseName: string,
  exerciseType: string,
  muscleGroup: string,
  focus: string,
  equipmentRow: string,
  sets: number,
  reps: string,
  loadNote: string,
): ExerciseRow {
  return { id, dayName, exerciseName, exerciseType, muscleGroup, focus, equipmentRow, sets, reps, loadNote }
}

function parseMeta(note?: string | null) {
  if (!note) return { focus: "", muscle: "", equipment: "", note: "" }
  const items = Object.fromEntries(note.split("|").map((item) => {
    const [key, ...value] = item.split(":")
    return [key, value.join(":")]
  }))
  return {
    focus: items.focus || "",
    muscle: items.muscle || "",
    equipment: items.equipment || "",
    note: items.note || note,
  }
}

function groupRows(rows: ExerciseRow[]) {
  return rows.reduce<Record<string, ExerciseRow[]>>((acc, item) => {
    acc[item.dayName || "Hari"] ||= []
    acc[item.dayName || "Hari"].push(item)
    return acc
  }, {})
}

function getWorkoutDashboard(rows: ExerciseRow[], grouped: Record<string, ExerciseRow[]>) {
  const todayName = days[(new Date().getDay() + 6) % 7]
  const todayCount = grouped[todayName]?.length ?? 0
  const trainingDays = Object.values(grouped).filter((items) => items.length > 0).length
  const totalSets = rows.reduce((sum, item) => sum + Number(item.sets || 0), 0)
  const muscles = rows.reduce<Record<string, number>>((acc, item) => {
    const muscle = item.muscleGroup || "General"
    acc[muscle] = (acc[muscle] || 0) + 1
    return acc
  }, {})
  const maxMuscle = Math.max(1, ...Object.values(muscles))
  const muscleDistribution = Object.entries(muscles)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percent: Math.round((count / maxMuscle) * 100) }))

  return {
    todayName,
    todayCount,
    trainingDays,
    totalSets,
    avgSetsPerDay: trainingDays ? Math.round(totalSets / trainingDays) : 0,
    muscleCount: Object.keys(muscles).length,
    balanceScore: Math.min(100, Math.round((Object.keys(muscles).length / 8) * 100)),
    muscleDistribution,
  }
}

function buildMonthCalendar(date: Date, grouped: Record<string, ExerciseRow[]>) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - startOffset)
  const cells = Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(gridStart)
    cellDate.setDate(gridStart.getDate() + index)
    const dayName = days[(cellDate.getDay() + 6) % 7]
    return {
      key: cellDate.toISOString(),
      date: cellDate,
      dayName,
      inMonth: cellDate.getMonth() === month,
      isToday: cellDate.toDateString() === date.toDateString(),
      items: grouped[dayName] ?? [],
    }
  })
  return {
    monthLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date),
    cells,
  }
}

function coachNote(rows: ExerciseRow[], goal: string) {
  const hasLegs = rows.some((item) => /quads|hamstrings|glutes|calves|squat|leg|lunges|kaki/i.test(`${item.muscleGroup} ${item.exerciseName}`))
  const hasPull = rows.some((item) => /back|row|pull|punggung/i.test(`${item.muscleGroup} ${item.exerciseName}`))
  const hasPush = rows.some((item) => /chest|shoulders|triceps|press|push/i.test(`${item.muscleGroup} ${item.exerciseName}`))
  if (!hasLegs) return "Tambahkan latihan kaki seperti squat, leg press, leg curl, atau hip thrust agar program lebih seimbang."
  if (!hasPull) return "Tambahkan gerakan tarik seperti row, pull up, atau lat pulldown untuk menjaga postur dan bahu."
  if (!hasPush) return "Tambahkan gerakan push seperti bench press atau shoulder press untuk melengkapi upper body."
  if (goal === "fat_loss") return "Untuk fat loss, jaga tempo latihan dan tambah cardio 8-12 menit setelah strength."
  return "Program sudah cukup seimbang. Jika terasa mudah, naikkan beban sedikit minggu depan."
}

function guessMuscle(name: string) {
  const found = exerciseLibrary.find((item) => item.name.toLowerCase() === name.toLowerCase())
  return found?.muscle || "Chest"
}

function guessFocus(name: string) {
  const found = exerciseLibrary.find((item) => item.name.toLowerCase() === name.toLowerCase())
  return found?.focus || ""
}

function guessEquipment(name: string) {
  const found = exerciseLibrary.find((item) => item.name.toLowerCase() === name.toLowerCase())
  return found?.equipment || ""
}

function WorkoutStat({ icon: Icon, label, value, helper }: { icon: typeof Dumbbell; label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ExerciseMobileCard({ item, canDelete, onEdit, onDelete }: { item: ExerciseRow; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="outline">{item.dayName}</Badge>
          <p className="mt-2 font-medium">{item.exerciseName || "Latihan"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.muscleGroup} · {item.equipmentRow || "Alat bebas"}</p>
          <p className="mt-1 text-sm tabular-nums text-muted-foreground">{item.sets} set · {item.reps || "-"}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Edit latihan" onClick={onEdit}>
            <Pencil size={15} />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Hapus latihan" onClick={onDelete} disabled={!canDelete}>
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function HumanBodyPicker({ side, selected, onSelect }: { side: "front" | "back"; selected: string; onSelect: (muscle: string) => void }) {
  const frontMuscles = ["Chest", "Shoulders", "Biceps", "Core", "Quads", "Cardio", "Full Body"]
  const backMuscles = ["Back", "Shoulders", "Triceps", "Hamstrings", "Glutes", "Calves", "Cardio", "Full Body"]
  const muscles = side === "front" ? frontMuscles : backMuscles
  const buttonClass = (muscle: string) => selected === muscle ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"

  return (
    <div className="rounded-xl border border-border bg-muted/25 p-4">
      <div className="grid gap-4 md:grid-cols-[15rem_1fr] xl:grid-cols-1">
        <svg viewBox="0 0 220 320" className="mx-auto h-72 w-52 max-w-full" role="img" aria-label={`Human body ${side}`}>
          <circle cx="110" cy="32" r="20" className={selected === "Shoulders" ? "fill-primary/80" : "fill-muted-foreground/25"} />
          {side === "front" ? (
            <>
              <path d="M72 68 Q110 48 148 68 L139 111 Q110 126 81 111 Z" className={bodyFill(selected, "Chest")} onClick={() => onSelect("Chest")} />
              <path d="M83 113 Q110 130 137 113 L130 188 Q110 204 90 188 Z" className={bodyFill(selected, "Core")} onClick={() => onSelect("Core")} />
              <path d="M50 75 Q67 62 82 76 L70 166 Q55 169 45 155 Z" className={bodyFill(selected, "Biceps")} onClick={() => onSelect("Biceps")} />
              <path d="M170 75 Q153 62 138 76 L150 166 Q165 169 175 155 Z" className={bodyFill(selected, "Biceps")} onClick={() => onSelect("Biceps")} />
              <path d="M80 188 L104 188 L98 292 Q76 294 68 270 Z" className={bodyFill(selected, "Quads")} onClick={() => onSelect("Quads")} />
              <path d="M116 188 L140 188 L152 270 Q144 294 122 292 Z" className={bodyFill(selected, "Quads")} onClick={() => onSelect("Quads")} />
              <path d="M56 66 Q73 52 91 64 L82 82 Q66 76 55 91 Z" className={bodyFill(selected, "Shoulders")} onClick={() => onSelect("Shoulders")} />
              <path d="M164 66 Q147 52 129 64 L138 82 Q154 76 165 91 Z" className={bodyFill(selected, "Shoulders")} onClick={() => onSelect("Shoulders")} />
            </>
          ) : (
            <>
              <path d="M72 68 Q110 50 148 68 L140 136 Q110 156 80 136 Z" className={bodyFill(selected, "Back")} onClick={() => onSelect("Back")} />
              <path d="M83 138 Q110 154 137 138 L132 189 Q110 204 88 189 Z" className={bodyFill(selected, "Glutes")} onClick={() => onSelect("Glutes")} />
              <path d="M50 75 Q67 62 82 76 L70 166 Q55 169 45 155 Z" className={bodyFill(selected, "Triceps")} onClick={() => onSelect("Triceps")} />
              <path d="M170 75 Q153 62 138 76 L150 166 Q165 169 175 155 Z" className={bodyFill(selected, "Triceps")} onClick={() => onSelect("Triceps")} />
              <path d="M80 188 L104 188 L98 260 Q78 264 70 244 Z" className={bodyFill(selected, "Hamstrings")} onClick={() => onSelect("Hamstrings")} />
              <path d="M116 188 L140 188 L150 244 Q142 264 122 260 Z" className={bodyFill(selected, "Hamstrings")} onClick={() => onSelect("Hamstrings")} />
              <path d="M72 252 Q85 266 98 262 L96 294 Q78 296 68 278 Z" className={bodyFill(selected, "Calves")} onClick={() => onSelect("Calves")} />
              <path d="M122 262 Q135 266 148 252 L152 278 Q142 296 124 294 Z" className={bodyFill(selected, "Calves")} onClick={() => onSelect("Calves")} />
              <path d="M56 66 Q73 52 91 64 L82 82 Q66 76 55 91 Z" className={bodyFill(selected, "Shoulders")} onClick={() => onSelect("Shoulders")} />
              <path d="M164 66 Q147 52 129 64 L138 82 Q154 76 165 91 Z" className={bodyFill(selected, "Shoulders")} onClick={() => onSelect("Shoulders")} />
            </>
          )}
        </svg>
        <div className="grid content-start gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {muscles.map((muscle) => (
            <button key={muscle} type="button" onClick={() => onSelect(muscle)} className={`h-10 rounded-md border border-border px-3 text-left text-sm font-medium transition ${buttonClass(muscle)}`}>
              {muscle}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function bodyFill(selected: string, muscle: string) {
  return selected === muscle
    ? "cursor-pointer fill-primary transition"
    : "cursor-pointer fill-muted-foreground/30 transition hover:fill-primary/50"
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
