import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Home, UtensilsCrossed, MessageCircle } from "lucide-react";

// Halaman 404 kustom berbahasa Indonesia (temuan F-07 pentest: 404 bawaan Next.js
// berbahasa Inggris tanpa navigasi — menurunkan kesan profesional & ISO 9126
// attractiveness/fault-tolerance). Sekaligus momen branding: maskot + pesan hangat.
export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan | PlatterTea",
  description:
    "Halaman yang kamu cari tidak ditemukan. Yuk kembali ke beranda atau lihat menu PlatterTea!",
  robots: { index: false, follow: true },
};

const WHATSAPP_URL = "https://wa.me/6285175397747";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-4 py-16 text-center text-forest">
      {/* dekorasi daun lembut */}
      <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-forest/5" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-gold/10" />

      <p
        aria-hidden
        className="font-[family-name:var(--font-kaushan)] text-[88px] font-bold leading-none tracking-tight text-forest sm:text-[120px]"
      >
        404
      </p>

      <Image
        src="/brand/mascot-point.png"
        alt="Maskot PlatterTea menunjuk arah kembali ke beranda"
        width={168}
        height={168}
        priority
        className="mt-2 h-auto w-36 sm:w-44"
      />

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Waduh, halamannya nggak ada!
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-forest/70">
        Sepertinya tautan yang kamu buka sudah dipindah atau salah ketik.
        Tenang — teh &amp; platter kami masih menunggu di tempat biasa.{" "}
        <span className="font-[family-name:var(--font-caveat)] text-lg font-semibold text-gold-dark">
          Mix, Sip, Enjoy!
        </span>
      </p>

      <nav aria-label="Navigasi 404" className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-extrabold text-forest shadow-sm transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark"
        >
          <Home className="h-4 w-4" aria-hidden />
          Kembali ke Beranda
        </Link>
        <Link
          href="/menu"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-forest/20 bg-white/70 px-6 py-2.5 text-sm font-extrabold text-forest transition hover:border-forest/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          <UtensilsCrossed className="h-4 w-4" aria-hidden />
          Lihat Menu
        </Link>
      </nav>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-forest/70 underline-offset-4 transition hover:text-forest hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Masih bingung? Chat WhatsApp kami
      </a>
    </main>
  );
}
