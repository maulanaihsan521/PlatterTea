# 🚀 Panduan Deploy PlatterTea — Vercel + Supabase (Gratis)

> Estimasi waktu: **15–20 menit** · Biaya: **Rp0** (Vercel Hobby + Supabase Free)
> Tidak perlu migrasi data — website akan memakai database Supabase yang sudah terisi produk & konten.

**Yang dibutuhkan:**
- ✅ Repo GitHub (kode terbaru sudah ter-push otomatis)
- ✅ Proyek Supabase (sudah ada & terisi data)
- ⬜ Akun Vercel (daftar gratis pakai akun GitHub)

---

## Bagian 0 — Keamanan dulu (WAJIB, ±5 menit)

Kredensial berikut pernah terekspos di percakapan, jadi **wajib diganti sebelum deploy**:

### 0.1 Rotasi service key Supabase
1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → pilih proyek PlatterTea.
2. **Project Settings → API Keys**.
3. Hapus/revoke secret key lama, buat **secret key baru** (diawali `sb_secret_...` atau bertipe `service_role`).
4. 📋 Simpan nilai baru — akan dipakai di Bagian 1 & Bagian 2.
5. ⚠️ Jangan lupa perbarui juga `SUPABASE_SERVICE_ROLE_KEY` di file `.env` lokal agar fitur upload foto saat pengembangan tetap jalan.

### 0.2 Rotasi token GitHub
1. [github.com](https://github.com) → **Settings → Developer settings → Personal access tokens**.
2. Hapus token lama, buat token baru (scope `repo`).
3. Token baru hanya dipakai untuk push dari terminal — jangan dibagikan.

### 0.3 Siapkan password admin baru yang kuat
Minimal 10 karakter, gabungan huruf besar/kecil + angka + simbol. (Dipakai di Bagian 4, langkah 3.)

### 0.4 Buat `AUTH_SECRET` (kunci sesi login admin)
Jalankan salah satu di terminal, lalu catat hasilnya:

```bash
# Mac / Linux
openssl rand -hex 32

# Windows (dengan Node.js terpasang)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Bagian 1 — Supabase: siapkan Storage & kumpulkan nilai (±5 menit)

### 1.1 Buat bucket foto (jika belum ada)
1. Dashboard Supabase → **Storage → New bucket**.
2. Name: `media` · centang **✓ Public bucket** → **Create**.

### 1.2 Kumpulkan nilai environment (simpan sementara di notepad — JANGAN dibagikan)

| Variabel | Ambil dari mana |
|---|---|
| `SUPABASE_URL` | **Settings → API → Project URL** (bentuk `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key **baru** dari Bagian 0.1 |
| `DATABASE_URL` | Salin dari file `.env` lokal proyek ini (sudah benar formatnya — pooler port 6543) |
| `DIRECT_URL` | Salin dari file `.env` lokal proyek ini (port 5432) |
| *(catatan)* Region proyek | **Settings → General → Region** — mis. `Singapore (ap-southeast-1)` → dipakai di Bagian 2 langkah 4 |

---

## Bagian 2 — Vercel: import & konfigurasi (±5 menit)

### 2.1 Import proyek
1. Buka [vercel.com](https://vercel.com) → **Continue with GitHub** (atau login).
2. **Add New… → Project** → cari repo PlatterTea → **Import**.

### 2.2 Konfigurasi build
- Framework Preset: **Next.js** (terdeteksi otomatis).
- Build command sudah diatur oleh file `vercel.json` di repo — **biarkan apa adanya**.

### 2.3 (Disarankan) Samakan region dengan Supabase
- **Settings → Functions → Function Region** → pilih region yang sama dengan proyek Supabase (mis. Supabase di *Singapore* → pilih **Singapore `sin1`**).
- Manfaat: panggilan API website → database jadi jauh lebih cepat (±20–50 ms vs ±200 ms jika beda benua). Plan gratis = 1 region.

### 2.4 Isi Environment Variables
Saat layar konfigurasi (atau setelahnya di **Settings → Environment Variables**), tambahkan **satu per satu**:

| Nama | Nilai | Keterangan |
|---|---|---|
| `DATABASE_URL` | *(dari Bagian 1.2)* | pooler Supabase port 6543 |
| `DIRECT_URL` | *(dari Bagian 1.2)* | port 5432 |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | 🔒 rahasia — untuk upload foto |
| `NEXT_PUBLIC_SITE_URL` | `https://nama-proyek.vercel.app` | domain final — diperbarui di Bagian 3 |
| `AUTH_SECRET` | *(hasil Bagian 0.4)* | 🔒 wajib — tanpa ini admin menolak jalan |
| `ADMIN_EMAIL` | email login admin | opsional (informasi) |
| `ADMIN_PASSWORD` | — | **opsional** — login memakai password yang tersimpan di database, bukan env ini |

> Biarkan pilihan **Environments** = Production + Preview + Development (default).

### 2.5 Deploy
Klik **Deploy** → tunggu ±2–3 menit sampai muncul layar **Congratulations!**

---

## Bagian 3 — Setelah deploy pertama

1. **Catat domain** dari Vercel, mis. `https://plattertea-xxx.vercel.app`.
2. Jika `NEXT_PUBLIC_SITE_URL` tadi berbeda: **Settings → Environment Variables** → edit nilainya → lalu tab **Deployments → deploy teratas → ⋯ → Redeploy**. (Supaya preview-link WhatsApp/Facebook menampilkan gambar brand dengan benar.)
3. *(Opsional — pakai domain sendiri)* **Settings → Domains → Add** → ikuti instruksi DNS dari penyedia domain → setelah aktif, perbarui `NEXT_PUBLIC_SITE_URL` + Redeploy. Sertifikat HTTPS otomatis.

---

## Bagian 4 — Checklist verifikasi (±10 menit)

- [ ] Home & semua halaman tampil: **Menu, Promo, About, Contact, FAQ**
- [ ] Tambah produk ke **keranjang** → **Pesan via WhatsApp** → pesan WA terisi otomatis dengan isi pesanan
- [ ] Buka `https://domain-anda.vercel.app/#/admin` → login dengan email + **password lama yang tersimpan di database** (masih yang lama — langsung lanjut ke langkah berikut)
- [ ] 🔒 **Ganti password**: Admin → **Pengaturan → Keamanan Akun** → isi password lama + password kuat baru (min. 10 karakter) → simpan. Password tersimpan ter-enskripsi di database, jadi berlaku di Vercel maupun lokal.
- [ ] **Upload 1 foto test** lewat CMS → pastikan tampil di website (bukti Supabase Storage bekerja) → hapus foto test
- [ ] Edit satu teks kecil → **Save** → muat ulang website → perubahan muncul (cache maks. 30 detik)
- [ ] Cek tampilan **mobile** (buka dari HP, atau DevTools → toggle device) — keranjang & semua teks terbaca jelas

---

## Bagian 5 — Masalah umum & solusi

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| API error 500 | Env var salah/kurang (spasi, tanda kutip) | Vercel → **Logs** (Function logs) → perbaiki env → Redeploy |
| Login admin gagal | Password mengikuti **database**, bukan `ADMIN_PASSWORD` env | Pakai password DB saat ini, lalu ganti via **Keamanan Akun** |
| Upload foto gagal | Bucket `media` belum **public** / `SUPABASE_*` salah | Cek bucket & env → Redeploy |
| Tidak bisa login admin saat baru deploy | `AUTH_SECRET` belum diisi | Wajib isi (Bagian 0.4) — sistem menolak jalan tanpa itu demi keamanan |
| Ada gambar lama pecah di keranjang | Item lama di localStorage HP/browser | Sudah ada fallback otomatis; hilang permanen setelah tombol **Kosongkan** |
| Perubahan admin tidak langsung muncul | Cache API 30 detik | Tunggu ±30 detik lalu refresh |
| Build gagal (jarang) | Kesalahan ketik nilai env | Cek Build Logs di Vercel |

---

## Bagian 6 — Batas plan gratis & perawatan

| Sumber daya | Batas gratis | Kebutuhan PlatterTea |
|---|---|---|
| Supabase Database | 500 MB | Beberapa KB — sangat lega |
| Supabase Storage | 1 GB (maks. file 50 MB) | Foto otomatis dikompres ≤1600px WebP (~100 KB/foto → ribuan foto masih muat) |
| Supabase Egress | 5 GB/bulan | Landing page ringan — cukup |
| Vercel Bandwidth | 100 GB/bulan | Cukup untuk puluhan ribu kunjungan/bulan |

**Kebiasaan baik:**
- Hapus foto yang tak terpakai lewat CMS (menghemat Storage).
- Pantau pemakaian: Supabase → **Settings → Usage**, Vercel → **Usage**.
- Website Vercel & pengembangan lokal memakai **database yang sama** — perubahan lewat admin terlihat di keduanya.

---

## Lampiran — Catatan teknis (untuk developer)

- `vercel.json` di repo: `framework: nextjs` + `buildCommand: next build` (melewati langkah *standalone copy* yang hanya untuk self-host).
- `output: "standalone"` di `next.config.ts` tetap berguna untuk self-host lokal; Vercel mengabaikannya dengan aman.
- `NEXT_PUBLIC_SITE_URL` dibaca **saat build** (metadata OG & LocalBusiness) → ubah nilai = wajib **Redeploy**.
- Cache API 30 detik & rate-limit login bersifat per-instance serverless — normal untuk skala ini.
- Tanpa tabel transaksi (keranjang = localStorage, checkout = `wa.me`) — ideal untuk serverless.
