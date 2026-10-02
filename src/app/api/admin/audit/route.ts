import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, bad } from '@/lib/admin-helpers'
import { maybeCleanupOldAuditLogs } from '@/lib/audit'

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'IMPORT', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET', 'PASSWORD_RESET_FAILED', 'PASSWORD_CHANGE', 'MEDIA_DELETE']
const ENTITIES = ['Product', 'Category', 'Promotion', 'Testimonial', 'Faq', 'Gallery', 'Settings', 'User', 'Data', 'Auth', 'Media']

/**
 * GET /api/admin/audit — riwayat aktivitas admin.
 * SUPER_ADMIN melihat semua; role lain hanya aktivitasnya sendiri.
 * Query: page, limit (max 50), action, entity, userId (SUPER_ADMIN only), q (cari label)
 */
export async function GET(req: NextRequest) {
  return handleAdmin(async (me) => {
    // Retensi otomatis: hapus log > 90 hari (throttle 1x/24 jam, fire-and-forget)
    maybeCleanupOldAuditLogs()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limitRaw = parseInt(searchParams.get('limit') || '20', 10) || 20
    const limit = Math.min(50, Math.max(1, limitRaw))
    const action = searchParams.get('action') || ''
    const entity = searchParams.get('entity') || ''
    const q = searchParams.get('q')?.trim() || ''
    const userId = searchParams.get('userId') || ''
    const since = searchParams.get('since') || ''

    const isSuper = me.role === 'SUPER_ADMIN'

    const where: Record<string, unknown> = {}
    if (action && ACTIONS.includes(action)) where.action = action
    if (entity && ENTITIES.includes(entity)) where.entity = entity
    if (q) where.entityLabel = { contains: q }
    if (since) {
      const d = new Date(since)
      if (!Number.isNaN(d.getTime())) where.createdAt = { gte: d }
    }

    // Non-super admin hanya melihat aktivitasnya sendiri
    if (!isSuper) {
      where.userId = me.id
    } else if (userId) {
      where.userId = userId
    }

    const [items, total] = await Promise.all([
      db.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.adminAuditLog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hasMore: page * limit < total,
      },
    })
  })
}

/** DELETE /api/admin/audit — bersihkan log (SUPER_ADMIN only). */
export async function DELETE() {
  return handleAdmin(async (me) => {
    if (me.role !== 'SUPER_ADMIN') {
      return bad('Hanya Super Admin yang dapat menghapus log aktivitas.', 403)
    }
    const res = await db.adminAuditLog.deleteMany()
    return NextResponse.json({ success: true, data: { deleted: res.count } })
  })
}
