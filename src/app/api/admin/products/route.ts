import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStr, num, bool, slugify, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  return handleAdmin(async () => {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    const where: Record<string, unknown> = {}
    if (q) where.name = { contains: q }
    if (status) where.status = status
    if (category) where.categoryId = category

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ success: true, data: products })
  })
}

export async function POST(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const name = str(body.name)
    if (!name) return bad('Nama produk wajib diisi.')
    const price = num(body.price, -1)
    if (price < 0) return bad('Harga tidak valid.')

    const slugBase = str(body.slug) || slugify(name)
    let slug = slugBase
    let i = 1
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${++i}`
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        categoryId: optStr(body.categoryId),
        price,
        shortDesc: optStr(body.shortDesc),
        fullDesc: optStr(body.fullDesc),
        composition: optStr(body.composition),
        mainImage: optStr(body.mainImage),
        featured: bool(body.featured),
        status: statusVal(body.status),
        sortOrder: num(body.sortOrder, 0),
        portion: optStr(body.portion),
      },
      include: { category: true },
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'Product',
      entityId: product.id,
      entityLabel: product.name,
      detail: { price: product.price, status: product.status },
    })
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  })
}
