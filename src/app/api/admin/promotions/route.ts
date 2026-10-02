import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStr, num, bool, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return handleAdmin(async () => {
    const promotions = await db.promotion.findMany({
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json({ success: true, data: promotions })
  })
}

export async function POST(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const title = str(body.title)
    if (!title) return bad('Judul promo wajib diisi.')

    const promotion = await db.promotion.create({
      data: {
        title,
        subtitle: optStr(body.subtitle),
        description: optStr(body.description),
        image: optStr(body.image),
        startDate: body.startDate ? new Date(str(body.startDate)) : null,
        endDate: body.endDate ? new Date(str(body.endDate)) : null,
        status: statusVal(body.status),
        featured: bool(body.featured),
        ctaLabel: str(body.ctaLabel, 'Lihat Informasi'),
        sortOrder: num(body.sortOrder, 0),
      },
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'Promotion',
      entityId: promotion.id,
      entityLabel: promotion.title,
      detail: { featured: promotion.featured, status: promotion.status },
    })
    return NextResponse.json({ success: true, data: promotion }, { status: 201 })
  })
}
