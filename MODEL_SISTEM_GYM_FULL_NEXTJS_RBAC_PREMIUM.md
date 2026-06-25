# MODEL SISTEM GYM — Full Next.js, shadcn/ui, RBAC, Premium Feature & Financial Dashboard

## 0. Ringkasan Keputusan Terbaru

Dokumen ini adalah versi lanjutan dari brainstorming sistem gym. Fokus sistem adalah membangun platform gym berbasis web yang memiliki:

1. **Landing page public** untuk marketing gym.
2. **Dashboard owner** untuk pengelolaan bisnis, financial, membership, laporan, branding, dan setting.
3. **Dashboard admin/front desk** untuk operasional harian seperti member, pembayaran, invoice, dan attendance.
4. **Portal member** untuk check-in/check-out, status membership, billing, fitur premium, blog, dan pencatatan gizi.
5. **RBAC** untuk membatasi akses berdasarkan role.
6. **Feature gating** untuk membatasi fitur berdasarkan paket langganan.
7. **Payment gateway Midtrans** untuk VA dan QRIS.
8. **Theme dan branding dinamis** agar owner bisa mengganti logo, favicon, app icon, warna tema, dan tampilan brand.

Keputusan stack final yang disarankan:

```txt
Frontend + Backend : Next.js App Router
Language           : TypeScript
UI Component       : shadcn/ui
Styling            : Tailwind CSS
Animation          : Motion / Framer Motion
Database           : PostgreSQL
ORM                : Prisma
Auth               : Auth.js / NextAuth
Payment Gateway    : Midtrans
Chart              : Recharts / shadcn chart
Validation         : Zod
Form               : React Hook Form
Table              : TanStack Table + shadcn Table
Notification       : Sonner
Icon               : Lucide React
Deployment         : Docker
```

> Catatan penting: untuk core sistem membership, invoice, payment, financial, attendance, dan laporan, **PostgreSQL lebih direkomendasikan daripada MongoDB** karena data sistem ini sangat transaksional dan banyak relasi.

---

# 1. Tujuan Sistem

Sistem gym ini bertujuan untuk membuat bisnis gym menjadi lebih rapi secara digital.

Kalimat inti sistem:

> Member daftar, memilih paket harian atau langganan, membayar melalui Midtrans, membership aktif otomatis, lalu member bisa check-in dan check-out berbasis lokasi. Owner dapat melihat data member, pendapatan, pengeluaran, profit, invoice, attendance, performa paket, dan fitur premium berdasarkan langganan.

Sistem harus menjawab pertanyaan operasional berikut:

| Pertanyaan | Jawaban dari Sistem |
|---|---|
| Siapa member ini? | Data member dan profil user |
| Paketnya apa? | Subscription aktif dan plan |
| Sudah bayar atau belum? | Invoice dan payment status |
| Masih aktif atau expired? | Subscription status dan end date |
| Boleh check-in atau tidak? | Berdasarkan membership, payment, lokasi, dan status member |
| Berapa lama latihan? | Dari check-in dan check-out time |
| Fitur apa yang bisa dipakai member? | Berdasarkan plan feature / entitlement |
| Pendapatan bulan ini berapa? | Financial dashboard |
| Pengeluaran bulan ini berapa? | Expense tracking |
| Profit bisnis berapa? | Revenue dikurangi expense |
| Paket mana yang paling laris? | Membership analytics |

---

# 2. Modul Utama Sistem

```txt
Sistem Gym
├── Public Website / Landing Page
├── Auth
├── Owner Dashboard
├── Admin Dashboard
├── Member Portal
├── Membership & Subscription
├── Billing & Invoice
├── Payment Gateway Midtrans
├── Attendance Check-in / Check-out
├── Financial Management
├── Membership Analytics
├── Blog Public & Premium
├── Nutrition Log
├── Branding & Theme
├── RBAC
├── Premium Feature Management
└── Reports
```

---

# 3. Public Website / Landing Page

Landing page digunakan untuk marketing gym.

## 3.1 Halaman Public

```txt
/
├── Home
├── Paket Membership
├── Fasilitas
├── Trainer
├── Blog
├── Promo
├── Kontak
└── Daftar Member
```

## 3.2 Section Homepage

| Section | Isi |
|---|---|
| Navbar | Logo, menu, login, daftar |
| Hero | Headline, subheadline, CTA, image gym |
| Stats | Total member, tahun berdiri, trainer, rating |
| Benefit | Keunggulan gym |
| Facilities | Foto dan deskripsi fasilitas |
| Membership Pricing | Daily pass, 1 bulan, 2 bulan, 3 bulan, dst |
| Trainer | Profil trainer |
| Testimonials | Review member |
| Blog Preview | Artikel terbaru |
| FAQ | Pertanyaan umum |
| Location | Alamat dan maps |
| CTA | Daftar sekarang / WhatsApp |
| Footer | Kontak, social media, copyright |

## 3.3 Komponen shadcn yang Dipakai di Landing

| Kebutuhan | shadcn Component |
|---|---|
| Navbar desktop | NavigationMenu |
| Navbar mobile | Sheet |
| CTA | Button |
| Label promo | Badge |
| Pricing | Card, Badge, Button |
| Fasilitas | Carousel, Card |
| Testimonial | Card, Avatar, Carousel |
| FAQ | Accordion |
| Form kontak | Form, Input, Textarea |
| Footer separator | Separator |

## 3.4 Motion Landing Page

Gunakan animasi secukupnya agar terasa premium.

| Area | Animasi |
|---|---|
| Hero title | Fade up |
| CTA button | Hover scale |
| Pricing card | Hover lift |
| Facility card | Fade in on scroll |
| Stats | Animated number |
| Blog card | Hover image zoom |
| Navbar | Sticky blur transition |

---

# 4. Theme, Branding, dan Customization Owner

Owner harus dapat mengganti identitas brand tanpa mengubah kode.

## 4.1 Setting Branding Owner

Menu:

```txt
Owner Dashboard
└── Settings
    ├── Branding
    ├── Theme
    ├── Logo & Icon
    ├── Website Content
    └── Preview
```

Field yang bisa diubah owner:

| Field | Keterangan |
|---|---|
| Brand name | Nama gym |
| Tagline | Slogan gym |
| Logo utama | Logo untuk navbar dan dashboard |
| Logo dark mode | Logo alternatif untuk dark mode |
| Favicon | Icon browser |
| App icon | Icon PWA/mobile shortcut |
| Primary color | Warna utama brand |
| Secondary color | Warna pendukung |
| Accent color | Warna highlight |
| Background color | Background utama |
| Card color | Warna card |
| Radius | Kelengkungan komponen |
| Theme mode | Light / Dark / System |
| Font style | Default font |
| WhatsApp | Nomor CTA |
| Instagram | Link social media |
| TikTok | Link social media |
| Footer text | Teks footer |

## 4.2 Preset Theme

Sediakan preset agar owner mudah memilih.

| Preset | Karakter | Cocok Untuk |
|---|---|---|
| Premium Dark | Hitam, orange, sporty | Gym modern, bodybuilding |
| Clean Light | Putih, biru/emerald | Health club, gym keluarga |
| Red Energy | Gelap, merah, agresif | Boxing, MMA, crossfit |
| Luxury Gold | Hitam/navy, emas | Premium private gym |
| Green Performance | Gelap/putih, hijau | Fitness, wellness, performance |
| Blue Corporate | Putih/biru | Gym corporate/profesional |

Default MVP:

```txt
Theme       : Premium Dark
Primary     : Orange
Secondary   : Amber
Background  : Dark / Zinc
Radius      : 16px
Font        : Geist / Inter
```

## 4.3 CSS Variable untuk shadcn/ui

Gunakan CSS variable agar theme bisa dinamis dari database.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 24 95% 53%;
  --primary-foreground: 0 0% 98%;
  --secondary: 45 93% 47%;
  --card: 0 0% 100%;
  --border: 240 5.9% 90%;
  --radius: 0.75rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 24 95% 53%;
  --primary-foreground: 0 0% 98%;
  --secondary: 45 93% 47%;
  --card: 240 10% 7%;
  --border: 240 3.7% 15.9%;
}
```

## 4.4 Branding Flow

```txt
Owner login
↓
Buka Settings > Branding
↓
Upload logo, favicon, app icon
↓
Pilih theme preset atau custom color
↓
Klik Preview
↓
Klik Save
↓
Landing page, dashboard, dan member portal memakai branding baru
```

---

# 5. Arsitektur UI dengan shadcn/ui

## 5.1 Komponen Global yang Digunakan

| Komponen | Penggunaan |
|---|---|
| Button | CTA, submit, action |
| Card | Statistik, pricing, detail data |
| Badge | Status membership, invoice, payment |
| Avatar | User profile, trainer, member |
| DropdownMenu | User menu, row action |
| Sheet | Mobile sidebar, drawer form |
| Dialog | Create/edit form, detail data |
| AlertDialog | Delete, cancel, refund confirmation |
| Tabs | Detail member, financial report |
| Accordion | FAQ |
| Tooltip | Hint pada dashboard |
| Popover | Date picker, filter |
| Calendar | Date range report |
| Select | Filter status, role, plan |
| Command | Search cepat member/invoice |
| Table | Data member, invoice, payment, attendance |
| Checkbox | Bulk action, permission selection |
| Switch | Toggle active/inactive |
| Slider | Radius check-in |
| Skeleton | Loading state |
| Progress | Sisa hari membership, progress gizi |
| Separator | Pemisah layout |
| ScrollArea | Sidebar dan panel panjang |
| Sonner | Toast notification |
| Breadcrumb | Navigasi dashboard |
| Chart | Revenue, membership, attendance |
| Carousel | Fasilitas, testimonial |
| HoverCard | Preview member/paket |
| Drawer | Mobile action |

---

# 6. Motion / Animation Guideline

Gunakan Motion untuk membuat UI terasa hidup, tetapi jangan mengganggu operasional.

## 6.1 Komponen Motion Reusable

```txt
components/motion/
├── fade-in.tsx
├── fade-up.tsx
├── scale-in.tsx
├── stagger-container.tsx
├── page-transition.tsx
├── animated-number.tsx
└── hover-lift.tsx
```

## 6.2 Aturan Animasi

| Area | Aturan |
|---|---|
| Landing page | Boleh lebih ekspresif |
| Owner dashboard | Animasi ringan saja |
| Admin dashboard | Minim animasi, fokus cepat |
| Member portal | Animasi pada check-in/check-out dan progress |
| Table | Jangan animasi berlebihan |
| Dialog | Scale/fade halus |
| Toast | Gunakan Sonner |

## 6.3 Animasi Check-in

Flow UI:

```txt
Member klik Check-in
↓
Button loading
↓
Browser meminta lokasi
↓
Card menampilkan "Memvalidasi lokasi..."
↓
Jika valid, muncul success state
↓
Card berubah menjadi "Sedang Latihan"
↓
Timer durasi berjalan
```

---

# 7. Role Based Access Control / RBAC

RBAC mengatur **siapa boleh mengakses apa**.

RBAC berbeda dengan premium feature:

| Sistem | Mengatur |
|---|---|
| RBAC | Hak akses berdasarkan role user |
| Premium Feature | Hak akses berdasarkan paket/langganan member |

Contoh:

- Owner boleh membuka financial dashboard karena role-nya owner.
- Member langganan boleh membuka nutrition log karena paketnya membuka fitur premium.
- Member harian tidak boleh membuka nutrition log walaupun user-nya valid.

## 7.1 Role Awal

| Role | Keterangan |
|---|---|
| SUPER_ADMIN | Pengelola sistem utama jika nanti menjadi SaaS multi-gym |
| OWNER | Pemilik gym |
| MANAGER | Manager cabang |
| ADMIN | Staff front desk/kasir |
| MARKETING | Pengelola landing page, promo, blog |
| TRAINER | Trainer, nanti bisa melihat client dan workout notes |
| MEMBER | Member gym |

Untuk MVP minimal:

```txt
OWNER
ADMIN
MEMBER
```

Tetapi database disiapkan untuk role lengkap.

## 7.2 Permission List

Permission menggunakan kode agar mudah dicek di server.

```txt
manage_users
manage_roles
manage_permissions
manage_branches
manage_branding
manage_theme
manage_members
view_members
manage_memberships
manage_plans
manage_invoices
manage_payments
manage_refunds
view_financial
manage_expenses
view_reports
manage_attendance
manual_check_in
manage_blog
manage_premium_features
view_member_portal
member_check_in
member_check_out
use_premium_blog
use_nutrition_log
use_workout_progress
```

## 7.3 Permission Matrix

| Permission | Super Admin | Owner | Manager | Admin | Marketing | Trainer | Member |
|---|---:|---:|---:|---:|---:|---:|---:|
| manage_users | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| manage_roles | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| manage_permissions | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| manage_branches | Ya | Ya | Terbatas | Tidak | Tidak | Tidak | Tidak |
| manage_branding | Ya | Ya | Tidak | Tidak | Terbatas | Tidak | Tidak |
| manage_theme | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| manage_members | Ya | Ya | Ya | Ya | Tidak | Terbatas | Tidak |
| view_members | Ya | Ya | Ya | Ya | Tidak | Terbatas | Tidak |
| manage_memberships | Ya | Ya | Ya | Ya | Tidak | Tidak | Tidak |
| manage_plans | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| manage_invoices | Ya | Ya | Ya | Ya | Tidak | Tidak | Tidak |
| manage_payments | Ya | Ya | Ya | Ya | Tidak | Tidak | Tidak |
| manage_refunds | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| view_financial | Ya | Ya | Terbatas | Tidak | Tidak | Tidak | Tidak |
| manage_expenses | Ya | Ya | Terbatas | Tidak | Tidak | Tidak | Tidak |
| view_reports | Ya | Ya | Ya | Terbatas | Tidak | Tidak | Tidak |
| manage_attendance | Ya | Ya | Ya | Ya | Tidak | Terbatas | Tidak |
| manual_check_in | Ya | Ya | Ya | Ya | Tidak | Tidak | Tidak |
| manage_blog | Ya | Ya | Tidak | Tidak | Ya | Tidak | Tidak |
| manage_premium_features | Ya | Ya | Tidak | Tidak | Tidak | Tidak | Tidak |
| view_member_portal | Tidak | Tidak | Tidak | Tidak | Tidak | Tidak | Ya |
| member_check_in | Tidak | Tidak | Tidak | Tidak | Tidak | Tidak | Ya |
| member_check_out | Tidak | Tidak | Tidak | Tidak | Tidak | Tidak | Ya |

## 7.4 Implementasi RBAC

RBAC harus dicek di dua sisi:

1. **UI / Client guard** agar menu tidak tampil.
2. **Server guard** agar API/server action tetap aman.

Backend/server action tetap menjadi sumber validasi utama.

Contoh helper:

```ts
export function hasPermission(userPermissions: string[], permission: string) {
  return userPermissions.includes(permission)
}
```

Contoh server guard:

```ts
await requirePermission("view_financial")
```

Contoh route guard:

```txt
/owner/financial hanya boleh OWNER atau SUPER_ADMIN
/admin/members boleh OWNER, MANAGER, ADMIN
/member/dashboard hanya boleh MEMBER
```

---

# 8. Premium Feature Management / Feature Gating

Premium feature mengatur **fitur apa yang terbuka berdasarkan paket membership**.

Ini penting karena sistem punya member harian, member basic, dan member langganan.

## 8.1 Konsep Feature Gating

```txt
Member punya subscription aktif
↓
Subscription terhubung ke membership plan
↓
Membership plan punya daftar fitur
↓
Sistem cek apakah fitur tersebut aktif untuk plan itu
↓
Jika aktif, member boleh akses
↓
Jika tidak aktif, tampilkan upgrade prompt
```

## 8.2 Jenis Paket

| Paket | Tipe | Durasi | Akses |
|---|---|---:|---|
| Daily Pass | DAILY | 1 hari | Check-in/check-out saja |
| Basic Monthly | MONTHLY | 30 hari | Attendance + billing + profile |
| Plus Monthly | MONTHLY | 30 hari | Basic + blog premium + nutrition log |
| Pro Monthly | MONTHLY | 30 hari | Plus + progress workout + body tracking |
| 3 Months Pro | MONTHLY | 90 hari | Semua fitur Pro |

## 8.3 Feature List

```txt
attendance_check_in
attendance_check_out
attendance_history
billing_history
premium_blog
nutrition_log
body_weight_tracking
workout_progress
trainer_notes
class_booking
priority_support
multi_branch_access
```

## 8.4 Feature Access Matrix

| Feature | Daily | Basic | Plus | Pro |
|---|---:|---:|---:|---:|
| Check-in | Ya | Ya | Ya | Ya |
| Check-out | Ya | Ya | Ya | Ya |
| Attendance history | Terbatas | Ya | Ya | Ya |
| Billing history | Ya | Ya | Ya | Ya |
| Blog public | Ya | Ya | Ya | Ya |
| Blog premium | Tidak | Tidak | Ya | Ya |
| Nutrition log | Tidak | Tidak | Ya | Ya |
| Body weight tracking | Tidak | Tidak | Ya | Ya |
| Workout progress | Tidak | Tidak | Tidak | Ya |
| Trainer notes | Tidak | Tidak | Tidak | Ya/Nanti |
| Class booking | Tidak | Tidak | Nanti | Nanti |
| Multi-branch access | Tidak | Opsional | Opsional | Ya |

## 8.5 Aturan Premium Access

Member boleh memakai fitur premium jika semua kondisi ini terpenuhi:

```txt
1. User login sebagai MEMBER
2. Member tidak banned
3. Subscription aktif
4. Payment status paid
5. Subscription belum expired
6. Plan memiliki feature yang diminta
7. Feature sedang active di sistem
```

## 8.6 Upgrade Prompt

Jika member mencoba membuka fitur premium yang tidak termasuk paketnya, tampilkan:

```txt
Fitur ini tersedia untuk member Plus atau Pro.
Upgrade paket kamu untuk membuka fitur Nutrition Log, Blog Premium, dan Progress Tracking.

[Upgrade Sekarang]
[Lihat Paket]
```

## 8.7 Feature Flag untuk Owner

Owner juga bisa mengaktifkan atau menonaktifkan fitur tertentu dari dashboard.

Contoh:

```txt
Owner Dashboard
└── Settings
    └── Premium Features
        ├── Blog Premium ON/OFF
        ├── Nutrition Log ON/OFF
        ├── Workout Progress ON/OFF
        ├── Body Tracking ON/OFF
        └── Class Booking ON/OFF
```

Jika fitur dimatikan oleh owner, maka fitur tidak bisa dipakai walaupun plan member mendukung.

---

# 9. Membership dan Subscription

## 9.1 Jenis Member

| Jenis Member | Keterangan |
|---|---|
| Daily Member | Bayar harian dulu baru latihan |
| Subscription Member | Member langganan bulanan |
| Trial Member | Member trial/promosi |
| Frozen Member | Member sedang dibekukan |
| Banned Member | Member diblokir |

## 9.2 Flow Registrasi Member

```txt
Calon member buka landing page
↓
Klik Daftar
↓
Isi form registrasi
↓
Pilih paket harian / langganan
↓
Sistem membuat user member
↓
Sistem membuat invoice
↓
Member diarahkan ke billing
↓
Member bayar via Midtrans VA/QRIS
↓
Midtrans callback ke sistem
↓
Payment menjadi PAID
↓
Subscription aktif
↓
Member bisa check-in/check-out
```

## 9.3 Daily Pass

Aturan Daily Pass:

| Aturan | Keterangan |
|---|---|
| Harus bayar dulu | Ya |
| Masa aktif | 1 hari |
| Check-in | Ya |
| Check-out | Ya |
| Fitur premium | Tidak |
| Berlaku | Sampai akhir hari pembayaran |

Rekomendasi:

```txt
Daily Pass berlaku 1 hari dan boleh check-in/check-out selama hari itu.
```

## 9.4 Subscription Bulanan

Paket:

```txt
1 bulan = 30 hari
2 bulan = 60 hari
3 bulan = 90 hari
6 bulan = 180 hari
12 bulan = 365 hari
```

Status subscription:

```txt
PENDING_PAYMENT
ACTIVE
EXPIRED
CANCELLED
FROZEN
```

## 9.5 Renewal

### Renewal sebelum expired

```txt
Paket lama expired: 30 Juni 2026
Member perpanjang: 20 Juni 2026
Paket baru: 30 hari
Start baru: 1 Juli 2026
End baru: 30 Juli 2026
```

### Renewal setelah expired

```txt
Paket lama expired: 30 Juni 2026
Member perpanjang: 5 Juli 2026
Paket baru: 30 hari
Start baru: 5 Juli 2026
End baru: 3 Agustus 2026
```

---

# 10. Billing, Invoice, dan Midtrans

## 10.1 Metode Pembayaran

```txt
Midtrans
├── Virtual Account
├── QRIS
├── E-Wallet opsional
└── Bank transfer opsional
```

MVP bisa tetap menyediakan manual payment untuk admin:

```txt
Manual
├── Cash
├── Transfer manual
└── QRIS manual
```

## 10.2 Flow Payment Midtrans

```txt
Member pilih paket
↓
Sistem membuat invoice PENDING
↓
Sistem request transaction ke Midtrans
↓
Midtrans mengembalikan payment_url / snap_token
↓
Member membayar via VA/QRIS
↓
Midtrans mengirim callback/webhook
↓
Sistem validasi signature
↓
Payment status menjadi PAID
↓
Invoice menjadi PAID
↓
Subscription menjadi ACTIVE
```

## 10.3 Status Invoice

```txt
PENDING
PAID
EXPIRED
FAILED
CANCELLED
REFUNDED
```

## 10.4 Aturan Billing

| Aturan | Keterangan |
|---|---|
| Subscription aktif hanya jika invoice paid | Wajib |
| Pending invoice tidak bisa check-in | Wajib |
| Payment callback harus divalidasi | Wajib |
| Semua refund harus oleh owner | Wajib |
| Semua perubahan invoice masuk audit log | Wajib |

---

# 11. Attendance Check-in / Check-out

## 11.1 Konsep

Member tidak menggunakan QR. Member login ke portal lalu menekan tombol:

```txt
[Check-in]
[Check-out]
```

Sistem mengambil lokasi browser dan membandingkan dengan lokasi cabang.

## 11.2 Flow Check-in

```txt
Member login
↓
Buka portal member
↓
Klik Check-in
↓
Browser meminta izin lokasi
↓
Sistem mengambil latitude, longitude, accuracy
↓
Sistem cek user role MEMBER
↓
Sistem cek member status
↓
Sistem cek subscription aktif
↓
Sistem cek payment paid
↓
Sistem cek feature attendance_check_in
↓
Sistem cek lokasi dalam radius cabang
↓
Sistem cek jam operasional
↓
Sistem cek tidak ada sesi aktif
↓
Check-in berhasil
```

## 11.3 Flow Check-out

```txt
Member selesai latihan
↓
Klik Check-out
↓
Sistem mencari attendance session aktif
↓
Sistem mengisi check_out_time
↓
Sistem menghitung duration_minutes
↓
Status menjadi CHECKED_OUT
```

## 11.4 Validasi Attendance

| Validasi | Aturan |
|---|---|
| User login | Harus login |
| Role | Harus MEMBER |
| Subscription | Harus active |
| Payment | Harus paid |
| Lokasi | Dalam radius cabang |
| GPS accuracy | Tidak terlalu buruk |
| Jam operasional | Harus dalam jam buka |
| Double check-in | Tidak boleh ada sesi aktif ganda |
| Status member | Tidak banned/frozen |
| Feature access | Plan harus mendukung attendance |

## 11.5 Case Lupa Check-out

Solusi:

```txt
Jika member lupa check-out sampai gym tutup,
sistem bisa auto checkout pada jam tutup cabang.
```

Status:

```txt
AUTO_CHECKED_OUT
```

Admin/owner juga bisa force checkout.

---

# 12. Owner Dashboard

Owner dashboard adalah pusat kontrol bisnis.

## 12.1 Menu Owner

```txt
Owner Dashboard
├── Overview
├── Financial
│   ├── Revenue
│   ├── Expenses
│   ├── Cashflow
│   ├── Profit & Loss
│   ├── Payment Methods
│   ├── Invoices
│   └── Export Report
│
├── Membership
│   ├── Overview
│   ├── Active Members
│   ├── Expiring Soon
│   ├── Expired Members
│   ├── Renewal
│   ├── Package Performance
│   └── Churn Analysis
│
├── Members
├── Plans
├── Payments
├── Invoices
├── Attendances
├── Blog
├── Premium Features
├── Reports
└── Settings
    ├── Branding
    ├── Theme
    ├── Users
    ├── Roles
    └── Permissions
```

## 12.2 Summary Cards Owner

```txt
Total Revenue Bulan Ini
Total Revenue Hari Ini
Total Expense Bulan Ini
Net Profit
Active Members
New Members Bulan Ini
Check-in Hari Ini
Pending Invoices
Expiring Members 7 Hari
Most Popular Plan
```

## 12.3 Chart Owner

| Chart | Fungsi |
|---|---|
| Revenue Chart | Pendapatan harian/bulanan |
| Cashflow Chart | Uang masuk vs uang keluar |
| Profit Chart | Revenue - expense |
| Payment Method Chart | VA, QRIS, cash, transfer |
| Membership Growth | Pertumbuhan member |
| Active vs Expired | Komposisi status member |
| Package Performance | Paket paling laris |
| Attendance Frequency | Frekuensi kedatangan member |
| Churn Chart | Member expired tidak renewal |

---

# 13. Financial Management

## 13.1 Tujuan Financial Module

Owner harus bisa melihat kondisi bisnis, bukan hanya transaksi member.

Financial module menjawab:

```txt
Pendapatan berapa?
Pengeluaran berapa?
Profit berapa?
Metode pembayaran mana yang paling banyak dipakai?
Paket mana yang paling menghasilkan?
Invoice pending berapa?
Refund berapa?
```

## 13.2 Expense Category

```txt
Gaji staff
Sewa tempat
Listrik
Internet
Maintenance alat
Marketing
Refund
Operasional lain
```

## 13.3 Financial Pages

```txt
/owner/financial
/owner/financial/revenue
/owner/financial/expenses
/owner/financial/cashflow
/owner/financial/profit-loss
/owner/financial/reports
```

## 13.4 Financial Features

| Fitur | Keterangan |
|---|---|
| Revenue summary | Pendapatan dari invoice paid |
| Expense tracking | Input pengeluaran manual |
| Cashflow | Uang masuk dan keluar |
| Profit & Loss | Revenue - Expense |
| Payment method report | VA, QRIS, cash, transfer |
| Package revenue | Pendapatan per paket |
| Export CSV | Export laporan |
| Export PDF | Tahap berikutnya |

---

# 14. Admin Dashboard

Admin fokus ke operasional harian.

## 14.1 Menu Admin

```txt
Admin Dashboard
├── Dashboard
├── Members
├── New Member
├── Payments
├── Invoices
├── Attendances
├── Manual Check-in
└── Reports Terbatas
```

## 14.2 Admin Tidak Boleh

Admin tidak boleh:

```txt
Melihat profit detail
Mengubah theme
Mengubah logo/favicon
Menghapus payment paid sembarangan
Melakukan refund tanpa owner
Mengubah role/permission
Mengubah harga paket tanpa izin
```

---

# 15. Member Portal

## 15.1 Menu Member Basic

```txt
Member Portal
├── Dashboard
├── Check-in / Check-out
├── Membership Saya
├── Billing
├── Riwayat Pembayaran
└── Profil
```

## 15.2 Menu Member Premium

```txt
Member Portal
├── Dashboard
├── Check-in / Check-out
├── Membership Saya
├── Riwayat Attendance
├── Billing
├── Blog Premium
├── Nutrition Log
├── Body Tracking
├── Workout Progress
└── Profil
```

## 15.3 Dashboard Member

```txt
Halo, Budi

Status Membership: Aktif
Paket: Plus Monthly
Berlaku sampai: 24 Juli 2026
Sisa hari: 18 hari

[Check-in Sekarang]
```

Jika sedang latihan:

```txt
Kamu sedang latihan
Check-in: 18:20
Durasi: 42 menit

[Check-out]
```

---

# 16. Database Model Awal

## 16.1 users

```txt
id
name
email
phone
password_hash
status
created_at
updated_at
```

## 16.2 roles

```txt
id
name
code
description
created_at
updated_at
```

## 16.3 permissions

```txt
id
code
name
description
created_at
updated_at
```

## 16.4 role_permissions

```txt
role_id
permission_id
```

## 16.5 user_roles

```txt
user_id
role_id
```

## 16.6 branches

```txt
id
name
address
latitude
longitude
radius_meters
open_time
close_time
phone
email
is_active
created_at
updated_at
```

## 16.7 members

```txt
id
user_id
member_code
branch_id
member_type
status
created_at
updated_at
```

member_type:

```txt
DAILY
SUBSCRIPTION
TRIAL
```

status:

```txt
ACTIVE
INACTIVE
FROZEN
BANNED
```

## 16.8 membership_plans

```txt
id
name
code
type
duration_days
price
description
is_active
created_at
updated_at
```

type:

```txt
DAILY
MONTHLY
TRIAL
```

## 16.9 plan_features

```txt
id
plan_id
feature_id
is_enabled
created_at
updated_at
```

## 16.10 features

```txt
id
code
name
description
category
is_premium
is_active
created_at
updated_at
```

Contoh feature code:

```txt
attendance_check_in
attendance_check_out
attendance_history
premium_blog
nutrition_log
body_weight_tracking
workout_progress
```

## 16.11 subscriptions

```txt
id
member_id
plan_id
invoice_id
start_date
end_date
status
created_at
updated_at
```

## 16.12 invoices

```txt
id
invoice_number
member_id
plan_id
amount
status
expired_at
created_at
updated_at
```

## 16.13 payments

```txt
id
invoice_id
provider
provider_order_id
provider_transaction_id
method
amount
status
paid_at
raw_callback
created_at
updated_at
```

## 16.14 attendances

```txt
id
member_id
branch_id
subscription_id
check_in_time
check_out_time
duration_minutes
check_in_latitude
check_in_longitude
check_in_accuracy
check_out_latitude
check_out_longitude
check_out_accuracy
distance_meters
status
failure_reason
created_at
updated_at
```

## 16.15 expenses

```txt
id
branch_id
category
amount
description
expense_date
payment_method
proof_url
created_by
created_at
updated_at
```

## 16.16 branding_settings

```txt
id
brand_name
tagline
logo_url
logo_dark_url
favicon_url
app_icon_url
primary_color
secondary_color
accent_color
background_color
card_color
border_color
radius
theme_mode
preset_theme
whatsapp
instagram_url
tiktok_url
footer_text
created_at
updated_at
```

## 16.17 blog_posts

```txt
id
title
slug
excerpt
content
thumbnail_url
access_type
status
author_id
published_at
created_at
updated_at
```

access_type:

```txt
PUBLIC
SUBSCRIBER_ONLY
```

## 16.18 nutrition_logs

```txt
id
member_id
log_date
weight_kg
calories
protein_gram
carbs_gram
fat_gram
water_ml
notes
created_at
updated_at
```

## 16.19 audit_logs

```txt
id
actor_user_id
action
entity_type
entity_id
old_value
new_value
ip_address
user_agent
created_at
```

---

# 17. Arsitektur Folder Next.js

Gunakan feature-based architecture.

```txt
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── pricing/
│   │   ├── blog/
│   │   ├── contact/
│   │   └── register/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── owner/
│   │   ├── dashboard/
│   │   ├── financial/
│   │   ├── memberships/
│   │   ├── members/
│   │   ├── payments/
│   │   ├── invoices/
│   │   ├── attendances/
│   │   ├── premium-features/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── members/
│   │   ├── payments/
│   │   ├── invoices/
│   │   ├── attendances/
│   │   └── check-in-manual/
│   │
│   ├── member/
│   │   ├── dashboard/
│   │   ├── check-in/
│   │   ├── billing/
│   │   ├── nutrition/
│   │   ├── workouts/
│   │   ├── blog/
│   │   └── profile/
│   │
│   └── api/
│       ├── auth/
│       ├── midtrans/
│       ├── upload/
│       ├── attendance/
│       └── cron/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── public/
│   ├── dashboard/
│   ├── charts/
│   ├── data-table/
│   ├── forms/
│   ├── motion/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── rbac/
│   ├── branding/
│   ├── members/
│   ├── memberships/
│   ├── plans/
│   ├── features/
│   ├── billing/
│   ├── payments/
│   ├── financial/
│   ├── attendance/
│   ├── nutrition/
│   ├── blog/
│   ├── reports/
│   └── settings/
│
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── midtrans.ts
│   ├── permissions.ts
│   ├── feature-gate.ts
│   ├── format.ts
│   ├── date.ts
│   ├── money.ts
│   ├── haversine.ts
│   └── validators.ts
│
├── hooks/
│   ├── use-current-user.ts
│   ├── use-geolocation.ts
│   ├── use-theme-branding.ts
│   └── use-debounce.ts
│
├── styles/
│   ├── globals.css
│   └── theme.css
│
├── types/
│   ├── auth.ts
│   ├── rbac.ts
│   ├── feature.ts
│   ├── member.ts
│   ├── payment.ts
│   ├── attendance.ts
│   └── financial.ts
│
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

# 18. Feature Folder Detail

## 18.1 RBAC Feature

```txt
features/rbac/
├── actions/
│   ├── get-roles.ts
│   ├── get-permissions.ts
│   ├── assign-role.ts
│   └── update-role-permissions.ts
│
├── components/
│   ├── role-table.tsx
│   ├── permission-matrix.tsx
│   ├── role-form.tsx
│   └── user-role-dialog.tsx
│
├── schemas/
│   └── rbac.schema.ts
│
└── utils/
    └── has-permission.ts
```

## 18.2 Premium Features Module

```txt
features/features/
├── actions/
│   ├── get-features.ts
│   ├── toggle-feature.ts
│   ├── assign-feature-to-plan.ts
│   └── get-member-entitlements.ts
│
├── components/
│   ├── feature-table.tsx
│   ├── feature-toggle-card.tsx
│   ├── plan-feature-matrix.tsx
│   └── upgrade-prompt.tsx
│
├── schemas/
│   └── feature.schema.ts
│
└── utils/
    └── can-use-feature.ts
```

## 18.3 Financial Feature

```txt
features/financial/
├── actions/
│   ├── get-financial-summary.ts
│   ├── get-revenue-chart.ts
│   ├── create-expense.ts
│   ├── update-expense.ts
│   └── export-financial-report.ts
│
├── components/
│   ├── financial-summary-cards.tsx
│   ├── revenue-chart.tsx
│   ├── expense-table.tsx
│   ├── cashflow-chart.tsx
│   ├── payment-method-chart.tsx
│   └── financial-filter.tsx
│
├── schemas/
│   └── expense.schema.ts
│
└── utils/
    └── calculate-profit.ts
```

---

# 19. API / Route Handler Penting

## 19.1 Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## 19.2 RBAC

```txt
GET  /api/roles
POST /api/roles
GET  /api/permissions
POST /api/roles/:id/permissions
POST /api/users/:id/roles
```

## 19.3 Feature Gating

```txt
GET  /api/features
POST /api/features
PUT  /api/features/:id
POST /api/plans/:id/features
GET  /api/member/entitlements
```

## 19.4 Billing

```txt
POST /api/billing/create-invoice
GET  /api/member/invoices
GET  /api/owner/invoices
```

## 19.5 Midtrans

```txt
POST /api/midtrans/create-transaction
POST /api/midtrans/callback
```

## 19.6 Attendance

```txt
POST /api/member/check-in
POST /api/member/check-out
GET  /api/member/attendances
GET  /api/owner/attendances
POST /api/admin/manual-check-in
POST /api/admin/force-checkout
```

## 19.7 Financial

```txt
GET  /api/owner/financial/summary
GET  /api/owner/financial/revenue
GET  /api/owner/financial/cashflow
POST /api/owner/financial/expenses
GET  /api/owner/financial/expenses
GET  /api/owner/financial/export
```

---

# 20. Guard yang Wajib Ada

## 20.1 Auth Guard

Cek user sudah login atau belum.

```txt
Jika belum login → redirect ke /login
```

## 20.2 Role Guard

Cek role user.

```txt
Jika bukan owner → tidak boleh buka /owner/*
Jika bukan admin → tidak boleh buka /admin/*
Jika bukan member → tidak boleh buka /member/*
```

## 20.3 Permission Guard

Cek permission spesifik.

```txt
view_financial
manage_members
manage_attendance
manage_premium_features
```

## 20.4 Feature Guard

Cek fitur premium.

```txt
canUseFeature(memberId, "nutrition_log")
canUseFeature(memberId, "premium_blog")
canUseFeature(memberId, "workout_progress")
```

## 20.5 Subscription Guard

Cek subscription aktif.

```txt
subscription.status === ACTIVE
subscription.end_date >= today
invoice.status === PAID
```

---

# 21. DataTable Standard

Karena sistem banyak tabel, buat reusable data table.

Fitur wajib:

```txt
Search
Filter status
Filter tanggal
Filter paket
Filter cabang
Sorting
Pagination
Column visibility
Bulk action
Export CSV
Row action
```

Dipakai di:

```txt
Member table
Invoice table
Payment table
Attendance table
Expense table
Subscription table
Blog table
Role table
Feature table
```

---

# 22. Phase Pengerjaan

## Phase 1 — Design System

```txt
Setup Next.js App Router
Setup TypeScript
Setup Tailwind
Setup shadcn/ui
Setup CSS variables
Setup dark/light mode
Setup Motion components
Setup dashboard shell
Setup public layout
```

## Phase 2 — Database, Auth, RBAC

```txt
Setup Prisma
Setup PostgreSQL
Setup Auth.js / NextAuth
Create users, roles, permissions
Create role permission matrix
Implement route guard
Implement server permission guard
```

## Phase 3 — Branding & Theme

```txt
Branding settings
Upload logo
Upload favicon
Theme preset
Custom color
Preview branding
Apply dynamic CSS variables
```

## Phase 4 — Public Website

```txt
Landing page
Pricing page
Blog public
Register page
Contact page
CTA WhatsApp
```

## Phase 5 — Membership Core

```txt
CRUD plan
Plan feature matrix
Register member
Create subscription
Create invoice
Member status
```

## Phase 6 — Billing & Midtrans

```txt
Create invoice
Create Midtrans transaction
VA payment
QRIS payment
Webhook callback
Update invoice paid
Activate subscription
```

## Phase 7 — Attendance

```txt
Check-in
Check-out
Geolocation
Radius validation
Duration calculation
Attendance history
Manual check-in
Force checkout
```

## Phase 8 — Owner Dashboard

```txt
Overview cards
Revenue chart
Membership chart
Attendance chart
Pending invoice
Expiring member
Package performance
```

## Phase 9 — Financial

```txt
Expense tracking
Cashflow
Profit & Loss
Payment method report
Export CSV
```

## Phase 10 — Premium Member Features

```txt
Premium blog
Nutrition log
Body weight tracking
Workout progress
Upgrade prompt
Feature gating UI
```

---

# 23. MVP Prioritas Paling Penting

Untuk pengerjaan awal, jangan semua langsung dibuat sempurna.

Prioritas MVP:

```txt
1. Auth + RBAC
2. Theme + branding dasar
3. Landing page
4. Paket membership
5. Register member
6. Invoice
7. Midtrans payment
8. Aktivasi subscription
9. Check-in/check-out
10. Owner dashboard summary
11. Admin member/payment table
12. Feature gating dasar
```

Financial detail dan premium feature lengkap bisa setelah core stabil.

---

# 24. Kesimpulan Final

Sistem gym ini harus dibangun sebagai **Fullstack Next.js SaaS-style Gym Management System**.

Fitur utama:

```txt
Landing page premium
Dashboard owner
Dashboard admin
Portal member
RBAC
Premium feature gating
Membership plan
Billing Midtrans
Attendance lokasi
Check-in/check-out duration
Financial dashboard
Expense tracking
Membership analytics
Dynamic branding
Theme customization
Blog public/premium
Nutrition log
```

Prinsip penting:

1. **RBAC mengatur akses berdasarkan role.**
2. **Feature gating mengatur akses berdasarkan paket/langganan.**
3. **Payment paid mengaktifkan subscription.**
4. **Subscription aktif membuka attendance.**
5. **Plan feature membuka fitur premium.**
6. **Owner punya kendali atas branding, theme, financial, dan fitur premium.**
7. **Admin fokus ke operasional harian.**
8. **Member fokus ke check-in/check-out dan fitur sesuai paketnya.**

Kalimat desain sistem:

> Sistem ini bukan hanya aplikasi absensi gym, tetapi platform digital untuk mengelola bisnis gym dari marketing, member, pembayaran, membership, attendance, financial, sampai fitur premium berbasis langganan.
