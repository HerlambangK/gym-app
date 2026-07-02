"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

export function SubscriptionExpiryDialog({
  subscriptionId,
  planName,
  endDate,
}: {
  subscriptionId: string
  planName: string
  endDate: string
}) {
  const endAt = useMemo(() => getSubscriptionEndTime(endDate), [endDate])
  const [now, setNow] = useState(() => Date.now())
  const remainingMs = endAt - now
  const shouldShow = remainingMs > 0 && remainingMs <= SIX_HOURS_MS
  const storageKey = `forgefit-expiry-dialog:${subscriptionId}:${endDate}`
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!shouldShow) return
    if (window.localStorage.getItem(storageKey) === "dismissed") return
    const timeout = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(timeout)
  }, [shouldShow, storageKey])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      window.localStorage.setItem(storageKey, "dismissed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-200">
            <AlertTriangle size={18} />
          </div>
          <DialogTitle>Subscription hampir berakhir</DialogTitle>
          <DialogDescription>
            {planName} akan habis dalam {formatCompactDuration(remainingMs)}. Perpanjang sekarang agar akses member tetap aktif.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Clock size={15} />
            Countdown paket
          </div>
          <p className="mt-1 tabular-nums text-muted-foreground">{formatCompactDuration(remainingMs)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Nanti
          </Button>
          <Link href="/member/billing">
            <Button className="w-full sm:w-auto">Perpanjang Sekarang</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getSubscriptionEndTime(endDate: string) {
  return new Date(`${endDate}T23:59:59`).getTime()
}

function formatCompactDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours} jam ${minutes} menit`
  if (minutes > 0) return `${minutes} menit ${seconds} detik`
  return `${seconds} detik`
}
