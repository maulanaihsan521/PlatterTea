import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'
import { checkRateLimit, recordFailure, clearRateLimit, requestIp, type RateLimitResult } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

// Header standar rate-limit utk respons 429 (temuan F-06 pentest: 429 tanpa
// Retry-After menyulitkan klien sah & monitoring mengetahui kapan boleh coba lagi)
function rateLimited(res: RateLimitResult) {
  return NextResponse.json(
    {
      success: false,
      error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil(res.retryAfterSec / 60)} menit.`,
      lockedUntilSec: res.retryAfterSec,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(res.retryAfterSec),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + res.retryAfterSec),
      },
    }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    // Validasi tipe eksplisit (temuan F-05 pentest: body dgn tipe salah, mis.
    // email:123, memicu TypeError .trim() → 500; kini ditolak 400 dengan pesan baku)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi.' },
        { status: 400 }
      )
    }

    // ===== Rate limit / lockout (anti brute-force) =====
    const key = `${requestIp(req)}:${email}`
    const limit = checkRateLimit(key)
    if (!limit.allowed) {
      logAudit({
        action: 'LOGIN_FAILED',
        entity: 'Auth',
        entityLabel: email,
        detail: { reason: 'locked', retryAfterSec: limit.retryAfterSec },
      })
      return rateLimited(limit)
    }

    const user = await db.adminUser.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      const after = recordFailure(key)
      logAudit({
        action: 'LOGIN_FAILED',
        entity: 'Auth',
        entityLabel: email,
        detail: { reason: 'invalid_credentials', remainingAttempts: after.remainingAttempts },
      })
      if (!after.allowed) {
        // percobaan ke-5 (dan selanjutnya) → terkunci
        return rateLimited(after)
      }
      return NextResponse.json(
        {
          success: false,
          error:
            after.remainingAttempts <= 2
              ? `Email atau password salah. Sisa ${after.remainingAttempts} percobaan sebelum akun terkunci sementara.`
              : 'Email atau password salah.',
        },
        { status: 401 }
      )
    }
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Akun tidak aktif. Hubungi Super Admin.' },
        { status: 403 }
      )
    }

    clearRateLimit(key)
    await setSessionCookie(user.id)
    logAudit({
      actor: user,
      action: 'LOGIN',
      entity: 'Auth',
      entityId: user.id,
      entityLabel: user.email,
    })

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status },
    })
  } catch (error) {
    console.error('POST /api/admin/login error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
