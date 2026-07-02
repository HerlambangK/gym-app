# Nutrition + Workout + Owner Intelligence Deck

## 1. Tujuan Produk

ForgeFit sekarang diarahkan menjadi aplikasi gym yang membantu 3 pihak:

- Member: mencatat nutrisi, menjalankan workout, dan melihat rekomendasi sederhana.
- Owner: membaca risiko churn, forecast check-in, pending revenue, dan prioritas follow-up.
- Trainer/admin: memakai data aktivitas member sebagai dasar intervensi.

Fokus tahap ini bukan membuat AI palsu, tetapi membangun rule-based intelligence yang datanya nyata dan bisa berkembang ke ML.

---

## 2. Fitur Nutrition Yang Dikerjakan

### Member Nutrition

Halaman: `/member/nutrition`

Yang sudah dibuat:

- Food diary per hari.
- Input cepat makanan, porsi, kalori, protein, karbo, lemak, dan air.
- Template menu lokal Indonesia:
  - Nasi + ayam bakar.
  - Telur + tempe + nasi.
  - Soto ayam.
  - Ikan + sayur + nasi.
- Ringkasan kalori, protein, karbo, dan lemak.
- Progress kalori dan protein.
- Smart suggestion berbasis rules.
- Hapus diary.
- Jika profile belum lengkap, fitur tetap bisa dipakai dengan default target sementara.
- User diarahkan secara halus ke Profile, bukan dipaksa redirect.

### Data Profile Untuk Nutrition

Halaman: `/member/profile`

Data nutrisi utama dipusatkan di Profile:

- Berat badan.
- Tinggi badan.
- Umur.
- Gender.
- Tujuan nutrisi.
- Aktivitas harian.
- Target kalori.
- Target protein.
- Target karbo.
- Target lemak.
- Target air minum.
- Jumlah makan per hari.

---

## 3. Fitur Workout Yang Dikerjakan

### Member Workout

Halaman: `/member/workouts`

Yang sudah dibuat:

- Program cepat berbasis template.
- Input gerakan sederhana:
  - Hari.
  - Nama latihan.
  - Jenis latihan.
  - Set.
  - Reps.
  - Beban/RPE.
- Template beginner 3 hari:
  - Senin: Squat, Push Up.
  - Rabu: Lat Pulldown, Shoulder Press.
  - Jumat: Leg Press, Plank.
- Preview mingguan yang mudah dibaca saat di gym.
- Smart workout coach berbasis rules:
  - Cek latihan kaki.
  - Cek gerakan tarik.
  - Rekomendasi cardio untuk fat loss.
  - Rekomendasi naik beban jika program seimbang.
- Hapus program.
- Jika profile belum lengkap, fitur tetap bisa dipakai dengan default:
  - Goal: muscle_gain.
  - Level: beginner.
  - Jadwal: 3x/minggu.
  - Durasi: 45 menit.

### Data Profile Untuk Workout

Halaman: `/member/profile`

Data workout dipusatkan di Profile:

- Workout goal.
- Level.
- Hari latihan per minggu.
- Durasi per sesi.
- Alat tersedia.
- Cedera atau batasan gerak.

---

## 4. Fitur Owner Intelligence Yang Dikerjakan

Halaman: `/owner/intelligence`

Yang sudah dibuat:

- Summary member terpantau.
- High risk member count.
- Medium risk member count.
- Forecast check-in hari ini.
- Jam ramai historis.
- Paid revenue bulan ini.
- Pending revenue bulan ini.
- Trainer follow-up queue.
- Rule-based owner recommendation.
- AI/ML roadmap card.

### Owner Rule Engine

Risk member dihitung dari:

- Sisa hari membership.
- Check-in 30 hari terakhir.
- Hari sejak check-in terakhir.
- Status subscription.

Contoh rules:

- Jika membership hampir habis dan check-in rendah: HIGH risk.
- Jika tidak check-in 14 hari: HIGH risk.
- Jika sisa membership kurang dari 10 hari: MEDIUM risk.
- Jika aktivitas sehat: LOW risk.

### Forecast Check-in

Forecast awal memakai moving average sederhana:

- Ambil attendance 30 hari terakhir.
- Hitung rata-rata check-in harian.
- Sesuaikan dengan multiplier hari:
  - Senin/Selasa lebih tinggi.
  - Sabtu/Minggu lebih rendah.
- Tampilkan prediksi check-in hari ini.

### Revenue Signal

Owner melihat:

- Paid revenue bulan berjalan.
- Pending revenue bulan berjalan.
- Rekomendasi reminder payment jika pending terlalu besar.

---

## 5. Optimasi Query

### Workout

Sebelumnya berisiko N+1:

- Query program.
- Query sessions.
- Query exercises per session.

Sekarang:

- Query program aktif.
- Satu joined query untuk semua sessions dan exercises.
- Grouping dilakukan di memory.

### Owner Intelligence

Owner intelligence memakai 3 query besar:

- Member + subscription + plan.
- Attendance 30 hari terakhir.
- Invoice bulan berjalan.

Tidak ada query per member.

---

## 6. AI/ML Strategy

### Tahap 1: Rule-based AI

Sudah mulai diterapkan.

Contoh:

- Protein kurang: sarankan ayam, telur, ikan, tempe, tahu.
- Lemak tinggi: hindari gorengan dan santan.
- Workout tidak punya lower body: sarankan squat/leg press/lunges.
- Member jarang check-in: masuk follow-up queue owner.

### Tahap 2: Regression

Use case berikutnya:

- Prediksi berat badan minggu depan.
- Prediksi check-in harian.
- Prediksi revenue bulan depan.
- Rekomendasi kenaikan beban workout.

Algoritma awal:

- Moving Average.
- Linear Regression.
- Ridge/Lasso Regression.

### Tahap 3: Classification

Use case berikutnya:

- Churn risk: low / medium / high.
- Nutrition status: good / warning / bad.
- Workout readiness: ready / light / rest.
- Progress status: on track / stagnan / off track.

Algoritma awal:

- Logistic Regression.
- Decision Tree.
- Random Forest Classifier.

---

## 7. Database / Migration

Migration terkait:

- `supabase/nutrition-workout-upgrade-2026-07-02.sql`

Perubahan data:

- `nutrition_logs`
  - meal_type.
  - portion.
  - eaten_at.
- `nutrition_targets`
  - height_cm.
  - age.
  - gender.
  - goal.
  - activity_level.
  - target macros.
  - workout preference disimpan sementara di notes.
- `workout_programs`
  - kolom tambahan disiapkan untuk goal, level, weekly_sessions, duration, equipment, limitation.

---

## 8. UX Principle Yang Dipakai

- Jangan memaksa redirect dari fitur.
- Fitur tetap bisa dipakai walaupun data profile belum lengkap.
- Jika data kurang, tampilkan panel arahan di halaman yang sama.
- Profile menjadi pusat data target.
- Nutrition dan Workout hanya untuk aksi harian yang cepat.
- Owner melihat insight operasional, bukan tabel mentah saja.

---

## 9. Status Verifikasi

Sudah dicek:

- TypeScript: lulus.
- ESLint targeted: lulus.
- Production build Next.js Node 20: lulus.
- Migration Supabase nutrition/workout sudah dijalankan.
- Kolom live DB sudah diverifikasi.

---

## 10. Next Step Yang Disarankan

Prioritas berikutnya:

1. Tambahkan trainer assignment table.
2. Owner bisa assign trainer ke member.
3. Trainer dashboard:
   - member binaan.
   - progress nutrisi.
   - progress workout.
   - follow-up queue.
4. Simpan weight history terpisah agar regression berat badan lebih akurat.
5. Simpan workout completion log agar progress dan readiness lebih nyata.
6. Buat ML dataset export untuk churn dan progress prediction.

