import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit'
import { checkPublicLimit, requestIp } from '@/lib/rate-limit'
import { getOrLoad } from '@/lib/simple-cache'

export async function GET() {
  try {
    const testimonials = await getOrLoad('api:testimonials', () =>
      db.testimonial.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
      })
    )
    // no-store: testimoni yang disetujui admin langsung terlihat oleh pengunjung
    return NextResponse.json({ success: true, data: testimonials }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/testimonials error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat testimoni.' }, { status: 500 })
  }
}

// ===== POST publik — kirim testimoni (masuk antrian moderasi) =====

const LIMIT_MAX = 3
const LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 menit

/** Buang karakter kontrol & pemisah garis berlebihan, potong ke panjang aman. */
function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen)
}

export async function POST(req: Request) {
  try {
    const ip = requestIp(req)
    const limit = checkPublicLimit(`testi:${ip}`, LIMIT_MAX, LIMIT_WINDOW_MS)
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(limit.retryAfterSec / 60)} menit.` },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
      )
    }

    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return NextResponse.json({ success: false, error: 'Format permintaan tidak valid.' }, { status: 400 })
    }

    // Honeypot anti-spam: field tersembunyi yang wajib kosong bagi manusia.
    // Bot yang mengisinya dianggap spam — balas sukses palsu tanpa menyimpan.
    if (sanitize(body.website, 200) !== '') {
      return NextResponse.json({ success: true, message: 'Terima kasih! Testimoni kamu akan kami tinjau.' })
    }

    const name = sanitize(body.name, 40)
    const role = sanitize(body.role, 40)
    const content = sanitize(body.content, 300)
    const ratingRaw = Number(body.rating)
    const rating = Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : 0

    const errors: string[] = []
    if (name.length < 2) errors.push('Nama wajib diisi (2–40 karakter).')
    if (content.length < 10) errors.push('Ceritakan pengalamanmu minimal 10 karakter.')
    if (!rating) errors.push('Pilih rating 1–5 bintang.')
    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors.join(' ') }, { status: 400 })
    }

    const created = await db.testimonial.create({
      data: {
        name,
        role: role || null,
        content,
        rating,
        status: 'DRAFT', // menunggu moderasi admin sebelum tampil publik
        sortOrder: 0,
      },
      select: { id: true },
    })

    logAudit({
      action: 'TESTIMONI_SUBMIT',
      entity: 'testimonial',
      entityId: created.id,
      entityLabel: name,
      detail: { rating, ip },
    })

    return NextResponse.json({ success: true, message: 'Terima kasih! Testimoni kamu akan kami tinjau.' })
  } catch (error) {
    console.error('POST /api/testimonials error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengirim testimoni. Coba lagi.' }, { status: 500 })
  }
}
