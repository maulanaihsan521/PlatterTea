import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

/**
 * PUT /api/admin/gallery/reorder — simpan urutan foto galeri (drag-and-drop).
 * Body: { ids: string[] } — urutan id sesuai posisi baru.
 */
export async function PUT(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const ids = Array.isArray(body.ids) ? body.ids.filter((i): i is string => typeof i === 'string') : []
    if (ids.length === 0) return bad('Daftar urutan kosong.')
    if (new Set(ids).size !== ids.length) return bad('Urutan mengandung duplikat.')

    const existing = await db.galleryItem.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true },
    })
    if (existing.length !== ids.length) return bad('Ada foto galeri yang tidak ditemukan.')

    const max = await db.galleryItem.aggregate({ _max: { sortOrder: true } })
    let offset = (max._max.sortOrder ?? 0) + ids.length + 1

    await db.$transaction([
      ...ids.map((id) => db.galleryItem.update({ where: { id }, data: { sortOrder: (offset += 1) } })),
      ...ids.map((id, i) => db.galleryItem.update({ where: { id }, data: { sortOrder: i + 1 } })),
    ])

    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Gallery',
      entityId: null,
      entityLabel: `${ids.length} foto galeri (urutan tampil)`,
      detail: { reorder: true, order: ids.length <= 20 ? ids : ids.slice(0, 20) },
    })

    return NextResponse.json({ success: true, data: { affected: ids.length } })
  })
}
