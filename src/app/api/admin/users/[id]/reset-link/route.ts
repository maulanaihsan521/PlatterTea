import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { handleSuperAdmin, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

const TOKEN_TTL_MS = 30 * 60 * 1000 // 30 menit

/**
 * POST /api/admin/users/[id]/reset-link — buat link reset password (SUPER_ADMIN only).
 * Token mentah dikembalikan SEKALI (disimpan hanya hash-nya). Link dikirim ke user
 * lewat jalur lain (chat pribadi) karena website ini tidak mengirim email.
 */
export async function POST(_req: NextRequest, { params }: Params) {
  return handleSuperAdmin(async (me) => {
    const { id } = await params
    const target = await db.adminUser.findUnique({ where: { id } })
    if (!target) return bad('User tidak ditemukan.', 404)
    if (target.status !== 'ACTIVE') {
      return bad('Akun sedang ditangguhkan — aktifkan akun dulu sebelum membuat link reset.')
    }

    // Token baru otomatis menggantikan token lama yang masih aktif
    await db.passwordResetToken.deleteMany({ where: { userId: id, usedAt: null } })

    const raw = randomBytes(24).toString('base64url')
    const tokenHash = createHash('sha256').update(raw).digest('hex')
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

    await db.passwordResetToken.create({ data: { userId: id, tokenHash, expiresAt } })

    logAudit({
      actor: me,
      action: 'PASSWORD_RESET_REQUEST',
      entity: 'User',
      entityId: target.id,
      entityLabel: `${target.name} (${target.email})`,
      detail: { expiresAt: expiresAt.toISOString() },
    })

    return NextResponse.json({
      success: true,
      data: {
        token: raw,
        expiresAt: expiresAt.toISOString(),
        url: `/#/admin/reset/${raw}`,
      },
    })
  })
}
