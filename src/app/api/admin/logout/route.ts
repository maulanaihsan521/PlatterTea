import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getSessionUser } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  // Catat siapa yang logout sebelum sesi dibaca (getSessionUser butuh cookie)
  const user = await getSessionUser().catch(() => null)
  if (user) {
    logAudit({
      actor: user,
      action: 'LOGOUT',
      entity: 'Auth',
      entityId: user.id,
      entityLabel: user.email,
    })
  }
  await clearSessionCookie()
  return NextResponse.json({ success: true })
}
