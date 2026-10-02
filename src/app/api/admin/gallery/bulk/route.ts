import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, bad, str } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

/**
 * PATCH /api/admin/gallery/bulk — aksi massal foto galeri.
 * Body: { action: 'publish' | 'draft' | 'delete', ids: string[] }
 */
export async function PATCH(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const action = str(body.action)
    const ids = Array.isArray(body.ids) ? body.ids.filter((i): i is string => typeof i === 'string') : []

    if (!['publish', 'draft', 'delete'].includes(action)) {
      return bad('Aksi tidak dikenal.')
    }
    if (ids.length === 0) return bad('Pilih minimal satu foto.')

    const where = { id: { in: ids } }

    if (action === 'delete') {
      const existing = await db.galleryItem.findMany({ where, select: { id: true, title: true } })
      if (existing.length === 0) return bad('Foto tidak ditemukan.')
      const res = await db.galleryItem.deleteMany({ where })
      logAudit({
        actor: me,
        action: 'DELETE',
        entity: 'Gallery',
        entityId: null,
        entityLabel: `${res.count} foto galeri (massal)`,
        detail: { bulk: true, count: res.count, names: existing.slice(0, 10).map((g) => g.title) },
      })
      return NextResponse.json({ success: true, data: { affected: res.count, action } })
    }

    const status = action === 'publish' ? 'PUBLISHED' : 'DRAFT'
    const res = await db.galleryItem.updateMany({ where, data: { status } })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Gallery',
      entityId: null,
      entityLabel: `${res.count} foto galeri (massal)`,
      detail: { bulk: true, count: res.count, status },
    })
    return NextResponse.json({ success: true, data: { affected: res.count, action } })
  })
}
