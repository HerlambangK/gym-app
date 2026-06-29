"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function Page() {
  const [password, setPassword] = useState("")
  const router = useRouter()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password updated successfully")
      router.push("/login")
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="grid gap-4">
            <Input
              type="password"
              placeholder="New Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button type="submit" className="w-full">Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
