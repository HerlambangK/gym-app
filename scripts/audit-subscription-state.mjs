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

const env = readEnv()
const pool = new Pool({ connectionString: env.SUPABASE_DB_URL || env.DATABASE_URL })

const queries = {
  now: `
    select current_date as db_date, now() as db_now
  `,
  counts: `
    select
      (select count(*) from public.invoices) invoices,
      (select count(*) from public.payments) payments,
      (select count(*) from public.subscriptions) subscriptions,
      (select count(*) from public.members) members
  `,
  byStatus: `
    select 'invoices' tbl, status::text, count(*)::int from public.invoices group by status
    union all
    select 'subscriptions', status::text, count(*)::int from public.subscriptions group by status
    union all
    select 'payments', status::text, count(*)::int from public.payments group by status
    order by tbl, status
  `,
  paidButNotActive: `
    select
      i.invoice_number,
      i.status invoice_status,
      p.status payment_status,
      s.status sub_status,
      s.start_date,
      s.end_date,
      mp.code,
      mp.duration_days,
      u.email
    from public.invoices i
    left join public.payments p on p.invoice_id = i.id
    left join public.subscriptions s on s.invoice_id = i.id
    left join public.membership_plans mp on mp.id = i.plan_id
    left join public.members m on m.id = i.member_id
    left join public.users u on u.id = m.user_id
    where i.status = 'PAID' and (s.id is null or s.status in ('PENDING_PAYMENT', 'CANCELLED', 'FROZEN'))
    order by i.created_at desc
    limit 20
  `,
  paidExpiredHistory: `
    select
      i.invoice_number,
      i.created_at invoice_created_at,
      i.status invoice_status,
      p.status payment_status,
      s.status sub_status,
      s.start_date,
      s.end_date,
      mp.code,
      mp.duration_days,
      u.email
    from public.invoices i
    join public.payments p on p.invoice_id = i.id
    join public.subscriptions s on s.invoice_id = i.id
    join public.membership_plans mp on mp.id = i.plan_id
    left join public.members m on m.id = i.member_id
    left join public.users u on u.id = m.user_id
    where i.status = 'PAID' and s.status = 'EXPIRED'
    order by i.created_at desc
    limit 20
  `,
  allSubscriptions: `
    select
      i.invoice_number,
      i.created_at invoice_created_at,
      p.status payment_status,
      s.status sub_status,
      s.start_date,
      s.end_date,
      mp.code,
      mp.duration_days,
      u.email
    from public.subscriptions s
    left join public.invoices i on i.id = s.invoice_id
    left join public.payments p on p.invoice_id = i.id
    left join public.membership_plans mp on mp.id = s.plan_id
    left join public.members m on m.id = s.member_id
    left join public.users u on u.id = m.user_id
    order by s.start_date desc, s.created_at desc
  `,
  expiredStillActive: `
    select
      s.id,
      s.status,
      s.start_date,
      s.end_date,
      mp.code,
      u.email,
      m.member_type
    from public.subscriptions s
    join public.membership_plans mp on mp.id = s.plan_id
    join public.members m on m.id = s.member_id
    left join public.users u on u.id = m.user_id
    where s.status = 'ACTIVE'
      and s.end_date::date < (now() at time zone 'Asia/Jakarta')::date
    order by s.end_date desc
    limit 30
  `,
  upcomingActive: `
    select
      s.id,
      s.status,
      s.start_date,
      s.end_date,
      mp.code,
      u.email,
      m.member_type
    from public.subscriptions s
    join public.membership_plans mp on mp.id = s.plan_id
    join public.members m on m.id = s.member_id
    left join public.users u on u.id = m.user_id
    where s.status = 'ACTIVE'
      and s.start_date::date > (now() at time zone 'Asia/Jakarta')::date
    order by s.end_date desc
    limit 30
  `,
  memberTypeMismatch: `
    with active as (
      select
        s.member_id,
        bool_or(mp.code <> 'DAILY_PASS') has_premium,
        bool_or(mp.code = 'DAILY_PASS') has_daily
      from public.subscriptions s
      join public.membership_plans mp on mp.id = s.plan_id
      where s.status = 'ACTIVE'
        and s.start_date::date <= (now() at time zone 'Asia/Jakarta')::date
        and s.end_date::date >= (now() at time zone 'Asia/Jakarta')::date
      group by s.member_id
    )
    select
      m.id,
      u.email,
      m.member_type,
      m.status,
      a.has_premium,
      a.has_daily
    from public.members m
    left join public.users u on u.id = m.user_id
    left join active a on a.member_id = m.id
    where
      (coalesce(a.has_premium, false) and m.member_type <> 'PREMIUM')
      or (not coalesce(a.has_premium, false) and coalesce(a.has_daily, false) and m.member_type <> 'DAILY')
      or (not coalesce(a.has_premium, false) and not coalesce(a.has_daily, false) and m.member_type in ('PREMIUM', 'DAILY', 'SUBSCRIPTION'))
    order by u.email
    limit 50
  `,
  activeOverlaps: `
    select
      s1.member_id,
      u.email,
      s1.id sub_a,
      s1.start_date a_start,
      s1.end_date a_end,
      s2.id sub_b,
      s2.start_date b_start,
      s2.end_date b_end
    from public.subscriptions s1
    join public.subscriptions s2 on s1.member_id = s2.member_id
      and s1.id < s2.id
      and s1.status = 'ACTIVE'
      and s2.status = 'ACTIVE'
      and s1.start_date <= s2.end_date
      and s2.start_date <= s1.end_date
    left join public.members m on m.id = s1.member_id
    left join public.users u on u.id = m.user_id
    limit 50
  `,
}

const client = await pool.connect()
try {
  for (const [name, sql] of Object.entries(queries)) {
    const result = await client.query(sql)
    console.log(`## ${name}`)
    console.log(JSON.stringify(result.rows, null, 2))
  }
} finally {
  client.release()
  await pool.end()
}
