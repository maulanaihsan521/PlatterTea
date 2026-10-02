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
  title: "PlatterTea — Food & Tea Purwokerto | Mix, Sip, Enjoy!",
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
    icon: "/brand/logo.png",
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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PlatterTea — Mix Platter & es teh kekinian. Mix, Sip, Enjoy!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlatterTea — Food & Tea Purwokerto | Mix, Sip, Enjoy!",
    description:
      "Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan kekinian. Pesan mudah lewat keranjang online → WhatsApp.",
    images: ["/og-image.jpg"],
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
  url: SITE_URL,
  image: [`${SITE_URL}/og-image.jpg`],
  priceRange: "Rp8.000 - Rp25.000",
  menu: `${SITE_URL}/#/menu`,
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
  openingHours: "Mo-Su 07:00-20:00",
  servesCuisine: ["Indonesian", "Tea", "Snack"],
  sameAs: ["https://instagram.com/plattertea", "https://tiktok.com/@plattertea"],
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
      </body>
    </html>
  );
}
