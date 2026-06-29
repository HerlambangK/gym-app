import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <Card>
      <CardHeader><CardTitle>Member Profile</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {[
          `Name: ${user.user_metadata?.name || user.email}`,
          `Email: ${user.email}`,
          `Role: MEMBER`,
          `Status: ${user.email_confirmed_at ? "VERIFIED" : "UNVERIFIED"}`,
        ].map((item) => (
          <div key={item} className="rounded-md border border-border p-3">{item}</div>
        ))}
      </CardContent>
    </Card>
  )
}
