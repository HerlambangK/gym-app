update public.members m
set member_type = 'PREMIUM'
where exists (
  select 1
  from public.subscriptions s
  join public.membership_plans p on p.id = s.plan_id
  where s.member_id = m.id
    and s.status = 'ACTIVE'
    and p.code <> 'DAILY_PASS'
);
