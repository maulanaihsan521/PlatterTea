import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleSuperAdmin, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

interface BackupRow {
  id?: string
  [key: string]: unknown
}

interface BackupPayload {
  app?: string
  version?: number
  data?: {
    categories?: BackupRow[]
    products?: BackupRow[]
    promotions?: BackupRow[]
    galleryItems?: BackupRow[]
    testimonials?: BackupRow[]
    faqs?: BackupRow[]
    settings?: BackupRow[]
  }
}

function isDate(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:/.test(v)
}

function parseDates(row: Record<string, unknown>, dateFields: string[]) {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (dateFields.includes(k) && isDate(v)) out[k] = new Date(v)
    else out[k] = v
  }
  return out
}

/**
 * POST /api/admin/import — restore konten dari file backup JSON.
 * Mode upsert per id (data dengan id yang sama diperbarui, id baru dibuat).
 * Tidak menghapus data yang tidak ada di file backup.
 */
export async function POST(req: NextRequest) {
  return handleSuperAdmin(async (me) => {
    let payload: BackupPayload
    try {
      payload = (await req.json()) as BackupPayload
    } catch {
      return bad('File backup tidak valid (bukan JSON).')
    }
    if (payload.app !== 'plattertea-cms' || !payload.data) {
      return bad('File bukan backup PlatterTea CMS.')
    }

    const d = payload.data
    const result = { categories: 0, products: 0, promotions: 0, galleryItems: 0, testimonials: 0, faqs: 0, settings: 0 }

    for (const row of d.categories ?? []) {
      if (!row.id) continue
      const { id, ...rest } = parseDates(row, ['createdAt', 'updatedAt']) as { id: string } & Record<string, unknown>
      await db.category.upsert({ where: { id }, create: { id, ...(rest as object) }, update: rest })
      result.categories++
    }

    for (const row of d.products ?? []) {
      if (!row.id) continue
      const { id, ...rest } = parseDates(row, ['createdAt', 'updatedAt']) as { id: string } & Record<string, unknown>
      // jaga FK: null-kan categoryId jika kategori target tidak ada di database
      const catId = typeof rest.categoryId === 'string' ? rest.categoryId : null
      if (catId) {
        const catExists = await db.category.findUnique({ where: { id: catId }, select: { id: true } })
        if (!catExists) rest.categoryId = null
      }
      await db.product.upsert({ where: { id }, create: { id, ...(rest as object) }, update: rest })
      result.products++
    }

    for (const row of d.promotions ?? []) {
      if (!row.id) continue
      const { id, ...rest } = parseDates(row, ['createdAt', 'updatedAt', 'startDate', 'endDate']) as { id: string } & Record<string, unknown>
      await db.promotion.upsert({ where: { id }, create: { id, ...(rest as object) }, update: rest })
      result.promotions++
    }

    for (const row of d.galleryItems ?? []) {
      if (!row.id) continue
      const { id, ...rest } = parseDates(row, ['createdAt', 'updatedAt']) as { id: string } & Record<string, unknown>
      await db.galleryItem.upsert({ where: { id }, create: { id, ...(rest as object) }, update: rest })
      result.galleryItems++
    }

    for (const row of d.testimonials ?? []) {
      if (!row.id) continue
      const { id, ...rest } = parseDates(row, ['createdAt', 'updatedAt']) as { id: string } & Record<string, unknown>
      await db.testimonial.upsert({ where: { id }, create: { id, ...(rest as object) }, update: rest })
      result.testimonials++
    }

    for (const row of d.faqs ?? []) {
      if (!row.id) continue
      const { id, ...rest } = parseDates(row, ['createdAt', 'updatedAt']) as { id: string } & Record<string, unknown>
      await db.faq.upsert({ where: { id }, create: { id, ...(rest as object) }, update: rest })
      result.faqs++
    }

    for (const row of d.settings ?? []) {
      if (typeof row.key !== 'string' || typeof row.value !== 'string') continue
      await db.siteSetting.upsert({
        where: { key: row.key },
        create: { key: row.key, value: row.value },
        update: { value: row.value },
      })
      result.settings++
    }

    logAudit({
      actor: me,
      action: 'IMPORT',
      entity: 'Data',
      entityLabel: 'Restore Backup',
      detail: result,
    })
    return NextResponse.json({ success: true, data: result })
  })
}
