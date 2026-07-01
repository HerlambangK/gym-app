"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  label,
  suffix,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  suffix?: string
}) {
  function clamp(val: number) {
    return Math.min(max, Math.max(min, val))
  }

  return (
    <div className="grid gap-2">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <div className="flex items-center gap-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-r-none border-r-0"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label="Kurangi"
        >
          <Minus size={16} />
        </Button>
        <div className="relative flex-1">
          <Input
            type="number"
            value={value}
            onChange={(event) => {
              const parsed = Number(event.target.value)
              if (!isNaN(parsed)) onChange(clamp(parsed))
            }}
            min={min}
            max={max}
            step={step}
            className="h-10 rounded-none text-center [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-l-none border-l-0"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label="Tambah"
        >
          <Plus size={16} />
        </Button>
        {suffix ? (
          <span className="ml-3 min-w-fit text-sm text-muted-foreground">{suffix}</span>
        ) : null}
      </div>
    </div>
  )
}
