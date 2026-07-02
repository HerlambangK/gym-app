import { desc, eq, gte } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { attendances, invoices, membership_plans, members, subscriptions, users } from "@/db/schema"

export type OwnerRiskMember = {
  id: string
  name: string
  email: string
  plan: string
  daysLeft: number
  checkins30d: number
  lastCheckInLabel: string
  risk: "LOW" | "MEDIUM" | "HIGH"
  reason: string
}

export async function getOwnerIntelligence() {
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const start30 = new Date(now.getTime() - 30 * 86400000).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [memberRows, attendanceRows, invoiceRows] = await Promise.all([
    db
      .select({
        member_id: members.id,
        member_type: members.member_type,
        member_status: members.status,
        name: users.name,
        email: users.email,
        subscription_status: subscriptions.status,
        end_date: subscriptions.end_date,
        plan_name: membership_plans.name,
      })
      .from(members)
      .innerJoin(users, eq(members.user_id, users.id))
      .leftJoin(subscriptions, eq(members.id, subscriptions.member_id))
      .leftJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
      .orderBy(desc(members.created_at))
      .limit(250),
    db
      .select({
        member_id: attendances.member_id,
        check_in_time: attendances.check_in_time,
        status: attendances.status,
      })
      .from(attendances)
      .where(gte(attendances.check_in_time, start30))
      .orderBy(desc(attendances.check_in_time))
      .limit(1000),
    db
      .select({
        amount: invoices.amount,
        status: invoices.status,
        created_at: invoices.created_at,
      })
      .from(invoices)
      .where(gte(invoices.created_at, startOfMonth)),
  ])

  const membersById = new Map<string, {
    id: string
    name: string
    email: string
    plan: string
    status: string
    endDate: string | null
  }>()

  for (const row of memberRows) {
    const existing = membersById.get(row.member_id)
    const isActive = row.subscription_status === "ACTIVE" && (!existing?.endDate || (row.end_date || "") >= existing.endDate)
    if (!existing || isActive) {
      membersById.set(row.member_id, {
        id: row.member_id,
        name: row.name || "Member",
        email: row.email || "-",
        plan: row.plan_name || row.member_type || "Member",
        status: row.member_status,
        endDate: row.end_date || null,
      })
    }
  }

  const attendanceByMember = new Map<string, { count: number; latest: string | null }>()
  const hourlyBuckets = new Map<number, number>()
  for (const row of attendanceRows) {
    const current = attendanceByMember.get(row.member_id) || { count: 0, latest: null }
    attendanceByMember.set(row.member_id, {
      count: current.count + 1,
      latest: current.latest || row.check_in_time,
    })
    const hour = new Date(row.check_in_time).getHours()
    hourlyBuckets.set(hour, (hourlyBuckets.get(hour) || 0) + 1)
  }

  const riskMembers = Array.from(membersById.values())
    .map((member) => {
      const attendance = attendanceByMember.get(member.id) || { count: 0, latest: null }
      const daysLeft = member.endDate ? daysBetween(today, member.endDate) : 0
      return classifyMemberRisk({
        ...member,
        daysLeft,
        checkins30d: attendance.count,
        latestCheckIn: attendance.latest,
      })
    })
    .sort((a, b) => riskRank(b.risk) - riskRank(a.risk) || a.daysLeft - b.daysLeft)

  const paidRevenue = invoiceRows
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)
  const pendingRevenue = invoiceRows
    .filter((invoice) => invoice.status === "PENDING")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

  const busiestHour = Array.from(hourlyBuckets.entries()).sort((a, b) => b[1] - a[1])[0]
  const avgDailyCheckins = Math.round(attendanceRows.length / 30)
  const todayForecast = Math.max(avgDailyCheckins, Math.round(avgDailyCheckins * dayMultiplier(now.getDay())))

  return {
    summary: {
      memberCount: membersById.size,
      highRiskCount: riskMembers.filter((member) => member.risk === "HIGH").length,
      mediumRiskCount: riskMembers.filter((member) => member.risk === "MEDIUM").length,
      paidRevenue,
      pendingRevenue,
      todayForecast,
      busiestHourLabel: busiestHour ? `${busiestHour[0].toString().padStart(2, "0")}:00` : "-",
    },
    riskMembers: riskMembers.slice(0, 8),
    recommendations: buildOwnerRecommendations(riskMembers, paidRevenue, pendingRevenue, todayForecast, busiestHour?.[0]),
  }
}

function classifyMemberRisk(input: {
  id: string
  name: string
  email: string
  plan: string
  daysLeft: number
  checkins30d: number
  latestCheckIn: string | null
}): OwnerRiskMember {
  const daysSinceLastCheckin = input.latestCheckIn
    ? Math.max(0, Math.floor((Date.now() - new Date(input.latestCheckIn).getTime()) / 86400000))
    : 999
  let risk: OwnerRiskMember["risk"] = "LOW"
  let reason = "Aktivitas masih sehat."

  if (input.daysLeft <= 5 && input.checkins30d <= 3) {
    risk = "HIGH"
    reason = "Membership hampir habis dan check-in rendah."
  } else if (daysSinceLastCheckin >= 14 || input.checkins30d <= 1) {
    risk = "HIGH"
    reason = "Tidak aktif lebih dari 14 hari atau hampir tidak pernah check-in."
  } else if (input.daysLeft <= 10 || input.checkins30d <= 4) {
    risk = "MEDIUM"
    reason = "Perlu follow-up sebelum engagement turun."
  }

  return {
    id: input.id,
    name: input.name,
    email: input.email,
    plan: input.plan,
    daysLeft: input.daysLeft,
    checkins30d: input.checkins30d,
    lastCheckInLabel: input.latestCheckIn ? `${daysSinceLastCheckin} hari lalu` : "Belum ada",
    risk,
    reason,
  }
}

function buildOwnerRecommendations(
  riskMembers: OwnerRiskMember[],
  paidRevenue: number,
  pendingRevenue: number,
  todayForecast: number,
  busiestHour?: number,
) {
  const highRisk = riskMembers.filter((member) => member.risk === "HIGH").length
  return [
    highRisk > 0
      ? `${highRisk} member berisiko tinggi. Prioritaskan WhatsApp follow-up dan tawarkan jadwal trainer.`
      : "Tidak ada high-risk member dominan. Fokus pertahankan konsistensi check-in member aktif.",
    pendingRevenue > paidRevenue * 0.25
      ? "Invoice pending cukup besar. Kirim reminder pembayaran dan tampilkan opsi VA/QRIS yang masih aktif."
      : "Pending revenue masih terkendali. Pertahankan reminder otomatis sebelum invoice expired.",
    busiestHour
      ? `Jam ramai historis sekitar ${busiestHour.toString().padStart(2, "0")}:00. Siapkan trainer dan alat favorit sebelum jam tersebut.`
      : "Data check-in belum cukup. Kumpulkan minimal 30 hari untuk forecast jam ramai lebih stabil.",
    todayForecast > 20
      ? `Prediksi check-in hari ini ${todayForecast} member. Pastikan front desk dan area latihan siap.`
      : `Prediksi check-in hari ini ${todayForecast} member. Gunakan jam sepi untuk follow-up dan konten premium.`,
  ]
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime()
  const end = new Date(`${to}T00:00:00`).getTime()
  return Math.ceil((end - start) / 86400000)
}

function dayMultiplier(day: number) {
  if (day === 1 || day === 2) return 1.15
  if (day === 0 || day === 6) return 0.85
  return 1
}

function riskRank(risk: OwnerRiskMember["risk"]) {
  return risk === "HIGH" ? 3 : risk === "MEDIUM" ? 2 : 1
}
