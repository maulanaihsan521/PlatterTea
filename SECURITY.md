# Keamanan Informasi — PlatterTea Website

Dokumen ini memetakan pengendalian keamanan website PlatterTea terhadap
**ISO/IEC 27001:2022** (Annex A) dan kualitas terhadap **ISO/IEC 25010:2011**.

---

## Pemetaan ISO/IEC 27001:2022 (Annex A)

| Kontrol | Kategori | Implementasi di PlatterTea |
|---|---|---|
| A.5.15 / A.5.16 | Access control | Login CMS terpisah, sesi cookie httpOnly SameSite=Lax, logout menghapus sesi |
| A.5.17 | Authentication information | Password admin di-hash **scrypt** + salt acak (tidak pernah plaintext); token reset password disimpan sebagai SHA-256 dengan kedaluwarsa & penanda pakai |
| A.8.2 / A.8.3 | Privileged access | Peran pengguna (SUPER_ADMIN / CONTENT_ADMIN / EDITOR) di server-side helper `handleAdmin` |
| A.8.5 | Secure authentication | Rate-limit percobaan login gagal + pencatatan `LOGIN_FAILED` ke audit log |
| A.8.9 | Configuration management | Konfigurasi via env (`.env` tidak masuk repo; tersedia `.env.example`); `poweredByHeader: false` |
| A.8.12 | Data leakage prevention | Secret (password DB, kredensial) **tidak pernah** di-commit; riwayat git dibersihkan sebelum push publik |
| A.8.18 | Use of privileged utility programs | Semua endpoint admin melewati middleware otentikasi server-side |
| A.8.20 / A.8.22 | Network & web security | Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `HSTS` (next.config.ts) |
| A.8.24 | Use of cryptography | Kredensial via HTTPS/TLS; hash password scrypt; token reset one-way hash |
| A.8.25 | Secure development lifecycle | Lint wajib bersih, review manual + uji browser otomatis sebelum rilis |
| A.8.26 | Application security requirements | Validasi input server-side (tipe file, ukuran, nama file anti path-traversal, whitelist parameter) |
| A.8.28 | Secure coding | Upload gambar diverifikasi ulang via parser (sharp `failOn: error`) — Content-Type yang dipalsukan ditolak |
| A.8.15 | Logging | Audit log admin (CREATE/UPDATE/DELETE/LOGIN/LOGIN_FAILED/MEDIA_DELETE) + retensi otomatis 90 hari |
| A.5.24–A.5.26 | Incident management | Indikator login-gagal realtime di dashboard Super Admin |

### Catatan kredensial
- Kredensial Supabase/GitHub yang pernah dibagikan via chat **disarankan dirotasi**:
  - Password database: Supabase → Settings → Database → Reset database password
  - GitHub classic token: GitHub → Settings → Developer settings → Personal access tokens (regenerate)

---

## Pemetaan ISO/IEC 25010 — Karakter Kualitas

| Karakter | Implementasi |
|---|---|
| Functional suitability | Fitur sesuai kebutuhan brand: company profile, katalog, promo, galeri, FAQ, CMS lengkap (produk, kategori, promo, testimoni, FAQ, galeri, media, pengaturan, pengguna, audit) |
| Performance efficiency | Gambar upload dikonversi **WebP** (terukur ~90%+ lebih kecil), resize maks 1600px, lazy-load, koneksi DB pooled (PgBouncer) |
| Compatibility | Responsif mobile-first (390px) s.d. desktop; uji lintas-viewport otomatis |
| Usability | Navigasi bottom-bar mobile, tap target ≥ 44px, kontras WCAG-friendly, `aria-*`, `prefers-reduced-motion` |
| Reliability | Fallback storage (Supabase Storage → lokal), fallback clipboard, SW offline page, retry seed idempoten (upsert) |
| Security (duet 27001) | Lihat tabel di atas |
| Maintainability | TypeScript ketat, lint bersih, struktur modular (views/admin/lib), skema Prisma tunggal |
| Portability | Deploy-agnostic (Vercel/self-host), DB via env, storage via env, Tanpa lock-in vendor di kode aplikasi |

---

## Prosedur Deployment Aman (Vercel + Supabase)

1. Import repo GitHub ke Vercel.
2. Set Environment Variables di Vercel (lihat `.env.example`): `DATABASE_URL`, `DIRECT_URL`, opsional `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Buat bucket **media** (public) di Supabase Storage bila memakai upload cloud.
4. Deploy — `postinstall` otomatis menjalankan `prisma generate`.
5. Seed pertama kali (opsional): `bun run db:seed` dari mesin lokal dengan `.env` terisi.

---

## Log Audit Keamanan

### Audit 1 — Kajian Keamanan Repository (ISO/IEC 27001)
**Tanggal**: 2 Oktober 2026 · **Cakupan**: working tree, seluruh objek git (242 blob), konfigurasi git, remote GitHub

| # | Pemeriksaan | Hasil |
|---|---|---|
| 1 | File sensitif ter-track (.env, *.db, uploads) | ✅ 0 file |
| 2 | Pola sekret di seluruh blob (token, password DB, private key, AKIA) | ✅ 0 kecocokan asli |
| 3 | Objek unreachable (sisa history lama) | ✅ 0 (ter-prune) |
| 4 | Credential helper / token tersimpan di git config | ✅ Tidak ada |
| 5 | **Kredensial admin CMS di repo publik** | ❌ **DITEMUKAN** → **DIREMEDIASI** |

**Temuan kritis & remediasi**:
- Password admin CMS (`admin@plattertea.id`) terekspos publik di 4 file (AdminLogin.tsx, seed.ts, create-admin.ts, seed-gallery.ts) + worklog.md.
- **Remediasi**: (a) semua skrip seed/admin kini WAJIB env `ADMIN_EMAIL`/`ADMIN_PASSWORD` (min. 12 karakter, tanpa fallback hardcoded — seed melewati pembuatan admin bila env kosong); (b) hint "Demo:" di halaman login dihapus; (c) password asli **dirotasi** di database (hash scrypt salt baru); (d) worklog disanitasi; (e) history diganti ulang (orphan commit) & force-push agar blob lama tidak lagi dapat diakses dari ref.
- **Tindak lanjut untuk pemilik**: rotasi GitHub token & password DB Supabase via dashboard (pernah dibagikan via chat); pertimbangkan repo private / branch protection.

### Audit 2 — Remediasi Supabase Advisor: "RLS Disabled in Public" (10 CRITICAL)
**Tanggal**: 2 Oktober 2026 · **Pemicu**: laporan Database Advisor di dashboard Supabase

- **Temuan**: seluruh 10 tabel `public` dibuat `prisma db push` TANPA Row Level Security. Skema default Supabase memberi grant SELECT/INSERT/UPDATE/DELETE pada tabel baru ke role `anon` & `authenticated` → siapa pun dengan anon key dapat membaca bahkan MENULIS data (termasuk `AdminUser`, `PasswordResetToken`, `AdminAuditLog`) langsung via auto REST API PostgREST, mem-bypass lapisan API Next.js.
- **Remediasi**: (1) `ALTER TABLE … ENABLE ROW LEVEL SECURITY` untuk 10 tabel — tanpa policy → anon/authenticated melihat nol baris; (2) `REVOKE ALL ON ALL TABLES/SEQUENCES IN SCHEMA public FROM anon, authenticated` (defense in depth); (3) verifikasi via `pg_class.relrowsecurity` (10/10 true) & `has_table_privilege` (10/10 tanpa grant).
- **Aplikasi tidak terdampak**: Prisma terhubung sebagai role `postgres` (pemilik tabel → otomatis bypass RLS tanpa `FORCE`). Terverifikasi: `/api/products`, `/api/settings`, login CMS, dan homepage tetap normal.
- **Catatan**: selama jeda antara migrasi ↔ remediasi ini, akses anon via Data API secara teknis mungkin. Konten publik bersifat non-sensitif; tabel admin kini terkunci. Rotasi password DB (poin catatan di atas) tetap disarankan.
- **Jika suatu saat ingin memakai Supabase Data API/client di frontend**: buat policy RLS eksplisit per tabel + grant minimal, JANGAN menonaktifkan RLS.
- **Hardening opsional di dashboard**: Settings → API → bisa menonaktifkan Data API bila memang tidak dipakai.
