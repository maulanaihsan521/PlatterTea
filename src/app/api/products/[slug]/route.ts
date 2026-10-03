import { NextRequest, NextResponse } from 'next/server'
import { getProductWithRelated } from '@/lib/products-server'
import { PUBLIC_CACHE_CONTROL } from '@/lib/simple-cache'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const result = await getProductWithRelated(slug)

    if (!result) {
      // no-store: 404 jangan di-cache — produk bisa saja dipublikasikan setelahnya
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan.' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return NextResponse.json(
      { success: true, data: result },
      { headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL } },
    )
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat produk.' }, { status: 500 })
  }
}
