import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStrKeep, num, bool, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit, diffFields } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const existing = await db.promotion.findUnique({ where: { id } })
    if (!existing) return bad('Promo tidak ditemukan.', 404)

    const promotion = await db.promotion.update({
      where: { id },
      data: {
        title: str(body.title, existing.title),
        subtitle: optStrKeep(body.subtitle, existing.subtitle),
        description: optStrKeep(body.description, existing.description),
        image: optStrKeep(body.image, existing.image),
        startDate: body.startDate === undefined ? existing.startDate : body.startDate ? new Date(str(body.startDate)) : null,
        endDate: body.endDate === undefined ? existing.endDate : body.endDate ? new Date(str(body.endDate)) : null,
        status: statusVal(body.status, existing.status),
        featured: bool(body.featured, existing.featured),
        ctaLabel: str(body.ctaLabel, existing.ctaLabel),
        sortOrder: num(body.sortOrder, existing.sortOrder),
      },
    })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Promotion',
      entityId: promotion.id,
      entityLabel: promotion.title,
      detail: {
        changes: diffFields(
          existing as unknown as Record<string, unknown>,
          promotion as unknown as Record<string, unknown>,
          ['title', 'status', 'featured', 'sortOrder']
        ),
      },
    })
    return NextResponse.json({ success: true, data: promotion })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const existing = await db.promotion.findUnique({ where: { id } })
    if (!existing) return bad('Promo tidak ditemukan.', 404)
    await db.promotion.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'Promotion',
      entityId: id,
      entityLabel: existing.title,
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
