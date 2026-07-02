-- Add verification_sent_at column to track when verification email was sent
alter table public.users
  add column if not exists verification_sent_at timestamptz;

-- Create index for cleanup queries
create index if not exists idx_users_verification_sent_at on public.users(verification_sent_at);
