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
    const [totalProducts, activeProducts, draftProducts, promotions, gallery, testimonials, faqs, recentAudits] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { status: 'PUBLISHED' } }),
        db.product.count({ where: { status: 'DRAFT' } }),
        db.promotion.count({ where: { status: 'PUBLISHED' } }),
        db.galleryItem.count({ where: { status: 'PUBLISHED' } }),
        db.testimonial.count({ where: { status: 'PUBLISHED' } }),
        db.faq.count({ where: { status: 'PUBLISHED' } }),
        // Aktivitas 7 hari: ambil createdAt saja (hemat), dibucket per hari WIB di bawah
        db.adminAuditLog.findMany({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          select: { createdAt: true },
        }),
      ])

    // Bucket per kalender hari Asia/Jakarta (WIB, UTC+7) — en-CA = YYYY-MM-DD
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' })
    const byDay = new Map<string, number>()
    for (const a of recentAudits) {
      const key = fmt.format(a.createdAt)
      byDay.set(key, (byDay.get(key) || 0) + 1)
    }
    const DAY_LABEL: Record<string, string> = {
      Sun: 'Min', Mon: 'Sen', Tue: 'Sel', Wed: 'Rab', Thu: 'Kam', Fri: 'Jum', Sat: 'Sab',
    }
    const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Jakarta' })
    const activity7d = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
      const key = fmt.format(d)
      return {
        date: key,
        label: DAY_LABEL[dayFmt.format(d)] || dayFmt.format(d),
        total: byDay.get(key) || 0,
      }
    })

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
        activity7d,
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
