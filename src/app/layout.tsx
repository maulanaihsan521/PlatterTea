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

export const metadata: Metadata = {
  // Base URL untuk OG/twitter image absolut (ganti via NEXT_PUBLIC_SITE_URL saat deploy)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "PlatterTea — Food & Tea | Mix, Sip, Enjoy!",
  description:
    "PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.",
  keywords: [
    "PlatterTea",
    "Food & Tea",
    "Mix Platter",
    "Tea",
    "Camilan",
    "Es Teh",
    "Combo",
  ],
  authors: [{ name: "PlatterTea" }],
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
    title: "PlatterTea — Food & Tea | Mix, Sip, Enjoy!",
    description:
      "PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.",
    siteName: "PlatterTea",
    type: "website",
    images: ["/products/hero.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlatterTea — Food & Tea | Mix, Sip, Enjoy!",
    description:
      "PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.",
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
    "PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.",
  telephone: "+6285175397747",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
