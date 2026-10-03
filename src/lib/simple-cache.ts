/**
 * Cache memori sederhana (TTL) untuk API publik read-heavy.
 *
 * Tujuan performa:
 * - Home memanggil 4-5 API per load (settings, products, promotions, testimonials, faqs).
 * - Setiap call melakukan round-trip ke Supabase (ap-southeast-1) ~300-1200ms.
 * - Dengan TTL pendek, pengunjung berikutnya mendapat respons <5ms tanpa biaya DB.
 *
 * Freshness:
 * - TTL 30 detik cukup aman untuk konten marketing.
 * - Admin CMS memanggil `invalidatePublicCache()` setelah setiap write (create/update/delete),
 *   sehingga perubahan langsung tampil tanpa menunggu TTL habis.
 */

type Entry<T> = { value: T; expires: number }

// Disimpan di globalThis agar singleton lintas bundel Turbopack/webpack —
// setiap route handler yang meng-import modul ini berbagi Map yang sama.
const globalForCache = globalThis as unknown as {
  platterteaCacheStore?: Map<string, Entry<unknown>>
}
const store: Map<string, Entry<unknown>> = (globalForCache.platterteaCacheStore ??= new Map())

export const PUBLIC_CACHE_TTL_MS = 30_000

/**
 * Cache-Control utk respons API publik (GET) di Vercel:
 * - s-maxage=30        → respons disimpan di Edge Network Vercel 30 dtk.
 *   Kunjungan berikutnya dilayani edge TANPA menjalankan fungsi (tanpa query Supabase)
 *   → melindungi kuota free-tier (Supabase egress + compute) saat traffic ramai.
 * - stale-while-revalidate=300 → dlm 5 menit, edge boleh sajikan salinan lama
 *   sambil refresh di background → pengunjung selalu respons cepat.
 * Freshness: perubahan CMS tampil maksimal 30 dtk kemudian (setara TTL cache memori),
 * dan invalidasi memori tetap aktif utk instance yg hangat.
 */
export const PUBLIC_CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=300'

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key)
  if (!hit) return undefined
  if (Date.now() > hit.expires) {
    store.delete(key)
    return undefined
  }
  return hit.value as T
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = PUBLIC_CACHE_TTL_MS): void {
  store.set(key, { value, expires: Date.now() + ttlMs })
}

/** Dipakai di handler cache-able: helper getOrLoad, hasil selalu JSON-serializable (dari Prisma). */
export async function getOrLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cacheGet<T>(key)
  if (hit !== undefined) return hit
  const value = await loader()
  cacheSet(key, value)
  return value
}

/** Hapus semua cache publik — dipanggil admin API setelah write. Prefix 'api:' mencakup kombinasi filter. */
export function invalidatePublicCache(): void {
  for (const key of store.keys()) {
    if (key.startsWith('api:')) store.delete(key)
  }
}
