-- Reset data testing Gym App.
-- Jalankan dari Supabase SQL Editor saat ingin membersihkan data transaksi/member
-- tanpa menghapus tabel master seperti role, permission, cabang, paket, fitur, dan branding.
--
-- Kondisi live terakhir dicek 2026-07-02:
-- users 14, roles 7, permissions 26, user_roles 3, branches 1, members 1,
-- membership_plans 4, features 12, blog_posts 5, transaksi/member activity 0.

begin;

-- 1) Data operasional yang aman dikosongkan untuk ulang test pembayaran,
-- check-in, nutrisi, workout, dan invoice.
truncate table
  public.audit_logs,
  public.workout_exercises,
  public.workout_sessions,
  public.workout_programs,
  public.nutrition_targets,
  public.nutrition_logs,
  public.attendances,
  public.payments,
  public.subscriptions,
  public.invoices
restart identity cascade;

-- 2) Reset data member aplikasi, tapi tetap mempertahankan akun public.users
-- dan role login. Setelah user member login lagi, app akan membuat ulang row members.
-- Jika browser masih menyimpan session lama, sign out lalu login ulang sebelum test.
truncate table
  public.members
restart identity cascade;

commit;

-- OPSIONAL: reset konten yang biasanya masih berguna untuk demo.
-- Aktifkan hanya kalau memang ingin blog/expense kosong juga.
/*
begin;
truncate table
  public.expenses,
  public.blog_posts
restart identity cascade;
commit;
*/

-- OPSIONAL: reset identitas public app.
-- PERINGATAN:
-- - Ini tidak menghapus auth.users di Supabase Auth.
-- - Jika email masih ada di auth.users, signup ulang dengan email yang sama
--   bisa tetap ditolak sampai user Auth dihapus dari Dashboard Supabase/Auth.
-- - Jangan jalankan kalau masih ingin memakai akun demo owner/admin/member.
/*
begin;
truncate table
  public.user_roles,
  public.users
restart identity cascade;
commit;
*/
