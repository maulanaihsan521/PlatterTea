'use client'

import { useEffect, useState, createContext, useContext, useCallback, useSyncExternalStore } from 'react'
import { parseHash, routeToHash, type Route, type SiteSettings } from '@/lib/plattertea'

// ============ Hash Router Hook ============

const HOME_ROUTE: Route = { view: 'home' }

// Cache snapshot agar getSnapshot stabil (wajib untuk useSyncExternalStore)
let hashCache = ''
let routeCache: Route = HOME_ROUTE

function getHashRoute(): Route {
  if (typeof window === 'undefined') return HOME_ROUTE
  const h = window.location.hash
  if (h !== hashCache) {
    hashCache = h
    routeCache = parseHash(h)
  }
  return routeCache
}

function subscribeHash(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

export function useHashRoute() {
  // Saat SSR & hydration selalu mulai dari home, lalu sinkron ke hash asli
  // setelah mount — mencegah hydration mismatch pada deep-link (mis. #/P578Admin).
  const route = useSyncExternalStore(subscribeHash, getHashRoute, () => HOME_ROUTE)

  useEffect(() => {
    const onHashChange = () => {
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((r: Route, opts?: { scrollToTop?: boolean }) => {
    const target = routeToHash(r)
    if (window.location.hash === target) {
      if (opts?.scrollToTop !== false) window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.location.hash = target
    if (opts?.scrollToTop !== false) {
      requestAnimationFrame(() => window.scrollTo({ top: 0 }))
    }
  }, [])

  return { route, navigate }
}

// ============ Settings Context ============

const defaultSettings: SiteSettings = {
  hero_title: 'Mix, Sip, Enjoy!',
  hero_subtitle: 'Perpaduan Mix Platter dan Tea untuk menemani setiap momenmu.',
  hero_badge: 'Segar, Lezat, Praktis!',
  about_story:
    'PlatterTea adalah brand Food & Tea yang menghadirkan kombinasi makanan ringan dan minuman teh dengan konsep yang praktis, fresh, dan menyenangkan.',
  whatsapp: '6285175397747',
  whatsapp_display: '+62 851-7539-7747',
  email: 'plattertea@gmail.com',
  address: 'Telkom University Purwokerto, Jl. D.I. Panjaitan No. 128, Purwokerto, Kab. Banyumas, Jawa Tengah 53147',
  maps_url: 'https://www.google.com/maps/search/?api=1&query=Telkom+University+Purwokerto',
  maps_embed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.270756540308!2d109.24651767500141!3d-7.435263092575548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e655ea49d9f9885%3A0x62be0b6159700ec9!2sTelkom%20University%20Purwokerto!5e0!3m2!1sen!2sid!4v1790927483123!5m2!1sen!2sid',
  opening_hours: 'Senin - Minggu (07:00 - 20:00)',
  instagram_url: 'https://instagram.com/plattertea',
  instagram_display: '@plattertea',
  tiktok_url: 'https://tiktok.com/@plattertea',
  tiktok_display: '@plattertea',
}

const SettingsContext = createContext<SiteSettings>(defaultSettings)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    let mounted = true
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success && res.data) {
          setSettings({ ...defaultSettings, ...res.data })
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}

// ============ WhatsApp Helpers ============

export function waLink(waNumber: string, message?: string): string {
  const num = waNumber.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${num}${text}`
}

export const WA_MESSAGES = {
  general: 'Halo PlatterTea! Saya mau tanya-tanya dulu.',
  product: (name: string) =>
    `Halo PlatterTea! Saya tertarik dengan produk "${name}". Boleh minta info lebih lanjut?`,
  order: 'Halo PlatterTea! Saya mau pesan menu. Boleh bantu?',
  marketdays: 'Halo PlatterTea! Saya mau tanya soal promo Spesial Market Days.',
  openPO:
    // Tanpa emoji — redirect wa.me merusak emoji 4-byte (jadi karakter pengganti).
    'Halo PlatterTea! Saya mau Open PO untuk Market Days.\n\nNama: \nPesanan: \nVarian Tea: \nJumlah: \n\n(Ambil di booth saat Market Days ya. Terima kasih!)',
}

// Format pesanan Open PO — ditampilkan di website sebagai panduan
// (bukan form pemesanan — website tidak mengelola transaksi)
export const OPEN_PO_MESSAGE_TEMPLATE = `Halo PlatterTea! 👋
Saya mau Open PO Market Days

Nama :
Pesanan :
Varian Tea :
Jumlah :

Terima kasih!`
