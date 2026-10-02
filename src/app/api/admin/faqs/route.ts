import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, num, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return handleAdmin(async () => {
    const items = await db.faq.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ success: true, data: items })
  })
}

export async function POST(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const question = str(body.question)
    const answer = str(body.answer)
    if (!question) return bad('Pertanyaan wajib diisi.')
    if (!answer) return bad('Jawaban wajib diisi.')

    const item = await db.faq.create({
      data: {
        question,
        answer,
        category: str(body.category, 'umum'),
        sortOrder: num(body.sortOrder, 0),
        status: statusVal(body.status),
      },
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'Faq',
      entityId: item.id,
      entityLabel: item.question.slice(0, 80),
      detail: { category: item.category, status: item.status },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  })
}
