import { PrismaClient } from '@/generated/prisma'

// Di dev sengaja TANPA cache global: setelah `prisma db push / generate` (model baru),
// Turbopack meng-invalidate src/generated/prisma → modul ini ikut dievaluasi ulang →
// instance PrismaClient baru otomatis punya model terbaru. Cache global justru membuat
// instance lama (tanpa model baru) terus dipakai → bug "db.<model> is undefined".
// Di production tetap di-cache agar hanya ada satu instance.
const globalForPrisma = globalThis as unknown as {
  prismaProd: PrismaClient | undefined
}

export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prismaProd ??= new PrismaClient({ log: ['error'] }))
    : new PrismaClient({ log: ['error'] })
