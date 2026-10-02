import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStrKeep, num, slugify, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit, diffFields } from '@/lib/audit'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return bad('Kategori tidak ditemukan.', 404)

    const name = str(body.name, existing.name)
    let slug = str(body.slug) || slugify(name)
    if (slug !== existing.slug) {
      let base = slug
      let i = 1
      while (await db.category.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${base}-${++i}`
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: optStrKeep(body.description, existing.description),
        image: optStrKeep(body.image, existing.image),
        sortOrder: num(body.sortOrder, existing.sortOrder),
        status: statusVal(body.status, existing.status),
      },
    })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'Category',
      entityId: category.id,
      entityLabel: category.name,
      detail: {
        changes: diffFields(
          existing as unknown as Record<string, unknown>,
          category as unknown as Record<string, unknown>,
          ['name', 'status', 'sortOrder']
        ),
      },
    })
    return NextResponse.json({ success: true, data: category })
  })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return handleAdmin(async (me) => {
    const { id } = await params
    const count = await db.product.count({ where: { categoryId: id } })
    if (count > 0) {
      return bad(`Kategori masih dipakai ${count} produk. Pindahkan produk terlebih dahulu.`)
    }
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return bad('Kategori tidak ditemukan.', 404)
    await db.category.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'Category',
      entityId: id,
      entityLabel: existing.name,
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
