import fs from "node:fs"
import { Pool } from "pg"

function readEnv() {
  const file = fs.readFileSync(".env.local", "utf8")
  return Object.fromEntries(
    file
      .split(/\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=")
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )
}

function addDays(dateString, days) {
  const normalized = toJakartaDateString(dateString)
  const date = new Date(`${normalized}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split("T")[0]
}

function toJakartaDateString(value) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value)
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return toJakartaDateString(parsed)
  return String(value).slice(0, 10)
}

const env = readEnv()
const pool = new Pool({ connectionString: env.SUPABASE_DB_URL || env.DATABASE_URL })
const client = await pool.connect()

try {
  await client.query("begin")

  const { rows: todayRows } = await client.query(`
    select (now() at time zone 'Asia/Jakarta')::date::text as today
  `)
  const today = todayRows[0].today

  const paidInvoices = await client.query(`
    update public.invoices i
    set status = 'PAID',
        updated_at = now()
    where exists (
      select 1
      from public.payments p
      where p.invoice_id = i.id
        and upper(p.status) = 'PAID'
    )
      and i.status <> 'PAID'
    returning i.id, i.invoice_number
  `)

  const expiredPendingInvoices = await client.query(`
    update public.invoices i
    set status = 'EXPIRED',
        updated_at = now()
    where i.status = 'PENDING'
      and i.expired_at is not null
      and i.expired_at::timestamptz < now()
      and not exists (
        select 1
        from public.payments p
        where p.invoice_id = i.id
          and upper(p.status) = 'PAID'
      )
    returning i.id, i.invoice_number
  `)

  const expiredActiveSubscriptions = await client.query(`
    update public.subscriptions
    set status = 'EXPIRED',
        updated_at = now()
    where status = 'ACTIVE'
      and end_date < $1
    returning id, member_id
  `, [today])

  const expiredPendingSubscriptions = await client.query(`
    update public.subscriptions s
    set status = 'EXPIRED',
        updated_at = now()
    from public.invoices i
    where s.invoice_id = i.id
      and s.status = 'PENDING_PAYMENT'
      and i.status in ('EXPIRED', 'FAILED', 'CANCELLED')
    returning s.id, s.member_id
  `)

  const pendingPaidSubscriptions = await client.query(`
    select
      s.id,
      s.member_id,
      s.status,
      mp.duration_days
    from public.subscriptions s
    join public.invoices i on i.id = s.invoice_id
    join public.membership_plans mp on mp.id = s.plan_id
    where (
      s.status = 'PENDING_PAYMENT'
      and i.status = 'PAID'
    ) or (
        s.status = 'EXPIRED'
        and i.status = 'PAID'
        and (i.created_at at time zone 'Asia/Jakarta')::date >= $1::date
    )
    order by i.created_at, s.created_at
  `, [today])

  const activatedSubscriptions = []
  for (const row of pendingPaidSubscriptions.rows) {
    const latest = await client.query(`
      select end_date
      from public.subscriptions
      where member_id = $1
        and id <> $2
        and status = 'ACTIVE'
        and end_date >= $3
      order by end_date desc
      limit 1
    `, [row.member_id, row.id, today])

    const startDate = latest.rows[0]?.end_date ? addDays(latest.rows[0].end_date, 1) : today
    const endDate = addDays(startDate, Math.max(1, Number(row.duration_days || 1)) - 1)
    await client.query(`
      update public.subscriptions
      set status = 'ACTIVE',
          start_date = $1,
          end_date = $2,
          updated_at = now()
      where id = $3
    `, [startDate, endDate, row.id])
    activatedSubscriptions.push({ id: row.id, start_date: startDate, end_date: endDate })
  }

  const memberTypeSync = await client.query(`
    with active as (
      select
        s.member_id,
        bool_or(mp.code <> 'DAILY_PASS') has_premium,
        bool_or(mp.code = 'DAILY_PASS') has_daily
      from public.subscriptions s
      join public.membership_plans mp on mp.id = s.plan_id
      where s.status = 'ACTIVE'
        and s.start_date <= $1
        and s.end_date >= $1
      group by s.member_id
    ),
    desired as (
      select
        m.id,
        case
          when coalesce(a.has_premium, false) then 'PREMIUM'::public.member_type
          when coalesce(a.has_daily, false) then 'DAILY'::public.member_type
          else 'TRIAL'::public.member_type
        end as member_type
      from public.members m
      left join active a on a.member_id = m.id
    )
    update public.members m
    set member_type = d.member_type,
        updated_at = now()
    from desired d
    where d.id = m.id
      and m.member_type <> d.member_type
    returning m.id, m.member_type
  `, [today])

  await client.query("commit")

  console.log(JSON.stringify({
    today,
    paidInvoices: paidInvoices.rowCount,
    expiredPendingInvoices: expiredPendingInvoices.rowCount,
    expiredActiveSubscriptions: expiredActiveSubscriptions.rowCount,
    expiredPendingSubscriptions: expiredPendingSubscriptions.rowCount,
    activatedSubscriptions: activatedSubscriptions.length,
    memberTypeSync: memberTypeSync.rowCount,
    activatedSubscriptionWindows: activatedSubscriptions,
  }, null, 2))
} catch (error) {
  await client.query("rollback")
  console.error(error)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
