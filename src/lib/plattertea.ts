// PlatterTea shared types

export interface Product {
  id: string
  name: string
  slug: string
  categoryId: string | null
  category?: Category | null
  price: number
  shortDesc: string | null
  fullDesc: string | null
  composition: string | null
  mainImage: string | null
  galleryImages: string | null
  featured: boolean
  status: string
  sortOrder: number
  portion: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
  status: string
}

export interface Promotion {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image: string | null
  startDate: string | null
  endDate: string | null
  status: string
  featured: boolean
  ctaLabel: string
  sortOrder: number
}

export interface Testimonial {
  id: string
  name: string
  role: string | null
  photo: string | null
  content: string
  rating: number
  status: string
  sortOrder: number
}

export interface Faq {
  id: string
  question: string
  answer: string
  category: string
  sortOrder: number
  status: string
}

export interface GalleryItem {
  id: string
  title: string
  description: string | null
  image: string
  category: string
  sortOrder: number
  status: string
}

export type SiteSettings = Record<string, string>

// Routes: hash-based SPA routing (sandbox exposes only `/`)
export type Route =
  | { view: 'home' }
  | { view: 'menu' }
  | { view: 'product'; slug: string }
  | { view: 'promo' }
  | { view: 'about' }
  | { view: 'contact' }
  | { view: 'faq' }
  | { view: 'admin'; path: string[] }

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').split('?')[0]
  const parts = clean.split('/').filter(Boolean)
  if (parts.length === 0) return { view: 'home' }
  switch (parts[0]) {
    // Slug admin disamarkan (tidak mudah ditebak) — URL resmi: #/P578Admin
    case 'P578Admin':
      return { view: 'admin', path: parts.slice(1) }
    case 'menu':
      if (parts[1]) return { view: 'product', slug: parts[1] }
      return { view: 'menu' }
    case 'product':
      // alias #/product/{slug} — arahkan sama seperti #/menu/{slug}
      if (parts[1]) return { view: 'product', slug: parts[1] }
      return { view: 'menu' }
    case 'promo':
      return { view: 'promo' }
    case 'about':
      return { view: 'about' }
    case 'contact':
      return { view: 'contact' }
    case 'faq':
      return { view: 'faq' }
    default:
      return { view: 'home' }
  }
}

export function routeToHash(route: Route): string {
  switch (route.view) {
    case 'home':
      return '#/'
    case 'menu':
      return '#/menu'
    case 'product':
      return `#/menu/${route.slug}`
    case 'promo':
      return '#/promo'
    case 'about':
      return '#/about'
    case 'contact':
      return '#/contact'
    case 'faq':
      return '#/faq'
    case 'admin':
      return route.path.length ? `#/P578Admin/${route.path.join('/')}` : '#/P578Admin'
  }
}

export function formatRupiah(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`
}

// ============ Promo harga coret (lapisan tampilan publik) ============

/**
 * Besaran diskon tampilan: setiap harga produk tampil "seolah-olah" dipotong
 * Rp2.500 — harga normal (harga + 2.500) dicoret, harga sekarang jadi harga promo.
 * Dipilih 2.500 karena: harga asli berakhiran .500 terasa wajar bagi konsumen
 * F&B Indonesia, dan Tea Only jadi ~~Rp10.000~~ → Rp8.000 (diskon 20% rapi).
 * HANYA lapisan tampilan: harga asli di DB, subtotal/total keranjang, dan
 * pesanan WhatsApp tetap memakai harga sekarang (yang dibayar tidak berubah).
 * Ubah nilai ini dan seluruh situs (badge, banner, admin placeholder) ikut.
 */
export const PROMO_DISKON_RP = 2500

/** Harga normal (sebelum "diskon") yang dicoret di tampilan publik. */
export function hargaSebelumDiskon(price: number): number {
  return price + PROMO_DISKON_RP
}

/**
 * Highlight angka untuk kartu promo (harga paket / nominal diskon).
 * Dipetakan dari judul promo di CMS — tanpa field harga khusus.
 * Nominal diskon diturunkan dari PROMO_DISKON_RP agar selalu konsisten.
 */
export function promoHighlight(title: string): string | null {
  const t = title.toUpperCase()
  if (t.includes('MARKET DAY')) return `Diskon ${formatRupiah(PROMO_DISKON_RP)}`
  if (t.includes('BESTIE')) return 'Rp35.000'
  if (t.includes('PLATTERTEA COMBO')) return 'Rp21.000'
  return null
}

// ============ Pesanan Keranjang → WhatsApp ============

export interface OrderLine {
  name: string
  price: number
  qty: number
}

export interface OrderMeta {
  customerName?: string
  note?: string
}

/**
 * Susun teks pesanan otomatis dari isi keranjang — dikirim sebagai
 * prefill chat WhatsApp sehingga admin langsung tahu isi pesanan.
 * Murni fungsi (mudah diuji); format rapi & tanpa karakter berbahaya.
 */
export function buildWaOrderMessage(items: OrderLine[], meta: OrderMeta = {}): string {
  const lines: string[] = []
  // Tanpa emoji: redirect server WhatsApp (wa.me) merusak emoji 4-byte
  // menjadi karakter pengganti (U+FFFD) — teks polos selalu aman.
  lines.push('Halo PlatterTea!')
  lines.push('Saya mau pesan:')
  lines.push('')
  items.forEach((item, idx) => {
    const sub = item.price * item.qty
    lines.push(`${idx + 1}. ${item.name} (${formatRupiah(item.price)}) x${item.qty} = ${formatRupiah(sub)}`)
  })
  lines.push('')
  lines.push(`Total: ${formatRupiah(items.reduce((n, i) => n + i.price * i.qty, 0))}`)

  const name = (meta.customerName || '').trim()
  const note = (meta.note || '').trim()
  if (name || note) {
    lines.push('')
    if (name) lines.push(`Nama: ${name}`)
    if (note) lines.push(`Catatan: ${note}`)
  }
  lines.push('')
  lines.push('Terima kasih!')
  return lines.join('\n')
}
