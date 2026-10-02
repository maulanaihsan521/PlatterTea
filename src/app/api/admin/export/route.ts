import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleSuperAdmin } from '@/lib/admin-helpers'

/** GET /api/admin/export — backup seluruh konten CMS sebagai file JSON (SUPER_ADMIN only). */
export async function GET() {
  return handleSuperAdmin(async () => {
    const [categories, products, promotions, galleryItems, testimonials, faqs, settings] =
      await Promise.all([
        db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.product.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.promotion.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.testimonial.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.faq.findMany({ orderBy: { sortOrder: 'asc' } }),
        db.siteSetting.findMany({ orderBy: { key: 'asc' } }),
      ])

    const payload = {
      app: 'plattertea-cms',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { categories, products, promotions, galleryItems, testimonials, faqs, settings },
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="plattertea-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  })
}
