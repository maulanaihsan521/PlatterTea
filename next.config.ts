import type { NextConfig } from "next";

// Header keamanan (praktik ISO/IEC 27001 A.14 — keamanan dalam development &
// A.13 — komunikasi) — dilindungi: klikjacking, sniffing, referer leak,
// akses API kamera/lokasi/mikrofon tanpa izin eksplisit, XSS/CSP.
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline' dibutuhkan bootstrap Next.js; 'unsafe-eval' hanya dev (HMR)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  // frame-src: Google Maps embed di halaman Kontak (iframe maps_embed) —
  // tanpa ini iframe jatuh ke default-src 'self' dan diblokir browser
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // hanya produksi (di dev bisa memaksa subresource http localhost jadi https)
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // X-Robots-Tag noindex khusus panel admin — pengganti Disallow robots.txt
      // (temuan F-01 pentest: robots.txt terbaca publik & membocorkan path admin;
      // header ini dikirim HANYA pada respons /P578Admin tanpa membocorkan path).
      { source: "/P578Admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/P578Admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  /**
   * SEO path-routing SSR: semua path di-rewrite ke halaman tunggal "/" dengan
   * query ptview — server component (page.tsx) membaca searchParams untuk
   * me-render view + metadata yang benar saat SSR (raw HTML per path: title,
   * canonical, OG — terbaca crawler sosial yang tidak mengeksekusi JS).
   * Hash #/P578Admin lama tetap didukung via parseHash (fallback legacy).
   */
  async rewrites() {
    return [
      { source: "/menu", destination: "/?ptview=menu" },
      { source: "/menu/:slug", destination: "/?ptview=product&slug=:slug" }, // alias lama
      { source: "/produk/:slug", destination: "/?ptview=product&slug=:slug" },
      { source: "/promo", destination: "/?ptview=promo" },
      { source: "/about", destination: "/?ptview=about" },
      { source: "/contact", destination: "/?ptview=contact" },
      { source: "/faq", destination: "/?ptview=faq" },
      // Admin CMS — path asli (robots.txt Disallow + noindex metadata;
      // hash #/P578Admin lama otomatis dinormalisasi ke path ini)
      { source: "/P578Admin", destination: "/?ptview=admin" },
      { source: "/P578Admin/:path*", destination: "/?ptview=admin" },
    ];
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
