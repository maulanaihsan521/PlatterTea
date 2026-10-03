import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrLoad, PUBLIC_CACHE_CONTROL } from '@/lib/simple-cache'

export async function GET() {
  try {
    const settings = await getOrLoad('api:settings', () => db.siteSetting.findMany())
    const data: Record<string, string> = {}
    for (const s of settings) data[s.key] = s.value
    // Edge cache 30 dtk: perubahan CMS tampil <=30 dtk
    return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL } })
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat pengaturan.' }, { status: 500 })
  }
}
