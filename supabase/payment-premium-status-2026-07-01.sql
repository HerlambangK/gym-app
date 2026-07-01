do $$ begin
  alter type public.member_type add value if not exists 'PREMIUM';
exception
  when duplicate_object then null;
end $$;
