// POST /api/admin/change-password — admin mengganti password sendiri dari CMS.
// Keamanan: verifikasi password saat ini, panjang minimal 10, wajib berbeda dari yang lama,
// sesi TIDAK di-invalidasi (admin tetap login), semua percobaan tercatat di audit log.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError, hashPassword, verifyPassword } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const me = await requireAdmin()

    const body = (await req.json().catch(() => null)) as
      | { currentPassword?: string; newPassword?: string }
      | null
    const currentPassword = body?.currentPassword || ''
    const newPassword = body?.newPassword || ''

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Password saat ini dan password baru wajib diisi.' },
        { status: 400 }
      )
    }
    if (newPassword.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Password baru minimal 10 karakter.' },
        { status: 400 }
      )
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Password baru harus berbeda dari password saat ini.' },
        { status: 400 }
      )
    }

    const user = await db.adminUser.findUnique({ where: { id: me.id } })
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Akun tidak ditemukan atau tidak aktif.' },
        { status: 404 }
      )
    }
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      logAudit({
        actor: me,
        action: 'PASSWORD_CHANGE',
        entity: 'Auth',
        entityLabel: null,
        detail: { ok: false, reason: 'password-saat-ini-salah' },
      })
      return NextResponse.json(
        { success: false, error: 'Password saat ini salah.' },
        { status: 401 }
      )
    }

    await db.adminUser.update({
      where: { id: me.id },
      data: { passwordHash: hashPassword(newPassword) },
    })

    logAudit({
      actor: me,
      action: 'PASSWORD_CHANGE',
      entity: 'Auth',
      entityLabel: null,
      detail: { ok: true },
    })

    return NextResponse.json({ success: true, data: { changed: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error('POST /api/admin/change-password error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
