# Cleanup Data Member

Hapus semua data transaksional member: attendances, payments, subscriptions, invoices, members.

## Query

Jalankan di **Supabase Dashboard → SQL Editor**:

```sql
begin;

-- 1. Attendances
delete from public.attendances;

-- 2. Payments
delete from public.payments;

-- 3. Subscriptions
delete from public.subscriptions;

-- 4. Invoices
delete from public.invoices;

-- 5. Members
delete from public.members;

commit;
```

## Reset Total (termasuk nutrisi & workout)

```sql
begin;

delete from public.attendances;
delete from public.payments;
delete from public.subscriptions;
delete from public.invoices;
delete from public.workout_exercises;
delete from public.workout_sessions;
delete from public.workout_programs;
delete from public.nutrition_targets;
delete from public.nutrition_logs;
delete from public.members;

commit;
```

## Hanya Satu Member

Ganti `MEMBER_UUID` dengan id member yang dituju.

```sql
begin;

delete from public.attendances where member_id = 'MEMBER_UUID';
delete from public.payments where invoice_id in (select id from public.invoices where member_id = 'MEMBER_UUID');
delete from public.subscriptions where member_id = 'MEMBER_UUID';
delete from public.invoices where member_id = 'MEMBER_UUID';
delete from public.members where id = 'MEMBER_UUID';

commit;
```

## Catatan

- Tidak ada `ON DELETE CASCADE` di FK mana pun — wajib hapus child dulu (urutan di atas sudah benar).
- Gunakan `BEGIN` / `COMMIT` agar atomic: jika salah satu `DELETE` gagal, semua otomatis rollback.
- Data master (`users`, `membership_plans`, `branches`, `features`) tidak terhapus.
