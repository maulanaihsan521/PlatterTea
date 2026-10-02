import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    const data: Record<string, string> = {}
    for (const s of settings) data[s.key] = s.value
    // no-store: konten CMS harus selalu fresh di browser pengunjung setelah admin mengubahnya
    return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat pengaturan.' }, { status: 500 })
  }
}
