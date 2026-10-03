import { db } from '@/lib/db'
import { getOrLoad } from '@/lib/simple-cache'

/**
 * FAQ published untuk server component (FAQPage JSON-LD di /faq) —
 * cache key terpisah dari /api/faqs tapi pola identik agar perubahan CMS
 * tampil cepat & beban DB minim.
 */
export async function getPublishedFaqs() {
  try {
    return await getOrLoad('ssr:faqs', () =>
      db.faq.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
      })
    )
  } catch {
    // DB gagal → halaman FAQ tetap render (tanpa JSON-LD), jangan 500
    return []
  }
}
