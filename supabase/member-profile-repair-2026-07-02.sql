create unique index if not exists idx_members_user_id_unique
  on public.members (user_id);

insert into public.members (user_id, member_code, member_type, status)
select
  u.id,
  'M-' || upper(substr(replace(u.id::text, '-', ''), 1, 10)),
  'TRIAL',
  'ACTIVE'
from public.users u
join public.user_roles ur on ur.user_id = u.id
join public.roles r on r.id = ur.role_id
where r.code = 'MEMBER'
  and not exists (
    select 1
    from public.members m
    where m.user_id = u.id
  );
