"use client"

import { useActionState } from "react"
import { saveMemberProfile, type ActionState } from "@/app/actions/member"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const initialState: ActionState = { ok: false, message: "" }

export function ProfileForm({
  profile,
  member,
  email,
  verified,
}: {
  profile: { name?: string | null; phone?: string | null } | null
  member: { member_code?: string | null; status?: string | null; member_type?: string | null } | null
  email: string
  verified: boolean
}) {
  const [state, action, pending] = useActionState(saveMemberProfile, initialState)
  const isPremium = member?.member_type === "PREMIUM"

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Ringkasan Akun</CardTitle>
            {isPremium ? (
              <Badge className="premium-gold-badge">MEMBER PREMIUM</Badge>
            ) : null}
          </div>
          <CardDescription>Status akun, member code, dan tipe membership.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProfileRow label="Email" value={email} />
          <ProfileRow label="Member Code" value={member?.member_code || "-"} />
          <ProfileRow label="Tipe" value={isPremium ? "Member Premium" : member?.member_type || "MEMBER"} />
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex flex-wrap justify-end gap-2">
              {isPremium ? <Badge className="premium-gold-badge">GOLD ACTIVE</Badge> : null}
              <Badge variant={member?.status === "ACTIVE" ? "success" : "muted"}>{member?.status || "ACTIVE"}</Badge>
              <Badge variant={verified ? "success" : "warning"}>{verified ? "VERIFIED" : "UNVERIFIED"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setting Profile</CardTitle>
          <CardDescription>Perbarui data yang dipakai admin untuk kontak dan identitas member.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="profile-name" className="text-sm font-medium">Nama lengkap</label>
              <Input id="profile-name" name="name" defaultValue={profile?.name ?? ""} required />
            </div>
            <div className="grid gap-2">
              <label htmlFor="profile-phone" className="text-sm font-medium">Nomor telepon</label>
              <Input id="profile-phone" name="phone" defaultValue={profile?.phone ?? ""} placeholder="08xxxxxxxxxx" />
            </div>
            {state.message ? (
              <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan Profile"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-sm font-medium">{value}</span>
    </div>
  )
}
