import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'
import { checkRateLimit, recordFailure, clearRateLimit, requestIp } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const email = (body?.email || '').trim().toLowerCase()
    const password = body?.password || ''

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
      const menit = Math.ceil(limit.retryAfterSec / 60)
      logAudit({
        action: 'LOGIN_FAILED',
        entity: 'Auth',
        entityLabel: email,
        detail: { reason: 'locked', retryAfterSec: limit.retryAfterSec },
      })
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${menit} menit.`,
          lockedUntilSec: limit.retryAfterSec,
        },
        { status: 429 }
      )
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
        return NextResponse.json(
          {
            success: false,
            error: 'Terlalu banyak percobaan gagal. Login terkunci sementara.',
            lockedUntilSec: after.retryAfterSec,
          },
          { status: 429 }
        )
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
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (error) {
    console.error('POST /api/admin/login error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
