import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { checkRateLimit, recordFailure, clearRateLimit, requestIp } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit'

/**
 * POST /api/admin/reset-password — publik (tanpa sesi): konsumsi token reset
 * dan pasang password baru. Token single-use, kadaluarsa 30 menit.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const token = (body?.token || '').trim()
    const password = body?.password || ''

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Kode reset dan password baru wajib diisi.' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 8 karakter.' },
        { status: 400 }
      )
    }

    // Rate limit per-IP (token 144-bit hampir mustahil ditebak, ini lapis ekstra)
    const ip = requestIp(req)
    const key = `reset:${ip}`
    const limit = checkRateLimit(key)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak percobaan. Coba lagi nanti.', lockedUntilSec: limit.retryAfterSec },
        { status: 429 }
      )
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')
    const record = await db.passwordResetToken.findUnique({ where: { tokenHash } })

    const invalid = !record || !!record.usedAt || record.expiresAt < new Date()
    if (invalid) {
      recordFailure(key)
      logAudit({
        action: 'PASSWORD_RESET_FAILED',
        entity: 'Auth',
        entityLabel: record?.userId || 'token tidak dikenal',
        detail: { reason: !record ? 'token_not_found' : record.usedAt ? 'token_used' : 'token_expired' },
      })
      return NextResponse.json(
        { success: false, error: 'Kode reset tidak valid, sudah dipakai, atau kedaluwarsa. Minta link baru dari Super Admin.' },
        { status: 400 }
      )
    }

    const user = await db.adminUser.findUnique({ where: { id: record.userId } })
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Akun tidak tersedia atau tidak aktif.' },
        { status: 400 }
      )
    }

    // Terapkan password baru + tandai token terpakai + hapus token lain milik user ini
    await db.$transaction([
      db.adminUser.update({ where: { id: user.id }, data: { passwordHash: hashPassword(password) } }),
      db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    ])

    clearRateLimit(key)
    logAudit({
      actor: user,
      action: 'PASSWORD_RESET',
      entity: 'Auth',
      entityId: user.id,
      entityLabel: user.email,
      detail: { via: 'reset_token' },
    })

    return NextResponse.json({ success: true, data: { email: user.email } })
  } catch (error) {
    console.error('POST /api/admin/reset-password error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
