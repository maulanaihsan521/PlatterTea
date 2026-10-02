import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStrKeep, num, bool, slugify, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit, diffFields } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return bad('Produk tidak ditemukan.', 404)

    const name = str(body.name, existing.name)
    let slug = str(body.slug) || slugify(name)
    if (slug !== existing.slug) {
      let base = slug
      let i = 1
      while (await db.product.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${base}-${++i}`
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        slug,
        // Update parsial: field yang tidak dikirim mempertahankan nilai lama
        categoryId: optStrKeep(body.categoryId, existing.categoryId),
        price: num(body.price, existing.price),
        shortDesc: optStrKeep(body.shortDesc, existing.shortDesc),
        fullDesc: optStrKeep(body.fullDesc, existing.fullDesc),
        composition: optStrKeep(body.composition, existing.composition),
        mainImage: optStrKeep(body.mainImage, existing.mainImage),
        featured: bool(body.featured, existing.featured),
        status: statusVal(body.status, existing.status),
        sortOrder: num(body.sortOrder, existing.sortOrder),
        portion: optStrKeep(body.portion, existing.portion),
      },
      include: { category: true },
    })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Product',
      entityId: product.id,
      entityLabel: product.name,
      detail: {
        changes: diffFields(
          existing as unknown as Record<string, unknown>,
          product as unknown as Record<string, unknown>,
          ['name', 'price', 'status', 'featured', 'categoryId', 'sortOrder']
        ),
      },
    })
    return NextResponse.json({ success: true, data: product })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return bad('Produk tidak ditemukan.', 404)
    await db.product.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'Product',
      entityId: id,
      entityLabel: existing.name,
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
