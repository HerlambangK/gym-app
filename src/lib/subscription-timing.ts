export type SubscriptionHealth = "safe" | "soon" | "critical" | "expired"

export type SubscriptionTimingInput = {
  startDate: string | Date
  endDate: string | Date
  now?: Date
}

export type SubscriptionTiming = {
  status: SubscriptionHealth
  statusLabel: string
  alertTitle: string
  remainingMs: number
  totalMs: number
  elapsedMs: number
  remainingLabel: string
  totalLabel: string
  countdownLabel: string
  summaryLabel: string
  progressRemaining: number
  progressElapsed: number
  isExpiringSoon: boolean
  isCritical: boolean
  expired: boolean
}

const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function toJakartaDateString(value: string | Date) {
  if (value instanceof Date) return jakartaDateFormatter.format(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return jakartaDateFormatter.format(parsed)

  return value.slice(0, 10)
}

export function getJakartaDayStartMs(value: string | Date) {
  return new Date(`${toJakartaDateString(value)}T00:00:00+07:00`).getTime()
}

export function getJakartaDayEndMs(value: string | Date) {
  return new Date(`${toJakartaDateString(value)}T23:59:59.999+07:00`).getTime()
}

export function getSubscriptionTiming(input: SubscriptionTimingInput): SubscriptionTiming {
  const now = input.now?.getTime() ?? Date.now()
  const startAt = getJakartaDayStartMs(input.startDate)
  const endAt = getJakartaDayEndMs(input.endDate)
  const totalMs = Math.max(1, endAt - startAt + 1)
  const remainingMs = Math.max(0, endAt - now)
  const elapsedMs = Math.min(totalMs, Math.max(0, now - startAt))
  const progressRemaining = clampPercent(Math.round((remainingMs / totalMs) * 100))
  const progressElapsed = clampPercent(Math.round((elapsedMs / totalMs) * 100))
  const status = getSubscriptionHealth(remainingMs)
  const remainingLabel = formatDuration(remainingMs)
  const totalLabel = formatDuration(totalMs)

  return {
    status,
    statusLabel: getSubscriptionStatusLabel(status),
    alertTitle: getSubscriptionAlertTitle(status),
    remainingMs,
    totalMs,
    elapsedMs,
    remainingLabel,
    totalLabel,
    countdownLabel: `${remainingLabel} lagi`,
    summaryLabel: `${remainingLabel} dari ${totalLabel}`,
    progressRemaining,
    progressElapsed,
    isExpiringSoon: status === "soon" || status === "critical",
    isCritical: status === "critical",
    expired: status === "expired",
  }
}

export function getSubscriptionStatusLabel(status: SubscriptionHealth) {
  if (status === "expired") return "Habis"
  if (status === "critical") return "Hampir habis"
  if (status === "soon") return "Sebentar lagi habis lho"
  return "Aman untuk latihan"
}

export function getSubscriptionAlertTitle(status: SubscriptionHealth) {
  if (status === "expired") return "Subscription sudah habis"
  if (status === "critical") return "Subscription hampir habis!"
  if (status === "soon") return "Subscription sebentar lagi habis"
  return "Subscription aman untuk latihan"
}

export function formatDuration(ms: number) {
  if (ms <= 0) return "0 menit"

  const totalMinutes = Math.ceil(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) {
    if (hours > 0) return `${days} hari ${hours} jam`
    return `${days} hari`
  }

  if (hours > 0) {
    if (minutes > 0) return `${hours} jam ${minutes} menit`
    return `${hours} jam`
  }

  return `${minutes} menit`
}

function getSubscriptionHealth(remainingMs: number): SubscriptionHealth {
  if (remainingMs <= 0) return "expired"
  if (remainingMs <= 24 * 60 * 60 * 1000) return "critical"
  if (remainingMs <= 3 * 24 * 60 * 60 * 1000) return "soon"
  return "safe"
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value))
}
