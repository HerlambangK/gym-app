# Daftar Test Scenario — Gym App

## 1. Register Scenario (`src/__tests__/scenarios/register.scenario.test.ts`) — 7 Tests

| # | Skenario                                 | Input                                                                          | Expected                                                          |
| - | ---------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 1 | Registrasi sukses - data valid           | name=Budi Santoso, email=budi@test.com, phone=08123456789, password=rahasia123 | `{ redirectTo: "/" }`                                           |
| 2 | Registrasi gagal - nama < 2 karakter     | name="A"                                                                       | `{ error: "Nama lengkap minimal 2 karakter." }`                 |
| 3 | Registrasi gagal - email tidak valid     | email=invalid-email                                                            | `{ error: "Format email tidak valid." }`                        |
| 4 | Registrasi gagal - password < 6 karakter | password=12345                                                                 | `{ error: "Password minimal 6 karakter." }`                     |
| 5 | Registrasi gagal - email sudah terdaftar | Supabase error "User already registered"                                       | `{ error: mengandung "Email sudah terdaftar", cooldown: true }` |
| 6 | Registrasi gagal - nama kosong           | name=""                                                                        | `{ error: "Nama lengkap minimal 2 karakter." }`                 |
| 7 | Registrasi gagal - password kosong       | password=""                                                                    | `{ error: "Password wajib diisi." }`                            |

## 2. Login Scenario (`src/__tests__/scenarios/login.scenario.test.ts`) — 8 Tests

| # | Skenario                               | Input / Setup                              | Expected                                             |
| - | -------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| 1 | Login MEMBER sukses                    | role=MEMBER                                | `{ redirectTo: "/member/dashboard" }`              |
| 2 | Login ADMIN sukses                     | role=ADMIN                                 | `{ redirectTo: "/admin/dashboard" }`               |
| 3 | Login OWNER sukses                     | role=OWNER                                 | `{ redirectTo: "/owner/dashboard" }`               |
| 4 | Login SUPER_ADMIN sukses               | role=SUPER_ADMIN                           | `{ redirectTo: "/owner/dashboard" }`               |
| 5 | Login gagal - password salah           | Supabase error "Invalid login credentials" | `{ error: "Email atau password salah." }`          |
| 6 | Login gagal - email belum diverifikasi | email_confirmed_at=null                    | `{ error: mengandung "Email belum diverifikasi" }` |
| 7 | Login gagal - email kosong             | email=""                                   | `{ error: "Email wajib diisi." }`                  |
| 8 | Login gagal - password < 6 karakter    | password=12                                | `{ error: "Password minimal 6 karakter." }`        |

## 3. Member Scenario (`src/__tests__/scenarios/member.scenario.test.ts`) — 10 Tests

| #  | Skenario                                     | Setup                                                | Expected                                           |
| -- | -------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| 1  | Check-in sukses dalam radius branch          | GPS dalam 100m radius, subscription aktif            | `{ status: "CHECKED_IN" }` + 200                 |
| 2  | Check-in ditolak - di luar radius branch     | radius 10m, GPS jauh                                 | `{ error: "Outside branch radius" }` + 403       |
| 3  | Check-in ditolak - tanpa subscription aktif  | subscription=null                                    | `{ error: "No active subscription" }` + 403      |
| 4  | Check-in ditolak - sudah check-in            | active session exists                                | `{ error: "Already checked in" }` + 409          |
| 5  | Check-in ditolak - tanpa auth                | user=null                                            | `{ error: "Unauthorized" }` + 401                |
| 6  | Check-out sukses                             | active session exists                                | `{ status: "CHECKED_OUT", durationMinutes: 45 }` |
| 7  | Check-out gagal - tanpa session aktif        | no active session                                    | `{ error: "No active check-in session" }` + 404  |
| 8  | Route guard - MEMBER tidak bisa akses /admin | role=MEMBER, allowed=OWNER/SUPER_ADMIN/MANAGER/ADMIN | `false`                                          |
| 9  | Route guard - MEMBER bisa akses /member      | role=MEMBER, allowed=MEMBER/OWNER/SUPER_ADMIN/ADMIN  | `true`                                           |
| 10 | MEMBER memiliki permission check-in          | permission=member_check_in                           | `true`, tapi `manage_users` = `false`        |

## 4. Admin Scenario (`src/__tests__/scenarios/admin.scenario.test.ts`) — 7 Tests

| # | Skenario                              | Setup                                                 | Expected                               |
| - | ------------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| 1 | ADMIN bisa akses /admin               | role=ADMIN, allowed=OWNER/SUPER_ADMIN/MANAGER/ADMIN   | `true`                               |
| 2 | MEMBER tidak bisa akses /admin        | role=MEMBER, allowed=OWNER/SUPER_ADMIN/MANAGER/ADMIN  | `false`                              |
| 3 | TRAINER tidak bisa akses /admin       | role=TRAINER, allowed=OWNER/SUPER_ADMIN/MANAGER/ADMIN | `false`                              |
| 4 | MANAGER bisa akses /admin             | role=MANAGER, allowed=OWNER/SUPER_ADMIN/MANAGER/ADMIN | `true`                               |
| 5 | ADMIN memiliki permission member      | manage_members, manage_invoices, dll                  | `toContain(...)` semua               |
| 6 | ADMIN tidak punya permission owner    | manage_users, manage_roles, dll                       | `not.toContain(...)` semua           |
| 7 | MARKETING hanya punya branding & blog | rolePermissions.MARKETING                             | `["manage_branding", "manage_blog"]` |

## 5. Owner Scenario (`src/__tests__/scenarios/owner.scenario.test.ts`) — 9 Tests

| # | Skenario                             | Setup                                       | Expected                                                                                                                                                  |
| - | ------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | OWNER bisa akses /owner              | role=OWNER, allowed=OWNER/SUPER_ADMIN       | `true`                                                                                                                                                  |
| 2 | ADMIN tidak bisa akses /owner        | role=ADMIN, allowed=OWNER/SUPER_ADMIN       | `false`                                                                                                                                                 |
| 3 | SUPER_ADMIN bisa akses /owner        | role=SUPER_ADMIN, allowed=OWNER/SUPER_ADMIN | `true`                                                                                                                                                  |
| 4 | Owner bisa melihat financial summary | role=OWNER                                  | summary: revenue 50jt, expense 8jt, profit 42jt, 120 members, 42 checkins                                                                                 |
| 5 | Admin ditolak akses financial (403)  | role=ADMIN                                  | `{ error: "Forbidden" }` + 403                                                                                                                          |
| 6 | Unauthorized ditolak financial (401) | user=null                                   | `{ error: "Unauthorized" }` + 401                                                                                                                       |
| 7 | ADMIN tidak punya akses owner route  | role=ADMIN, allowed=OWNER/SUPER_ADMIN       | `false`                                                                                                                                                 |
| 8 | OWNER memiliki semua permission      | rolePermissions.OWNER                       | manage_users, manage_roles, manage_branches, manage_branding, manage_members, view_financial, manage_expenses, manage_premium_features, manage_attendance |
| 9 | SUPER_ADMIN = OWNER permissions      | rolePermissions.SUPER_ADMIN                 | `toEqual(rolePermissions.OWNER)`                                                                                                                        |

## 6. Pure Function Unit Tests (dipertahankan) — 55 Tests

| File                                       | Tests        | Coverage                                                                |
| ------------------------------------------ | ------------ | ----------------------------------------------------------------------- |
| `src/lib/__tests__/utils.test.ts`        | 6            | cn() — merge, conditional, conflict resolution                         |
| `src/lib/__tests__/format.test.ts`       | 13           | rupiah, number, formatDate                                              |
| `src/lib/__tests__/haversine.test.ts`    | 6            | jarak antar koordinat                                                   |
| `src/lib/__tests__/rbac.test.ts`         | 10           | rolePermissions matrix, hasPermission, canAccessRole, requirePermission |
| `src/lib/__tests__/feature-gate.test.ts` | 9            | planFeatureMatrix, canUseFeature                                        |
| `src/lib/__tests__/validators.test.ts`   | 11           | registerMemberSchema, attendanceLocationSchema                          |
| **Subtotal**                         | **55** | ditambah 16 dari rbac di scenario test                                  |

## 7. Halaman Pricing — Page UI Test (`src/app/__tests__/pricing-page.test.tsx`) — 14 Tests

| #  | Skenario                                      | Setup                      | Assertion                                                           |
| -- | --------------------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| 1  | Menampilkan SiteHeader                        | user=null                  | `<header data-testid="site-header">` ada                          |
| 2  | Menampilkan badge "Membership"                | user=null                  | Text "Membership" di dalam Badge                                   |
| 3  | Menampilkan heading h1 yang benar             | user=null                  | `<h1>Pilih paket yang tepat untuk Anda.</h1>`                     |
| 4  | Menampilkan nama & deskripsi tiap paket       | user=null, 4 plans         | Each plan name + description visible                               |
| 5  | Menampilkan harga dalam format Rupiah         | user=null, 4 plans         | Rp 45.000, Rp 449.000, Rp 299.000, Rp 1.199.000                   |
| 6  | Tombol Daftar (link → `/?action=register`)    | user=null                  | 4 links dengan href yang benar                                     |
| 7  | Paket PLUS_MONTHLY mendapat `border-primary`  | user=null                  | Card Plus Monthly memiliki class `border-primary`                  |
| 8  | Paket non-populer tidak punya `border-primary`| user=null                  | Card Daily Pass tidak memiliki class `border-primary`              |
| 9  | Tombol Subscribe muncul saat sudah login      | user={ id, email }         | 4 tombol Subscribe (data-testid="subscribe-btn")                   |
| 10 | SubscribeButton mengirim planCode yang benar  | user={ id, email }         | Setiap button punya `data-plan-code` sesuai                        |
| 11 | Tidak ada link Daftar saat sudah login        | user={ id, email }         | `queryByRole("link", /daftar/)` → null                             |
| 12 | Empty state — pesan "Belum ada paket"         | plans=[]                   | Text "Belum ada paket tersedia."                                   |
| 13 | Empty state — tidak ada kartu paket           | plans=[]                   | Tidak ada nama/Subscribe/Daftar                                    |
| 14 | Empty state — tidak ada harga Rupiah          | plans=[]                   | Tidak ada text dengan prefix Rp                                    |

## 8. UI Component Tests (Basic) — 48 Tests

| File                                       | Tests | Deskripsi                                                            |
| ------------------------------------------ | ----- | -------------------------------------------------------------------- |
| `src/components/ui/__tests__/Button.test.tsx` | 9 | Render button, anchor, className, disabled, loading, value format   |
| `src/components/ui/__tests__/Badge.test.tsx`  | 7 | Render text, variants (default/secondary/destructive/outline)        |
| `src/components/ui/__tests__/Input.test.tsx`  | 7 | Render label, placeholder, type, disabled, autoComplete              |
| `src/components/ui/__tests__/Card.test.tsx`   | 5 | Title, description, content, className, children                     |
| `src/components/ui/__tests__/Progress.test.tsx` | 7 | Value, min/max, data-state, indicator, className                     |
| `src/components/ui/__tests__/Skeleton.test.tsx` | 3 | Render div + animate-pulse, className, child                         |
| `src/components/ui/__tests__/Separator.test.tsx` | 5 | role="separator", orientation, decorative, className                 |
| `src/components/ui/__tests__/Textarea.test.tsx` | 5 | Label, placeholder, disabled, structure, value via textContent       |

## 9. UI Component Tests (Dashboard & Sidebar) — 23 Tests

| File                                                    | Tests | Deskripsi                                                      |
| ------------------------------------------------------- | ----- | -------------------------------------------------------------- |
| `src/components/dashboard/__tests__/metric-card.test.tsx` | 8 | Label, formatted values (revenue/expense/profit), helper, 0   |
| `src/components/__tests__/nav-user.test.tsx`              | 6 | Name, email, initials, aria-haspopup                           |
| `src/components/__tests__/nav-main.test.tsx`              | 5 | All items rendered, label, icons, empty, hrefs                 |
| `src/components/__tests__/team-switcher.test.tsx`         | 4 | Active team name, plan, empty teams, Dumbbell icon             |

## 10. Database Integration Tests — 16 Tests

| File | Tests | Deskripsi |
| ---- | ----- | --------- |
| `src/__tests__/integration/db-users.test.ts` | 4 | Roles, permissions, role_permissions, CRUD user + role |
| `src/__tests__/integration/db-plans.test.ts` | 4 | Active plans, daily pass, positive price, CRUD plan |
| `src/__tests__/integration/db-members.test.ts` | 4 | Members, subscriptions, invoices, payments |
| `src/__tests__/integration/db-branches.test.ts` | 2 | Branch ForgeFit + koordinat operasional valid, branding default |
| `src/__tests__/integration/db-checkin.test.ts` | 2 | Attendances access + checked-out duration |

Integration DB test mencetak speed setiap query ke stdout dengan format:

```text
[db-query] payments.list: 115.1ms
```

Jika env Supabase admin tidak tersedia di CI, integration DB test akan skip seluruh suite database dengan pesan:

```text
[db-query] skipped: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required
```

Env yang dibutuhkan agar test database benar-benar berjalan:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL` atau `NEXT_PUBLIC_SUPABASE_URL`

Public E2E tetap berjalan sebagai guest saat env Supabase public kosong. Halaman `/pricing` memakai data paket demo bila `SUPABASE_DB_URL`/`DATABASE_URL` tidak tersedia.

Playwright memakai port `3000` secara default. Untuk verifikasi berdampingan dengan dev server yang sudah hidup, gunakan `PORT=3100`. Untuk menjalankan E2E terhadap production server hasil build, set `PLAYWRIGHT_WEB_SERVER_COMMAND`, contoh:

```bash
PORT=3100 PLAYWRIGHT_WEB_SERVER_COMMAND="npm run start -- --port 3100" npm run test:e2e
```

---

**Total: 29 test suites, 212 tests** — semua passing ✅

### Cara menjalankan

```bash
npm test                # semua test (212), termasuk integration DB jika env Supabase tersedia
npm run test:integration # database integration + speed query per query, skip jika env DB tidak tersedia
npm run test:watch      # watch mode
npm run test:coverage   # dengan coverage report
```

### Hasil Verifikasi Terakhir

- `npm run test:integration -- --runInBand`: 5 suites, 16 tests passed.
- `npm test -- --runInBand`: 29 suites, 212 tests passed.
- `npm run build`: passed.
- `npm run test:e2e`: 21 tests passed.
