"use client"

import { useState, useEffect, useActionState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Dumbbell, User, LogOut, X, ChevronRight, Star, Clock, Menu, Check, Smartphone, BarChart3, CreditCard, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { brand, navItems, blogPosts, membershipPlans } from "@/data/gym"
import { rupiah } from "@/lib/format"
import { registerAction, loginAction } from "@/lib/auth"
import { getDashboardPathForRole } from "@/lib/auth-routing"
import { demoAccounts } from "@/lib/demo-accounts"
import { toast } from "sonner"

const DEFAULT_COOLDOWN = 60

const benefits = [
  { icon: Smartphone, title: "Akses Berbasis Peran", text: "Owner, admin, trainer, dan member — masing-masing punya kendali sesuai perannya." },
  { icon: CreditCard, title: "Pembayaran Midtrans", text: "Dari pending ke paid, langganan aktif otomatis tanpa ribet." },
  { icon: MapPin, title: "Check-in via GPS", text: "Validasi lokasi memastikan kehadiran benar-benar di gym." },
  { icon: BarChart3, title: "Fitur Premium Bertingkat", text: "Gizi, blog premium, progres latihan — sesuai paket yang dipilih." },
]

const testimonial = {
  name: "Arya Wirawan",
  role: "Owner ForgeFit Studio",
  text: "Sebelumnya saya pakai Excel dan buku tamu. Sekarang semuanya otomatis — check-in, billing, laporan keuangan. Saya bisa pantau bisnis dari HP.",
  avatar: "AW",
}

const stats = [
  { value: "742+", label: "Member Aktif", desc: "Terdaftar dan aktif berlatih" },
  { value: "4.9", label: "Rating", desc: "Rata-rata ulasan member" },
  { value: "12", label: "Trainer", desc: "Bersertifikat nasional" },
  { value: "186", label: "Check-in/Hari", desc: "Rata-rata kehadiran harian" },
]

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [maxCooldown, setMaxCooldown] = useState(60)
  const [menuOpen, setMenuOpen] = useState(false)
  const [nextPath, setNextPath] = useState("")
  const [dashboardHref, setDashboardHref] = useState("/member/dashboard")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [seedPending, setSeedPending] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendSending, setResendSending] = useState(false)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email, name: data.user.user_metadata?.name as string })
        fetch("/api/auth/me")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const role = data?.user?.role as string | null | undefined
            setDashboardHref(getDashboardPathForRole(role))
          })
          .catch(() => setDashboardHref("/member/dashboard"))
      }
    })
    const params = new URLSearchParams(window.location.search)
    const action = params.get("action")
    const next = params.get("next")
    const error = params.get("error")
    if (next?.startsWith("/") && !next.startsWith("//")) {
      window.setTimeout(() => setNextPath(next), 0)
    }
    if (error === "role_missing") {
      toast.error("Akun Anda belum memiliki role dashboard. Hubungi admin untuk mengatur akses.")
    }
    window.setTimeout(() => {
      if (action === "login") setLoginOpen(true)
      if (action === "register") setRegisterOpen(true)
    }, 0)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null)
  const loginErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (!loginState) return
    if (loginState.error) {
      toast.error(loginState.error)
      loginErrorRef.current = loginState.error
    }
    if (loginState.redirectTo) {
      toast.success("Login berhasil!")
      const href = loginState.redirectTo
      const timer = setTimeout(() => { window.location.href = href }, 300)
      return () => clearTimeout(timer)
    }
  }, [loginState])

  useEffect(() => {
    if (loginErrorRef.current?.toLowerCase().includes("verifikasi") || loginErrorRef.current?.toLowerCase().includes("verified")) {
      setUnverifiedEmail(loginEmail)
    }
    loginErrorRef.current = null
  }, [loginEmail])

  const [regState, regFormAction, regPending] = useActionState(registerAction, null)

  useEffect(() => {
    if (!regState) return
    if (regState.error) {
      toast.error(regState.error)
      if (regState.cooldown) {
        const cd = regState.cooldownSeconds ?? DEFAULT_COOLDOWN
        const timer = setTimeout(() => { setCooldown(cd); setMaxCooldown(cd) }, 0)
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

  function switchToRegister() { setLoginOpen(false); setRegisterOpen(true) }
  function switchToLogin() { setRegisterOpen(false); setLoginOpen(true) }
  async function seedDemoAccounts() {
    setSeedPending(true)
    try {
      const response = await fetch("/api/auth/seed-demo", { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(data.error || "Gagal seed akun demo.")
        return
      }
      toast.success("Akun demo owner/admin/member siap dipakai.")
    } catch {
      toast.error("Gagal menghubungi endpoint seed demo.")
    } finally {
      setSeedPending(false)
    }
  }

  const regDisabled = regPending || cooldown > 0

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-foreground to-foreground/70 text-background shadow-lg">
              <Dumbbell size={18} />
            </span>
            <span className="text-sm font-bold tracking-tight">{brand.name}</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href={dashboardHref}>
                  <Button size="sm" variant="outline" className="gap-2"><User size={14} /> Dashboard</Button>
                </Link>
                <button
                  type="button"
                  aria-label="Keluar dari akun"
                  onClick={async () => {
                    const supabase = createBrowserSupabaseClient()
                    await supabase.auth.signOut()
                    setUser(null)
                    toast.success("Berhasil keluar.")
                  }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setLoginOpen(true)}>Masuk</Button>
                <Button size="sm" onClick={() => setRegisterOpen(true)} className="shadow-lg shadow-foreground/10">Daftar</Button>

                <Dialog open={loginOpen} onOpenChange={(open) => { setLoginOpen(open); if (!open) setUnverifiedEmail(null) }}>
                  <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[440px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Masuk</DialogTitle>
                      <DialogDescription>Masuk ke akun {brand.name} Anda.</DialogDescription>
                    </DialogHeader>
                    <form action={loginFormAction} className="mt-2 grid gap-4">
                      <input type="hidden" name="next" value={nextPath} />
                      <div className="grid gap-2 rounded-xl border border-border/70 bg-muted/35 p-3">
                        <div className="grid grid-cols-[1fr_auto] gap-2">
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
                          <button
                            type="button"
                            onClick={seedDemoAccounts}
                            disabled={seedPending}
                            className="rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background transition-opacity disabled:opacity-60"
                          >
                            {seedPending ? "Seed..." : "Seed"}
                          </button>
                        </div>
                        <div className="grid gap-1 text-xs text-muted-foreground">
                          {demoAccounts.map((account) => (
                            <p key={account.email}>
                              <span className="font-medium text-foreground">{account.label}</span>: {account.email} / {account.password}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="login-email" className="text-sm font-medium">Email</label>
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="nama@email.com"
                          required
                          className="h-10"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            name="password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Minimal 6 karakter"
                            required
                            minLength={6}
                            className="h-10 pr-10"
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
                      {unverifiedEmail && (
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
                                if (!res.ok) { toast.error(data.error || "Gagal kirim ulang."); return }
                                toast.success("Email verifikasi telah dikirim ulang!")
                              } catch { toast.error("Gagal menghubungi server.") }
                              finally { setResendSending(false) }
                            }}
                            className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                          >
                            {resendSending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
                          </button>
                        </div>
                      )}
                      <Button type="submit" disabled={loginPending} className="h-10 w-full">
                        {loginPending ? "Memproses..." : "Masuk"}
                      </Button>
                      <div className="flex items-center justify-between text-sm">
                        <button type="button" onClick={switchToRegister} className="text-primary hover:underline">Belum punya akun?</button>
                        <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">Lupa password?</Link>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                  <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[440px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Daftar Akun</DialogTitle>
                      <DialogDescription>Buat akun baru {brand.name}.</DialogDescription>
                    </DialogHeader>
                    <form action={regFormAction} className="mt-2 grid gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="register-name" className="text-sm font-medium">Nama Lengkap</label>
                        <Input id="register-name" name="name" placeholder="Nama lengkap" required className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="register-email" className="text-sm font-medium">Email</label>
                        <Input id="register-email" name="email" type="email" placeholder="nama@email.com" required className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="register-phone" className="text-sm font-medium">Nomor WhatsApp</label>
                        <Input id="register-phone" name="phone" placeholder="+62 812-xxxx-xxxx" className="h-10" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="register-password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                          <Input id="register-password" name="password" type={showRegPassword ? "text" : "password"} placeholder="Minimal 6 karakter" required minLength={6} className="h-10 pr-10" />
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
                      <Button type="submit" disabled={regDisabled} className="h-10 w-full">
                        {regPending ? "Mendaftarkan..." : cooldown > 0 ? "Coba lagi" : "Daftar"}
                      </Button>
                      {cooldown > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-amber-500">Email sudah terdaftar</span>
                            <span className="tabular-nums text-muted-foreground">{Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}</span>
                          </div>
                          <Progress value={(cooldown / maxCooldown) * 100} className="h-1.5" />
                        </div>
                      )}
                      <p className="text-center text-sm text-muted-foreground">
                        Sudah punya akun?{" "}
                        <button type="button" onClick={switchToLogin} className="font-medium text-primary hover:underline">Masuk</button>
                      </p>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
            <button
              className="md:hidden text-muted-foreground"
              type="button"
              aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div id="landing-mobile-nav" className="border-t border-border/50 bg-background px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setLoginOpen(true); setMenuOpen(false) }}>Masuk</Button>
                <Button size="sm" onClick={() => { setRegisterOpen(true); setMenuOpen(false) }}>Daftar</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <section className="hero-media relative overflow-hidden border-b border-border/60">
        <div className="section-wrap grid min-h-[calc(100vh-4rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.92fr] lg:py-20">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-5 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
              Platform Manajemen Gym Premium
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.03] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Operasional gym rapi dari member masuk sampai laporan profit.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              {brand.tagline} Registrasi, paket, billing Midtrans, check-in GPS, RBAC, dan dashboard owner berjalan dalam satu pengalaman.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setRegisterOpen(true)} className="h-11 gap-2 px-6 shadow-xl shadow-black/10">
                Daftar Member <ArrowRight size={16} />
              </Button>
              <Link href="/owner/dashboard">
                <Button size="lg" variant="outline" className="h-11 gap-2 px-6 bg-background/70 backdrop-blur">
                  Lihat Dashboard <ChevronRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
              {["Paid otomatis", "GPS check-in", "RBAC aktif"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur">
                  <Check size={14} className="text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative h-[560px] overflow-hidden rounded-3xl border border-white/70 bg-white/40 p-2 shadow-2xl shadow-black/15 backdrop-blur">
              <Image
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=85"
                alt="Interior gym modern dengan area latihan lengkap"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="rounded-[1.25rem] object-cover"
              />
            </div>
            <div className="absolute -left-8 bottom-10 w-72 rounded-2xl border border-border bg-background/95 p-5 shadow-2xl shadow-black/15 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Check-in hari ini</p>
                  <p className="text-xs text-muted-foreground">Live attendance</p>
                </div>
                <Badge variant="success">186</Badge>
              </div>
              <div className="mt-4 space-y-2">
                {["18:00", "19:00", "20:00"].map((hour, index) => (
                  <div key={hour} className="grid grid-cols-[3rem_1fr] items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{hour}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${[72, 88, 54][index]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-5 top-12 rounded-2xl border border-border bg-background/95 p-4 shadow-xl shadow-black/10 backdrop-blur">
              <p className="text-xs text-muted-foreground">Revenue bulan ini</p>
              <p className="mt-1 text-2xl font-bold">Rp128,7jt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <p className="text-3xl font-bold tracking-tight text-foreground">{s.value}</p>
              <p className="mt-1 font-semibold text-foreground/85">{s.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrap py-20" id="facilities">
        <div className="grid items-end gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge variant="outline" className="mb-4 px-3 py-1">SaaS Manajemen Gym</Badge>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Alur utama gym dibuat padat, cepat, dan mudah diawasi.
            </h2>
          </div>
          <p className="text-muted-foreground lg:text-base">
            Owner mendapat angka bisnis, admin mendapat tabel operasional, member mendapat portal check-in dan fitur sesuai paket.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <benefit.icon size={21} />
              </div>
              <h3 className="text-base font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/40 py-20" id="paket">
        <div className="section-wrap">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1">Harga Membership</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Paket jelas untuk daily, basic, plus, dan pro.</h2>
            <p className="mt-4 text-muted-foreground">Setiap paket membuka entitlement yang berbeda, jadi upsell premium terasa natural.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {membershipPlans.map((plan) => (
              <div key={plan.code} className={`relative flex flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.highlighted ? "border-primary/45 shadow-lg shadow-primary/10 ring-1 ring-primary/20" : "border-border/70 shadow-sm"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                    Rekomendasi
                  </div>
                )}
                <div className="mb-1 text-base font-semibold">{plan.name}</div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="my-5">
                  <span className="text-3xl font-bold tracking-tight">{rupiah.format(plan.price)}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{plan.durationDays} hari akses</span>
                </div>
                <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${plan.tier === "DAILY" ? "w-[25%] bg-muted-foreground/50" : plan.tier === "BASIC" ? "w-[50%] bg-sky-500" : plan.tier === "PLUS" ? "w-[75%] bg-primary" : "w-full bg-emerald-500"}`} />
                </div>
                <ul className="mb-6 flex-1 space-y-2.5">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="pl-7 text-xs text-muted-foreground">+{plan.features.length - 5} fitur lainnya</li>
                  )}
                </ul>
                <Button className="h-9 w-full" variant={plan.highlighted ? "default" : "outline"} onClick={() => setRegisterOpen(true)}>
                  Pilih Paket
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap py-20" id="trainers">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-4 px-4 py-1">Fasilitas & Trainer</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pengalaman member tetap terasa premium, operasionalnya tetap terukur.</h2>
            <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="mb-4 flex -space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-foreground/90">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/70 bg-card p-2 shadow-xl shadow-black/5">
              <Image
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80"
                alt="Gym interior"
                fill
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="rounded-[1.25rem] object-cover"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {["Strength Zone", "Functional", "Recovery"].map((item) => (
                <div key={item} className="rounded-2xl border border-border/70 bg-card p-4 text-sm font-semibold shadow-sm">
                  {item}
                  <p className="mt-1 text-xs font-normal text-muted-foreground">Terhubung attendance</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="section-wrap">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1">Blog</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Artikel Terbaru</h2>
            <p className="mt-4 text-muted-foreground">Konten publik dan khusus pelanggan premium.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {blogPosts.map((post) => (
              <div key={post.title} className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Badge variant={post.access === "PUBLIC" ? "outline" : "warning"} className="mb-4">
                  {post.access === "PUBLIC" ? "Publik" : "Pelanggan"}
                </Badge>
                <p className="font-semibold leading-relaxed">{post.title}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {post.minutes} menit baca
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground px-8 py-14 text-center text-background shadow-xl shadow-black/10 sm:px-16">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Siap Mengelola Gym Lebih Efisien?</h2>
            <p className="mx-auto mt-4 max-w-xl text-background/70">Daftar gratis, tidak perlu kartu kredit. Mulai transformasi digital gym Anda sekarang.</p>
            <Button size="lg" variant="secondary" onClick={() => setRegisterOpen(true)} className="mt-8 h-11 gap-2 px-8 shadow-2xl">
              Daftar Gratis <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12">
        <div className="section-wrap">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <div className="flex items-center gap-2">
              <Dumbbell size={14} />
              <span>{brand.name} &mdash; {brand.address}</span>
            </div>
            <p>{brand.whatsapp} / {brand.instagram}</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
