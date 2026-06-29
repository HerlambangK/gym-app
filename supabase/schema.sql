create extension if not exists "pgcrypto";

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type user_status as enum ('ACTIVE', 'INACTIVE', 'BANNED');
  end if;
  if not exists (select 1 from pg_type where typname = 'member_type') then
    create type member_type as enum ('DAILY', 'SUBSCRIPTION', 'TRIAL');
  end if;
  if not exists (select 1 from pg_type where typname = 'member_status') then
    create type member_status as enum ('ACTIVE', 'INACTIVE', 'FROZEN', 'BANNED');
  end if;
  if not exists (select 1 from pg_type where typname = 'plan_type') then
    create type plan_type as enum ('DAILY', 'MONTHLY', 'TRIAL');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'FROZEN');
  end if;
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type invoice_status as enum ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED', 'REFUNDED');
  end if;
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type attendance_status as enum ('CHECKED_IN', 'CHECKED_OUT', 'AUTO_CHECKED_OUT', 'FAILED');
  end if;
  if not exists (select 1 from pg_type where typname = 'blog_access_type') then
    create type blog_access_type as enum ('PUBLIC', 'SUBSCRIBER_ONLY');
  end if;
  if not exists (select 1 from pg_type where typname = 'blog_status') then
    create type blog_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  password_hash text,
  status user_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid references public.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  radius_meters integer not null default 100,
  open_time time not null default '06:00',
  close_time time not null default '22:00',
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  member_code text unique not null,
  branch_id uuid references public.branches(id),
  member_type member_type not null,
  status member_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  type plan_type not null,
  duration_days integer not null,
  price numeric(14, 2) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  category text,
  is_premium boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.membership_plans(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, feature_id)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  member_id uuid not null references public.members(id),
  plan_id uuid not null references public.membership_plans(id),
  amount numeric(14, 2) not null,
  status invoice_status not null default 'PENDING',
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  plan_id uuid not null references public.membership_plans(id),
  invoice_id uuid references public.invoices(id),
  start_date date not null,
  end_date date not null,
  status subscription_status not null default 'PENDING_PAYMENT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id),
  provider text not null,
  provider_order_id text,
  provider_transaction_id text,
  method text,
  amount numeric(14, 2) not null,
  status text not null,
  paid_at timestamptz,
  raw_callback jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendances (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  branch_id uuid not null references public.branches(id),
  subscription_id uuid references public.subscriptions(id),
  check_in_time timestamptz not null default now(),
  check_out_time timestamptz,
  duration_minutes integer,
  check_in_latitude numeric(10, 7),
  check_in_longitude numeric(10, 7),
  check_in_accuracy numeric(10, 2),
  check_out_latitude numeric(10, 7),
  check_out_longitude numeric(10, 7),
  check_out_accuracy numeric(10, 2),
  distance_meters numeric(10, 2),
  status attendance_status not null default 'CHECKED_IN',
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  category text not null,
  amount numeric(14, 2) not null,
  description text,
  expense_date date not null,
  payment_method text,
  proof_url text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_settings (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  tagline text,
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  app_icon_url text,
  primary_color text not null default '24 95% 53%',
  secondary_color text not null default '188 84% 45%',
  accent_color text not null default '142 71% 45%',
  background_color text not null default '240 10% 3.9%',
  card_color text not null default '240 10% 7%',
  border_color text not null default '240 4% 18%',
  radius text not null default '0.75rem',
  theme_mode text not null default 'dark',
  preset_theme text not null default 'Premium Dark',
  whatsapp text,
  instagram_url text,
  tiktok_url text,
  footer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  thumbnail_url text,
  access_type blog_access_type not null default 'PUBLIC',
  status blog_status not null default 'DRAFT',
  author_id uuid references public.users(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  log_date date not null,
  weight_kg numeric(6, 2),
  calories integer,
  protein_gram integer,
  carbs_gram integer,
  fat_gram integer,
  water_ml integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, log_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.members enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.attendances enable row level security;
alter table public.nutrition_logs enable row level security;

insert into public.roles (name, code, description) values
  ('Super Admin', 'SUPER_ADMIN', 'Platform operator'),
  ('Owner', 'OWNER', 'Gym owner'),
  ('Manager', 'MANAGER', 'Branch manager'),
  ('Admin', 'ADMIN', 'Front desk and cashier'),
  ('Marketing', 'MARKETING', 'Content and promo'),
  ('Trainer', 'TRAINER', 'Trainer access'),
  ('Member', 'MEMBER', 'Gym member')
on conflict (code) do nothing;

insert into public.permissions (code, name) values
  ('manage_users', 'Manage Users'),
  ('manage_roles', 'Manage Roles'),
  ('manage_permissions', 'Manage Permissions'),
  ('manage_branches', 'Manage Branches'),
  ('manage_branding', 'Manage Branding'),
  ('manage_theme', 'Manage Theme'),
  ('manage_members', 'Manage Members'),
  ('view_members', 'View Members'),
  ('manage_memberships', 'Manage Memberships'),
  ('manage_plans', 'Manage Plans'),
  ('manage_invoices', 'Manage Invoices'),
  ('manage_payments', 'Manage Payments'),
  ('manage_refunds', 'Manage Refunds'),
  ('view_financial', 'View Financial'),
  ('manage_expenses', 'Manage Expenses'),
  ('view_reports', 'View Reports'),
  ('manage_attendance', 'Manage Attendance'),
  ('manual_check_in', 'Manual Check In'),
  ('manage_blog', 'Manage Blog'),
  ('manage_premium_features', 'Manage Premium Features'),
  ('view_member_portal', 'View Member Portal'),
  ('member_check_in', 'Member Check In'),
  ('member_check_out', 'Member Check Out'),
  ('use_premium_blog', 'Use Premium Blog'),
  ('use_nutrition_log', 'Use Nutrition Log'),
  ('use_workout_progress', 'Use Workout Progress')
on conflict (code) do nothing;

insert into public.membership_plans (name, code, type, duration_days, price, description) values
  ('Daily Pass', 'DAILY_PASS', 'DAILY', 1, 45000, 'Check-in harian'),
  ('Basic Monthly', 'BASIC_MONTHLY', 'MONTHLY', 30, 299000, 'Attendance dan billing'),
  ('Plus Monthly', 'PLUS_MONTHLY', 'MONTHLY', 30, 449000, 'Premium blog, nutrition, body tracking'),
  ('Pro 3 Months', 'PRO_3_MONTHS', 'MONTHLY', 90, 1199000, 'Semua fitur Pro')
on conflict (code) do nothing;

insert into public.features (code, name, category, is_premium) values
  ('attendance_check_in', 'Check-in', 'Attendance', false),
  ('attendance_check_out', 'Check-out', 'Attendance', false),
  ('attendance_history', 'Attendance History', 'Attendance', false),
  ('billing_history', 'Billing History', 'Billing', false),
  ('premium_blog', 'Premium Blog', 'Content', true),
  ('nutrition_log', 'Nutrition Log', 'Health', true),
  ('body_weight_tracking', 'Body Tracking', 'Health', true),
  ('workout_progress', 'Workout Progress', 'Training', true),
  ('trainer_notes', 'Trainer Notes', 'Training', true),
  ('class_booking', 'Class Booking', 'Operation', true),
  ('priority_support', 'Priority Support', 'Support', true),
  ('multi_branch_access', 'Multi Branch Access', 'Branch', true)
on conflict (code) do nothing;

