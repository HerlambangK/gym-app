# 🏋️ ForgeFit Studio — Roadmap Pengembangan

> Dokumen ini berisi fase-fase pengembangan sistem manajemen gym premium secara detail dan kompleks. Setiap fase mencakup konteks, daftar pekerjaan, kriteria selesai, dan prioritas.

---

## 📋 Status Saat Ini (v0.8)

| Area | Status | Catatan |
|------|--------|---------|
| Auth & RBAC | ✅ Berfungsi | Login/register, 7 role, middleware, server guards |
| Landing page | ✅ Lengkap | Hero, pricing, blog, CTA, mobile nav |
| Owner dashboard | ✅ Dasar | KPI summary, invoice stats, daftar member |
| Admin dashboard | ✅ Dasar | Metric cards, tabel member/invoice, chart attendance |
| Member dashboard | ✅ Dasar | Check-in panel, sisa hari subscription |
| GPS Check-in | ✅ Berfungsi | Validasi radius via Haversine, session management |
| Midtrans Payment | ✅ Berfungsi | Create transaction + callback + signature verification |
| Branch location | ✅ Berfungsi | Map picker, Nominatim search, radius config |
| Premium features | ✅ Berfungsi | Toggle on/off dari owner/admin |
| Nutrition log | ✅ Dasar | Log makanan + target BMI/kalori/protein |
| Workout program | ✅ Dasar | Tree program → day → exercise |
| Blog | ✅ Dasar | Publik + subscriber access |
| Profile settings | ✅ Berfungsi | Edit nama + no telepon |

---

## 🚀 Fase-Fase Pengembangan

---

### FASE 1: Production Hardening & UX Polish

**Tujuan**: Membuat sistem robust, handle semua edge case, dan memberikan pengalaman yang mulus.

#### 1.1 Global Error & Empty States

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Error boundary global | `src/app/error.tsx` | Buat error boundary dengan tombol "Coba Lagi" dan dukungan logging |
| 404 page | `src/app/not-found.tsx` | Halaman 404 dengan navigasi ke dashboard/home |
| Loading skeleton | `src/app/loading.tsx` | Global loading state dengan skeleton yang sesuai konteks |
| Empty state component | `src/components/ui/empty-state.tsx` | Komponen reusable untuk daftar kosong dengan ilustrasi + CTA |
| Error banner component | `src/components/ui/error-banner.tsx` | Banner error yang bisa dismiss dengan detail error |

#### 1.2 Dashboard Loading & Skeleton

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Owner dashboard loading | `src/app/owner/dashboard/loading.tsx` | Skeleton grid 4 metric card + chart placeholder |
| Admin dashboard loading | `src/app/admin/dashboard/loading.tsx` | Skeleton 3 metric card + 2 tabel placeholder |
| Member dashboard loading | `src/app/member/dashboard/loading.tsx` | Skeleton check-in panel + subscription card |
| Data table skeleton | `src/components/dashboard/data-table-skeleton.tsx` | Skeleton baris tabel untuk loading data |

#### 1.3 Form UX Enhancement

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Toast sukses konsisten | `src/components/ui/form-feedback.tsx` | Integrasi sonner toast di semua form action |
| Field error inline | Validasi sisi client + server | Setiap input punya helper text error |
| Auto-disable submit | Hook `useFormPending` | Cegah double submit di semua form |
| Confirm dialog destructive | `src/components/ui/confirm-dialog.tsx` | Konfirmasi sebelum hapus/nonaktifkan |

#### 1.4 Auth Edge Cases

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Session refresh otomatis | `src/lib/supabase/middleware.ts` | Refresh token sebelum expired |
| Rate limit login | `src/lib/auth.ts` | Cooldown 30 detik setelah 5 gagal login |
| Email verification resend | `src/app/auth/verify/page.tsx` | Tombol kirim ulang verifikasi email |
| Password reset flow | `src/app/auth/reset-password/page.tsx` | Integrasi penuh dengan Supabase reset password |

#### 1.5 Loading & Transition UX

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Page transition | `src/components/nprogress.tsx` | Progress bar di top saat navigasi |
| Suspense boundaries | Semua page | Bungkus tiap section dengan Suspense |
| useTransition | Client component | Hindari UI freeze saat action pending |

**Kriteria Selesai Fase 1**:
- [ ] Tidak ada white screen saat loading
- [ ] Semua form punya validasi client + server
- [ ] Error boundary menangkap semua error tak terduga
- [ ] Empty states informatif di semua tabel/daftar
- [ ] Semua action punya toast feedback

---

### FASE 2: Admin & Owner Operational Dashboard

**Tujuan**: Memberikan alat operasional lengkap untuk admin front desk dan owner.

#### 2.1 Member Management CRUD

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Tambah member manual | `src/app/admin/members/create/page.tsx` | Form create member + assign plan langsung |
| Edit member | `src/app/admin/members/[id]/page.tsx` | Edit profil, status, ganti plan |
| Search + filter member | `src/components/member/member-filters.tsx` | Filter by name, status, plan type, date range |
| Bulk action member | Select multiple → change status, extend subscription |
| Export CSV | `src/lib/export.ts` | Export daftar member ke CSV/Excel |

#### 2.2 Expense Management

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Expense CRUD | `src/app/owner/expenses/page.tsx` | Tambah, edit, hapus pengeluaran dengan kategori |
| Expense categories | `supabase/schema.sql` | Enum/tabel kategori (sewa, listrik, gaji, dll) |
| Expense chart | `src/components/charts/expense-chart.tsx` | Pie chart per kategori, bar chart per bulan |
| Recurring expense | Auto-create monthly expenses (sewa, gaji) |

#### 2.3 Invoice & Payment Management

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Manual invoice | `src/app/admin/invoices/create/page.tsx` | Buat invoice manual untuk pembayaran offline |
| Payment method | Support tunai, transfer manual selain Midtrans |
| Invoice void/refund | `src/app/admin/invoices/[id]/page.tsx` | Void atau refund invoice dengan alasan |
| Invoice reminder | Auto-remind invoice pending via email |

#### 2.4 Enhanced Attendance View

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Kalender attendance | `src/components/attendance/calendar-view.tsx` | View kalender kehadiran per member |
| Attendance export | Export rekap kehadiran harian/bulanan |
| Durasi rata-rata | Statistik rata-rata durasi latihan member |
| Peak hours chart | Grafik jam sibuk gym (heatmap) |

#### 2.5 Branch Multi-Location Foundation

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Branch CRUD | Tambah/hapus/edit multiple cabang |
| Branch selector | `src/components/branch/branch-selector.tsx` | Pilih cabang di semua halaman admin/owner |
| Data per-branch | Filter attendance, member, invoice per cabang |

**Kriteria Selesai Fase 2**:
- [ ] Admin bisa create/edit member dari dashboard
- [ ] Expense tercatat dengan kategori dan chart
- [ ] Invoice bisa dibuat manual + export
- [ ] Attendance bisa difilter per cabang
- [ ] Search + filter di semua tabel

---

### FASE 3: Member Experience & Engagement

**Tujuan**: Membuat member betah dan termotivasi dengan fitur personal.

#### 3.1 Advanced Workout Tracking

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Workout history | `src/app/member/workouts/history/page.tsx` | Riwayat sesi latihan selesai dengan detail |
| Set tracking real-time | UI centang set per exercise saat latihan |
| Workout timer | Timer istirahat antar set |
| Progress chart | `src/components/charts/workout-progress.tsx` | Grafik progres beban, reps, volume per exercise |
| Workout template | Simpan program sebagai template, duplikat, modifikasi |
| Exercise library | `supabase/schema.sql` | Tabel library exercise (nama, otot target, equipment) |
| Personal records | Catat PR (personal record) per exercise |

#### 3.2 Enhanced Nutrition

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Makanan favorit | Save makanan favorit untuk re-log cepat |
| Meal plan | Template meal plan (sarapan, makan siang, etc) |
| Nutrition calendar | `src/components/nutrition/calendar-view.tsx` | Lihat log per hari di kalender |
| Macro pie chart | Visual breakdown protein/karbo/lemak per hari |
| Weight tracking chart | Grafik berat badan dari waktu ke waktu |
| Nutrition insight | Ringkasan: "Minggu ini protein naik 15%" |

#### 3.3 Body Measurement

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Body metrics table | `supabase/schema.sql` | Tabel body_measurements (weight, body fat, muscle, waist, etc) |
| Body log form | `src/components/member/body-measurement-form.tsx` | Input pengukuran tubuh |
| Body progress chart | `src/components/charts/body-progress.tsx` | Grafik weight, body fat %, muscle mass |
| Photo progress | Simpan foto progress (members only) |

#### 3.4 Trainer Notes

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Trainer assignment | `supabase/schema.sql` | Relasi trainer → member |
| Trainer notes CRUD | `src/app/admin/trainer-notes/page.tsx` | Catatan personal trainer per member |
| Member view notes | `src/app/member/workouts/trainer-notes.tsx` | Lihat catatan dari trainer |
| Program recommendation | Trainer bisa assign workout program ke member |

#### 3.5 Subscription & Billing Experience

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Auto-renewal | Subscription auto-renew dengan notifikasi 7 hari sebelum expired |
| Plan upgrade prorata | Hitung selisih harga untuk upgrade mid-cycle |
| Freeze subscription | Member bisa freeze subscription (maks 2x/tahun) |
| Payment history | Riwayat pembayaran dengan status jelas |
| Invoice download | Download invoice PDF |

**Kriteria Selesai Fase 3**:
- [ ] Member bisa tracking set real-time saat latihan
- [ ] Progress chart workout beban dan reps dari waktu ke waktu
- [ ] Nutrition auto-save makanan favorit
- [ ] Body measurement dengan grafik progress
- [ ] Trainer bisa assign program dan catatan

---

### FASE 4: Marketing & Communication

**Tujuan**: Membantu owner/admin marketing menjangkau dan engage member.

#### 4.1 Blog Management

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Blog editor | `src/app/admin/blog/create/page.tsx` | Rich text editor (TipTap/Quill) + cover image |
| Blog publish flow | Draft → review → publish schedule |
| Blog categories | Kategori artikel (nutrition, workout, lifestyle) |
| Blog image | Upload cover image ke Supabase Storage |
| Blog SEO | Meta title, description, slug otomatis |

#### 4.2 Notification System

| Pekerjaan | File | Detail |
|-----------|------|--------|
| In-app notification | `supabase/schema.sql` | Tabel notifications + UI dropdown |
| Notification triggers | Check-in reminder, payment reminder, blog baru, promo |
| Email notification | Send email via Supabase or Resend for: |
| | - Welcome email setelah register |
| | - Payment reminder H-3 expired |
| | - Blog baru untuk subscriber |
| Push notification | Browser push notification (Web Push API) |

#### 4.3 Promo & Referral

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Promo codes | `supabase/schema.sql` | Tabel promo_codes (code, diskon %, max uses) |
| Apply promo saat checkout | Member bisa input kode promo sebelum bayar |
| Referral program | Referral link → diskon untuk referrer + referee |
| Referral dashboard | Owner lihat performa referral program |

#### 4.4 Member Communication

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Broadcast message | Admin kirim pesan ke semua member aktif |
| Targeted message | Filter member by plan type, status, last check-in |
| Inbox member | `src/app/member/inbox/page.tsx` | Baca pesan dari admin |
| Read receipt | Tracking siapa yang sudah baca pesan |

**Kriteria Selesai Fase 4**:
- [ ] Blog punya editor + publish flow + kategori
- [ ] Notifikasi muncul di in-app dropdown
- [ ] Email terkirim untuk event penting (welcome, reminder)
- [ ] Promo code bisa dibuat dan dipakai
- [ ] Admin bisa broadcast pesan ke member

---

### FASE 5: Advanced Analytics & Business Intelligence

**Tujuan**: Owner bisa mengambil keputusan bisnis berbasis data.

#### 5.1 Owner Dashboard V2

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Drill-down revenue | Klik angka revenue → lihat breakdown per plan |
| MRR/ARR chart | Monthly Recurring Revenue, Annual Run Rate |
| Retention cohort | Cohort analysis: berapa % member bertahan setelah 1/3/6 bulan |
| Churn prediction | Identifikasi member risiko churn (tidak check-in >14 hari) |
| LTV per member | Average Lifetime Value per segment |
| Peak hour analysis | Jam berapa gym paling padat per hari |

#### 5.2 Financial Reports

| Pekerjaan | File | Detail |
|-----------|------|--------|
| P&L statement | Profit & Loss per bulan dengan perbandingan MoM |
| Cash flow | Cash inflow (subscription) vs outflow (expense) |
| Tax report | Ringkasan PPh, PPN untuk pelaporan |
| Export report | Export PDF/Excel semua laporan keuangan |
| Budget planning | Set budget per kategori expense, tracking realisasi |

#### 5.3 Member Analytics

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Member growth chart | Grafik pertumbuhan member per bulan |
| Plan distribution | Pie chart distribusi plan (daily, basic, plus, pro) |
| Active vs inactive | Ratio member aktif vs tidak aktif |
| Check-in heatmap | Hari/jam paling ramai |
| Gender/age demo | Jika data tersedia, demografi member |

#### 5.4 Dashboard Customization

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Widget system | Owner bisa drag-drop widget di dashboard |
| Saved filters | Simpan filter untuk report yang sering dipakai |
| Export all data | Export semua data ke CSV/Excel |
| Scheduled report | Auto-kirim report via email tiap minggu/bulan |

**Kriteria Selesai Fase 5**:
- [ ] Dashboard owner bisa drill-down ke detail transaksi
- [ ] MRR/ARR dan churn rate tampil
- [ ] P&L statement siap pakai
- [ ] Retention cohort analysis berfungsi
- [ ] Semua angka bisa diexport

---

### FASE 6: Multi-Branch & Enterprise

**Tujuan**: Skalakan sistem untuk multiple lokasi dengan kontrol terpusat.

#### 6.1 Multi-Branch Architecture

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Branch management full | CRUD branch dengan jam operasional, kontak, gambar |
| Cross-branch report | Owner lihat aggregate data semua cabang |
| Per-branch pricing | Tiap cabang bisa punya paket harga sendiri |
| Branch transfer | Member pindah cabang (temporary/permanent) |
| Branch inventory | `supabase/schema.sql` | Tabel inventory per cabang |

#### 6.2 Staff Management

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Staff CRUD | Tambah staff (admin, trainer, marketing) dengan role |
| Staff schedule | Jadwal shift staff per cabang |
| Staff attendance | Check-in/out untuk staff (bukan GPS, manual) |
| Payroll integration | Data kehadiran staff untuk kalkulasi gaji |

#### 6.3 Class & Booking System

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Class types | `supabase/schema.sql` | Tabel class (yoga, HIIT, zumba, dll) |
| Class schedule | Jadwal kelas per hari + trainer + kuota |
| Booking system | Member booking kelas, dengan limit kuota |
| Waitlist | Jika kelas penuh, masuk waitlist |
| Class attendance | Check-in khusus untuk class |
| Cancel booking | Cancel dengan batas waktu |

#### 6.4 Equipment Management

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Equipment list | `supabase/schema.sql` | Daftar alat gym per cabang |
| Maintenance schedule | Jadwal maintenance alat |
| Maintenance log | Catatan service/kerusakan |
| Equipment status | Status: available, maintenance, broken |

**Kriteria Selesai Fase 6**:
- [ ] Multi-cabang dengan data terpisah tapi aggregate terpusat
- [ ] Manajemen staff dengan schedule dan attendance
- [ ] Booking kelas dengan waitlist
- [ ] Equipment management dengan maintenance log

---

### FASE 7: Mobile & Performance

**Tujuan**: Pengalaman mobile maksimal dan performa optimal.

#### 7.1 PWA (Progressive Web App)

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Manifest | `src/app/manifest.ts` | Web manifest dengan icon, theme color |
| Service worker | `public/sw.js` | Cache static assets, offline page |
| Install prompt | Tombol "Install App" untuk member |
| Offline page | Halaman offline dengan informasi kontak gym |
| Push notifications | Web push untuk check-in reminder, promo |

#### 7.2 Image Optimization

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Next/Image config | `next.config.ts` | Semua image paket Next/Image dengan blur placeholder |
| Supabase Storage | Upload image profile member, blog cover, logo gym |
| Image resize | Buat thumbnail otomatis untuk berbagai ukuran |
| Lazy loading | Semua gambar lazy load dengan low-res placeholder |

#### 7.3 Performance Optimization

| Pekerjaan | File | Detail |
|-----------|------|--------|
| React profiler | Audit komponen yang re-render tidak perlu |
| Memoization | `useMemo` + `useCallback` untuk komponen berat |
| Bundle analysis | Analisis bundle size, split large dependencies |
| Route prefetch | Prefetch halaman yang sering dikunjungi |
| DB query optimization | Tambah index, optimize N+1 queries |
| ISR for static pages | Blog publik, pricing page pakai ISR |

#### 7.4 Native Mobile (Optional)

| Pekerjaan | File | Detail |
|-----------|------|--------|
| React Native / Expo | Aplikasi mobile native untuk check-in GPS |
| Shared logic | Bagi validasi, format, tipe antara web dan mobile |
| Biometric auth | Fingerprint/FaceID untuk login mobile |
| Offline check-in | Queue check-in saat offline, submit saat online |

**Kriteria Selesai Fase 7**:
- [ ] PWA bisa diinstall dan jalan offline
- [ ] Semua gambar optimized (lazy load, responsive)
- [ ] Lighthouse score > 90 untuk mobile dan desktop
- [ ] Bundle size < 200kb initial load

---

### FASE 8: Security & Compliance

**Tujuan**: Memastikan sistem aman, data member terlindungi, dan compliance regulasi.

#### 8.1 Security Hardening

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Rate limiting | API rate limit untuk public endpoints (login, register, contact) |
| CSRF protection | Double-submit cookie pattern untuk form |
| SQL injection audit | Review semua query sudah pakai parameterized |
| XSS sanitization | Sanitasi input user sebelum render HTML |
| CORS policy | Ketatkan CORS hanya untuk domain sendiri |
| Security headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |

#### 8.2 Data Privacy

| Pekerjaan | File | Detail |
|-----------|------|--------|
| GDPR compliance | Privacy policy, cookie consent, data deletion |
| Data retention policy | Auto-delete data lama sesuai kebijakan |
| Data export member | Member bisa download data pribadi mereka |
| Account deletion | Full account deletion untuk member |
| Audit log | Log semua akses ke data sensitif |

#### 8.3 RLS & Authorization Audit

| Pekerjaan | File | Detail |
|-----------|------|--------|
| RLS review | Pastikan semua tabel punya RLS yang benar |
| Permission audit | Cocokkan permission code dengan RBAC helper |
| Role assignment audit | Batasi assign role SUPER_ADMIN dan OWNER |
| Service role usage | Review semua pemakaian admin client |

**Kriteria Selesai Fase 8**:
- [ ] Security headers aktif di response
- [ ] Rate limiting aktif di public endpoints
- [ ] Semua tabel punya RLS (kecuali service-role only)
- [ ] Data member bisa diexport dan dihapus
- [ ] Audit log tercatat

---

### FASE 9: Testing & Quality Assurance

**Tujuan**: Coverage test yang memadai untuk prevent regression.

#### 9.1 Unit Test Expansion

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Lib test coverage | Test semua helper di `src/lib/` (format, haversine, validators, rbac, feature-gate) |
| DB helper test | Test semua fungsi di `src/lib/db/` dengan mock Supabase |
| Server action test | Test semua server action (branches, member, features) |
| Validation test | Test Zod schema dengan berbagai input |

#### 9.2 Integration Test

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Auth flow integration | Register → login → dashboard redirect |
| Payment flow | Create transaction → callback → subscription active |
| Check-in flow | GPS validasi → check-in → check-out → duration |
| Branch CRUD | Create branch → update location → delete |

#### 9.3 E2E Test Expansion

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Playwright login flow | Login modal → credential → dashboard landing |
| Playwright pricing flow | Pricing page → pilih paket → redirect |
| Playwright member flow | Check-in → nutrition log → workout program |
| Playwright admin flow | View members → view invoices → toggle features |
| Playwright owner flow | View dashboard → financial → settings |

#### 9.4 Test Infrastructure

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Test DB setup | Supabase local/test DB untuk integration test |
| CI/CD pipeline | GitHub Actions: lint → typecheck → unit → integration → e2e |
| Test data factory | Helper untuk generate test data konsisten |
| Snapshot testing | Snapshot untuk komponen UI stabil |

**Kriteria Selesai Fase 9**:
- [ ] Coverage > 80% untuk `src/lib/`
- [ ] Integration test untuk auth, payment, check-in flow
- [ ] E2E test untuk semua role (member, admin, owner)
- [ ] CI pipeline green di setiap PR

---

### FASE 10: Deployment & DevOps

**Tujuan**: Deployment yang reliable, monitoring, dan skalabilitas.

#### 10.1 Production Deployment

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Vercel deployment | Connect repo, set env vars, custom domain |
| Supabase production | Migration, seed data production |
| SSL certificate | Auto via Vercel + custom domain |
| Environment variables | `.env.production` dengan production keys |
| Custom domain | Domain kustom (gym.forgefit.com) |

#### 10.2 Monitoring & Logging

| Pekerjaan | File | Detail |
|-----------|------|--------|
| Error tracking | Sentry/Bugsnag integration |
| Performance monitoring | Vercel Analytics, Web Vitals |
| Server logging | Log Midtrans callback, auth events, error DB |
| Alert system | Notifikasi kalau Midtrans callback gagal > 5 menit |
| Uptime monitoring | Monitoring 24/7 via Pingdom/StatusCake |

#### 10.3 Backup & Disaster Recovery

| Pekerjaan | File | Detail |
|-----------|------|--------|
| DB backup | Scheduled daily backup Supabase |
| Backup restore | Script restore dari backup terbaru |
| Disaster recovery plan | Dokumentasi langkah-langkah recovery |
| Rollback strategy | Git tag + deployment rollback via Vercel |

**Kriteria Selesai Fase 10**:
- [ ] App live di production domain
- [ ] Error tracking aktif + alert
- [ ] Backup harian berjalan
- [ ] Dokumentasi deployment dan recovery

---

## 📊 Prioritas & Timeline

| Fase | Prioritas | Estimasi | Effort | Dependencies |
|------|-----------|----------|--------|--------------|
| **Fase 1** | 🔴 Kritis | 1-2 minggu | Medium | - |
| **Fase 2** | 🔴 Kritis | 2-3 minggu | Large | Fase 1 |
| **Fase 3** | 🟡 Tinggi | 3-4 minggu | Very Large | Fase 2 |
| **Fase 4** | 🟡 Tinggi | 2-3 minggu | Large | - |
| **Fase 5** | 🟢 Normal | 2-3 minggu | Large | Fase 2,3 |
| **Fase 6** | 🟢 Normal | 4-6 minggu | Very Large | Fase 2 |
| **Fase 7** | 🟢 Normal | 2-3 minggu | Medium | Fase 1 |
| **Fase 8** | 🔴 Kritis | 1-2 minggu | Medium | Fase 1 |
| **Fase 9** | 🟡 Tinggi | 2-3 minggu | Medium | Fase 1-6 |
| **Fase 10** | 🟡 Tinggi | 1 minggu | Small | Fase 8 |

> **Estimasi total**: 20-30 minggu dengan satu developer full-time.
> Bisa diparalelkan: Fase 5 ↔ Fase 6, Fase 8 ↔ Fase 9.

---

## 🏗️ Arsitektur untuk Fase Mendatang

### Tabel baru yang perlu ditambahkan

```sql
-- Fase 2
expense_categories (id, name, code, is_active)
member_notes (id, member_id, admin_id, note, created_at)

-- Fase 3
body_measurements (id, member_id, date, weight_kg, body_fat_pct, muscle_mass_kg, waist_cm, notes)
exercise_library (id, name, muscle_group, equipment, description)
workout_logs (id, member_id, session_id, exercise_id, set_number, reps, weight_kg, completed, date)
workout_templates (id, member_id, name, created_at)

-- Fase 4
notifications (id, user_id, type, title, body, data, read_at, created_at)
promo_codes (id, code, discount_pct, max_uses, current_uses, valid_from, valid_until, is_active)
referrals (id, referrer_id, referee_id, code, discount_amount, status, created_at)
member_inbox (id, from_user_id, to_user_id, subject, body, read_at, created_at)

-- Fase 6
staff (id, user_id, branch_id, role, schedule, hourly_rate)
inventory (id, branch_id, item_name, quantity, unit, min_stock)
classes (id, branch_id, name, trainer_id, capacity, description)
class_schedule (id, class_id, day, start_time, end_time, max_participants)
bookings (id, member_id, class_schedule_id, status, booked_at, checked_in)
equipment (id, branch_id, name, category, purchase_date, last_maintenance, status)

-- Fase 5: analytics bisa view SQL tanpa tabel baru
-- Fase 8: audit_logs udah ada
```

### Approache untuk fitur kompleks

**Booking System**:
```
Class → ClassSchedule (recurring: setiap Senin jam 18:00)
       → Booking (member booking slot tertentu)
       → Waitlist (jika penuh)
       → Attendance (check-in khusus class)
```

**Notification System**:
```
Trigger (payment reminder, blog baru, etc)
  → Create notification row
  → Kirim email (via Resend/Supabase)
  → Tampilkan di in-app dropdown
  → (Opsional) Push notification via Web Push
```

**Multi-Branch**:
```
Semua tabel operasional punya branch_id
Owner bisa lihat aggregate via UNION atau query terpisah
Admin terikat ke satu branch (branch_id di profile)
Member punya home branch, bisa transfer
```

---

## ✅ Cara Menggunakan Dokumen Ini

1. **Pilih fase** berdasarkan prioritas dan kebutuhan bisnis saat ini
2. **Buat task untuk setiap pekerjaan** di project management tool
3. **Gunakan agent yang sesuai** dari `AGENTS.md` untuk tiap pekerjaan
    - `frontend-agent` untuk UI components
    - `backend-agent` untuk server actions & API
    - `database-agent` untuk schema & migration
    - `security-agent` untuk auth & RBAC hardening
4. **Selesaikan checklist** di setiap fase sebelum lanjut
5. **Update dokumen ini** jika ada perubahan scope atau prioritas

---

> Dokumen ini living document — akan terus diperbarui seiring perkembangan sistem.
> Last updated: 2026-07-01
