import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PUBLIC_CACHE_CONTROL } from '@/lib/simple-cache'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await db.product.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: { category: true },
    })

    if (!product) {
      // no-store: 404 jangan di-cache — produk bisa saja dipublikasikan setelahnya
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    // related products (same category, exclude current)
    const related = await db.product.findMany({
      where: { categoryId: product.categoryId, status: 'PUBLISHED', id: { not: product.id } },
      take: 3,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(
      { success: true, data: { product, related } },
      { headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL } },
    )
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat produk.' }, { status: 500 })
  }
}
