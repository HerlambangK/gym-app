-- =============================================================
-- SEED DATA LENGKAP — FORGEFIT STUDIO
-- Jalankan di Supabase SQL Editor (idempotent — aman diulang)
-- =============================================================

-- 1. ROLE → PERMISSION MAPPING
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where
  (r.code = 'SUPER_ADMIN')
  or (r.code = 'OWNER')
  or (r.code = 'MANAGER' and p.code in (
    'manage_members', 'view_members', 'manage_invoices', 'manage_payments',
    'manage_attendance', 'manual_check_in', 'view_reports', 'manage_expenses',
    'view_financial', 'member_check_in', 'member_check_out'
  ))
  or (r.code = 'ADMIN' and p.code in (
    'manage_members', 'view_members', 'manage_invoices', 'manage_payments',
    'manage_attendance', 'manual_check_in', 'member_check_in', 'member_check_out'
  ))
  or (r.code = 'MARKETING' and p.code in ('manage_blog', 'manage_branding'))
  or (r.code = 'TRAINER' and p.code in (
    'view_members', 'manage_attendance', 'member_check_in', 'member_check_out',
    'use_workout_progress'
  ))
  or (r.code = 'MEMBER' and p.code in (
    'view_member_portal', 'member_check_in', 'member_check_out',
    'use_premium_blog', 'use_nutrition_log', 'use_workout_progress',
    'billing_history'
  ))
on conflict do nothing;

-- 2. BRANCH
insert into public.branches (id, name, address, latitude, longitude, radius_meters, open_time, close_time, phone, email)
values (
  'b0000000-0000-0000-0000-000000000001',
  'ForgeFit Studio HQ',
  'Jl. Senopati No. 21, Kebayoran Baru, Jakarta Selatan',
  -6.2387, 106.7986, 100, '06:00', '22:00', '+62 812-9000-2026', 'hq@forgefit.studio'
)
on conflict (id) do nothing;

-- 3. BRANDING
insert into public.branding_settings (id, brand_name, tagline, whatsapp, instagram_url, footer_text, theme_mode, preset_theme)
values (
  'b1000000-0000-0000-0000-000000000001',
  'ForgeFit Studio',
  'Membership gym premium dengan operasional digital penuh.',
  '+62 812-9000-2026',
  'https://instagram.com/forgefit.studio',
  'ForgeFit Studio — Jl. Senopati No. 21, Jakarta Selatan',
  'light',
  'Premium Light'
)
on conflict (id) do nothing;

-- 4. BLOG POSTS
insert into public.blog_posts (id, title, slug, excerpt, content, access_type, status, published_at)
values
  (
    'b2000000-0000-0000-0000-000000000001',
    'Cara Membaca Progress Tanpa Terjebak Timbangan',
    'cara-membaca-progress',
    'Berat badan bukan satu-satunya ukuran. Pelajari metrik lain yang lebih akurat.',
    'Berat badan bisa naik karena air, otot, atau waktu makan. Fokus pada lingkar pinggang, kekuatan angkat, dan energi harian.',
    'PUBLIC', 'PUBLISHED', now() - interval '7 days'
  ),
  (
    'b2000000-0000-0000-0000-000000000002',
    'Meal Prep 7 Hari untuk Member Plus',
    'meal-prep-7-hari',
    'Rencana makan mingguan yang praktis dan sesuai target makro.',
    'Hari 1: Oatmeal + telur, Nasi merah + dada ayam + brokoli, Salmon + kentang + asparagus.',
    'SUBSCRIBER_ONLY', 'PUBLISHED', now() - interval '3 days'
  ),
  (
    'b2000000-0000-0000-0000-000000000003',
    'Latihan Push Pull Legs untuk Fase Cutting',
    'push-pull-legs-cutting',
    'Rutin PPL 6x seminggu untuk membakar lemak sambil mempertahankan otot.',
    'Push: bench press, overhead press. Pull: pull-up, row. Legs: squat, deadlift.',
    'SUBSCRIBER_ONLY', 'PUBLISHED', now() - interval '1 days'
  ),
  (
    'b2000000-0000-0000-0000-000000000004',
    '5 Manfaat Cold Exposure Setelah Latihan',
    'cold-exposure',
    'Cold plunge dan ice bath makin populer di kalangan atlet. Apa kata sains?',
    'Studi menunjukkan cold exposure dapat mengurangi inflamasi, mempercepat recovery, dan meningkatkan fokus mental.',
    'PUBLIC', 'PUBLISHED', now() - interval '14 days'
  ),
  (
    'b2000000-0000-0000-0000-000000000005',
    'Panduan Sleep Hygiene untuk Performa Gym',
    'sleep-hygiene',
    'Tidur berkualitas adalah foundation dari progress fitness.',
    'Target 7-9 jam. Hindari layar 1 jam sebelum tidur. Jaga suhu kamar 18-22°C.',
    'PUBLIC', 'PUBLISHED', now() - interval '21 days'
  )
on conflict (id) do nothing;

-- =============================================================
-- 5. APP USERS + MEMBERS + RELATED DATA
-- =============================================================
do $$
declare
  owner_id uuid;
  admin_id uuid;
  member1_id uuid;
  branch_id uuid := 'b0000000-0000-0000-0000-000000000001';
  extra_users uuid[] := '{}';
  extra_members uuid[] := '{}';
  u uuid;
  plan_id_plus uuid;
  plan_id_basic uuid;
  plan_id_pro uuid;
  plan_id_daily uuid;
  mem_rec record;
  inv_id uuid;
  sub_id uuid;
  att_date date;
  att_time timestamptz;
  cat text;
begin
  -- Ambil ID dari auth.users (demo accounts) jika ada
  select id into owner_id from auth.users where email = 'owner@gym.test';
  select id into admin_id from auth.users where email = 'admin@gym.test';
  select id into member1_id from auth.users where email = 'member@gym.test';

  if owner_id is null then owner_id := gen_random_uuid(); end if;
  if admin_id is null then admin_id := gen_random_uuid(); end if;
  if member1_id is null then member1_id := gen_random_uuid(); end if;

  -- Insert profiles
  insert into public.users (id, name, email, phone, status) values
    (owner_id, 'Budi Santoso', 'owner@gym.test', '081234567890', 'ACTIVE'),
    (admin_id, 'Nadia Putri', 'admin@gym.test', '081298765432', 'ACTIVE'),
    (member1_id, 'Raka Wirawan', 'member@gym.test', '081255512345', 'ACTIVE')
  on conflict (id) do nothing;

  -- Assign roles
  insert into public.user_roles (user_id, role_id)
  select owner_id, id from public.roles where code = 'OWNER'
  on conflict do nothing;
  insert into public.user_roles (user_id, role_id)
  select admin_id, id from public.roles where code = 'ADMIN'
  on conflict do nothing;
  insert into public.user_roles (user_id, role_id)
  select member1_id, id from public.roles where code = 'MEMBER'
  on conflict do nothing;

  -- Member untuk member1
  insert into public.members (id, user_id, member_code, branch_id, member_type, status)
  values (gen_random_uuid(), member1_id, 'M-0001', branch_id, 'SUBSCRIPTION', 'ACTIVE')
  on conflict do nothing;

  -- =============================================================
  -- 6. EXTRA USERS (10 orang dengan data lengkap)
  -- =============================================================
  extra_users := array_cat(extra_users, array[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ]);

  insert into public.users (id, name, email, phone, status) values
    (extra_users[1], 'Maya Sari', 'maya@example.com', '081311111111', 'ACTIVE'),
    (extra_users[2], 'Dimas Pratama', 'dimas@example.com', '081322222222', 'ACTIVE'),
    (extra_users[3], 'Sari Indah', 'sari@example.com', '081333333333', 'ACTIVE'),
    (extra_users[4], 'Ahmad Fauzi', 'ahmad@example.com', '081344444444', 'ACTIVE'),
    (extra_users[5], 'Dewi Lestari', 'dewi@example.com', '081355555555', 'ACTIVE'),
    (extra_users[6], 'Bambang Suprapto', 'bambang@example.com', '081366666666', 'FROZEN'),
    (extra_users[7], 'Rina Wijaya', 'rina@example.com', '081377777777', 'ACTIVE'),
    (extra_users[8], 'Agus Haryanto', 'agus@example.com', '081388888888', 'ACTIVE'),
    (extra_users[9], 'Fitri Handayani', 'fitri@example.com', '081399999999', 'INACTIVE'),
    (extra_users[10], 'Bayu Pratama', 'bayu@example.com', '081300000001', 'ACTIVE')
  on conflict (id) do nothing;

  -- Member records untuk extra users
  for i in 1..array_length(extra_users, 1) loop
    insert into public.members (id, user_id, member_code, branch_id, member_type, status)
    values (
      gen_random_uuid(),
      extra_users[i],
      'M-' || lpad((i + 1)::text, 4, '0'),
      branch_id,
      case when i in (1,3,5,7,8,10) then 'SUBSCRIPTION' else 'DAILY' end,
      case
        when (select status from public.users where id = extra_users[i]) = 'FROZEN' then 'FROZEN'
        when (select status from public.users where id = extra_users[i]) = 'INACTIVE' then 'INACTIVE'
        else 'ACTIVE'
      end
    )
    on conflict do nothing;
  end loop;

  -- =============================================================
  -- 7. PLAN IDs
  -- =============================================================
  select id into plan_id_plus from public.membership_plans where code = 'PLUS_MONTHLY';
  select id into plan_id_basic from public.membership_plans where code = 'BASIC_MONTHLY';
  select id into plan_id_pro from public.membership_plans where code = 'PRO_3_MONTHS';
  select id into plan_id_daily from public.membership_plans where code = 'DAILY_PASS';

  -- =============================================================
  -- 8. SUBSCRIPTIONS, INVOICES, PAYMENTS
  -- =============================================================
  for mem_rec in select m.id, m.member_code, m.status, row_number() over () as rn
                 from public.members m loop
    if mem_rec.status != 'ACTIVE' then continue; end if;

    inv_id := gen_random_uuid();
    sub_id := gen_random_uuid();

    if mem_rec.member_code = 'M-0001' then
      -- Plus Monthly
      insert into public.invoices (id, invoice_number, member_id, plan_id, amount, status, created_at)
      values (inv_id, 'INV-2026-' || lpad((1000 + mem_rec.rn)::text, 4, '0'), mem_rec.id, plan_id_plus, 449000, 'PAID', now() - interval '1 day');
      insert into public.subscriptions (id, member_id, plan_id, invoice_id, start_date, end_date, status)
      values (sub_id, mem_rec.id, plan_id_plus, inv_id, '2026-06-01', '2026-06-30', 'ACTIVE');
    elsif mem_rec.member_code in ('M-0002', 'M-0005') then
      insert into public.invoices (id, invoice_number, member_id, plan_id, amount, status, created_at)
      values (inv_id, 'INV-2026-' || lpad((1000 + mem_rec.rn)::text, 4, '0'), mem_rec.id, plan_id_pro, 1199000, 'PAID', now() - interval '1 day');
      insert into public.subscriptions (id, member_id, plan_id, invoice_id, start_date, end_date, status)
      values (sub_id, mem_rec.id, plan_id_pro, inv_id, '2026-06-01', '2026-08-30', 'ACTIVE');
    elsif mem_rec.member_code in ('M-0003', 'M-0009') then
      insert into public.invoices (id, invoice_number, member_id, plan_id, amount, status, created_at)
      values (inv_id, 'INV-2026-' || lpad((1000 + mem_rec.rn)::text, 4, '0'), mem_rec.id, plan_id_daily, 45000, 'PAID', now() - interval '1 day');
      insert into public.subscriptions (id, member_id, plan_id, invoice_id, start_date, end_date, status)
      values (sub_id, mem_rec.id, plan_id_daily, inv_id, current_date, current_date, 'ACTIVE');
    else
      insert into public.invoices (id, invoice_number, member_id, plan_id, amount, status, created_at)
      values (inv_id, 'INV-2026-' || lpad((1000 + mem_rec.rn)::text, 4, '0'), mem_rec.id, plan_id_basic, 299000, 'PAID', now() - interval '1 day');
      insert into public.subscriptions (id, member_id, plan_id, invoice_id, start_date, end_date, status)
      values (sub_id, mem_rec.id, plan_id_basic, inv_id, '2026-06-01', '2026-06-30', 'ACTIVE');
    end if;

    -- Payment
    insert into public.payments (id, invoice_id, provider, method, amount, status, paid_at)
    values (
      gen_random_uuid(), inv_id, 'Midtrans',
      case when mem_rec.rn % 3 = 0 then 'VA BCA' when mem_rec.rn % 3 = 1 then 'QRIS' else 'VA Mandiri' end,
      case
        when mem_rec.member_code = 'M-0001' then 449000
        when mem_rec.member_code in ('M-0002', 'M-0005') then 1199000
        when mem_rec.member_code in ('M-0003', 'M-0009') then 45000
        else 299000
      end,
      'settlement', now()
    );
  end loop;

  -- =============================================================
  -- 9. ATTENDANCES (7 hari terakhir, ~60% hadir)
  -- =============================================================
  for mem_rec in select id from public.members where status = 'ACTIVE' loop
    for d in 0..6 loop
      if random() < 0.4 then continue; end if;
      att_date := current_date - d;
      att_time := att_date::timestamptz + time '07:00' + (random() * interval '3 hours');
      insert into public.attendances (member_id, branch_id, check_in_time, check_out_time, duration_minutes, status)
      values (
        mem_rec.id, branch_id,
        att_time,
        att_time + interval '1 hour' + (random() * interval '90 minutes')::interval,
        60 + (random() * 90)::int,
        'CHECKED_OUT'
      );
    end loop;
  end loop;

  -- =============================================================
  -- 10. EXPENSES
  -- =============================================================
  foreach cat in array array['Sewa','Listrik','Payroll','Air','Maintenance','Marketing','Alat','Supplemen'] loop
    insert into public.expenses (branch_id, category, amount, description, expense_date)
    values (
      branch_id, cat,
      case cat
        when 'Sewa' then 15000000
        when 'Listrik' then 3500000 + (random() * 1000000)::int
        when 'Payroll' then 20000000 + (random() * 5000000)::int
        when 'Air' then 500000 + (random() * 300000)::int
        when 'Maintenance' then 2000000 + (random() * 2000000)::int
        when 'Marketing' then 3000000 + (random() * 2000000)::int
        when 'Alat' then 5000000 + (random() * 5000000)::int
        when 'Supplemen' then 1500000 + (random() * 1000000)::int
        else 1000000
      end,
      'Biaya ' || lower(cat) || ' bulan ' || to_char(now(), 'Mon YYYY'),
      current_date - (random() * 5)::int
    );
  end loop;

  -- =============================================================
  -- 11. NUTRITION LOGS (3 member aktif, 14 hari terakhir)
  -- =============================================================
  for mem_rec in select id from public.members where status = 'ACTIVE' order by random() limit 3 loop
    for d in 0..13 loop
      insert into public.nutrition_logs (member_id, log_date, weight_kg, calories, protein_gram, carbs_gram, fat_gram, water_ml)
      values (
        mem_rec.id, current_date - d,
        65 + (random() * 20)::numeric(6,2),
        1800 + (random() * 800)::int,
        80 + (random() * 60)::int,
        180 + (random() * 120)::int,
        40 + (random() * 30)::int,
        1500 + (random() * 1500)::int
      )
      on conflict (member_id, log_date) do nothing;
    end loop;
  end loop;
end $$;
