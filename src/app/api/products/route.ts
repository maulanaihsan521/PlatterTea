import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') // slug or 'all'
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = { status: 'PUBLISHED' }
    if (category && category !== 'all') {
      where.category = { slug: category }
    }
    if (featured === 'true') {
      where.featured = true
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat produk.' }, { status: 500 })
  }
}
