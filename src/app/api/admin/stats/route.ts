import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth'
import { IMAGE_EXT, storageEnabled, listStorageMedia } from '@/lib/storage'

async function guard() {
  try {
    return await requireAdmin()
  } catch (e) {
    if (e instanceof AuthError) {
      throw e
    }
    throw e
  }
}

// ====== Statistik media (mode + jumlah + ukuran) — cache memori 60 detik ======
// Agar dashboard tidak memanggil Storage API setiap kali dimuat.
interface MediaStats {
  mode: 'storage' | 'local'
  count: number
  bytes: number
}
let mediaCache: { at: number; data: MediaStats } | null = null

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

async function mediaStats(): Promise<MediaStats> {
  if (mediaCache && Date.now() - mediaCache.at < 60_000) return mediaCache.data

  let data: MediaStats
  if (storageEnabled()) {
    const files = await listStorageMedia(1000)
    data = {
      mode: 'storage',
      count: files.length,
      bytes: files.reduce((s, f) => s + f.size, 0),
    }
  } else {
    let count = 0
    let bytes = 0
    try {
      const files = await readdir(UPLOAD_DIR)
      for (const name of files) {
        if (!IMAGE_EXT.includes(path.extname(name).toLowerCase())) continue
        try {
          const st = await stat(path.join(UPLOAD_DIR, name))
          if (st.isFile()) {
            count++
            bytes += st.size
          }
        } catch {
          // file hilang di antara readdir & stat — abaikan
        }
      }
    } catch {
      // folder uploads belum ada
    }
    data = { mode: 'local', count, bytes }
  }

  mediaCache = { at: Date.now(), data }
  return data
}

export async function GET(req: NextRequest) {
  try {
    await guard()

    // Rentang grafik aktivitas: 7 (default) atau 30 hari
    const daysParam = Number(new URL(req.url).searchParams.get('days') || '7')
    const days = daysParam === 30 ? 30 : 7

    const [totalProducts, activeProducts, draftProducts, promotions, gallery, testimonials, faqs, recentAudits, media] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { status: 'PUBLISHED' } }),
        db.product.count({ where: { status: 'DRAFT' } }),
        db.promotion.count({ where: { status: 'PUBLISHED' } }),
        db.galleryItem.count({ where: { status: 'PUBLISHED' } }),
        db.testimonial.count({ where: { status: 'PUBLISHED' } }),
        db.faq.count({ where: { status: 'PUBLISHED' } }),
        // Aktivitas N hari: ambil createdAt saja (hemat), dibucket per hari WIB di bawah
        db.adminAuditLog.findMany({
          where: { createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } },
          select: { createdAt: true },
        }),
        mediaStats(),
      ])

    // Bucket per kalender hari Asia/Jakarta (WIB, UTC+7) — en-CA = YYYY-MM-DD
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' })
    const byDay = new Map<string, number>()
    for (const a of recentAudits) {
      const key = fmt.format(a.createdAt)
      byDay.set(key, (byDay.get(key) || 0) + 1)
    }
    const DAY_LABEL: Record<string, string> = {
      Sun: 'Min', Mon: 'Sen', Tue: 'Sel', Wed: 'Rab', Thu: 'Kam', Fri: 'Jum', Sat: 'Sab',
    }
    const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Jakarta' })
    const activity = Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
      const key = fmt.format(d)
      return {
        date: key,
        label: DAY_LABEL[dayFmt.format(d)] || dayFmt.format(d),
        total: byDay.get(key) || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        draftProducts,
        promotions,
        gallery,
        testimonials,
        faqs,
        activity: activity,
        media,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
