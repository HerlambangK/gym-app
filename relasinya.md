# Skematik Database dan Alur Data Gym App

Dokumen ini menjelaskan relasi data utama, khususnya membership, attendance, nutrition, dan workout progress yang dipakai dashboard member.

## ERD Utama

```mermaid
erDiagram
  users ||--o{ user_roles : has
  roles ||--o{ user_roles : assigned
  roles ||--o{ role_permissions : grants
  permissions ||--o{ role_permissions : allowed

  users ||--o| members : owns_profile
  branches ||--o{ members : home_branch
  branches ||--o{ attendances : checkin_location

  members ||--o{ subscriptions : subscribes
  membership_plans ||--o{ subscriptions : plan
  members ||--o{ invoices : billed
  membership_plans ||--o{ invoices : invoice_plan
  invoices ||--o{ payments : paid_by

  members ||--o{ attendances : records
  subscriptions ||--o{ attendances : validates_access

  members ||--o{ nutrition_logs : logs_food
  members ||--o| nutrition_targets : has_target

  members ||--o{ workout_programs : owns
  workout_programs ||--o{ workout_sessions : schedules
  workout_sessions ||--o{ workout_exercises : contains

  users {
    uuid id PK
    text name
    text email
    text phone
    text status
  }

  members {
    uuid id PK
    uuid user_id FK
    uuid branch_id FK
    text member_code
    enum member_type
    enum status
  }

  workout_programs {
    uuid id PK
    uuid member_id FK
    text title
    text goal
    text level
    integer weekly_sessions
    boolean is_active
  }

  workout_sessions {
    uuid id PK
    uuid program_id FK
    text day_name
    integer session_order
  }

  workout_exercises {
    uuid id PK
    uuid session_id FK
    text exercise_name
    text exercise_type
    integer sets
    text reps
    text load_note
    integer exercise_order
  }
```

## Alur Data Workout

```mermaid
flowchart TD
  A[Member membuka Workout] --> B[Profile dicek: gender, goal, level, jadwal]
  B --> C[Member memilih human body dan muscle group]
  C --> D[Exercise library mengisi latihan, type, alat, fokus, set, reps, RPE]
  D --> E[Rows latihan di UI]
  E --> F[saveWorkoutProgram server action]
  F --> G[replaceActiveWorkoutProgram]
  G --> H[workout_programs aktif]
  H --> I[workout_sessions per hari]
  I --> J[workout_exercises per latihan]
  J --> K[Dashboard membaca program aktif]
  K --> L[Agregasi muscle dari load_note dan total sets]
  L --> M[Human body intensity: warna pudar ke pekat]
```

## Format Metadata Workout Saat Ini

Kolom `workout_exercises.load_note` menyimpan metadata terstruktur dengan format key-value:

```text
focus:Quadriceps · pendukung: Glutes, Hamstrings|muscle:Quads|equipment:Machine|note:Set 3-4 · RPE 7-8 · Jaga lutut searah...
```

Dashboard memakai:

- `muscle` untuk menentukan area body highlighter.
- `sets` untuk menghitung intensitas latihan.
- `exercise_name` untuk daftar latihan yang membentuk intensitas.
- `reps` untuk progres latihan harian dan calendar.

## Aturan Agregasi Body Highlighter

```mermaid
flowchart LR
  A[workout_exercises] --> B[parse load_note.muscle]
  B --> C[normalisasi muscle group]
  C --> D[mapping ke react-body-highlighter muscles]
  D --> E[sum sets per muscle group]
  E --> F[bucket intensitas 1 sampai 5]
  F --> G[warna pudar ke pekat]
```

Mapping utama:

| Muscle group | Body highlighter muscles |
| --- | --- |
| Chest | `chest` |
| Back | `upper-back`, `trapezius` |
| Shoulders | `front-deltoids` |
| Rear Shoulders | `back-deltoids` |
| Biceps | `biceps` |
| Triceps | `triceps` |
| Core | `abs`, `obliques` |
| Quads | `quadriceps` |
| Lower Back | `lower-back` |
| Hamstrings | `hamstring` |
| Glutes | `gluteal` |
| Calves | `calves` |
| Cardio | `quadriceps`, `hamstring`, `calves` |
| Full Body | `chest`, `upper-back`, `quadriceps`, `hamstring`, `abs` |

## Catatan Data Agar Tetap Rapi

- Sumber utama progress workout sekarang adalah `workout_exercises`.
- Program aktif ditandai oleh `workout_programs.is_active = true`.
- Saat program disimpan ulang, program lama dinonaktifkan dan program baru dibuat agar snapshot jadwal tetap konsisten.
- `load_note` wajib tetap menyertakan `focus`, `muscle`, `equipment`, dan `note` agar dashboard bisa melakukan agregasi.
- Untuk versi lanjutan, progres aktual harian bisa dibuat lebih detail dengan tabel `workout_logs` yang mereferensikan `workout_exercises`.

## Rekomendasi Tabel Lanjutan untuk Progress Aktual

```mermaid
erDiagram
  workout_exercises ||--o{ workout_logs : completed_as
  members ||--o{ workout_logs : records

  workout_logs {
    uuid id PK
    uuid member_id FK
    uuid workout_exercise_id FK
    date log_date
    integer actual_sets
    text actual_reps
    numeric weight_kg
    integer rpe
    text notes
    timestamptz created_at
  }
```

Dengan tabel ini, dashboard bisa membedakan antara program rencana dan progres aktual yang benar-benar dilakukan member.
