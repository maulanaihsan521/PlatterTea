import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const promos = await db.promotion.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json({ success: true, data: promos })
  } catch (error) {
    console.error('GET /api/promotions error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat promo.' }, { status: 500 })
  }
}
