import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth'

async function guard() {
  try {
    return await requireAdmin()
  } catch (e) {
    if (e instanceof AuthError) {
      throw e
    }
    throw e
  }
}

export async function GET() {
  try {
    await guard()
    const [totalProducts, activeProducts, draftProducts, promotions, gallery, testimonials, faqs] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { status: 'PUBLISHED' } }),
        db.product.count({ where: { status: 'DRAFT' } }),
        db.promotion.count({ where: { status: 'PUBLISHED' } }),
        db.galleryItem.count({ where: { status: 'PUBLISHED' } }),
        db.testimonial.count({ where: { status: 'PUBLISHED' } }),
        db.faq.count({ where: { status: 'PUBLISHED' } }),
      ])

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        draftProducts,
        promotions,
        gallery,
        testimonials,
        faqs,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
