"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
        <AlertTriangle size={28} />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Terjadi Kesalahan</h1>
      <p className="mt-2 max-w-sm text-center text-muted-foreground">
        Sinyal terputus atau server sedang sibuk. Silakan muat ulang halaman.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Kode: {error.digest}</p>
      ) : null}
      <Button onClick={reset} className="mt-8 gap-2">
        <RefreshCw size={16} />
        Muat Ulang
      </Button>
    </div>
  )
}
