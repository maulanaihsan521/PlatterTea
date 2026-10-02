import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStr, num, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return handleAdmin(async () => {
    const items = await db.testimonial.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ success: true, data: items })
  })
}

export async function POST(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const name = str(body.name)
    const content = str(body.content)
    if (!name) return bad('Nama wajib diisi.')
    if (!content) return bad('Isi testimoni wajib diisi.')

    const rating = Math.min(5, Math.max(1, num(body.rating, 5)))
    const item = await db.testimonial.create({
      data: {
        name,
        role: optStr(body.role),
        photo: optStr(body.photo),
        content,
        rating,
        status: statusVal(body.status),
        sortOrder: num(body.sortOrder, 0),
      },
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'Testimonial',
      entityId: item.id,
      entityLabel: item.name,
      detail: { rating: item.rating, status: item.status },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  })
}
