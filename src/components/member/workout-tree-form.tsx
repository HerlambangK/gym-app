"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import Model, { type IExerciseData, type IMuscleStats, type Muscle } from "react-body-highlighter"
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
  id: string
  name: string
  type: string
  muscle: string
  muscleGroupId: string
  focus: string
  primary: string
  support: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  highlightedMuscles: Muscle[]
  equipment: string
  reps: string
  defaultSets: string
  defaultRpe: string
  note: string
  side: "front" | "back" | "both"
}

const initialState: ActionState = { ok: false, message: "" }
const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
const tabs = [
  { id: "program", label: "Workout", icon: Dumbbell },
  { id: "history", label: "History Log", icon: History },
  { id: "daily", label: "Daily Workout", icon: CalendarDays },
] as const

const muscleGroups = [
  { id: "chest", label: "Chest", side: "front" },
  { id: "shoulders", label: "Shoulders", side: "front" },
  { id: "biceps", label: "Biceps", side: "front" },
  { id: "core", label: "Core", side: "front" },
  { id: "quads", label: "Quads", side: "front" },
  { id: "back", label: "Back", side: "back" },
  { id: "rear_shoulders", label: "Rear Shoulders", side: "back" },
  { id: "triceps", label: "Triceps", side: "back" },
  { id: "lower_back", label: "Lower Back", side: "back" },
  { id: "glutes", label: "Glutes", side: "back" },
  { id: "hamstrings", label: "Hamstrings", side: "back" },
  { id: "calves", label: "Calves", side: "both" },
  { id: "cardio", label: "Cardio", side: "front" },
  { id: "full_body", label: "Full Body", side: "both" },
] as const

type MuscleGroupId = (typeof muscleGroups)[number]["id"]

const exerciseLibrary: ExerciseTemplate[] = [
  ex("bench_press", "Bench Press", "chest", "Strength", "Barbell", ["Chest"], ["Triceps", "Front Shoulder"], "3-4", "8-12", "7-8", ["chest", "triceps", "front-deltoids"], "Kunci scapula, turunkan bar terkontrol ke dada tengah."),
  ex("incline_dumbbell_press", "Incline Dumbbell Press", "chest", "Strength", "Dumbbell", ["Upper Chest"], ["Triceps", "Shoulder"], "3-4", "8-12", "7-8", ["chest", "triceps", "front-deltoids"], "Gunakan incline sedang dan jaga dumbbell stabil di atas dada."),
  ex("chest_fly", "Chest Fly", "chest", "Isolation", "Machine/Dumbbell", ["Chest"], ["Shoulder"], "3", "12-15", "7", ["chest", "front-deltoids"], "Buka lengan secukupnya tanpa memaksa bahu."),
  ex("push_up", "Push Up", "chest", "Bodyweight", "Bodyweight", ["Chest"], ["Triceps", "Core"], "3", "10-20", "7", ["chest", "triceps", "abs"], "Jaga badan lurus dari bahu sampai tumit."),
  ex("cable_crossover", "Cable Crossover", "chest", "Isolation", "Cable", ["Chest"], ["Shoulder"], "3", "12-15", "7", ["chest", "front-deltoids"], "Arahkan siku sedikit menekuk dan fokus kontraksi dada."),
  ex("shoulder_press", "Shoulder Press", "shoulders", "Strength", "Dumbbell/Barbell", ["Shoulders"], ["Triceps"], "3-4", "8-12", "7-8", ["front-deltoids", "triceps"], "Tekan lurus ke atas tanpa melengkungkan pinggang berlebihan."),
  ex("lateral_raise", "Lateral Raise", "shoulders", "Isolation", "Dumbbell", ["Side Delts"], ["Traps"], "3", "12-15", "7", ["front-deltoids", "trapezius"], "Angkat sampai setinggi bahu dan jangan mengayun."),
  ex("front_raise", "Front Raise", "shoulders", "Isolation", "Dumbbell", ["Front Delts"], ["Chest"], "3", "12-15", "7", ["front-deltoids", "chest"], "Naikkan beban terkontrol sampai sejajar bahu."),
  ex("arnold_press", "Arnold Press", "shoulders", "Strength", "Dumbbell", ["Shoulders"], ["Triceps"], "3", "8-12", "7-8", ["front-deltoids", "triceps"], "Putar dumbbell halus, jangan memaksa bahu."),
  ex("upright_row", "Upright Row", "shoulders", "Strength", "Barbell/Cable", ["Shoulders"], ["Traps", "Biceps"], "3", "10-12", "7", ["front-deltoids", "trapezius", "biceps"], "Tarik sampai dada atas dengan siku tetap nyaman."),
  ex("barbell_curl", "Barbell Curl", "biceps", "Isolation", "Barbell", ["Biceps"], ["Forearm"], "3", "8-12", "7-8", ["biceps", "forearm"], "Jaga siku dekat badan dan hindari ayunan pinggang."),
  ex("dumbbell_curl", "Dumbbell Curl", "biceps", "Isolation", "Dumbbell", ["Biceps"], ["Forearm"], "3", "10-12", "7", ["biceps", "forearm"], "Putar telapak ke atas saat naik untuk kontraksi penuh."),
  ex("hammer_curl", "Hammer Curl", "biceps", "Isolation", "Dumbbell", ["Biceps", "Brachialis"], ["Forearm"], "3", "10-12", "7", ["biceps", "forearm"], "Pegang netral dan kontrol fase turun."),
  ex("preacher_curl", "Preacher Curl", "biceps", "Isolation", "Machine/Barbell", ["Biceps"], ["Forearm"], "3", "10-12", "7", ["biceps", "forearm"], "Jangan mengunci siku di bawah."),
  ex("cable_curl", "Cable Curl", "biceps", "Isolation", "Cable", ["Biceps"], ["Forearm"], "3", "12-15", "7", ["biceps", "forearm"], "Jaga tegangan kabel sepanjang repetisi."),
  ex("crunch", "Crunch", "core", "Core", "Bodyweight", ["Abs"], ["Core"], "3", "15-20", "7", ["abs"], "Angkat bahu dari lantai tanpa menarik leher."),
  ex("leg_raise", "Leg Raise", "core", "Core", "Bodyweight", ["Lower Abs"], ["Hip Flexor"], "3", "12-15", "7", ["abs"], "Tekan pinggang bawah tetap stabil."),
  ex("plank", "Plank", "core", "Core", "Bodyweight", ["Core"], ["Shoulder", "Glutes"], "3", "30-60 detik", "7", ["abs", "obliques", "front-deltoids", "gluteal"], "Jaga napas dan posisi pinggul sejajar."),
  ex("russian_twist", "Russian Twist", "core", "Core", "Bodyweight/Plate", ["Oblique"], ["Abs"], "3", "15/side", "7", ["obliques", "abs"], "Putar dari torso, bukan hanya tangan."),
  ex("mountain_climber", "Mountain Climber", "core", "Cardio/Core", "Bodyweight", ["Core"], ["Shoulder", "Legs"], "3", "30-60 detik", "8", ["abs", "front-deltoids", "quadriceps"], "Pertahankan bahu di atas pergelangan tangan."),
  ex("squat", "Squat", "quads", "Compound", "Barbell", ["Quadriceps"], ["Glutes", "Hamstrings", "Core"], "3-4", "8-12", "7-8", ["quadriceps", "gluteal", "hamstring", "abs"], "Jaga dada terbuka dan lutut mengikuti arah ujung kaki."),
  ex("leg_press", "Leg Press", "quads", "Strength", "Machine", ["Quadriceps"], ["Glutes", "Hamstrings"], "3-4", "10-12", "7-8", ["quadriceps", "gluteal", "hamstring"], "Jaga lutut searah dengan ujung kaki, jangan mengunci lutut di atas."),
  ex("leg_extension", "Leg Extension", "quads", "Isolation", "Machine", ["Quadriceps"], [], "3", "12-15", "7", ["quadriceps"], "Tahan sebentar di atas dan turunkan pelan."),
  ex("front_squat", "Front Squat", "quads", "Strength", "Barbell", ["Quadriceps"], ["Core", "Glutes"], "3-4", "6-10", "7-8", ["quadriceps", "abs", "gluteal"], "Pertahankan siku tinggi agar torso tetap tegak."),
  ex("walking_lunge", "Walking Lunge", "quads", "Strength", "Dumbbell", ["Quadriceps"], ["Glutes", "Hamstrings"], "3", "10/side", "7", ["quadriceps", "gluteal", "hamstring"], "Langkah stabil dan lutut depan tidak masuk ke dalam."),
  ex("bulgarian_split_squat_quads", "Bulgarian Split Squat", "quads", "Strength", "Dumbbell", ["Quadriceps"], ["Glutes", "Core"], "3", "8-10/side", "8", ["quadriceps", "gluteal", "abs"], "Turun perlahan, dorong lewat kaki depan."),
  ex("lunges", "Lunges", "quads", "Strength", "Bodyweight/Dumbbell", ["Quadriceps"], ["Glutes", "Hamstrings"], "3", "10/side", "7", ["quadriceps", "gluteal", "hamstring"], "Jaga langkah sejajar dan kontrol keseimbangan."),
  ex("pull_up", "Pull Up", "back", "Compound", "Bodyweight", ["Back/Lats"], ["Biceps", "Rear Delts"], "3", "6-10", "8", ["upper-back", "biceps", "back-deltoids"], "Tarik dada ke arah bar dan turunkan penuh terkontrol."),
  ex("lat_pulldown", "Lat Pulldown", "back", "Strength", "Machine", ["Lats"], ["Biceps"], "3-4", "10-12", "7-8", ["upper-back", "biceps"], "Tarik ke dada atas, jangan menarik dengan leher."),
  ex("barbell_row", "Barbell Row", "back", "Compound", "Barbell", ["Back"], ["Biceps", "Core"], "3-4", "8-12", "7-8", ["upper-back", "lower-back", "biceps", "abs"], "Pinggul hinge stabil, tarik bar ke perut bawah."),
  ex("seated_cable_row", "Seated Cable Row", "back", "Strength", "Cable", ["Mid Back"], ["Biceps"], "3", "10-12", "7", ["upper-back", "biceps"], "Tarik siku ke belakang dan rapatkan scapula."),
  ex("one_arm_dumbbell_row", "One Arm Dumbbell Row", "back", "Strength", "Dumbbell", ["Lats"], ["Biceps", "Core"], "3", "10/side", "7", ["upper-back", "biceps", "abs"], "Jaga punggung rata dan tarik siku ke pinggang."),
  ex("face_pull", "Face Pull", "rear_shoulders", "Isolation", "Cable", ["Rear Delts", "Upper Back"], ["Traps"], "3", "12-15", "7", ["back-deltoids", "upper-back", "trapezius"], "Tarik tali ke arah wajah dengan siku terbuka."),
  ex("triceps_pushdown", "Triceps Pushdown", "triceps", "Isolation", "Cable", ["Triceps"], ["Forearm"], "3", "12-15", "7", ["triceps", "forearm"], "Kunci siku di sisi badan dan tekan sampai lurus."),
  ex("overhead_triceps_extension", "Overhead Triceps Extension", "triceps", "Isolation", "Dumbbell/Cable", ["Triceps Long Head"], ["Shoulder"], "3", "10-12", "7", ["triceps", "front-deltoids"], "Jaga siku mengarah ke depan dan turun terkontrol."),
  ex("close_grip_bench_press", "Close Grip Bench Press", "triceps", "Strength", "Barbell", ["Triceps"], ["Chest", "Shoulder"], "3", "8-10", "8", ["triceps", "chest", "front-deltoids"], "Gunakan grip rapat nyaman, siku tidak melebar berlebihan."),
  ex("skull_crusher", "Skull Crusher", "triceps", "Isolation", "EZ Bar", ["Triceps"], ["Forearm"], "3", "10-12", "7", ["triceps", "forearm"], "Turunkan bar ke arah dahi dengan siku stabil."),
  ex("dips", "Dips", "triceps", "Compound", "Bodyweight", ["Triceps"], ["Chest", "Shoulder"], "3", "8-12", "8", ["triceps", "chest", "front-deltoids"], "Turun hanya sejauh bahu tetap nyaman."),
  ex("deadlift", "Deadlift", "lower_back", "Compound", "Barbell", ["Lower Back"], ["Hamstrings", "Glutes", "Core"], "3", "5-8", "8", ["lower-back", "hamstring", "gluteal", "abs"], "Brace core kuat dan dekatkan bar ke kaki."),
  ex("hip_thrust", "Hip Thrust", "glutes", "Strength", "Barbell", ["Glutes"], ["Hamstrings", "Core"], "3-4", "8-12", "7-8", ["gluteal", "hamstring", "abs"], "Dorong pinggul sampai lockout tanpa melengkungkan pinggang."),
  ex("glute_bridge", "Glute Bridge", "glutes", "Strength", "Bodyweight/Barbell", ["Glutes"], ["Hamstrings"], "3", "12-15", "7", ["gluteal", "hamstring"], "Tekan tumit ke lantai dan tahan kontraksi di atas."),
  ex("cable_kickback", "Cable Kickback", "glutes", "Isolation", "Cable", ["Glutes"], ["Hamstrings"], "3", "12-15", "7", ["gluteal", "hamstring"], "Gerakkan dari pinggul, bukan pinggang."),
  ex("sumo_squat", "Sumo Squat", "glutes", "Strength", "Dumbbell/Barbell", ["Glutes"], ["Quads", "Hamstrings"], "3", "10-12", "7", ["gluteal", "quadriceps", "hamstring"], "Buka kaki lebih lebar dan dorong lutut keluar."),
  ex("step_up", "Step Up", "glutes", "Strength", "Dumbbell", ["Glutes"], ["Quads", "Core"], "3", "10/side", "7", ["gluteal", "quadriceps", "abs"], "Naik dengan kaki depan, jangan memantul dari kaki belakang."),
  ex("romanian_deadlift", "Romanian Deadlift", "hamstrings", "Strength", "Barbell/Dumbbell", ["Hamstrings"], ["Glutes", "Lower Back"], "3-4", "8-12", "7-8", ["hamstring", "gluteal", "lower-back"], "Hinge dari pinggul dan rasakan hamstring meregang."),
  ex("leg_curl", "Leg Curl", "hamstrings", "Isolation", "Machine", ["Hamstrings"], ["Calves"], "3", "12-15", "7", ["hamstring", "calves"], "Tahan kontraksi di bawah dan kembali pelan."),
  ex("stiff_leg_deadlift", "Stiff Leg Deadlift", "hamstrings", "Strength", "Barbell", ["Hamstrings"], ["Glutes", "Lower Back"], "3", "8-10", "7-8", ["hamstring", "gluteal", "lower-back"], "Jaga lutut sedikit menekuk, bukan terkunci."),
  ex("good_morning", "Good Morning", "hamstrings", "Strength", "Barbell", ["Hamstrings"], ["Lower Back", "Glutes"], "3", "8-10", "7", ["hamstring", "lower-back", "gluteal"], "Turunkan torso dengan punggung netral."),
  ex("standing_calf_raise", "Standing Calf Raise", "calves", "Isolation", "Machine", ["Calves"], ["Soleus"], "3-4", "12-20", "7", ["calves"], "Naik penuh ke ujung kaki dan turun sampai stretch."),
  ex("seated_calf_raise", "Seated Calf Raise", "calves", "Isolation", "Machine", ["Soleus"], ["Gastrocnemius"], "3-4", "12-20", "7", ["calves"], "Tahan di atas satu detik untuk kontraksi betis."),
  ex("calf_press", "Calf Press", "calves", "Isolation", "Machine", ["Calves"], [], "3", "12-20", "7", ["calves"], "Gunakan rentang gerak penuh tanpa memantul."),
  ex("jump_rope_calves", "Jump Rope", "calves", "Cardio", "Bodyweight", ["Calves"], ["Shoulder", "Core"], "3", "1-3 menit", "7", ["calves", "front-deltoids", "abs"], "Mendarat ringan dengan lutut sedikit menekuk."),
  ex("treadmill_run", "Treadmill Run", "cardio", "Cardio", "Machine", ["Cardio"], ["Legs", "Core"], "1", "10-30 menit", "6-8", ["quadriceps", "hamstring", "calves", "abs"], "Mulai dari pace nyaman lalu naikkan bertahap."),
  ex("cycling", "Cycling", "cardio", "Cardio", "Bike", ["Cardio & Legs"], ["Quads", "Hamstrings", "Calves"], "1", "10-30 menit", "6-8", ["quadriceps", "hamstring", "calves"], "Atur resistance agar kayuhan tetap stabil."),
  ex("stair_climber", "Stair Climber", "cardio", "Cardio", "Machine", ["Cardio & Legs"], ["Glutes", "Quads", "Calves"], "1", "10-20 menit", "7-8", ["gluteal", "quadriceps", "calves"], "Jangan terlalu bertumpu pada pegangan."),
  ex("rowing_machine", "Rowing Machine", "cardio", "Cardio", "Machine", ["Full Body"], ["Back", "Legs", "Core", "Arms"], "1", "10-20 menit", "7", ["upper-back", "quadriceps", "hamstring", "abs", "biceps"], "Dorong dengan kaki dulu, lalu tarik handle ke rusuk."),
  ex("hiit", "HIIT", "cardio", "Cardio", "Bodyweight", ["Full Body"], ["Core", "Legs", "Shoulder"], "1", "10-20 menit", "8", ["chest", "quadriceps", "hamstring", "abs", "front-deltoids"], "Pilih interval yang tetap menjaga teknik gerak."),
  ex("full_body_squat", "Squat", "full_body", "Compound", "Barbell", ["Legs", "Glutes", "Core"], [], "3-4", "8-12", "7-8", ["quadriceps", "gluteal", "hamstring", "abs"], "Jadikan sebagai gerakan compound utama untuk lower body."),
  ex("full_body_deadlift", "Deadlift", "full_body", "Compound", "Barbell", ["Back", "Hamstrings", "Glutes", "Core"], [], "3", "5-8", "8", ["lower-back", "hamstring", "gluteal", "abs"], "Prioritaskan teknik hinge dan brace sebelum menambah beban."),
  ex("full_body_bench_press", "Bench Press", "full_body", "Compound", "Barbell", ["Chest", "Triceps", "Shoulder"], [], "3-4", "8-12", "7-8", ["chest", "triceps", "front-deltoids"], "Gunakan sebagai gerakan push utama."),
  ex("full_body_pull_up", "Pull Up", "full_body", "Compound", "Bodyweight", ["Back", "Biceps"], [], "3", "6-10", "8", ["upper-back", "biceps", "back-deltoids"], "Gunakan bantuan band bila repetisi belum stabil."),
  ex("full_body_overhead_press", "Overhead Press", "full_body", "Compound", "Barbell", ["Shoulders", "Triceps", "Core"], [], "3", "6-10", "7-8", ["front-deltoids", "triceps", "abs"], "Jaga core aktif saat menekan beban ke atas."),
  ex("full_body_barbell_row", "Barbell Row", "full_body", "Compound", "Barbell", ["Back", "Biceps"], [], "3-4", "8-12", "7-8", ["upper-back", "lower-back", "biceps"], "Tarik bar dengan punggung tetap netral."),
  ex("full_body_lunges", "Lunges", "full_body", "Compound", "Bodyweight/Dumbbell", ["Legs", "Glutes", "Core"], [], "3", "10/side", "7", ["quadriceps", "gluteal", "hamstring", "abs"], "Pilih langkah yang stabil dan tidak terlalu sempit."),
]

const muscleMap: Record<string, Muscle[]> = {
  Chest: ["chest"],
  Back: ["upper-back", "trapezius"],
  Shoulders: ["front-deltoids"],
  "Rear Shoulders": ["back-deltoids"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Core: ["abs", "obliques"],
  Quads: ["quadriceps"],
  "Lower Back": ["lower-back"],
  Hamstrings: ["hamstring"],
  Glutes: ["gluteal"],
  Calves: ["calves"],
  Cardio: ["quadriceps", "hamstring", "calves"],
  "Full Body": ["chest", "upper-back", "quadriceps", "hamstring", "abs"],
}

const highlighterMuscleMap: Partial<Record<Muscle, string>> = {
  chest: "Chest",
  biceps: "Biceps",
  triceps: "Triceps",
  forearm: "Biceps",
  "front-deltoids": "Shoulders",
  "back-deltoids": "Rear Shoulders",
  abs: "Core",
  obliques: "Core",
  quadriceps: "Quads",
  adductor: "Quads",
  abductors: "Glutes",
  hamstring: "Hamstrings",
  calves: "Calves",
  gluteal: "Glutes",
  trapezius: "Back",
  "upper-back": "Back",
  "lower-back": "Lower Back",
}

const muscleCategoryLabels: Record<string, string> = {
  Chest: "Dada / Chest",
  Back: "Punggung / Back",
  Shoulders: "Bahu / Shoulder",
  "Rear Shoulders": "Bahu Belakang / Rear Shoulder",
  Biceps: "Lengan Depan / Biceps",
  Triceps: "Lengan Belakang / Triceps",
  "Lower Back": "Punggung Bawah / Lower Back",
  Quads: "Kaki Depan / Quadriceps",
  Hamstrings: "Kaki Belakang / Hamstring",
  Glutes: "Bokong / Glutes",
  Calves: "Betis / Calves",
  Core: "Perut / Core",
  Cardio: "Cardio",
  "Full Body": "Compound / Full Body",
}

function ex(
  id: string,
  name: string,
  muscleGroupId: MuscleGroupId,
  type: string,
  equipment: string,
  primaryMuscles: string[],
  secondaryMuscles: string[],
  defaultSets: string,
  defaultReps: string,
  defaultRpe: string,
  highlightedMuscles: Muscle[],
  note: string,
): ExerciseTemplate {
  const muscleGroup = muscleGroups.find((group) => group.id === muscleGroupId)
  const primary = primaryMuscles.join(", ")
  const support = secondaryMuscles.join(", ")
  return {
    id,
    name,
    type,
    muscle: muscleGroup?.label ?? muscleGroupId,
    muscleGroupId,
    primary,
    support,
    primaryMuscles,
    secondaryMuscles,
    highlightedMuscles,
    equipment,
    reps: defaultReps,
    defaultSets,
    defaultRpe,
    note,
    side: muscleGroup?.side ?? "front",
    focus: support && support !== "-" ? `${primary} · pendukung: ${support}` : primary,
  }
}

function exerciseKind(item: ExerciseTemplate) {
  return item.type
}

function exerciseCategory(item: ExerciseTemplate) {
  return muscleCategoryLabels[item.muscle] ?? item.muscle
}

function defaultExerciseForMuscle(muscle: string) {
  const group = muscleGroups.find((item) => item.label === muscle)
  const preferredId = group?.id === "quads" ? "leg_press" : undefined
  return exerciseLibrary.find((item) => item.id === preferredId)
    ?? exerciseLibrary.find((item) => item.muscleGroupId === group?.id)
    ?? null
}

function numericSets(value: string) {
  const match = value.match(/\d+/)
  return Math.max(0, Number(match?.[0] ?? 3))
}

function defaultLoadNote(item: ExerciseTemplate) {
  return `Set ${item.defaultSets} · RPE ${item.defaultRpe} · ${item.note}`
}

function rowFromExercise(item: ExerciseTemplate, id: string, dayName: string, current?: ExerciseRow | null): ExerciseRow {
  return {
    ...(current ?? row(id, dayName, "", "Strength", item.muscle, item.focus, item.equipment, numericSets(item.defaultSets), item.reps, "")),
    id: current?.id ?? id,
    dayName: current?.dayName ?? dayName,
    exerciseName: item.name,
    exerciseType: exerciseKind(item),
    muscleGroup: item.muscle,
    focus: item.focus,
    equipmentRow: item.equipment,
    sets: numericSets(item.defaultSets),
    reps: item.reps,
    loadNote: defaultLoadNote(item),
  }
}

const templateRows = [
  templateRow("template-bench", "Senin", "Bench Press"),
  templateRow("template-leg-press", "Senin", "Leg Press"),
  templateRow("template-lat-pulldown", "Rabu", "Lat Pulldown"),
  templateRow("template-shoulder-press", "Rabu", "Shoulder Press"),
  templateRow("template-leg-curl", "Jumat", "Leg Curl"),
  templateRow("template-plank", "Jumat", "Plank"),
]

function templateRow(id: string, dayName: string, exerciseName: string) {
  const item = exerciseLibrary.find((exercise) => exercise.name === exerciseName)
  if (item) return rowFromExercise(item, id, dayName)
  return row(
    id,
    dayName,
    exerciseName,
    "Strength",
    "Chest",
    "",
    "",
    3,
    "8-12",
    "",
  )
}

export function WorkoutTreeForm({
  program,
  profile,
  profileIncomplete,
  gender,
}: {
  program: WorkoutProgram
  profile: WorkoutProfile
  profileIncomplete: boolean
  gender: string
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
  const [quickDialogOpen, setQuickDialogOpen] = useState(false)
  const [quickExerciseId, setQuickExerciseId] = useState("")
  const [quickQuery, setQuickQuery] = useState("")
  const [quickReps, setQuickReps] = useState("")
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
  const selectedExercise = useMemo(() => {
    if (!editingRow?.exerciseName) return exerciseLibrary.find((item) => item.muscle === selectedMuscle) ?? null
    return exerciseLibrary.find((item) =>
      item.name.toLowerCase() === editingRow.exerciseName.toLowerCase()
      && item.muscle === editingRow.muscleGroup
    ) ?? exerciseLibrary.find((item) => item.name.toLowerCase() === editingRow.exerciseName.toLowerCase()) ?? null
  }, [editingRow, selectedMuscle])
  const bodyData = useMemo(() => buildBodyData(editingRow, selectedExercise), [editingRow, selectedExercise])
  const visibleLibrary = useMemo(() => exerciseLibrary.filter((item) => item.muscle === selectedMuscle), [selectedMuscle])
  const quickMatches = useMemo(() => {
    const query = quickQuery.trim().toLowerCase()
    const source = query
      ? exerciseLibrary.filter((item) =>
          `${item.name} ${item.muscle} ${item.type}`.toLowerCase().includes(query)
        )
      : exerciseLibrary
    return source.slice(0, 8)
  }, [quickQuery])

  useEffect(() => {
    if (!state.message) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  function openCreateDialog() {
    const firstExercise = defaultExerciseForMuscle(selectedMuscle)
    setEditingRow(firstExercise
      ? rowFromExercise(firstExercise, `custom-${Date.now()}`, dashboard.todayName)
      : row(`custom-${Date.now()}`, dashboard.todayName, "", "Strength", selectedMuscle, "", "", 3, "8-12", ""))
    setDialogOpen(true)
  }

  function openQuickDialog() {
    const todayExercise = rows.find((item) => item.dayName === dashboard.todayName)
    const fallback = todayExercise
      ? exerciseLibrary.find((item) => item.name === todayExercise.exerciseName && item.muscle === todayExercise.muscleGroup)
      : defaultExerciseForMuscle(selectedMuscle)
    setQuickExerciseId(fallback?.id ?? "")
    setQuickQuery(fallback?.name ?? "")
    setQuickReps(fallback?.reps ?? "")
    setQuickDialogOpen(true)
  }

  function openEditDialog(item: ExerciseRow) {
    const template = exerciseLibrary.find((exercise) =>
      exercise.name.toLowerCase() === item.exerciseName.toLowerCase()
      && exercise.muscle === item.muscleGroup
    ) ?? exerciseLibrary.find((exercise) => exercise.name.toLowerCase() === item.exerciseName.toLowerCase())
    setBodySide(template?.side === "back" ? "back" : "front")
    setSelectedMuscle(item.muscleGroup || "Chest")
    setEditingRow(item)
    setDialogOpen(true)
  }

  function applyExercise(item: ExerciseTemplate) {
    setBodySide(item.side === "back" || (item.side === "both" && bodySide === "back") ? "back" : "front")
    setSelectedMuscle(item.muscle)
    setEditingRow((current) => rowFromExercise(item, `custom-${Date.now()}`, dashboard.todayName, current))
  }

  function selectMuscleGroup(muscle: string) {
    setSelectedMuscle(muscle)
    const item = defaultExerciseForMuscle(muscle)
    if (!item) {
      setEditingRow((current) => current ? { ...current, muscleGroup: muscle } : current)
      return
    }
    setBodySide(item.side === "back" || (item.side === "both" && bodySide === "back") ? "back" : "front")
    setEditingRow((current) => rowFromExercise(item, `custom-${Date.now()}`, dashboard.todayName, current))
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

  function selectQuickExercise(item: ExerciseTemplate) {
    setQuickExerciseId(item.id)
    setQuickQuery(item.name)
    setQuickReps(item.reps)
  }

  function addQuickToday() {
    const query = quickQuery.trim().toLowerCase()
    const selected = exerciseLibrary.find((item) => item.id === quickExerciseId)
      ?? exerciseLibrary.find((item) => item.name.toLowerCase() === query)
      ?? exerciseLibrary.find((item) => `${item.name} ${item.muscle}`.toLowerCase().includes(query))

    if (!selected) {
      toast.error("Pilih jenis latihan dari dropdown dulu.")
      return
    }

    const reps = quickReps.trim() || selected.reps
    const nextRow = {
      ...rowFromExercise(selected, `today-${Date.now()}`, dashboard.todayName),
      reps,
      loadNote: `${defaultLoadNote(selected)} · Input cepat hari ini`,
    }
    setRows((current) => [...current, nextRow])
    setSelectedMuscle(selected.muscle)
    setBodySide(selected.side === "back" ? "back" : "front")
    setQuickDialogOpen(false)
    setActiveTab("history")
    toast.success(`${selected.name} ditambahkan ke progres hari ini. Klik Simpan Program untuk menyimpan ke database.`)
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {profileIncomplete ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <WorkoutStat icon={Dumbbell} label="Latihan" value={`${rows.length}`} helper={`${dashboard.trainingDays} hari aktif`} />
        <WorkoutStat icon={Flame} label="Volume" value={`${dashboard.totalSets} set`} helper={`${dashboard.avgSetsPerDay} set/hari latihan`} />
        <WorkoutStat icon={CheckCircle2} label="Balance" value={`${dashboard.balanceScore}%`} helper={`${dashboard.muscleCount} area otot`} />
        <WorkoutStat icon={CalendarDays} label="Hari ini" value={dashboard.todayCount ? `${dashboard.todayCount} latihan` : "Rest"} helper={dashboard.todayName} />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="font-semibold">Workout profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {workoutGoal} · {workoutLevel} · {workoutDays}x/minggu · {workoutDuration} menit
            </p>
          </div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-2 sm:flex sm:flex-row sm:items-center">
            <Badge variant="secondary">{dashboard.totalSets} set/minggu</Badge>
            <Button type="button" className="gap-2" onClick={openQuickDialog}>
              <Plus size={16} />
              Input Hari Ini
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/25 p-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition sm:h-10 sm:gap-2 sm:px-3 ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "program" ? (
        <form action={action} className="space-y-3 sm:space-y-6">
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
            <CardHeader className="p-3 pb-2 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>Program Latihan</CardTitle>
                  <CardDescription>Input lewat anatomy selector, daftar program tetap ringkas untuk mobile dan desktop.</CardDescription>
                </div>
                <div className="grid grid-cols-3 gap-2 lg:flex">
                  <Button type="button" variant="secondary" className="gap-1 px-2 sm:gap-2" onClick={openQuickDialog}>
                    <Plus size={16} />
                    Input Hari Ini
                  </Button>
                  <Button type="button" variant="outline" className="px-2" onClick={() => setRows(templateRows.map((item, index) => ({ ...item, id: `${item.id}-copy-${index}` })))}>
                    Pakai Template
                  </Button>
                  <Button type="button" className="gap-1 px-2 sm:gap-2" onClick={openCreateDialog}>
                    <Plus size={16} />
                    Tambah Latihan
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-3">
                <Input name="title" defaultValue={program?.title || `${workoutGoal} ${workoutDays} Hari`} placeholder="Nama program" required />
                <Button type="submit" disabled={pending || rows.length === 0}>
                  {pending ? "Menyimpan..." : "Simpan Program"}
                </Button>
              </div>

              <div className="space-y-2 md:hidden">
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
              <HumanBodyPicker
                side={bodySide}
                selected={selectedMuscle}
                gender={gender}
                data={bodyData}
                onSelect={selectMuscleGroup}
              />
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Pilih latihan {selectedMuscle}</label>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-border p-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {visibleLibrary.map((item) => (
                      <button key={item.id} type="button" onClick={() => applyExercise(item)} className={`rounded-lg border px-3 py-2 text-left text-sm transition ${editingRow?.exerciseName === item.name && editingRow.muscleGroup === item.muscle ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                        <span className="font-medium">{item.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{exerciseCategory(item)} · {exerciseKind(item)}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{item.primary} · {item.equipment} · {item.reps}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {editingRow ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Fokus otot yang dilatih</p>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <div className="rounded-md bg-background/80 p-2">
                        <p className="text-xs text-muted-foreground">Otot utama</p>
                        <p className="font-medium">{selectedExercise?.primary || editingRow.muscleGroup}</p>
                      </div>
                      <div className="rounded-md bg-background/80 p-2">
                        <p className="text-xs text-muted-foreground">Otot pendukung</p>
                        <p className="font-medium">{selectedExercise?.support || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField label="Hari" value={editingRow.dayName} onChange={(value) => setEditingRow({ ...editingRow, dayName: value })} options={days} />
                    <SelectField label="Jenis" value={editingRow.exerciseType} onChange={(value) => setEditingRow({ ...editingRow, exerciseType: value })} options={["Compound", "Strength", "Isolation", "Bodyweight", "Cardio", "Cardio/Core", "Core"]} />
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

      <Dialog open={quickDialogOpen} onOpenChange={setQuickDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Input Latihan Hari Ini</DialogTitle>
            <DialogDescription>Pilih jenis latihan dan isi reps. Detail otot, alat, set, dan catatan progres akan mengikuti library latihan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Jenis latihan</label>
              <Input
                value={quickQuery}
                onChange={(event) => {
                  setQuickQuery(event.target.value)
                  setQuickExerciseId("")
                  const selected = exerciseLibrary.find((item) => item.name.toLowerCase() === event.target.value.trim().toLowerCase())
                  if (selected) {
                    setQuickExerciseId(selected.id)
                    setQuickReps(selected.reps)
                  }
                }}
                placeholder="Ketik contoh: Leg Press"
                autoComplete="off"
              />
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border p-2">
                <div className="grid gap-2">
                  {quickMatches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectQuickExercise(item)}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition ${quickExerciseId === item.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{item.muscle} · {item.type} · {item.reps}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <TextField label="Reps hari ini" value={quickReps} onChange={setQuickReps} />

            <div className="rounded-lg border border-border bg-muted/25 p-3 text-sm text-muted-foreground">
              Masuk ke jadwal {dashboard.todayName}. Progres mingguan langsung berubah setelah ditambahkan.
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setQuickDialogOpen(false)}>Batal</Button>
              <Button type="button" onClick={addQuickToday}>Tambahkan</Button>
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
      <CardContent className="flex items-start gap-2 p-3 sm:gap-3 sm:p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:size-9">
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-0.5 truncate text-lg font-semibold sm:mt-1 sm:text-xl">{value}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">{helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ExerciseMobileCard({ item, canDelete, onEdit, onDelete }: { item: ExerciseRow; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge variant="outline">{item.dayName}</Badge>
          <p className="mt-1.5 font-medium">{item.exerciseName || "Latihan"}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{item.muscleGroup} · {item.equipmentRow || "Alat bebas"}</p>
          <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">{item.sets} set · {item.reps || "-"}</p>
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

function buildBodyData(editingRow: ExerciseRow | null, selectedExercise: ExerciseTemplate | null): IExerciseData[] {
  const muscles = selectedExercise
    ? muscleMap[selectedExercise.muscle] ?? selectedExercise.highlightedMuscles
    : (editingRow ? muscleMap[editingRow.muscleGroup] : []) ?? []

  if (!editingRow || muscles.length === 0) return []

  return [{
    name: editingRow.exerciseName || selectedExercise?.name || editingRow.muscleGroup,
    muscles,
    frequency: 1,
  }]
}

function HumanBodyPicker({
  side,
  selected,
  gender,
  data,
  onSelect,
}: {
  side: "front" | "back"
  selected: string
  gender: string
  data: IExerciseData[]
  onSelect: (muscle: string) => void
}) {
  const frontMuscles = ["Chest", "Shoulders", "Biceps", "Core", "Quads", "Calves", "Cardio", "Full Body"]
  const backMuscles = ["Back", "Rear Shoulders", "Triceps", "Lower Back", "Glutes", "Hamstrings", "Calves", "Full Body"]
  const muscles = side === "front" ? frontMuscles : backMuscles
  const buttonClass = (muscle: string) => selected === muscle ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
  const genderLabel = gender === "female" ? "Perempuan" : gender === "male" ? "Laki-laki" : "Profile"
  const bodyColor = gender === "female" ? "#d8c7bf" : "#c9d0d8"
  const highlightedColors = ["#ef4444"]

  function handleBodyClick(stats: IMuscleStats) {
    const mapped = highlighterMuscleMap[stats.muscle]
    if (mapped) onSelect(mapped)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.12),_transparent_45%),hsl(var(--card))] p-3 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{side === "front" ? "Human depan" : "Human belakang"}</p>
          <p className="text-xs text-muted-foreground">Model {genderLabel} · merah = otot dilatih</p>
        </div>
        <Badge variant="secondary">{selected}</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-[14rem_1fr] xl:grid-cols-1">
        <div className="mx-auto w-full max-w-56 rounded-lg border border-border bg-background/80 p-2">
          <Model
            type={side === "front" ? "anterior" : "posterior"}
            data={data}
            bodyColor={bodyColor}
            highlightedColors={highlightedColors}
            onClick={handleBodyClick}
            style={{ width: "100%", height: "18rem", padding: "0.25rem" }}
            svgStyle={{ filter: "drop-shadow(0 16px 28px rgba(15, 23, 42, 0.16))" }}
          />
        </div>
        <div className="grid content-start gap-2 grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
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
