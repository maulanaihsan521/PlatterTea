'use client'

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
import { AdminView } from '@/components/plattertea/admin/AdminView'
import { DocumentMeta } from '@/components/plattertea/DocumentMeta'
import { InstallBanner } from '@/components/plattertea/InstallApp'
import { CartSheet } from '@/components/plattertea/Cart'
import { useHashRoute, SettingsProvider } from '@/hooks/use-plattertea'
import { routeToHash, type Route } from '@/lib/plattertea'

/**
 * PlatterTea — Public Website + Admin CMS
 * Public: Company Profile + Product Showcase + WhatsApp Contact
 * Admin:  CMS untuk kelola konten (login via #/admin)
 * (No transaction features — website is NOT e-commerce per brand rules)
 */
function PlatterTeaApp() {
  const { route, navigate } = useHashRoute()

  const nav = (r: Route) => navigate(r)

  // SEO dinamis per view (judul di-detail produk dioverride oleh ProductDetailView)
  const meta: Record<Route['view'], { title: string; description: string }> = {
    home: {
      title: 'PlatterTea — Food & Tea | Mix, Sip, Enjoy!',
      description: 'PlatterTea menghadirkan Mix Platter dan berbagai pilihan Tea dengan konsep yang fresh, praktis, dan menyenangkan.',
    },
    menu: {
      title: 'Menu Kami — PlatterTea',
      description: 'Pilihan Mix Platter, Tea, dan Combo PlatterTea. Ada Platter Only Rp15.000, Tea Only Rp8.000, dan paket combo hemat.',
    },
    product: {
      title: 'Menu — PlatterTea',
      description: 'Detail menu PlatterTea — pesan mudah via WhatsApp.',
    },
    promo: {
      title: 'Promo & Info Terbaru — PlatterTea',
      description: 'Promo menarik, Spesial Market Days, dan layanan Open PO via WhatsApp mulai H-7.',
    },
    about: {
      title: 'Tentang Kami — PlatterTea',
      description: 'Kenalan dengan PlatterTea: visi, misi, nilai brand, dan galeri momen bersama.',
    },
    contact: {
      title: 'Kontak — PlatterTea',
      description: 'Hubungi PlatterTea via WhatsApp, Instagram, TikTok, atau kunjungi booth kami.',
    },
    faq: {
      title: 'FAQ — PlatterTea',
      description: 'Pertanyaan yang sering diajukan tentang menu, pemesanan, dan promo PlatterTea.',
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
      {/* view product & promo menangani meta sendiri di view masing-masing */}
      {route.view !== 'product' && route.view !== 'promo' && (
        <DocumentMeta title={meta[route.view].title} description={meta[route.view].description} />
      )}
      <Navbar route={route} navigate={nav} />

      <main key={routeToHash(route)} className="pt-fade-in flex-1">
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
