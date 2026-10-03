import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad, PUBLIC_CACHE_CONTROL } from '@/lib/simple-cache'

export async function GET() {
  try {
    const faqs = await getOrLoad('api:faqs', () =>
      db.faq.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
      })
    )
    // Edge cache 30 dtk: perubahan CMS tampil <=30 dtk
    return NextResponse.json({ success: true, data: faqs }, { headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL } })
  } catch (error) {
    console.error('GET /api/faqs error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat FAQ.' }, { status: 500 })
  }
}
