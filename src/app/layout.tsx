import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Caveat, Kaushan_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/plattertea/ServiceWorkerRegister";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: ["400"],
});

// URL produksi — bisa dioverride via env NEXT_PUBLIC_SITE_URL (mis. saat pakai
// domain sendiri). Fallback domain Vercel agar OG/metadata tetap absolut & benar
// tanpa perlu env (penting untuk preview WhatsApp/Facebook/X).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plattertea.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // CATATAN: <title> TIDAK diatur di sini — dirender per view oleh <DocumentMeta>
  // (React 19 hoisting). Jika title juga ada di metadata, React mengelola DUA
  // node <title> dan me-restore versi layout setiap re-render (perang title).
  description:
    "Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan kekinian. Pesan mudah lewat keranjang online → WhatsApp. Mix, Sip, Enjoy!",
  keywords: [
    "PlatterTea",
    "Food & Tea",
    "Mix Platter",
    "Es Teh",
    "Camilan",
    "Kuliner Purwokerto",
    "Mix Platter Purwokerto",
    "Es Teh Purwokerto",
    "Telkom University Purwokerto",
    "Minuman Kekinian",
    "Menu PlatterTea",
    "Booth Telkom University",
  ],
  authors: [{ name: "PlatterTea" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  applicationName: "PlatterTea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlatterTea",
  },
  icons: {
    // Set lengkap: favicon klasik + PWA — Google memakai ini utk favicon
    // hasil pencarian (tampil di samping sitename seperti contoh Fore Coffee)
    icon: [
      { url: "/brand/favicon.png", type: "image/png" },
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/pwa/apple-touch-icon.png",
  },
  openGraph: {
    title: "PlatterTea — Food & Tea Purwokerto | Mix, Sip, Enjoy!",
    description:
      "Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan kekinian. Pesan mudah lewat keranjang online → WhatsApp.",
    siteName: "PlatterTea",
    locale: "id_ID",
    type: "website",
    images: [
      {
        // Resolusi 2x (2400x1260, rasio 1.91:1) agar teks & CTA "Beli di Sini"
        // tetap tajam/jelas saat link dibagikan ke WhatsApp/IG/Facebook/X.
        // Nama file -v2 juga mem-bust cache preview WhatsApp/Facebook.
        url: "/og-image-v2.jpg",
        width: 2400,
        height: 1260,
        alt: "PlatterTea — Food & Tea Purwokerto: Mix Platter, es teh & camilan kekinian. Beli di sini! Mix, Sip, Enjoy!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlatterTea — Food & Tea Purwokerto | Mix, Sip, Enjoy!",
    description:
      "Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan kekinian. Pesan mudah lewat keranjang online → WhatsApp.",
    images: ["/og-image-v2.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173D32",
};

// JSON-LD LocalBusiness — alamat, koordinat, jam buka & kontak PlatterTea
// agar mesin pencari memahami lokasi booth (rich results Google Maps/Search).
// Koordinat & alamat mengikuti Telkom University Purwokerto (mirror seed.ts).
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "PlatterTea — Food & Tea",
  slogan: "Mix, Sip, Enjoy!",
  description:
    "Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan kekinian. Pesan mudah lewat keranjang online → WhatsApp.",
  telephone: "+6285175397747",
  email: "plattertea@gmail.com",
  url: SITE_URL,
  image: [`${SITE_URL}/og-image-v2.jpg`],
  logo: `${SITE_URL}/pwa/icon-512.png`,
  priceRange: "Rp8.000 - Rp25.000",
  servesCuisine: ["Indonesian", "Tea", "Snack"],
  // Menu kini URL path asli — dapat diindeks & muncul sbg sitelink "Menu"
  hasMenu: `${SITE_URL}/menu`,
  menu: `${SITE_URL}/menu`,
  acceptsReservations: "False",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. D.I. Panjaitan No. 128 (Telkom University Purwokerto)",
    addressLocality: "Purwokerto",
    addressRegion: "Jawa Tengah",
    postalCode: "53147",
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -7.435263,
    longitude: 109.246518,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "07:00",
      closes: "20:00",
    },
  ],
  sameAs: ["https://instagram.com/plattertea", "https://tiktok.com/@plattertea"],
}

// JSON-LD WebSite + SearchAction — memenuhi syarat sitelinks searchbox:
// URL ?q=kata+kunci membuka pencarian situs secara langsung (didukung SPA).
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PlatterTea",
  alternateName: "PlatterTea — Food & Tea Purwokerto",
  url: SITE_URL,
  inLanguage: "id-ID",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} ${caveat.variable} ${kaushan.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegister />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Fallback tanpa-JS: konten inti + tautan navigasi tetap terbaca
            crawler sederhana & aksesibilitas — informasi sama dgn render JS */}
        <noscript>
          <div style={{ fontFamily: "sans-serif", padding: 24, background: "#F7F3E9", color: "#173D32" }}>
            <h2>PlatterTea — Food &amp; Tea Purwokerto</h2>
            <p>
              Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan
              kekinian. Pesan mudah lewat keranjang online → WhatsApp. Mix, Sip, Enjoy!
            </p>
            <ul>
              <li><a href="/menu">Menu</a> — pilihan Mix Platter, Tea &amp; Combo</li>
              <li><a href="/promo">Promo</a> — Spesial Market Days &amp; Open PO</li>
              <li><a href="/about">Tentang Kami</a></li>
              <li><a href="/contact">Hubungi Kami</a> — WhatsApp +62 851-7539-7747</li>
              <li><a href="/faq">FAQ</a></li>
            </ul>
            <p>
              Alamat: Telkom University Purwokerto, Jl. D.I. Panjaitan No. 128, Purwokerto, Kab.
              Banyumas, Jawa Tengah 53147 · Buka setiap hari 07.00–20.00
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
