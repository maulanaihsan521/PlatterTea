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

/**
 * PUT /api/admin/users/[id] — update nama / role / status / password.
 * Proteksi: Super Admin tidak dapat menurunkan/menonaktifkan dirinya sendiri
 * dan tidak dapat menghapus SUPER_ADMIN terakhir (dicek di DELETE).
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleSuperAdmin(async (me) => {
    const { id } = await params
    const body = await readJson(req)
    const target = await db.adminUser.findUnique({ where: { id } })
    if (!target) return bad('User tidak ditemukan.', 404)

    const data: Record<string, string> = {}

    const name = str(body.name)
    if (name) data.name = name

    const email = str(body.email).toLowerCase()
    if (email && email !== target.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Email tidak valid.')
      const dup = await db.adminUser.findUnique({ where: { email } })
      if (dup) return bad('Email sudah terdaftar.')
      data.email = email
    }

    const role = str(body.role)
    if (role && ROLES.includes(role)) {
      if (target.id === me.id && role !== 'SUPER_ADMIN') {
        return bad('Tidak dapat menurunkan role akun sendiri.')
      }
      // cek SUPER_ADMIN terakhir
      if (target.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
        const superCount = await db.adminUser.count({ where: { role: 'SUPER_ADMIN', status: 'ACTIVE' } })
        if (superCount <= 1) return bad('Minimal harus ada satu Super Admin aktif.')
      }
      data.role = role
    }

    const status = str(body.status)
    if (status && STATUSES.includes(status)) {
      if (target.id === me.id && status !== 'ACTIVE') {
        return bad('Tidak dapat menonaktifkan akun sendiri.')
      }
      if (target.role === 'SUPER_ADMIN' && status !== 'ACTIVE') {
        const superCount = await db.adminUser.count({ where: { role: 'SUPER_ADMIN', status: 'ACTIVE' } })
        if (superCount <= 1) return bad('Minimal harus ada satu Super Admin aktif.')
      }
      data.status = status
    }

    const password = str(body.password)
    if (password) {
      if (password.length < 8) return bad('Password minimal 8 karakter.')
      data.passwordHash = hashPassword(password)
    }

    if (Object.keys(data).length === 0) return bad('Tidak ada perubahan.')

    const user = await db.adminUser.update({ where: { id }, data, select: PUBLIC_SELECT })
    logAudit({
      actor: me,
      action: 'UPDATE',
      entity: 'User',
      entityId: user.id,
      entityLabel: `${user.name} (${user.email})`,
      detail: { fields: Object.keys(data).filter((k) => k !== 'passwordHash') },
    })
    return NextResponse.json({ success: true, data: user })
  })
}

/** DELETE /api/admin/users/[id] — hapus admin user. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleSuperAdmin(async (me) => {
    const { id } = await params
    if (id === me.id) return bad('Tidak dapat menghapus akun sendiri.')

    const target = await db.adminUser.findUnique({ where: { id } })
    if (!target) return bad('User tidak ditemukan.', 404)

    if (target.role === 'SUPER_ADMIN') {
      const superCount = await db.adminUser.count({ where: { role: 'SUPER_ADMIN', status: 'ACTIVE' } })
      if (superCount <= 1) return bad('Minimal harus ada satu Super Admin aktif.')
    }

    await db.adminUser.delete({ where: { id } })
    logAudit({
      actor: me,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      entityLabel: `${target.name} (${target.email})`,
    })
    return NextResponse.json({ success: true, data: { id } })
  })
}
