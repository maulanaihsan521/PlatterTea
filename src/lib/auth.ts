// PlatterTea Admin Auth — scrypt password hashing + HMAC-signed session cookie
import { scryptSync, randomBytes, createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

// ===== Fail-closed secret (ISO/IEC 27001 A.9 — kontrol akses) =====
// Rahasia sesi TIDAK BOLEH punya fallback yang dikenal/di-commit ke repo —
// siapa pun yang membaca repo bisa memalsukan session cookie admin.
// - Produksi tanpa AUTH_SECRET → tolak boot (fail closed).
// - Dev tanpa AUTH_SECRET → nilai acak per-proses: sesi hangus saat restart,
//   tapi tidak dapat dipalsukan dari nilai yang bocor di repo.
const ENV_SECRET = process.env.AUTH_SECRET || ''
const SECRET = ENV_SECRET || randomBytes(32).toString('hex')
if (process.env.NODE_ENV === 'production' && !ENV_SECRET) {
  throw new Error(
    'AUTH_SECRET wajib diset di environment produksi (minimal 32 byte acak, cth: openssl rand -hex 32).'
  )
}

export const SESSION_COOKIE = 'pt_admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

// ===== Password =====

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    if (!salt || !hash) return false
    const candidate = scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, 'hex')
    return candidate.length === expected.length && timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

// ===== Session token (stateless, HMAC-signed) =====

interface SessionPayload {
  userId: string
  exp: number
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = { userId, exp: Date.now() + SESSION_TTL_MS }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expectedSig = createHmac('sha256', SECRET).update(data).digest('base64url')
  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expectedSig)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload
    if (!payload.userId || !payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// ===== Cookie session helpers (server-side) =====

export async function setSessionCookie(userId: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' })
}

/** Returns the logged-in admin user, or null. */
export async function getSessionUser() {
  const store = await cookies()
  const payload = verifySessionToken(store.get(SESSION_COOKIE)?.value)
  if (!payload) return null
  const user = await db.adminUser.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, status: true },
  })
  if (!user || user.status !== 'ACTIVE') return null
  return user
}

/** Guard for admin API routes. Returns user or throws a 401 NextResponse. */
export async function requireAdmin() {
  const user = await getSessionUser()
  if (!user) {
    throw new AuthError('Silakan login terlebih dahulu.')
  }
  return user
}

/** Guard khusus SUPER_ADMIN (manajemen user admin). */
export async function requireSuperAdmin() {
  const user = await requireAdmin()
  if (user.role !== 'SUPER_ADMIN') {
    throw new AuthError('Hanya Super Admin yang dapat mengakses fitur ini.', 403)
  }
  return user
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}
