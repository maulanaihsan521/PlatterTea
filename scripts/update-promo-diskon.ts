/**
 * Sinkronkan nominal diskon pada konten promo CMS dgn PROMO_DISKON_RP (2.500).
 * Idempotent: hanya mengganti penyebutan "Rp2.000" → "Rp2.500" pada record
 * promo MARKET DAYS (judul/subjudul/deskripsi), aman dijalankan berulang.
 * Jalankan: bun scripts/update-promo-diskon.ts
 */
import './db-env'
import { PrismaClient } from '../src/generated/prisma'

const db = new PrismaClient()

async function main() {
  const promos = await db.promotion.findMany({
    where: { title: { contains: 'MARKET DAYS' } },
  })
  if (promos.length === 0) {
    console.log('Tidak ada promo MARKET DAYS — tidak ada yang diubah.')
    return
  }

  for (const p of promos) {
    const patch: { subtitle?: string; description?: string } = {}
    if (p.subtitle?.includes('Rp2.000')) patch.subtitle = p.subtitle.replaceAll('Rp2.000', 'Rp2.500')
    if (p.description?.includes('Rp2.000')) patch.description = p.description.replaceAll('Rp2.000', 'Rp2.500')

    if (Object.keys(patch).length === 0) {
      console.log(`• "${p.title}" — sudah sinkron (tidak ada "Rp2.000")`)
      continue
    }
    await db.promotion.update({ where: { id: p.id }, data: patch })
    console.log(`✓ "${p.title}" diperbarui: ${Object.keys(patch).join(', ')}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
