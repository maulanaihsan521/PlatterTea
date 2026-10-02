import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, num, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit, diffFields } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const existing = await db.faq.findUnique({ where: { id } })
    if (!existing) return bad('FAQ tidak ditemukan.', 404)

    const item = await db.faq.update({
      where: { id },
      data: {
        question: str(body.question, existing.question),
        answer: str(body.answer, existing.answer),
        category: str(body.category, existing.category),
        sortOrder: num(body.sortOrder, existing.sortOrder),
        status: statusVal(body.status, existing.status),
      },
    })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Faq',
      entityId: item.id,
      entityLabel: item.question.slice(0, 80),
      detail: {
        changes: diffFields(
          existing as unknown as Record<string, unknown>,
          item as unknown as Record<string, unknown>,
          ['question', 'category', 'status', 'sortOrder']
        ),
      },
    })
    return NextResponse.json({ success: true, data: item })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const existing = await db.faq.findUnique({ where: { id } })
    if (!existing) return bad('FAQ tidak ditemukan.', 404)
    await db.faq.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'Faq',
      entityId: id,
      entityLabel: existing.question.slice(0, 80),
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
