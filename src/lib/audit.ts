// PlatterTea — Audit log aktivitas admin
// Semua mutasi konten via CMS dicatat di sini (best-effort: kegagalan audit
// TIDAK boleh membatalkan operasi utama).
import { db } from '@/lib/db'

export interface AuditActor {
  id: string
  name: string
  email: string
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'IMPORT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET'
  | 'PASSWORD_RESET_FAILED'
  | 'PASSWORD_CHANGE'
  | 'MEDIA_DELETE'

export function logAudit(input: {
  actor?: AuditActor | null
  action: AuditAction
  entity: string
  entityId?: string | null
  entityLabel?: string | null
  detail?: Record<string, unknown> | null
}): void {
  // fire-and-forget — jangan pernah throw / await di critical path
  try {
    void db.adminAuditLog
      .create({
        data: {
          userId: input.actor?.id ?? null,
          userName: input.actor?.name ?? null,
          userEmail: input.actor?.email ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          entityLabel: input.entityLabel ?? null,
          detail: input.detail ? JSON.stringify(input.detail) : null,
        },
      })
      .catch((err) => console.error('audit log failed:', err))
  } catch (err) {
    // model belum ter-generate / db error — audit tidak boleh membatalkan operasi utama
    console.error('audit log failed (sync):', err)
  }
}

/** Ringkas field yang berubah — dipakai untuk detail UPDATE. */
export function diffFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: string[]
): Record<string, { from: unknown; to: unknown }> | null {
  const changes: Record<string, { from: unknown; to: unknown }> = {}
  for (const f of fields) {
    if (f in after && String(before[f]) !== String(after[f])) {
      changes[f] = { from: before[f], to: after[f] }
    }
  }
  return Object.keys(changes).length > 0 ? changes : null
}

// ===== Retensi otomatis log audit =====
// Log > 90 hari dihapus. Berjalan maksimal 1x per 24 jam (throttle in-memory)
// dipicu saat halaman Aktivitas dibuka — tanpa cron eksternal.

const RETENTION_DAYS = 90
const RETENTION_INTERVAL_MS = 24 * 60 * 60 * 1000
let lastRetentionRun = 0

export function maybeCleanupOldAuditLogs(): void {
  const now = Date.now()
  if (now - lastRetentionRun < RETENTION_INTERVAL_MS) return
  lastRetentionRun = now
  try {
    void db.adminAuditLog
      .deleteMany({
        where: { createdAt: { lt: new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000) } },
      })
      .then((res) => {
        if (res.count > 0) console.log(`audit retention: ${res.count} log > ${RETENTION_DAYS} hari dihapus`)
      })
      .catch((err) => console.error('audit retention failed:', err))
  } catch (err) {
    console.error('audit retention failed (sync):', err)
  }
}
