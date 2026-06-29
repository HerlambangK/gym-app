"use client"

import { useState } from "react"
import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import Link from "next/link"

export default function Page() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success("Tautan reset telah dikirim ke email Anda")
    }
  }

  if (sent) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-5">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Cek Email Anda</CardTitle>
            <CardDescription>Tautan reset password telah dikirim ke {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/?action=login">
              <Button variant="ghost">Kembali ke Login</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell size={24} />
          </span>
          <h1 className="text-xl font-semibold">Lupa Password</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Masukkan email untuk menerima tautan reset.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="grid gap-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Kirim Tautan Reset</Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link href="/?action=login" className="text-muted-foreground hover:text-foreground">Kembali ke Login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
