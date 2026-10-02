import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: testimonials })
  } catch (error) {
    console.error('GET /api/testimonials error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat testimoni.' }, { status: 500 })
  }
}
