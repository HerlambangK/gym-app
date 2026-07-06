"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { loginAction, registerAction } from "@/lib/auth"
import { demoAccounts } from "@/lib/demo-accounts"
import { gymProfile } from "@/data/company-profile"

const DEFAULT_COOLDOWN = 60

export function HomeAuthDialogs() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [maxCooldown, setMaxCooldown] = useState(DEFAULT_COOLDOWN)
  const [nextPath, setNextPath] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendSending, setResendSending] = useState(false)

  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null)
  const [regState, regFormAction, regPending] = useActionState(registerAction, null)
  const loginErrorRef = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const action = params.get("action")
    const next = params.get("next")
    const error = params.get("error")

    if (next?.startsWith("/") && !next.startsWith("//")) {
      window.setTimeout(() => setNextPath(next), 0)
    }
    if (error === "role_missing") toast.error("Akun Anda belum memiliki role dashboard. Hubungi admin untuk mengatur akses.")
    window.setTimeout(() => {
      if (action === "login") setLoginOpen(true)
      if (action === "register") setRegisterOpen(true)
    }, 0)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((current) => current - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    if (!loginState) return
    if (loginState.error) {
      toast.error(loginState.error)
      loginErrorRef.current = loginState.error
    }
    if (loginState.redirectTo) {
      toast.success("Login berhasil!")
      const timer = setTimeout(() => {
        window.location.href = loginState.redirectTo!
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [loginState])

  useEffect(() => {
    if (loginErrorRef.current?.toLowerCase().includes("verifikasi") || loginErrorRef.current?.toLowerCase().includes("verified")) {
      setUnverifiedEmail(loginEmail)
    }
    loginErrorRef.current = null
  }, [loginEmail])

  useEffect(() => {
    if (!regState) return
    if (regState.error) {
      toast.error(regState.error)
      if (regState.cooldown) {
        const nextCooldown = regState.cooldownSeconds ?? DEFAULT_COOLDOWN
        const timer = setTimeout(() => {
          setCooldown(nextCooldown)
          setMaxCooldown(nextCooldown)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
    if (regState.redirectTo) {
      toast.success("Pendaftaran berhasil! Cek email untuk verifikasi.")
      const regEmail = (document.getElementById("register-email") as HTMLInputElement)?.value || ""
      const timer = setTimeout(() => {
        window.location.href = `/auth/verify?email=${encodeURIComponent(regEmail)}`
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [regState])

  const regDisabled = regPending || cooldown > 0

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={(open) => { setLoginOpen(open); if (!open) setUnverifiedEmail(null) }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Masuk</DialogTitle>
            <DialogDescription>Masuk ke akun {gymProfile.name} Anda.</DialogDescription>
          </DialogHeader>
          <form action={loginFormAction} className="mt-2 grid gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <div className="grid gap-2 rounded-xl border border-border/70 bg-muted/35 p-3">
              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => {
                      setLoginEmail(account.email)
                      setLoginPassword(account.password)
                      setNextPath(account.dashboardPath)
                    }}
                    className="rounded-lg border border-border bg-background px-2 py-2 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                  >
                    {account.role}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Demo login tersedia untuk owner, admin, dan member.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium">Email</label>
              <Input id="login-email" name="email" type="email" required value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="login-password"
                  name="password"
                  type={showLoginPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="pr-10"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                />
                <button
                  type="button"
                  aria-label={showLoginPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {unverifiedEmail ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
                <p className="mb-2 font-medium text-amber-800 dark:text-amber-300">Email belum diverifikasi</p>
                <button
                  type="button"
                  disabled={resendSending}
                  onClick={async () => {
                    setResendSending(true)
                    try {
                      const res = await fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: unverifiedEmail }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        toast.error(data.error || "Gagal kirim ulang.")
                        return
                      }
                      toast.success("Email verifikasi telah dikirim ulang!")
                    } catch {
                      toast.error("Gagal menghubungi server.")
                    } finally {
                      setResendSending(false)
                    }
                  }}
                  className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {resendSending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
                </button>
              </div>
            ) : null}
            <Button type="submit" disabled={loginPending} className="w-full">
              {loginPending ? "Memproses..." : "Masuk"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setLoginOpen(false); setRegisterOpen(true) }} className="text-primary hover:underline">Belum punya akun?</button>
              <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">Lupa password?</Link>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Daftar Akun</DialogTitle>
            <DialogDescription>Buat akun baru {gymProfile.name}.</DialogDescription>
          </DialogHeader>
          <form action={regFormAction} className="mt-2 grid gap-4">
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-sm font-medium">Nama Lengkap</label>
              <Input id="register-name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-sm font-medium">Email</label>
              <Input id="register-email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="register-phone" className="text-sm font-medium">Nomor WhatsApp</label>
              <Input id="register-phone" name="phone" placeholder="+62 812-xxxx-xxxx" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input id="register-password" name="password" type={showRegPassword ? "text" : "password"} required minLength={6} className="pr-10" />
                <button
                  type="button"
                  aria-label={showRegPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={regDisabled} className="w-full">
              {regPending ? "Mendaftarkan..." : cooldown > 0 ? "Coba lagi" : "Daftar"}
            </Button>
            {cooldown > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-amber-500">Email sudah terdaftar</span>
                  <span className="tabular-nums text-muted-foreground">{Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}</span>
                </div>
                <Progress value={(cooldown / maxCooldown) * 100} className="h-1.5" />
              </div>
            ) : null}
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <button type="button" onClick={() => { setRegisterOpen(false); setLoginOpen(true) }} className="font-medium text-primary hover:underline">Masuk</button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
