import type { Metadata } from 'next'
import { PlatterTeaClient } from '@/components/plattertea/PlatterTeaClient'
import type { ProductResult } from '@/components/plattertea/views/ProductDetailView'
import { routeFromSearchParams, formatRupiah, type Route } from '@/lib/plattertea'
import { getProductWithRelated } from '@/lib/products-server'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

// Robots penuh utk view publik — sama dgn layout.tsx (page-level metadata
// menimpa layout, jadi field harus lengkap di sini).
const PUBLIC_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
} as const

const DEFAULT_OG_IMAGE = {
  // Resolusi 2x (2400x1260) — teks & CTA tetap tajam di preview WhatsApp/IG/FB.
  url: '/og-image-v2.jpg',
  width: 2400,
  height: 1260,
  alt: 'PlatterTea — Food & Tea Purwokerto: Mix Platter, es teh & camilan kekinian. Beli di sini! Mix, Sip, Enjoy!',
}

/**
 * Metadata per view utk RAW HTML (SSR). CATATAN PENTING:
 * - `title` SENGAJA tidak di-set di sini — <title> dimiliki <DocumentMeta>
 *   (React 19 hoisting; dua node <title> saling merebut document.title).
 *   Dengan initialRoute/initialProduct dari server, DocumentMeta me-render
 *   <title> yang benar per path langsung di HTML awal.
 * - og:title/description/canonical di-set di sini agar WhatsApp/IG/Facebook/X
 *   (crawler tanpa JS) mendapat preview yang benar sejak fetch pertama.
 */
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams
  const route = routeFromSearchParams(sp)

  if (route.view === 'admin') {
    // /P578Admin — blokir total: robots.txt Disallow (tak di-fetch crawler)
    // + noindex sebagai lapis kedua.
    return { robots: { index: false, follow: false } }
  }

  if (route.view === 'product') {
    // Metadata produk dari DB — preview WhatsApp/FB menampilkan nama, harga,
    // dan foto produk asli (bukan kartu beranda).
    const result = await getProductWithRelated(route.slug).catch(() => null)
    if (result) {
      const { product } = result
      const title = `${product.name} — ${product.category?.name || 'Menu'} | PlatterTea`
      const description =
        product.shortDesc ||
        product.fullDesc ||
        `Pesan ${product.name} PlatterTea via WhatsApp. Harga ${formatRupiah(product.price)}.`
      const image = product.mainImage
        ? { url: product.mainImage, width: 1200, height: 1200, alt: product.name }
        : DEFAULT_OG_IMAGE
      return {
        description,
        alternates: { canonical: `/produk/${product.slug}` },
        robots: PUBLIC_ROBOTS,
        openGraph: { title, description, url: `/produk/${product.slug}`, images: [image], siteName: 'PlatterTea', locale: 'id_ID', type: 'website' },
        twitter: { card: 'summary_large_image', title, description, images: [product.mainImage ?? '/og-image-v2.jpg'] },
      }
    }
    // slug tidak dikenal di DB (kalaupun crawler) — metadata generik menu
    return {
      description: 'Detail menu PlatterTea — pesan mudah via WhatsApp.',
      alternates: { canonical: `/produk/${route.slug}` },
      robots: PUBLIC_ROBOTS,
      openGraph: {
        title: 'Menu — PlatterTea',
        description: 'Detail menu PlatterTea — pesan mudah via WhatsApp.',
        url: `/produk/${route.slug}`,
        images: [DEFAULT_OG_IMAGE],
        siteName: 'PlatterTea',
        locale: 'id_ID',
        type: 'website',
      },
    }
  }

  // View statis: home/menu/promo/about/contact/faq — peta meta paralel dgn
  // client (PlatterTeaClient) agar nilai SSR & pasca-hidrasi konsisten.
  const VIEW_META: Record<Exclude<Route['view'], 'product' | 'admin'>, { title: string; description: string; path: string }> = {
    home: {
      title: 'PlatterTea — Food & Tea Purwokerto | Mix, Sip, Enjoy!',
      description:
        'Booth PlatterTea di Telkom University Purwokerto: Mix Platter, es teh, dan camilan kekinian. Pesan mudah lewat keranjang online → WhatsApp. Mix, Sip, Enjoy!',
      path: '/',
    },
    menu: {
      title: 'Menu Kami — PlatterTea',
      description:
        'Pilihan Mix Platter, Tea, dan Combo PlatterTea. Ada Platter Only Rp15.000, Tea Only Rp8.000, dan paket combo hemat.',
      path: '/menu',
    },
    promo: {
      title: 'Promo & Info Terbaru — PlatterTea',
      description: 'Promo menarik, Spesial Market Days, dan layanan Open PO via WhatsApp mulai H-4.',
      path: '/promo',
    },
    about: {
      title: 'Tentang Kami — PlatterTea',
      description: 'Kenalan dengan PlatterTea: visi, misi, nilai brand, dan galeri momen bersama.',
      path: '/about',
    },
    contact: {
      title: 'Hubungi Kami — PlatterTea',
      description:
        'Hubungi PlatterTea via WhatsApp +62 851-7539-7747, Instagram, TikTok, atau kunjungi booth kami di Telkom University Purwokerto.',
      path: '/contact',
    },
    faq: {
      title: 'FAQ — PlatterTea',
      description: 'Pertanyaan yang sering diajukan tentang menu, pemesanan, dan promo PlatterTea.',
      path: '/faq',
    },
  }
  const m = VIEW_META[route.view]
  return {
    description: m.description,
    alternates: { canonical: m.path },
    robots: PUBLIC_ROBOTS,
    openGraph: {
      title: m.title,
      description: m.description,
      url: m.path,
      images: [DEFAULT_OG_IMAGE],
      siteName: 'PlatterTea',
      locale: 'id_ID',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description, images: ['/og-image-v2.jpg'] },
  }
}

/**
 * PlatterTea — Public Website + Admin CMS (server entry)
 * Server membaca rewrite ptview (next.config) → tahu view tanpa JS → SSR
 * me-render view + metadata yang benar di raw HTML per path (SEO sitelinks,
 * preview WhatsApp/IG/FB). Hydration mulai dari view yang sama — tanpa flicker.
 */
export default async function PlatterTeaPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const initialRoute = routeFromSearchParams(sp)

  // Produk di-fetch server utk /produk/{slug} — meta + konten siap di HTML awal
  let initialProduct: ProductResult | 'notfound' | null = null
  if (initialRoute.view === 'product') {
    initialProduct = (await getProductWithRelated(initialRoute.slug).catch(() => null)) ?? 'notfound'
  }

  return <PlatterTeaClient initialRoute={initialRoute} initialProduct={initialProduct} />
}
