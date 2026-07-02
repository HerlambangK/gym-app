"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const RESEND_COOLDOWN = 30

function VerifyForm() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get("email") || ""
  const [email, setEmail] = useState(emailFromUrl)
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleResend() {
    if (!email || cooldown > 0 || sending) return

    setSending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Gagal mengirim ulang.")
        return
      }
      toast.success("Email verifikasi telah dikirim ulang!")
      setSent(true)
      setCooldown(RESEND_COOLDOWN)
    } catch {
      toast.error("Gagal menghubungi server.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10">
          {sent ? (
            <CheckCircle size={32} className="text-emerald-500" />
          ) : (
            <Mail size={32} className="text-primary" />
          )}
        </div>
        <CardTitle>{sent ? "Email Terkirim!" : "Cek Email Anda"}</CardTitle>
        <CardDescription>
          {sent
            ? `Tautan verifikasi telah dikirim ke ${email}.`
            : "Kami akan mengirim tautan verifikasi ke email Anda. Klik tautan tersebut untuk mengaktifkan akun Anda."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="verify-email" className="block text-left text-sm font-medium">
            Alamat Email
          </label>
          <input
            ref={inputRef}
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSent(false) }}
            placeholder="nama@email.com"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {cooldown > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle size={14} />
            Kirim ulang dalam {cooldown} detik
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            disabled={!email || cooldown > 0 || sending}
            onClick={handleResend}
          >
            {sending ? "Mengirim..." : cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : "Kirim Ulang Email"}
          </Button>
          <Link href="/?action=login">
            <Button variant="ghost" className="w-full">
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <Suspense fallback={
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Memuat...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <VerifyForm />
      </Suspense>
    </main>
  )
}
