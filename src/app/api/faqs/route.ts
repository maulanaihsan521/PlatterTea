import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad } from '@/lib/simple-cache'

export async function GET() {
  try {
    const faqs = await getOrLoad('api:faqs', () =>
      db.faq.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
      })
    )
    // no-store: konten CMS harus selalu fresh di browser pengunjung setelah admin mengubahnya
    return NextResponse.json({ success: true, data: faqs }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/faqs error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat FAQ.' }, { status: 500 })
  }
}
