import { PrismaClient } from '@/generated/prisma'
import { invalidatePublicCache } from '@/lib/simple-cache'

// Di dev sengaja TANPA cache global: setelah `prisma db push / generate` (model baru),
// Turbopack meng-invalidate src/generated/prisma → modul ini ikut dievaluasi ulang →
// instance PrismaClient baru otomatis punya model terbaru. Cache global justru membuat
// instance lama (tanpa model baru) terus dipakai → bug "db.<model> is undefined".
// Di production tetap di-cache agar hanya ada satu instance.
const globalForPrisma = globalThis as unknown as {
  prismaProd: ReturnType<typeof createClient> | undefined
}

// ====== Auto-invalidation cache publik ======
// Setiap operasi tulis pada model konten (dari admin CMS maupun form publik)
// otomatis mengosongkan cache API publik — perubahan langsung terlihat pengunjung,
// sambil tetap menghemat round-trip Supabase untuk traffic baca.
// Catatan: Prisma 6 tidak lagi menyediakan client.$use(); gunakan $extends query API.
const CACHED_MODELS = new Set([
  'SiteSetting',
  'Product',
  'Category',
  'Promotion',
  'Testimonial',
  'Faq',
  'GalleryItem',
])
const WRITE_ACTIONS = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert',
])

function createClient() {
  const base = new PrismaClient({ log: ['error'] })
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args)
          if (model && WRITE_ACTIONS.has(operation) && CACHED_MODELS.has(model)) {
            invalidatePublicCache()
          }
          return result
        },
      },
    },
  })
}

export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prismaProd ??= createClient())
    : createClient()
