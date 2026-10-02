import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStr, num, slugify, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return handleAdmin(async () => {
    const categories = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: categories })
  })
}

export async function POST(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const name = str(body.name)
    if (!name) return bad('Nama kategori wajib diisi.')

    const slugBase = str(body.slug) || slugify(name)
    let slug = slugBase
    let i = 1
    while (await db.category.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${++i}`
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: optStr(body.description),
        image: optStr(body.image),
        sortOrder: num(body.sortOrder, 0),
        status: statusVal(body.status),
      },
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'Category',
      entityId: category.id,
      entityLabel: category.name,
      detail: { status: category.status },
    })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  })
}
