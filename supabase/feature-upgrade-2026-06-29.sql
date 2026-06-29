-- Apply this on an existing Supabase database before using nutrition targets
-- and workout program persistence. The same definitions are also reflected in schema.sql.

alter table public.nutrition_logs
  add column if not exists food_name text;

create table if not exists public.nutrition_targets (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  target_bmi numeric(5, 2),
  target_calories integer,
  target_weight_kg numeric(6, 2),
  target_protein_gram integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id)
);

create table if not exists public.workout_programs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  title text not null,
  goal text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.workout_programs(id) on delete cascade,
  day_name text not null,
  session_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_name text not null,
  exercise_type text not null,
  sets integer not null default 3,
  reps text,
  load_note text,
  exercise_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_targets enable row level security;
alter table public.workout_programs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_exercises enable row level security;
