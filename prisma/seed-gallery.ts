// Seed gallery items untuk PlatterTea
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding gallery + admin...')

  const galleries = [
    { title: 'Bestie Combo', description: 'Paket berbagi 2 Platter + 2 Tea', image: '/products/bestie-combo.png', category: 'produk', sortOrder: 1 },
    { title: 'Booth PlatterTea', description: 'Booth kami saat Market Days kampus', image: '/products/booth.png', category: 'booth', sortOrder: 2 },
    { title: 'PlatterTea Combo', description: '1 Platter + 1 Tea favorit', image: '/products/plattertea-combo.png', category: 'produk', sortOrder: 3 },
    { title: 'Teh Segar Setiap Hari', description: 'Diseduh fresh setiap hari', image: '/products/original-tea.png', category: 'produk', sortOrder: 4 },
    { title: 'Mix Platter Favorit', description: 'Kentang, sosis, bola ayam, mayo', image: '/products/platter-only.png', category: 'produk', sortOrder: 5 },
    { title: 'Yakult Tea', description: 'Segar dengan perpaduan yakult', image: '/products/yakult-tea.png', category: 'produk', sortOrder: 6 },
    { title: 'Teh Tarik Creamy', description: 'Foam lembut khas tarik', image: '/products/teh-tarik.png', category: 'produk', sortOrder: 7 },
    { title: 'Siap Antar Acara', description: 'Open PO untuk kepanitiaan', image: '/products/hero.png', category: 'event', sortOrder: 8 },
  ]
  for (const g of galleries) {
    const existing = await prisma.galleryItem.findFirst({ where: { title: g.title } })
    if (!existing) await prisma.galleryItem.create({ data: g })
  }

  // CATATAN KEAMANAN: pembuatan akun admin TIDAK dilakukan di sini.
  // Gunakan prisma/create-admin.ts dengan env ADMIN_EMAIL & ADMIN_PASSWORD.

  console.log('Seed gallery completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
