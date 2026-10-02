import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStrKeep, num, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit, diffFields } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const existing = await db.testimonial.findUnique({ where: { id } })
    if (!existing) return bad('Testimoni tidak ditemukan.', 404)

    const item = await db.testimonial.update({
      where: { id },
      data: {
        name: str(body.name, existing.name),
        role: optStrKeep(body.role, existing.role),
        photo: optStrKeep(body.photo, existing.photo),
        content: str(body.content, existing.content),
        rating: Math.min(5, Math.max(1, num(body.rating, existing.rating))),
        status: statusVal(body.status, existing.status),
        sortOrder: num(body.sortOrder, existing.sortOrder),
      },
    })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Testimonial',
      entityId: item.id,
      entityLabel: item.name,
      detail: {
        changes: diffFields(
          existing as unknown as Record<string, unknown>,
          item as unknown as Record<string, unknown>,
          ['name', 'rating', 'status', 'sortOrder']
        ),
      },
    })
    return NextResponse.json({ success: true, data: item })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const existing = await db.testimonial.findUnique({ where: { id } })
    if (!existing) return bad('Testimoni tidak ditemukan.', 404)
    await db.testimonial.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'Testimonial',
      entityId: id,
      entityLabel: existing.name,
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
