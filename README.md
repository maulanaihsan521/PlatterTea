# PlatterTea — Food & Tea Website 🍵

Company profile + product showcase + Admin CMS untuk brand **PlatterTea**.
Dibangun dengan **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**,
**shadcn/ui**, dan **Prisma ORM** di atas **Supabase Postgres**.

> Mix, Sip, Enjoy!

## Fitur

- **Website publik** — Home, Menu, Detail Produk, Promo, About, Galeri, Contact, FAQ (SPA hash-routing)
- **Admin CMS** (`#/admin`) — kelola produk, kategori, promo, testimoni, FAQ, galeri, media, pengaturan site, pengguna, audit log
- **PWA** — installable, service worker, halaman offline
- **Upload otomatis WebP** — semua gambar upload dikonversi & dikompres (hemat storage free plan)
- **Media Storage ganda** — Supabase Storage (produksi) atau local disk (dev), via env
- **Keamanan** — rate-limit login, audit trail, security headers, hash scrypt (lihat [SECURITY.md](./SECURITY.md))

## Menjalankan Secara Lokal

```bash
cp .env.example .env   # isi kredensial Supabase Anda
bun install            # otomatis menjalankan prisma generate
bun run db:push        # sinkronkan skema ke Supabase
bun run db:seed        # isi data awal (idempoten)
bun run dev            # http://localhost:3000
```

## Deploy ke Vercel

1. Push repo ini ke GitHub, lalu import di Vercel.
2. Set env variables (lihat `.env.example`): `DATABASE_URL`, `DIRECT_URL`,
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
3. Buat bucket Storage public bernama `media` di dashboard Supabase.
4. Deploy — `postinstall` otomatis generate Prisma client.

## Struktur

```
src/app/            → API routes + halaman root
src/components/     → komponen publik (plattertea/) & CMS (plattertea/admin/)
src/lib/            → helper, plattertea.ts (types/routes)
src/hooks/          → settings context, hash-router, PWA install
prisma/             → schema.prisma + seed.ts
public/brand|products → aset logo, maskot, gambar produk
```

## Standar

Penerapan keamanan mengacu **ISO/IEC 27001:2022** Annex A dan kualitas produk
mengacu **ISO/IEC 25010** — rincian pemetaannya ada di [SECURITY.md](./SECURITY.md).
