-- Performance & bug fix migration
-- Apply this SQL to your Supabase project via SQL Editor

-- ============================================================
-- 1. DATABASE INDEXES for workout queries
-- ============================================================
create index if not exists idx_workout_programs_member_active
  on public.workout_programs (member_id, is_active);

create index if not exists idx_workout_programs_member_created
  on public.workout_programs (member_id, is_active, created_at desc);

create index if not exists idx_workout_sessions_program
  on public.workout_sessions (program_id);

create index if not exists idx_workout_exercises_session
  on public.workout_exercises (session_id);

-- ============================================================
-- 2. DATABASE INDEXES for frequently queried tables
-- ============================================================
create index if not exists idx_members_user_id
  on public.members (user_id);

create index if not exists idx_nutrition_logs_member_date
  on public.nutrition_logs (member_id, log_date desc);

create index if not exists idx_nutrition_targets_member
  on public.nutrition_targets (member_id);

create index if not exists idx_invoices_member
  on public.invoices (member_id);

create index if not exists idx_invoices_status
  on public.invoices (status);

create index if not exists idx_subscriptions_member_active
  on public.subscriptions (member_id, status);

create index if not exists idx_attendances_member_checkin
  on public.attendances (member_id, check_in_time desc);

-- ============================================================
-- 3. RLS POLICIES for workout tables (allow admin service_role)
-- ============================================================
-- These policies ensure service_role can always access, while anon/authenticated
-- have appropriate restrictions. Adjust per your security model.

-- Workout programs: member can only see their own
drop policy if exists "member_select_own_workout_programs" on public.workout_programs;
create policy "member_select_own_workout_programs" on public.workout_programs
  for select using (auth.uid() in (
    select user_id from public.members where id = member_id
  ));

-- Workout sessions: via program ownership
drop policy if exists "member_select_own_workout_sessions" on public.workout_sessions;
create policy "member_select_own_workout_sessions" on public.workout_sessions
  for select using (program_id in (
    select wp.id from public.workout_programs wp
    join public.members m on m.id = wp.member_id
    where m.user_id = auth.uid()
  ));

-- Workout exercises: via session ownership
drop policy if exists "member_select_own_workout_exercises" on public.workout_exercises;
create policy "member_select_own_workout_exercises" on public.workout_exercises
  for select using (session_id in (
    select ws.id from public.workout_sessions ws
    join public.workout_programs wp on wp.id = ws.program_id
    join public.members m on m.id = wp.member_id
    where m.user_id = auth.uid()
  ));
