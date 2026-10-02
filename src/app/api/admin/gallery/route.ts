import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson, str, optStr, num, statusVal, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return handleAdmin(async () => {
    const items = await db.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })
    return NextResponse.json({ success: true, data: items })
  })
}

export async function POST(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const title = str(body.title)
    const image = str(body.image)
    if (!title) return bad('Judul wajib diisi.')
    if (!image) return bad('Gambar wajib diunggah atau diisi URL-nya.')

    const item = await db.galleryItem.create({
      data: {
        title,
        description: optStr(body.description),
        image,
        category: str(body.category, 'produk'),
        sortOrder: num(body.sortOrder, 0),
        status: statusVal(body.status),
      },
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'Gallery',
      entityId: item.id,
      entityLabel: item.title,
      detail: { category: item.category, status: item.status },
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  })
}
