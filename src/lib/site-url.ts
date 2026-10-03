/**
 * URL produksi situs — sumber TUNGGAL untuk metadata absolut (layout, page,
 * sitemap, JSON-LD). Override via env NEXT_PUBLIC_SITE_URL saat pindah ke
 * domain sendiri. Fallback domain Vercel agar OG/metadata tetap absolut &
 * benar tanpa env (penting untuk preview WhatsApp/Facebook/X).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plattertea.vercel.app";
