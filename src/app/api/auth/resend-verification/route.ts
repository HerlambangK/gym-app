import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes("rate limit") || msg.includes("too many")) {
        return NextResponse.json({ error: "Terlalu banyak permintaan. Coba beberapa saat lagi." }, { status: 429 })
      }
      if (msg.includes("not found") || msg.includes("no user")) {
        return NextResponse.json({ error: "Email tidak ditemukan atau sudah terverifikasi." }, { status: 404 })
      }
      return NextResponse.json({ error: `Gagal mengirim ulang: ${error.message}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Email verifikasi telah dikirim ulang." })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
