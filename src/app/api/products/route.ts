import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad } from '@/lib/simple-cache'

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

    const products = await getOrLoad(`api:products:${category || 'all'}:${featured || 'any'}`, () =>
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      })
    )

    // no-store: konten CMS harus selalu fresh di browser pengunjung setelah admin mengubahnya
    return NextResponse.json({ success: true, data: products }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat produk.' }, { status: 500 })
  }
}
