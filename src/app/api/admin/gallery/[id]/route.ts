import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStrKeep, num, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit, diffFields } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const existing = await db.galleryItem.findUnique({ where: { id } })
    if (!existing) return bad('Item galeri tidak ditemukan.', 404)

    const item = await db.galleryItem.update({
      where: { id },
      data: {
        title: str(body.title, existing.title),
        description: optStrKeep(body.description, existing.description),
        image: str(body.image, existing.image),
        category: str(body.category, existing.category),
        sortOrder: num(body.sortOrder, existing.sortOrder),
        status: statusVal(body.status, existing.status),
      },
    })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Gallery',
      entityId: item.id,
      entityLabel: item.title,
      detail: {
        changes: diffFields(
          existing as unknown as Record<string, unknown>,
          item as unknown as Record<string, unknown>,
          ['title', 'category', 'status', 'sortOrder']
        ),
      },
    })
    return NextResponse.json({ success: true, data: item })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const existing = await db.galleryItem.findUnique({ where: { id } })
    if (!existing) return bad('Item galeri tidak ditemukan.', 404)
    await db.galleryItem.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'Gallery',
      entityId: id,
      entityLabel: existing.title,
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
