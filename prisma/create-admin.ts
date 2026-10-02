// One-off: buat/upsert akun admin PlatterTea
// Jalankan: ADMIN_EMAIL=... ADMIN_PASSWORD=... bunx tsx prisma/create-admin.ts
// KEAMANAN: kredensial WAJIB lewat environment variable — tidak ada fallback hardcoded.
import { PrismaClient } from '../src/generated/prisma'
import { scryptSync, randomBytes } from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.error('DITOLAK: set ADMIN_EMAIL dan ADMIN_PASSWORD di environment (jangan hardcode).')
    process.exit(1)
  }
  if (password.length < 12) {
    console.error('DITOLAK: ADMIN_PASSWORD minimal 12 karakter.')
    process.exit(1)
  }
  await prisma.adminUser.upsert({
    where: { email },
    update: { status: 'ACTIVE' },
    create: {
      email,
      name: 'Admin PlatterTea',
      passwordHash: hashPassword(password),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log(`Admin ready → ${email} (password tidak ditampilkan)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
