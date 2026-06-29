"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SubscribeButton({ planCode }: { planCode: string }) {
  async function handleSubscribe() {
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create transaction")
        return
      }
      if (data.midtrans?.redirect_url) {
        window.location.href = data.midtrans.redirect_url
      } else {
        toast.success("Invoice created! Check your billing page.")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <Button onClick={handleSubscribe} className="w-full">
      Subscribe
    </Button>
  )
}
