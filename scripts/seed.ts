import { createClient } from "@supabase/supabase-js"
import WebSocket from "ws"
import { randomUUID } from "crypto"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket as any },
})

const BRANCH_ID = "b0000000-0000-0000-0000-000000000001"
const BRANDING_ID = "b1000000-0000-0000-0000-000000000001"

async function main() {
  // ── 1. Role → Permission mapping ──
  console.log("Seeding role_permissions...")
  const { data: roles } = await supabase.from("roles").select("id, code")
  const { data: permissions } = await supabase.from("permissions").select("id, code")
  if (!roles || !permissions) throw new Error("Missing roles/permissions data")

  const rolePermMap: Record<string, string[]> = {
    SUPER_ADMIN: permissions.map((p) => p.code),
    OWNER: permissions.map((p) => p.code),
    MANAGER: [
      "manage_members", "view_members", "manage_invoices", "manage_payments",
      "manage_attendance", "manual_check_in", "view_reports", "manage_expenses",
      "view_financial", "member_check_in", "member_check_out",
    ],
    ADMIN: [
      "manage_members", "view_members", "manage_invoices", "manage_payments",
      "manage_attendance", "manual_check_in", "member_check_in", "member_check_out",
    ],
    MARKETING: ["manage_blog", "manage_branding"],
    TRAINER: [
      "view_members", "manage_attendance", "member_check_in", "member_check_out",
      "use_workout_progress",
    ],
    MEMBER: [
      "view_member_portal", "member_check_in", "member_check_out",
      "use_premium_blog", "use_nutrition_log", "use_workout_progress",
      "billing_history",
    ],
  }

  const permByCode: Record<string, string> = {}
  for (const p of permissions) permByCode[p.code] = p.id

  for (const role of roles) {
    const permCodes = rolePermMap[role.code]
    if (!permCodes) continue
    for (const code of permCodes) {
      const permId = permByCode[code]
      if (!permId) continue
      await supabase.from("role_permissions").upsert(
        { role_id: role.id, permission_id: permId },
        { onConflict: "role_id,permission_id", ignoreDuplicates: true }
      )
    }
  }

  // ── 2. Branch ──
  console.log("Seeding branch...")
  await supabase.from("branches").upsert(
    {
      id: BRANCH_ID,
      name: "ForgeFit Studio HQ",
      address: "Jl. Senopati No. 21, Kebayoran Baru, Jakarta Selatan",
      latitude: -6.2387,
      longitude: 106.7986,
      radius_meters: 100,
      open_time: "06:00",
      close_time: "22:00",
      phone: "+62 812-9000-2026",
      email: "hq@forgefit.studio",
    },
    { onConflict: "id", ignoreDuplicates: true }
  )

  // ── 3. Branding ──
  console.log("Seeding branding...")
  await supabase.from("branding_settings").upsert(
    {
      id: BRANDING_ID,
      brand_name: "ForgeFit Studio",
      tagline: "Membership gym premium dengan operasional digital penuh.",
      whatsapp: "+62 812-9000-2026",
      instagram_url: "https://instagram.com/forgefit.studio",
      footer_text: "ForgeFit Studio — Jl. Senopati No. 21, Jakarta Selatan",
      theme_mode: "light",
      preset_theme: "Premium Light",
    },
    { onConflict: "id", ignoreDuplicates: true }
  )

  // ── 4. Blog posts ──
  console.log("Seeding blog posts...")
  const blogPosts = [
    {
      id: "b2000000-0000-0000-0000-000000000001",
      title: "Cara Membaca Progress Tanpa Terjebak Timbangan",
      slug: "cara-membaca-progress",
      excerpt: "Berat badan bukan satu-satunya ukuran. Pelajari metrik lain yang lebih akurat.",
      content: "Berat badan bisa naik karena air, otot, atau waktu makan. Fokus pada lingkar pinggang, kekuatan angkat, dan energi harian.",
      access_type: "PUBLIC",
      status: "PUBLISHED",
      published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000002",
      title: "Meal Prep 7 Hari untuk Member Plus",
      slug: "meal-prep-7-hari",
      excerpt: "Rencana makan mingguan yang praktis dan sesuai target makro.",
      content: "Hari 1: Oatmeal + telur, Nasi merah + dada ayam + brokoli, Salmon + kentang + asparagus.",
      access_type: "SUBSCRIBER_ONLY",
      status: "PUBLISHED",
      published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000003",
      title: "Latihan Push Pull Legs untuk Fase Cutting",
      slug: "push-pull-legs-cutting",
      excerpt: "Rutin PPL 6x seminggu untuk membakar lemak sambil mempertahankan otot.",
      content: "Push: bench press, overhead press. Pull: pull-up, row. Legs: squat, deadlift.",
      access_type: "SUBSCRIBER_ONLY",
      status: "PUBLISHED",
      published_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000004",
      title: "5 Manfaat Cold Exposure Setelah Latihan",
      slug: "cold-exposure",
      excerpt: "Cold plunge dan ice bath makin populer di kalangan atlet. Apa kata sains?",
      content: "Studi menunjukkan cold exposure dapat mengurangi inflamasi, mempercepat recovery, dan meningkatkan fokus mental.",
      access_type: "PUBLIC",
      status: "PUBLISHED",
      published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "b2000000-0000-0000-0000-000000000005",
      title: "Panduan Sleep Hygiene untuk Performa Gym",
      slug: "sleep-hygiene",
      excerpt: "Tidur berkualitas adalah foundation dari progress fitness.",
      content: "Target 7-9 jam. Hindari layar 1 jam sebelum tidur. Jaga suhu kamar 18-22°C.",
      access_type: "PUBLIC",
      status: "PUBLISHED",
      published_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    },
  ]
  for (const post of blogPosts) {
    await supabase.from("blog_posts").upsert(post, { onConflict: "id", ignoreDuplicates: true })
  }

  // ── 5. Auth users + app users + members ──
  console.log("Seeding auth users...")
  const demoUsers = [
    { email: "owner@gym.test", password: "OwnerDemo123!", name: "Budi Santoso", phone: "081234567890", role: "OWNER" },
    { email: "admin@gym.test", password: "AdminDemo123!", name: "Nadia Putri", phone: "081298765432", role: "ADMIN" },
    { email: "member@gym.test", password: "MemberDemo123!", name: "Raka Wirawan", phone: "081255512345", role: "MEMBER" },
  ]

  const demoUserIds: Record<string, string> = {}

  for (const du of demoUsers) {
    // Check if auth user exists
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existing = authUsers?.users.find((u) => u.email === du.email)
    let userId: string
    if (existing) {
      userId = existing.id
      console.log(`  Auth user ${du.email} already exists (id=${userId.slice(0, 8)}...)`)
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: du.email,
        password: du.password,
        email_confirm: true,
      })
      if (error) throw new Error(`Failed to create auth user ${du.email}: ${error.message}`)
      userId = data.user.id
      console.log(`  Created auth user ${du.email} (id=${userId.slice(0, 8)}...)`)
    }
    demoUserIds[du.email] = userId

    // Upsert app profile
    await supabase.from("users").upsert(
      { id: userId, name: du.name, email: du.email, phone: du.phone, status: "ACTIVE" },
      { onConflict: "id", ignoreDuplicates: true }
    )

    // Assign role
    const role = roles.find((r) => r.code === du.role)
    if (role) {
      await supabase.from("user_roles").upsert(
        { user_id: userId, role_id: role.id },
        { onConflict: "user_id,role_id", ignoreDuplicates: true }
      )
    }
  }

  // Member for member@gym.test
  const memberUserId = demoUserIds["member@gym.test"]
  const { data: existingMember } = await supabase
    .from("members")
    .select("id")
    .eq("member_code", "M-0001")
    .maybeSingle()

  let member1Id: string
  if (!existingMember) {
    const { data: newMember, error } = await supabase
      .from("members")
      .insert({
        id: randomUUID(),
        user_id: memberUserId,
        member_code: "M-0001",
        branch_id: BRANCH_ID,
        member_type: "SUBSCRIPTION",
        status: "ACTIVE",
      })
      .select("id")
      .single()
    if (error) throw new Error(`Failed to create member: ${error.message}`)
    member1Id = newMember.id
    console.log(`  Created member M-0001 for member@gym.test`)
  } else {
    member1Id = existingMember.id
    console.log(`  Member M-0001 already exists`)
  }

  // ── 6. Extra users (10) ──
  console.log("Seeding extra users...")

  // user_status enum: ACTIVE, INACTIVE, BANNED
  // member_status enum: ACTIVE, INACTIVE, FROZEN, BANNED
  const extraUsers = [
    { name: "Maya Sari", email: "maya@example.com", phone: "081311111111", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: true },
    { name: "Dimas Pratama", email: "dimas@example.com", phone: "081322222222", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: false },
    { name: "Sari Indah", email: "sari@example.com", phone: "081333333333", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: true },
    { name: "Ahmad Fauzi", email: "ahmad@example.com", phone: "081344444444", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: false },
    { name: "Dewi Lestari", email: "dewi@example.com", phone: "081355555555", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: true },
    { name: "Bambang Suprapto", email: "bambang@example.com", phone: "081366666666", userStatus: "ACTIVE" as const, memberStatus: "FROZEN" as const, isSubscription: false },
    { name: "Rina Wijaya", email: "rina@example.com", phone: "081377777777", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: true },
    { name: "Agus Haryanto", email: "agus@example.com", phone: "081388888888", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: true },
    { name: "Fitri Handayani", email: "fitri@example.com", phone: "081399999999", userStatus: "INACTIVE" as const, memberStatus: "INACTIVE" as const, isSubscription: false },
    { name: "Bayu Pratama", email: "bayu@example.com", phone: "081300000001", userStatus: "ACTIVE" as const, memberStatus: "ACTIVE" as const, isSubscription: true },
  ]

  for (let i = 0; i < extraUsers.length; i++) {
    const eu = extraUsers[i]
    const memberCode = "M-" + String(i + 2).padStart(4, "0")

    // Look up existing user by email, or create a new one
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", eu.email)
      .maybeSingle()

    let uid: string
    if (existingUser) {
      uid = existingUser.id
      console.log(`  User ${eu.email} already exists`)
    } else {
      uid = randomUUID()
      const { error: userErr } = await supabase.from("users").insert({
        id: uid, name: eu.name, email: eu.email, phone: eu.phone, status: eu.userStatus,
      })
      if (userErr) {
        console.error(`  Failed to create user ${eu.email}:`, userErr.message)
        continue
      }
      console.log(`  Created user ${eu.email}`)
    }

    // Create member
    const { data: existingMemberRec } = await supabase
      .from("members")
      .select("id")
      .eq("member_code", memberCode)
      .maybeSingle()

    if (!existingMemberRec) {
      const { error: memberErr } = await supabase.from("members").insert({
        id: randomUUID(),
        user_id: uid,
        member_code: memberCode,
        branch_id: BRANCH_ID,
        member_type: eu.isSubscription ? "SUBSCRIPTION" : "DAILY",
        status: eu.memberStatus,
      })
      if (memberErr) {
        console.error(`  Failed to create member ${memberCode}:`, memberErr.message)
      } else {
        console.log(`  Created member ${memberCode} for ${eu.email}`)
      }
    } else {
      console.log(`  Member ${memberCode} already exists`)
    }

    // Assign MEMBER role
    const memberRole = roles.find((r) => r.code === "MEMBER")
    if (memberRole) {
      await supabase.from("user_roles").upsert(
        { user_id: uid, role_id: memberRole.id },
        { onConflict: "user_id,role_id", ignoreDuplicates: true }
      )
    }
  }

  // ── 7. Plan IDs ──
  console.log("Seeding subscriptions, invoices, payments...")
  const { data: plans } = await supabase.from("membership_plans").select("id, code, price")
  const planByCode: Record<string, { id: string; price: number }> = {}
  for (const p of plans || []) planByCode[p.code] = p

  // ── 8. Subscriptions, invoices, payments ──
  const { data: allMembers } = await supabase.from("members").select("id, member_code, status")
  let rowNum = 0
  for (const mem of allMembers || []) {
    if (mem.status !== "ACTIVE") continue
    rowNum++
    const invId = randomUUID()
    const subId = randomUUID()

    let planCode: string
    let amount: number

    if (mem.member_code === "M-0001") {
      planCode = "PLUS_MONTHLY"
      amount = 449000
    } else if (["M-0002", "M-0005"].includes(mem.member_code)) {
      planCode = "PRO_3_MONTHS"
      amount = 1199000
    } else if (["M-0003", "M-0009"].includes(mem.member_code)) {
      planCode = "DAILY_PASS"
      amount = 45000
    } else {
      planCode = "BASIC_MONTHLY"
      amount = 299000
    }

    const plan = planByCode[planCode]
    if (!plan) {
      console.warn(`  Plan ${planCode} not found, skipping ${mem.member_code}`)
      continue
    }

    const invoiceNum = "INV-2026-" + String(1000 + rowNum).padStart(4, "0")
    const createdDate = new Date(Date.now() - 86400000).toISOString()

    const { data: existingInv } = await supabase
      .from("invoices")
      .select("id")
      .eq("invoice_number", invoiceNum)
      .maybeSingle()

    if (existingInv) {
      // Skip — already seeded
      continue
    }

    await supabase.from("invoices").insert({
      id: invId,
      invoice_number: invoiceNum,
      member_id: mem.id,
      plan_id: plan.id,
      amount,
      status: "PAID",
      created_at: createdDate,
    })

    let subStart: string, subEnd: string
    if (planCode === "PRO_3_MONTHS") {
      subStart = "2026-06-01"
      subEnd = "2026-08-30"
    } else if (planCode === "DAILY_PASS") {
      subStart = new Date().toISOString().slice(0, 10)
      subEnd = subStart
    } else {
      subStart = "2026-06-01"
      subEnd = "2026-06-30"
    }

    await supabase.from("subscriptions").insert({
      id: subId,
      member_id: mem.id,
      plan_id: plan.id,
      invoice_id: invId,
      start_date: subStart,
      end_date: subEnd,
      status: "ACTIVE",
    })

    // Payment
    const payMethod = rowNum % 3 === 0 ? "VA BCA" : rowNum % 3 === 1 ? "QRIS" : "VA Mandiri"
    await supabase.from("payments").insert({
      id: randomUUID(),
      invoice_id: invId,
      provider: "Midtrans",
      method: payMethod,
      amount,
      status: "settlement",
      paid_at: new Date().toISOString(),
    })
  }

  // ── 9. Attendances (7 hari terakhir, ~60% hadir) ──
  console.log("Seeding attendances...")
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: activeMembers } = await supabase.from("members").select("id").eq("status", "ACTIVE")

  // Clear existing attendance data for clean re-seed
  await supabase.from("attendances").delete().gte("check_in_time", sevenDaysAgo)

  for (const mem of activeMembers || []) {
    for (let d = 0; d < 7; d++) {
      if (Math.random() < 0.4) continue
      const attDate = new Date(Date.now() - d * 86400000)
      attDate.setHours(7 + Math.floor(Math.random() * 3))
      attDate.setMinutes(Math.floor(Math.random() * 60))
      attDate.setSeconds(0)

      const checkOut = new Date(attDate.getTime() + (60 + Math.floor(Math.random() * 90)) * 60000)
      const duration = Math.round((checkOut.getTime() - attDate.getTime()) / 60000)

      await supabase.from("attendances").insert({
        member_id: mem.id,
        branch_id: BRANCH_ID,
        check_in_time: attDate.toISOString(),
        check_out_time: checkOut.toISOString(),
        duration_minutes: duration,
        status: "CHECKED_OUT",
      })
    }
  }

  // ── 10. Expenses ──
  console.log("Seeding expenses...")
  // Clear old expenses for clean re-seed
  await supabase.from("expenses").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  const expenseCategories = [
    { cat: "Sewa", base: 15000000, vari: 0 },
    { cat: "Listrik", base: 3500000, vari: 1000000 },
    { cat: "Payroll", base: 20000000, vari: 5000000 },
    { cat: "Air", base: 500000, vari: 300000 },
    { cat: "Maintenance", base: 2000000, vari: 2000000 },
    { cat: "Marketing", base: 3000000, vari: 2000000 },
    { cat: "Alat", base: 5000000, vari: 5000000 },
    { cat: "Supplemen", base: 1500000, vari: 1000000 },
  ]
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
  for (const ec of expenseCategories) {
    const amount = ec.base + (ec.vari > 0 ? Math.floor(Math.random() * ec.vari) : 0)
    const expDate = new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000)
    await supabase.from("expenses").insert({
      branch_id: BRANCH_ID,
      category: ec.cat,
      amount,
      description: `Biaya ${ec.cat.toLowerCase()} ${monthLabel}`,
      expense_date: expDate.toISOString().slice(0, 10),
    })
  }

  // ── 11. Nutrition logs (3 member, 14 hari) ──
  console.log("Seeding nutrition logs...")
  const shuffled = [...(activeMembers || [])].sort(() => Math.random() - 0.5).slice(0, 3)
  for (const mem of shuffled) {
    // Clear old logs for this member
    await supabase.from("nutrition_logs").delete().eq("member_id", mem.id)

    for (let d = 0; d < 14; d++) {
      const logDate = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10)
      await supabase.from("nutrition_logs").insert({
        member_id: mem.id,
        log_date: logDate,
        weight_kg: parseFloat((65 + Math.random() * 20).toFixed(2)),
        calories: 1800 + Math.floor(Math.random() * 800),
        protein_gram: 80 + Math.floor(Math.random() * 60),
        carbs_gram: 180 + Math.floor(Math.random() * 120),
        fat_gram: 40 + Math.floor(Math.random() * 30),
        water_ml: 1500 + Math.floor(Math.random() * 1500),
      })
    }
  }

  console.log("\n✅ Seed selesai! Semua data berhasil diisi.")
}

main().catch((err) => {
  console.error("❌ Seed gagal:", err)
  process.exit(1)
})
