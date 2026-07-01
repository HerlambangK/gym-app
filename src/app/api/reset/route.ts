import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function headers() {
  return {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: "return=minimal",
  }
}

async function restDelete(table: string, filterColumn = "id") {
  const dummy = "00000000-0000-0000-0000-000000000000"
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filterColumn}=neq.${dummy}`
  const res = await fetch(url, { method: "DELETE", headers: headers() })
  if (res.status === 404) return `table not found (skipped)`
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    return `${res.status} ${res.statusText}${body ? `: ${body.slice(0, 100)}` : ""}`
  }
  return null
}

async function restUpsert(table: string, rows: Record<string, unknown>[]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...headers(),
      Prefer: "return=minimal,resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) return `${table}: ${res.status} ${res.statusText}`
  return null
}

async function restSelectAll(table: string, select = "id,code") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
    headers: headers(),
  })
  if (!res.ok) return null
  return res.json()
}

export async function POST() {
  const warnings: string[] = []

  // 1. Delete all data (FK-safe order — no CASCADE first)
  const deleteOrder: [string, string][] = [
    ["role_permissions", "role_id"],
    ["blog_posts", "id"],
    ["branding_settings", "id"],
    ["attendances", "id"],
    ["nutrition_logs", "id"],
    ["payments", "id"],
    ["subscriptions", "id"],
    ["invoices", "id"],
    ["expenses", "id"],
    ["members", "id"],
    ["branches", "id"],
  ]

  for (const [table, filterCol] of deleteOrder) {
    const err = await restDelete(table, filterCol)
    if (err) warnings.push(`${table}: ${err}`)
  }

  // 2. Seed master data
  // Branch
  const brErr = await restUpsert("branches", [
    {
      id: "b0000000-0000-0000-0000-000000000001",
      name: "ForgeFit Studio HQ",
      address: "Jl. Senopati No. 21, Kebayoran Baru, Jakarta Selatan",
      latitude: -6.2387,
      longitude: 106.7986,
      radius_meters: 100,
      open_time: "06:00",
      close_time: "22:00",
      phone: "+62 812-9000-2026",
      email: "hq@forgefit.studio",
      is_active: true,
    },
  ])
  if (brErr) warnings.push(String(brErr))

  // Branding
  const bdErr = await restUpsert("branding_settings", [
    {
      id: "b1000000-0000-0000-0000-000000000001",
      brand_name: "ForgeFit Studio",
      tagline: "Membership gym premium dengan operasional digital penuh.",
      whatsapp: "+62 812-9000-2026",
      instagram_url: "https://instagram.com/forgefit.studio",
      footer_text: "ForgeFit Studio — Jl. Senopati No. 21, Jakarta Selatan",
      theme_mode: "light",
      preset_theme: "Premium Light",
    },
  ])
  if (bdErr) warnings.push(String(bdErr))

  // Role → Permission mapping (batch all into one request)
  const roles = await restSelectAll("roles")
  const permissions = await restSelectAll("permissions")
  if (roles && permissions) {
    const rolePermMap: Record<string, string[]> = {
      SUPER_ADMIN: (permissions as Array<{ code: string }>).map((p) => p.code),
      OWNER: (permissions as Array<{ code: string }>).map((p) => p.code),
      MANAGER: [
        "manage_branches",
        "manage_members",
        "view_members",
        "manage_memberships",
        "manage_invoices",
        "manage_payments",
        "view_financial",
        "manage_expenses",
        "view_reports",
        "manage_attendance",
        "manual_check_in",
      ],
      ADMIN: [
        "manage_members",
        "view_members",
        "manage_memberships",
        "manage_invoices",
        "manage_payments",
        "view_reports",
        "manage_attendance",
        "manual_check_in",
      ],
      MARKETING: ["manage_branding", "manage_blog"],
      TRAINER: ["view_members", "manage_attendance"],
      MEMBER: [
        "view_member_portal",
        "member_check_in",
        "member_check_out",
        "use_premium_blog",
        "use_nutrition_log",
        "use_workout_progress",
      ],
    }
    const rolePermRows: Record<string, unknown>[] = []
    for (const [roleCode, permCodes] of Object.entries(rolePermMap)) {
      const role = (roles as Array<{ id: string; code: string }>).find(
        (r: { code: string }) => r.code === roleCode,
      )
      if (!role) continue
      for (const permCode of permCodes) {
        const perm = (permissions as Array<{ id: string; code: string }>).find(
          (p: { code: string }) => p.code === permCode,
        )
        if (!perm) continue
        rolePermRows.push({
          role_id: role.id,
          permission_id: perm.id,
        })
      }
    }
    if (rolePermRows.length > 0) {
      const rpErr = await restUpsert("role_permissions", rolePermRows)
      if (rpErr) warnings.push(String(rpErr))
    }
  }

  // Blog posts
  const now = new Date()
  const blogRows = [
    {
      id: "b2000000-0000-0000-0000-000000000001",
      title: "Cara Membaca Progress Tanpa Terjebak Timbangan",
      slug: "cara-membaca-progress",
      excerpt:
        "Berat badan bukan satu-satunya ukuran. Pelajari metrik lain yang lebih akurat.",
      content:
        "Berat badan bisa naik karena air, otot, atau waktu makan. Fokus pada lingkar pinggang, kekuatan angkat, dan energi harian.",
      access_type: "PUBLIC",
      status: "PUBLISHED",
      published_at: new Date(now.getTime() - 7 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000002",
      title: "Meal Prep 7 Hari untuk Member Plus",
      slug: "meal-prep-7-hari",
      excerpt:
        "Rencana makan mingguan yang praktis dan sesuai target makro.",
      content:
        "Hari 1: Oatmeal + telur, Nasi merah + dada ayam + brokoli, Salmon + kentang + asparagus.",
      access_type: "SUBSCRIBER_ONLY",
      status: "PUBLISHED",
      published_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000003",
      title: "Latihan Push Pull Legs untuk Fase Cutting",
      slug: "push-pull-legs-cutting",
      excerpt:
        "Rutin PPL 6x seminggu untuk membakar lemak sambil mempertahankan otot.",
      content:
        "Push: bench press, overhead press. Pull: pull-up, row. Legs: squat, deadlift.",
      access_type: "SUBSCRIBER_ONLY",
      status: "PUBLISHED",
      published_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000004",
      title: "5 Manfaat Cold Exposure Setelah Latihan",
      slug: "cold-exposure",
      excerpt:
        "Cold plunge dan ice bath makin populer di kalangan atlet. Apa kata sains?",
      content:
        "Studi menunjukkan cold exposure dapat mengurangi inflamasi, mempercepat recovery, dan meningkatkan fokus mental.",
      access_type: "PUBLIC",
      status: "PUBLISHED",
      published_at: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000005",
      title: "Panduan Sleep Hygiene untuk Performa Gym",
      slug: "sleep-hygiene",
      excerpt:
        "Tidur berkualitas adalah foundation dari progress fitness.",
      content:
        "Target 7-9 jam. Hindari layar 1 jam sebelum tidur. Jaga suhu kamar 18-22°C.",
      access_type: "PUBLIC",
      status: "PUBLISHED",
      published_at: new Date(now.getTime() - 21 * 86400000).toISOString(),
    },
  ]
  const bpErr = await restUpsert("blog_posts", blogRows)
  if (bpErr) warnings.push(String(bpErr))

  return NextResponse.json({
    ok: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    step: "done",
  })
}
