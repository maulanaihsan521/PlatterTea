// PlatterTea Service Worker — PWA offline support
// Strategi:
//  - Navigasi halaman (SPA shell "/"): network-first, fallback cache → offline.html
//  - Aset statis (gambar/brand/products/PWA icons/_next/static): stale-while-revalidate
//  - API (/api/*): network-first tanpa fallback cache (data selalu segar saat online)
const STATIC_CACHE = 'pt-static-v1'
const PAGE_CACHE = 'pt-pages-v1'
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
  OFFLINE_URL,
  '/brand/logo.png',
  '/brand/logo-white.png',
  '/brand/logo-mark.png',
  '/brand/favicon.png',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

function isStaticAsset(url) {
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/pwa/')) return true
  return (
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|mp3|mp4)$/i.test(url.pathname) ||
    url.pathname.startsWith('/products/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname.startsWith('/uploads/')
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // ===== Navigasi halaman =====
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(PAGE_CACHE).then((c) => c.put('/', copy)).catch(() => {})
          return res
        })
        .catch(() =>
          caches
            .match('/')
            .then((cached) => cached || caches.match(OFFLINE_URL))
            .then((hit) => hit || caches.match(OFFLINE_URL))
            .then((hit) => hit || Response.error())
        )
    )
    return
  }

  // ===== API: network-first (tanpa cache fallback) =====
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => Response.error()))
    return
  }

  // ===== Aset build Next: network-first (hindari chunk basi saat HMR/dev) =====
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && request.destination === 'image') {
            caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone())).catch(() => {})
          }
          return res
        })
        .catch(() => caches.match(request).then((hit) => hit || Response.error()))
    )
    return
  }

  // ===== Aset statis (gambar/brand/products/uploads/pwa): stale-while-revalidate =====
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone()).catch(() => {})
            return res
          })
          .catch(() => cached || Response.error())
        return cached || network
      })
    )
  }
})
