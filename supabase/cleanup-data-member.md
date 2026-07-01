# Cleanup Data Member

Hapus semua data transaksional member.

## Urutan

Tabel dengan FK ke `members(id)`:

1. `attendances` → NO CASCADE
2. `nutrition_logs` → **NO CASCADE**
3. `nutrition_targets` → CASCADE
4. `payments` → via invoices
5. `subscriptions` → via invoices & members
6. `invoices` → NO CASCADE
7. `members`

## Query Semua Member

```sql
begin;

delete from public.attendances;
delete from public.nutrition_logs;
delete from public.nutrition_targets;
delete from public.payments;
delete from public.subscriptions;
delete from public.invoices;
delete from public.members;

commit;
```

## Query Satu Member

Ganti `MEMBER_UUID`:

```sql
begin;

delete from public.attendances where member_id = 'MEMBER_UUID';
delete from public.nutrition_logs where member_id = 'MEMBER_UUID';
delete from public.nutrition_targets where member_id = 'MEMBER_UUID';
delete from public.payments where invoice_id in (select id from public.invoices where member_id = 'MEMBER_UUID');
delete from public.subscriptions where member_id = 'MEMBER_UUID';
delete from public.invoices where member_id = 'MEMBER_UUID';
delete from public.members where id = 'MEMBER_UUID';

commit;
```

## Catatan

- `nutrition_logs` satu-satunya FK ke `members` tanpa `ON DELETE CASCADE` — hapus manual sebelum `members`.
- Gunakan `BEGIN/COMMIT` agar atomic.
- Data master (`users`, `membership_plans`, `branches`, `features`) tidak terhapus.

