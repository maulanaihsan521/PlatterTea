import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin } from '@/lib/admin-helpers'

export interface MediaUsageItem {
  url: string
  usages: { type: string; label: string }[]
}

/**
 * GET /api/admin/media/usage — pemetaan file media (lokal /uploads atau Supabase Storage)
 * → konten yang memakainya. Dipakai MediaManager untuk memperingatkan sebelum
 * menghapus file yang masih dipakai.
 */
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'
const STORAGE_PUBLIC = `/storage/v1/object/public/${STORAGE_BUCKET}/`

export async function GET() {
  return handleAdmin(async () => {
    const [products, categories, promotions, gallery, testimonials, settings] = await Promise.all([
      db.product.findMany({ select: { name: true, mainImage: true, galleryImages: true } }),
      db.category.findMany({ select: { name: true, image: true } }),
      db.promotion.findMany({ select: { title: true, image: true } }),
      db.galleryItem.findMany({ select: { title: true, image: true } }),
      db.testimonial.findMany({ select: { name: true, photo: true } }),
      db.siteSetting.findMany({ select: { key: true, value: true } }),
    ])

    const map = new Map<string, { type: string; label: string }[]>()

    const add = (url: string | null | undefined, type: string, label: string) => {
      if (!url) return
      // file lokal /uploads/... atau Supabase Storage .../storage/v1/object/public/{bucket}/...
      const local = url.match(/\/uploads\/([^/?#]+)/)
      const remote = url.includes(STORAGE_PUBLIC)
        ? url.split(STORAGE_PUBLIC)[1]?.match(/^([^/?#]+)/)
        : null
      if (!local && !remote) return
      const key = remote ? `key:${remote[1]}` : `/uploads/${local![1]}`
      const list = map.get(key) ?? []
      if (!list.some((u) => u.type === type && u.label === label)) list.push({ type, label })
      map.set(key, list)
    }

    for (const p of products) {
      add(p.mainImage, 'Produk', p.name)
      for (const g of (p.galleryImages || '').split('\n')) add(g.trim(), `Galeri produk`, p.name)
    }
    for (const c of categories) add(c.image, 'Kategori', c.name)
    for (const p of promotions) add(p.image, 'Promo', p.title)
    for (const g of gallery) add(g.image, 'Galeri', g.title)
    for (const t of testimonials) add(t.photo, 'Testimoni', t.name)
    for (const s of settings) {
      if (s.value.includes('/uploads/') || s.value.includes(STORAGE_PUBLIC)) add(s.value, 'Pengaturan', s.key)
    }

    const data: MediaUsageItem[] = Array.from(map.entries()).map(([url, usages]) => ({ url, usages }))
    return NextResponse.json({ success: true, data })
  })
}
