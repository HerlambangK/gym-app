"use client"

import { useMemo, useState } from "react"
import Model, { type IExerciseData, type Muscle } from "react-body-highlighter"
import { Badge } from "@/components/ui/badge"

export type WorkoutMuscleIntensity = {
  label: string
  count: number
  muscles: string[]
  exercises: string[]
}

const highlightedColors = ["#fee2e2", "#fecaca", "#fca5a5", "#ef4444", "#991b1b"]

export function WorkoutBodyIntensity({ data }: { data: WorkoutMuscleIntensity[] }) {
  const [selected, setSelected] = useState<WorkoutMuscleIntensity | null>(null)
  const maxCount = Math.max(1, ...data.map((item) => item.count))
  const modelData = useMemo<IExerciseData[]>(() => data.map((item) => ({
    name: item.label,
    muscles: item.muscles as Muscle[],
    frequency: intensityBucket(item.count, maxCount),
  })), [data, maxCount])
  const topAreas = [...data].sort((a, b) => b.count - a.count).slice(0, 4)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-start">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <BodyModelCard
            label="Depan"
            type="anterior"
            data={modelData}
            onSelect={(muscle) => setSelected(findAreaByMuscle(data, muscle))}
          />
          <BodyModelCard
            label="Belakang"
            type="posterior"
            data={modelData}
            onSelect={(muscle) => setSelected(findAreaByMuscle(data, muscle))}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <span>Pudar</span>
          {highlightedColors.map((color) => (
            <span key={color} className="size-4 rounded-sm border border-border" style={{ backgroundColor: color }} />
          ))}
          <span>Pekat</span>
        </div>
      </div>

      <div className="space-y-3">
        {selected ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-red-700 dark:text-red-300">{selected.label}</p>
              <Badge variant="secondary">{selected.count} set</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{selected.exercises.slice(0, 4).join(", ")}</p>
          </div>
        ) : null}

        {topAreas.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {topAreas.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelected(item)}
                className="min-w-0 rounded-lg border border-border p-3 text-left text-sm transition hover:border-primary/50 hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate font-medium">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{item.count} set</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{item.exercises.join(", ")}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Belum ada data otot dari program aktif.
          </div>
        )}
      </div>
    </div>
  )
}

function BodyModelCard({
  label,
  type,
  data,
  onSelect,
}: {
  label: string
  type: "anterior" | "posterior"
  data: IExerciseData[]
  onSelect: (muscle: Muscle) => void
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background/80 p-2">
      <p className="px-1 pb-1 text-center text-xs font-medium text-muted-foreground">{label}</p>
      <Model
        type={type}
        data={data}
        bodyColor="#d9dee5"
        highlightedColors={highlightedColors}
        onClick={(stats) => onSelect(stats.muscle)}
        style={{ width: "100%", height: "clamp(12rem, 30vw, 19rem)", padding: "0.25rem" }}
        svgStyle={{ filter: "drop-shadow(0 12px 22px rgba(15, 23, 42, 0.14))" }}
      />
    </div>
  )
}

function intensityBucket(count: number, maxCount: number) {
  if (count <= 0) return 0
  return Math.max(1, Math.ceil((count / maxCount) * highlightedColors.length))
}

function findAreaByMuscle(data: WorkoutMuscleIntensity[], muscle: Muscle) {
  return data.find((item) => item.muscles.includes(muscle)) ?? null
}
