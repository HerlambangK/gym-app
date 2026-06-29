"use client"

import { useState } from "react"
import { Eye, EyeOff, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [result, setResult] = useState<{ email: string; role: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
      roleCode: form.get("role"),
    }

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error || "Gagal membuat akun")
      return
    }

    setResult(data.user)
    toast.success(`Akun ${data.user.role} berhasil dibuat`)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Setup Aplikasi</CardTitle>
          <CardDescription>Buat akun Owner atau Admin pertama</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400">
                <p className="font-semibold">Akun berhasil dibuat!</p>
                <p>Email: {result.email}</p>
                <p>Role: {result.role}</p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => setResult(null)}>
                Buat Akun Lagi
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nama</label>
                <Input id="name" name="name" required placeholder="Nama lengkap" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                <Input id="email" name="email" type="email" required placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nomor WA (opsional)</label>
                <Input id="phone" name="phone" placeholder="+6281234567890" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Role</label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Buat Akun"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
