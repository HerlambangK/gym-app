import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type DashboardLoadingSkeletonProps = {
  variant: "owner" | "admin" | "member"
}

const variantConfig = {
  owner: {
    metricCount: 6,
    columns: "md:grid-cols-2 xl:grid-cols-3",
    lower: "xl:grid-cols-2",
    tableRows: 5,
  },
  admin: {
    metricCount: 3,
    columns: "md:grid-cols-3",
    lower: "xl:grid-cols-2",
    tableRows: 5,
  },
  member: {
    metricCount: 2,
    columns: "md:grid-cols-2",
    lower: "xl:grid-cols-[1.2fr_0.8fr]",
    tableRows: 4,
  },
} satisfies Record<
  DashboardLoadingSkeletonProps["variant"],
  {
    metricCount: number
    columns: string
    lower: string
    tableRows: number
  }
>

function SkeletonBlock({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
}

function MetricSkeleton() {
  return (
    <div className="min-h-[126px] rounded-lg border border-border bg-card p-5 shadow-sm">
      <SkeletonBlock className="h-3 w-28" />
      <SkeletonBlock className="mt-5 h-7 w-36" />
      <SkeletonBlock className="mt-3 h-3 w-44 max-w-full" />
    </div>
  )
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-5 w-40 max-w-full" />
          <SkeletonBlock className="mt-3 h-3 w-56 max-w-full" />
        </div>
        <SkeletonBlock className="hidden h-8 w-24 sm:block" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid min-h-10 grid-cols-[1.4fr_0.9fr_0.7fr] items-center gap-3 rounded-md border border-border/70 px-3"
          >
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-6 w-16 justify-self-end rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="min-h-[320px] rounded-lg border border-border bg-card p-5 shadow-sm">
      <SkeletonBlock className="h-5 w-44" />
      <SkeletonBlock className="mt-3 h-3 w-64 max-w-full" />
      <div className="mt-8 flex h-52 items-end gap-2 sm:gap-3">
        {[45, 70, 56, 82, 64, 92, 74, 88, 58, 78, 67, 86].map((height, index) => (
          <SkeletonBlock
            key={index}
            className="min-w-0 flex-1 rounded-t-md"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function MemberActionSkeleton() {
  return (
    <div className="min-h-[360px] rounded-lg border border-border bg-card p-5 shadow-sm">
      <SkeletonBlock className="h-6 w-32" />
      <SkeletonBlock className="mt-3 h-3 w-72 max-w-full" />
      <SkeletonBlock className="mt-6 h-44 w-full" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SkeletonBlock className="h-11 w-full" />
        <SkeletonBlock className="h-11 w-full" />
      </div>
    </div>
  )
}

export function DashboardLoadingSkeleton({ variant }: DashboardLoadingSkeletonProps) {
  const config = variantConfig[variant]
  const isMember = variant === "member"

  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman dashboard.</span>
      <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-32 rounded-full" />
        </div>
        <SkeletonBlock className="h-8 w-72 max-w-full sm:h-9" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
        <SkeletonBlock className="mt-3 h-4 w-5/6 max-w-xl" />
      </div>

      <div className={cn("grid gap-4", config.columns)}>
        {Array.from({ length: config.metricCount }).map((_, index) => (
          <MetricSkeleton key={index} />
        ))}
      </div>

      {isMember ? (
        <div className={cn("grid gap-6", config.lower)}>
          <MemberActionSkeleton />
          <TableSkeleton rows={config.tableRows} />
        </div>
      ) : (
        <>
          <ChartSkeleton />
          <div className={cn("grid gap-6", config.lower)}>
            <TableSkeleton rows={config.tableRows} />
            <TableSkeleton rows={config.tableRows} />
          </div>
        </>
      )}
    </div>
  )
}
