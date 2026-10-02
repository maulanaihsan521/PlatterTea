import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad } from '@/lib/simple-cache'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    const where: Record<string, unknown> = { status: 'PUBLISHED' }
    if (category && category !== 'all') where.category = category

    const items = await getOrLoad(`api:gallery:${category || 'all'}:${limit || 'any'}`, () =>
      db.galleryItem.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        ...(limit ? { take: parseInt(limit, 10) } : {}),
      })
    )
    // no-store: perubahan galeri dari admin langsung terlihat oleh pengunjung
    return NextResponse.json({ success: true, data: items }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/gallery error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat galeri.' }, { status: 500 })
  }
}
