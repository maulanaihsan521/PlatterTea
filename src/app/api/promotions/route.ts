import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad } from '@/lib/simple-cache'

export async function GET() {
  try {
    const promos = await getOrLoad('api:promotions', () =>
      db.promotion.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
      })
    )
    // no-store: konten CMS harus selalu fresh di browser pengunjung setelah admin mengubahnya
    return NextResponse.json({ success: true, data: promos }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/promotions error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat promo.' }, { status: 500 })
  }
}
