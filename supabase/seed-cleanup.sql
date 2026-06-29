-- CLEANUP: Hapus semua data test ci_test_ (integrase test)
-- Jalankan setelah integration test selesai

delete from public.nutrition_logs where member_id in (
  select m.id from public.members m
  join public.users u on u.id = m.user_id
  where u.email like 'ci_test_%'
);
delete from public.attendances where member_id in (
  select m.id from public.members m
  join public.users u on u.id = m.user_id
  where u.email like 'ci_test_%'
);
delete from public.payments where invoice_id in (
  select i.id from public.invoices i
  join public.members m on m.id = i.member_id
  join public.users u on u.id = m.user_id
  where u.email like 'ci_test_%'
);
delete from public.subscriptions where member_id in (
  select m.id from public.members m
  join public.users u on u.id = m.user_id
  where u.email like 'ci_test_%'
);
delete from public.invoices where member_id in (
  select m.id from public.members m
  join public.users u on u.id = m.user_id
  where u.email like 'ci_test_%'
);
delete from public.members where user_id in (
  select id from public.users where email like 'ci_test_%'
);
delete from public.user_roles where user_id in (
  select id from public.users where email like 'ci_test_%'
);
delete from public.users where email like 'ci_test_%';
