-- Nutrition and Workout MVP upgrade.
-- Apply this before using the richer diary/onboarding UI.

begin;

alter table public.nutrition_logs
  add column if not exists meal_type text,
  add column if not exists portion text,
  add column if not exists eaten_at time;

alter table public.nutrition_targets
  add column if not exists height_cm numeric(6, 2),
  add column if not exists age integer,
  add column if not exists gender text,
  add column if not exists goal text,
  add column if not exists activity_level text,
  add column if not exists allergies text,
  add column if not exists food_preferences text,
  add column if not exists daily_food_budget integer,
  add column if not exists meals_per_day integer,
  add column if not exists target_carbs_gram integer,
  add column if not exists target_fat_gram integer,
  add column if not exists target_water_ml integer,
  add column if not exists meal_pattern text;

alter table public.workout_programs
  add column if not exists level text,
  add column if not exists weekly_sessions integer,
  add column if not exists session_duration_minutes integer,
  add column if not exists equipment text,
  add column if not exists limitations text,
  add column if not exists preference text;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'nutrition_logs_member_id_log_date_key'
      and conrelid = 'public.nutrition_logs'::regclass
  ) then
    alter table public.nutrition_logs
      drop constraint nutrition_logs_member_id_log_date_key;
  end if;
end $$;

create index if not exists nutrition_logs_member_date_idx
  on public.nutrition_logs(member_id, log_date desc);

create index if not exists nutrition_logs_member_meal_idx
  on public.nutrition_logs(member_id, log_date, meal_type);

commit;

