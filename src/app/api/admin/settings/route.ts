import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { handleAdmin, readJson } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

export async function GET() {
  return handleAdmin(async () => {
    const settings = await db.siteSetting.findMany()
    const data: Record<string, string> = {}
    for (const s of settings) data[s.key] = s.value
    return NextResponse.json({ success: true, data })
  })
}

export async function PUT(req: NextRequest) {
  return handleAdmin(async (me) => {
    const body = await readJson(req)
    const entries = Object.entries(body).filter(([k]) => typeof k === 'string' && k.length > 0 && k.length < 100)
    for (const [key, value] of entries) {
      if (typeof value !== 'string') continue
      if (value.length > 10000) continue
      await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
    }
    if (entries.length > 0) {
      logAudit({
        actor: me,
        action: 'UPDATE',
        entity: 'Settings',
        entityLabel: `${entries.length} pengaturan`,
        detail: { keys: entries.map(([k]) => k) },
      })
    }
    const settings = await db.siteSetting.findMany()
    const data: Record<string, string> = {}
    for (const s of settings) data[s.key] = s.value
    return NextResponse.json({ success: true, data })
  })
}
