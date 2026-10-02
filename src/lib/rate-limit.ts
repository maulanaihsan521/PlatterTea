// PlatterTea — Rate limiter in-memory untuk proteksi login admin
// Sliding window per kunci (ip:email). Maks 5 kegagalan dalam 10 menit
// → akun/IP terkunci 15 menit. (Cukup untuk 1 instance server; produksi
// multi-instance sebaiknya pakai store terdistribusi.)

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000 // 10 menit
const LOCKOUT_MS = 15 * 60 * 1000 // 15 menit

interface AttemptRecord {
  failures: number[]
  lockedUntil: number
}

const store = new Map<string, AttemptRecord>()

function getRecord(key: string): AttemptRecord {
  let rec = store.get(key)
  if (!rec) {
    rec = { failures: [], lockedUntil: 0 }
    store.set(key, rec)
  }
  return rec
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSec: number
  remainingAttempts: number
}

/** Cek apakah percobaan login diizinkan (panggil SEBELUM verifikasi). */
export function checkRateLimit(key: string): RateLimitResult {
  const rec = getRecord(key)
  const now = Date.now()

  // bersihkan kegagalan di luar window
  rec.failures = rec.failures.filter((t) => now - t < WINDOW_MS)

  if (rec.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((rec.lockedUntil - now) / 1000),
      remainingAttempts: 0,
    }
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - rec.failures.length),
  }
}

/** Catat kegagalan login. Mengembalikan status lockout setelah kegagalan ini. */
export function recordFailure(key: string): RateLimitResult {
  const rec = getRecord(key)
  const now = Date.now()
  rec.failures = rec.failures.filter((t) => now - t < WINDOW_MS)
  rec.failures.push(now)

  if (rec.failures.length >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS
    rec.failures = [] // reset setelah lockout diaktifkan
    return { allowed: false, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000), remainingAttempts: 0 }
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - rec.failures.length),
  }
}

/** Reset setelah login sukses. */
export function clearRateLimit(key: string): void {
  store.delete(key)
}

// ===== Sliding window generik (endpoint publik, cth. kirim testimoni) =====
const pubStore = new Map<string, number[]>()

export interface PublicLimitResult {
  allowed: boolean
  retryAfterSec: number
}

/**
 * Cek apakah aksi publik masih dalam jatah: maks `max` kali per `windowMs`
 * per kunci (biasanya IP). Bersih-bersih entri lama berjalan hemat di sini.
 */
export function checkPublicLimit(key: string, max: number, windowMs: number): PublicLimitResult {
  const now = Date.now()
  const hits = (pubStore.get(key) || []).filter((t) => now - t < windowMs)

  if (hits.length >= max) {
    pubStore.set(key, hits)
    return { allowed: false, retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000) }
  }

  hits.push(now)
  pubStore.set(key, hits)

  // housekeeping: cegah Map tumbuh tanpa batas
  if (pubStore.size > 5000) {
    for (const [k, v] of pubStore) {
      if (v.every((t) => now - t >= windowMs)) pubStore.delete(k)
    }
  }
  return { allowed: true, retryAfterSec: 0 }
}

/** Ekstrak IP dari request (proxy-aware untuk Caddy/gateway lokal). */
export function requestIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
