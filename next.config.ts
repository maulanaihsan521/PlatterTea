import type { NextConfig } from "next";

// Header keamanan (praktik ISO/IEC 27001 A.14 — keamanan dalam development &
// A.13 — komunikasi) — dilindungi: klikjacking, sniffing, referer leak,
// akses API kamera/lokasi/mikrofon tanpa izin eksplisit.
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
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
