import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  status,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  status?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {eyebrow ? <Badge variant="secondary">{eyebrow}</Badge> : null}
          {status ? <Badge variant="outline">{status}</Badge> : null}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
