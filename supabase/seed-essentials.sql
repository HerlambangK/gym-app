-- =============================================================
-- SEED ESENSIAL — ForgeFit Studio
-- Hanya data master yang dibutuhkan aplikasi untuk berfungsi.
-- Data member/user transaksional dibuat via registrasi aplikasi
-- atau endpoint /api/auth/seed-demo.
-- =============================================================
-- Jalankan di Supabase SQL Editor (idempotent)
-- =============================================================

-- 1. BRANCH (default untuk check-in)
insert into public.branches (id, name, address, latitude, longitude, radius_meters, open_time, close_time, phone, email)
values (
  'b0000000-0000-0000-0000-000000000001',
  'ForgeFit Studio HQ',
  'Jl. Senopati No. 21, Kebayoran Baru, Jakarta Selatan',
  -6.2387, 106.7986, 100, '06:00', '22:00', '+62 812-9000-2026', 'hq@forgefit.studio'
)
on conflict (id) do nothing;

-- 2. BRANDING
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

-- 3. ROLE → PERMISSION MAPPING
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
