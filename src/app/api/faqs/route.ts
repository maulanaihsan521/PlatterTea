import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const faqs = await db.faq.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: faqs })
  } catch (error) {
    console.error('GET /api/faqs error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat FAQ.' }, { status: 500 })
  }
}
