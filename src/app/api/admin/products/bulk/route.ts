import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, bad, str } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

const ALLOWED_STATUS = ['PUBLISHED', 'DRAFT', 'ARCHIVED']

/**
 * PATCH /api/admin/products/bulk — aksi massal produk.
 * Body: { action: 'publish' | 'draft' | 'archive' | 'delete', ids: string[] }
 * Satu entri audit per operasi (detail: jumlah + status baru).
 */
export async function PATCH(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const action = str(body.action)
    const ids = Array.isArray(body.ids) ? body.ids.filter((i): i is string => typeof i === 'string') : []

    if (!['publish', 'draft', 'archive', 'delete'].includes(action)) {
      return bad('Aksi tidak dikenal.')
    }
    if (ids.length === 0) return bad('Pilih minimal satu produk.')

    const where = { id: { in: ids } }

    if (action === 'delete') {
      const existing = await db.product.findMany({ where, select: { id: true, name: true } })
      if (existing.length === 0) return bad('Produk tidak ditemukan.')
      const res = await db.product.deleteMany({ where })
      logAudit({
        actor: me,
        action: 'DELETE',
        entity: 'Product',
        entityId: null,
        entityLabel: `${res.count} produk (massal)`,
        detail: { bulk: true, count: res.count, names: existing.slice(0, 10).map((p) => p.name) },
      })
      return NextResponse.json({ success: true, data: { affected: res.count, action } })
    }

    const status = action === 'publish' ? 'PUBLISHED' : action === 'draft' ? 'DRAFT' : 'ARCHIVED'
    if (!ALLOWED_STATUS.includes(status)) return bad('Status tidak valid.')

    const res = await db.product.updateMany({ where, data: { status } })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Product',
      entityId: null,
      entityLabel: `${res.count} produk (massal)`,
      detail: { bulk: true, count: res.count, status },
    })
    return NextResponse.json({ success: true, data: { affected: res.count, action } })
  })
}
