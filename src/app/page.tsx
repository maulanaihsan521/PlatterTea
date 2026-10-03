'use client'

import dynamic from 'next/dynamic'
import { Navbar } from '@/components/plattertea/Navbar'
import { Footer } from '@/components/plattertea/Footer'
import { BackToTop, BottomNav } from '@/components/plattertea/Floating'
import { HomeView } from '@/components/plattertea/views/HomeView'
import { MenuView } from '@/components/plattertea/views/MenuView'
import { ProductDetailView } from '@/components/plattertea/views/ProductDetailView'
import { PromoView } from '@/components/plattertea/views/PromoView'
import { AboutView } from '@/components/plattertea/views/AboutView'
import { ContactView } from '@/components/plattertea/views/ContactView'
import { FaqView } from '@/components/plattertea/views/FaqView'
import { DocumentMeta } from '@/components/plattertea/DocumentMeta'
import { InstallBanner } from '@/components/plattertea/InstallApp'
import { CartSheet } from '@/components/plattertea/Cart'
import { useSiteRoute, SettingsProvider } from '@/hooks/use-plattertea'
import { routeToPath, type Route } from '@/lib/plattertea'
import { Loader2 } from 'lucide-react'

/**
 * Admin CMS di-lazy-load: kode admin (~1MB dev / ratusan KB di produksi)
 * TIDAK diunduh pengunjung publik — hanya dimuat saat hash #/P578Admin dibuka.
 * Publik jadi lebih ringan & lebih cepat (visitor tidak pernah butuh kode admin).
 */
const AdminView = dynamic(
  () => import('@/components/plattertea/admin/AdminView').then((m) => m.AdminView),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-forest" aria-hidden="true" />
        <p className="text-sm font-semibold text-forest/70">Memuat Admin CMS…</p>
      </div>
    ),
  },
)

/**
 * PlatterTea — Public Website + Admin CMS
 * Public: Company Profile + Product Showcase + WhatsApp Contact
 * Admin:  CMS untuk kelola konten (login via #/P578Admin)
 * (No transaction features — website is NOT e-commerce per brand rules)
 */
function PlatterTeaApp() {
  const { route, navigate } = useSiteRoute()

  const nav = (r: Route) => navigate(r)

  // SEO dinamis per view — path canonical + breadcrumb JSON-LD per halaman
  // (syarat sitelinks Google: setiap view = URL + judul + canonical sendiri)
  const meta: Record<
    Route['view'],
    { title: string; description: string; path?: string; breadcrumb?: { name: string; path: string }[] }
  > = {
    home: {
      title: 'PlatterTea — Food & Tea Purwokerto | Mix, Sip, Enjoy!',
      description:
        'PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.',
      path: '/',
    },
    menu: {
      title: 'Menu Kami — PlatterTea',
      description:
        'Pilihan Mix Platter, Tea, dan Combo PlatterTea. Ada Platter Only Rp15.000, Tea Only Rp8.000, dan paket combo hemat.',
      path: '/menu',
      breadcrumb: [{ name: 'Menu', path: '/menu' }],
    },
    product: {
      title: 'Menu — PlatterTea',
      description: 'Detail menu PlatterTea — pesan mudah via WhatsApp.',
    },
    promo: {
      title: 'Promo & Info Terbaru — PlatterTea',
      description: 'Promo menarik, Spesial Market Days, dan layanan Open PO via WhatsApp mulai H-4.',
      path: '/promo',
      breadcrumb: [{ name: 'Promo', path: '/promo' }],
    },
    about: {
      title: 'Tentang Kami — PlatterTea',
      description: 'Kenalan dengan PlatterTea: visi, misi, nilai brand, dan galeri momen bersama.',
      path: '/about',
      breadcrumb: [{ name: 'Tentang Kami', path: '/about' }],
    },
    contact: {
      title: 'Hubungi Kami — PlatterTea',
      description:
        'Hubungi PlatterTea via WhatsApp +62 851-7539-7747, Instagram, TikTok, atau kunjungi booth kami di Telkom University Purwokerto.',
      path: '/contact',
      breadcrumb: [{ name: 'Hubungi Kami', path: '/contact' }],
    },
    faq: {
      title: 'FAQ — PlatterTea',
      description: 'Pertanyaan yang sering diajukan tentang menu, pemesanan, dan promo PlatterTea.',
      path: '/faq',
      breadcrumb: [{ name: 'FAQ', path: '/faq' }],
    },
    admin: {
      title: 'Admin CMS — PlatterTea',
      description: 'Panel pengelolaan konten website PlatterTea.',
    },
  }

  // Admin CMS — full screen terpisah dari tampilan publik
  if (route.view === 'admin') {
    return (
      <SettingsProvider>
        <DocumentMeta {...meta.admin} />
        <AdminView path={route.path} />
      </SettingsProvider>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar route={route} navigate={nav} />

      <main key={routeToPath(route)} className="pt-fade-in flex-1">
        {/* Meta SEO per view — HARUS di dalam <main key> (remount per route):
            efek DocumentMeta di luar main tidak terpicu ulang saat sinkronisasi
            route pasca-hydration (quirk React 19), di dalam main selalu jalan.
            View product & promo menangani meta sendiri di komponen masing-masing. */}
        {route.view !== 'product' && route.view !== 'promo' && (
          <DocumentMeta
            title={meta[route.view].title}
            description={meta[route.view].description}
            path={meta[route.view].path}
            breadcrumb={meta[route.view].breadcrumb}
          />
        )}
        {route.view === 'home' && <HomeView navigate={nav} />}
        {route.view === 'menu' && <MenuView navigate={nav} />}
        {route.view === 'product' && <ProductDetailView slug={route.slug} navigate={nav} />}
        {route.view === 'promo' && <PromoView navigate={nav} />}
        {route.view === 'about' && <AboutView navigate={nav} />}
        {route.view === 'contact' && <ContactView navigate={nav} />}
        {route.view === 'faq' && <FaqView navigate={nav} />}
      </main>

      <Footer navigate={nav} />

      {/* Overlays */}
      <BackToTop />
      <BottomNav route={route} navigate={nav} />
      {route.view === 'home' && <InstallBanner />}
      {/* Keranjang → checkout WhatsApp (global, semua halaman publik) */}
      <CartSheet navigate={nav} />
    </div>
  )
}

export default function PlatterTeaPage() {
  return (
    <SettingsProvider>
      <PlatterTeaApp />
    </SettingsProvider>
  )
}
