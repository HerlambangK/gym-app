"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SubscribeButton({ planCode, label = "Beli Paket" }: { planCode: string; label?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Gagal membuat transaksi")
        return
      }
      if (data.midtrans?.redirect_url) {
        window.location.href = data.midtrans.redirect_url
      } else {
        toast.success("Invoice dibuat. Cek halaman billing.")
      }
    } catch {
      toast.error("Gagal menghubungi Midtrans")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscribe} className="w-full" disabled={loading}>
      {loading ? "Membuat transaksi..." : label}
    </Button>
  )
}
