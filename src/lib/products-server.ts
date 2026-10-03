import { db } from '@/lib/db'

/**
 * Query produk + related untuk halaman /produk/{slug} — dipakai BERSAMA oleh:
 *  - API route /api/products/[slug] (fetch klien)
 *  - Server component page.tsx (SSR metadata + initial data produk)
 * Satu sumber logika agar data SSR & API selalu identik.
 */
export async function getProductWithRelated(slug: string) {
  const product = await db.product.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: { category: true },
  })

  if (!product) return null

  // related products (same category, exclude current)
  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, status: 'PUBLISHED', id: { not: product.id } },
    take: 3,
    orderBy: { sortOrder: 'asc' },
  })

  return { product, related }
}
