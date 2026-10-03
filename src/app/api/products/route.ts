import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad, PUBLIC_CACHE_CONTROL } from '@/lib/simple-cache'

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

    // Edge cache 30 dtk (Vercel) + memori: pengunjung ramai tak menghantam Supabase;
    // perubahan CMS tampil <=30 dtk (invalidasi memori tetap aktif)
    return NextResponse.json({ success: true, data: products }, { headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL } })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat produk.' }, { status: 500 })
  }
}
