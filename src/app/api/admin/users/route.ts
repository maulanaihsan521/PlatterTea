import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { handleSuperAdmin, readJson, str, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

const ROLES = ['SUPER_ADMIN', 'CONTENT_ADMIN', 'EDITOR']
const STATUSES = ['ACTIVE', 'SUSPENDED']

const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}

/** GET /api/admin/users — daftar semua admin user (SUPER_ADMIN only) */
export async function GET() {
  return handleSuperAdmin(async () => {
    const users = await db.adminUser.findMany({
      select: PUBLIC_SELECT,
      orderBy: [{ createdAt: 'asc' }],
    })
    return NextResponse.json({ success: true, data: users })
  })
}

/** POST /api/admin/users — tambah admin user baru (SUPER_ADMIN only) */
export async function POST(req: NextRequest) {
  // (me) wajib — dipakai sebagai actor logAudit di bawah
  return handleSuperAdmin(async (me) => {
    const body = await readJson(req)
    const email = str(body.email).toLowerCase()
    const name = str(body.name)
    const password = str(body.password)
    const role = ROLES.includes(str(body.role)) ? str(body.role) : 'EDITOR'
    const status = STATUSES.includes(str(body.status)) ? str(body.status) : 'ACTIVE'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Email tidak valid.')
    if (!name) return bad('Nama wajib diisi.')
    if (password.length < 8) return bad('Password minimal 8 karakter.')

    const existing = await db.adminUser.findUnique({ where: { email } })
    if (existing) return bad('Email sudah terdaftar.')

    const user = await db.adminUser.create({
      data: { email, name, passwordHash: hashPassword(password), role, status },
      select: PUBLIC_SELECT,
    })
    logAudit({
      actor: me,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      entityLabel: `${user.name} (${user.email})`,
      detail: { role: user.role, status: user.status },
    })
    return NextResponse.json({ success: true, data: user }, { status: 201 })
  })
}
