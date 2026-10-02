// ============ Supabase Storage helpers (server-side only) ============
// Dipakai API admin: upload, media, stats.
// Catatan penting: kunci API rahasia format baru Supabase WAJIB mengirim
// header `apikey` selain `Authorization: Bearer` — tanpa apikey, Storage
// menolak request dengan "Invalid Compact JWS".

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'

export const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

export interface MediaFile {
  name: string
  url: string
  size: number
  modified: string
}

export function storageEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

/** Headers standar untuk Storage REST API. `extra` menimpa default bila perlu. */
export function storageHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...extra }
}

/** URL objek ter-autentikasi (upload / delete). */
export function storageObjectUrl(key: string): string {
  return `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${key}`
}

/** URL publik objek (tanpa auth — dipakai langsung di <img>). */
export function storagePublicUrl(key: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`
}

interface StorageItem {
  name: string
  updated_at?: string
  metadata?: { size?: number } | null
}

/**
 * List semua objek gambar di bucket secara REKURSIF.
 *
 * Storage API memperlakukan prefix sebagai folder: listing dengan prefix ''
 * hanya mengembalikan "folder" level atas (tanpa metadata) + file di root,
 * sehingga file dengan key ber-folder seperti `2026/10/uuid.webp` tidak tampak.
 * Solusi: BFS per folder — item tanpa metadata dianggap folder dan ditelusuri.
 * `name` yang dikembalikan Storage bersifat relatif terhadap prefix yang
 * diminta, jadi full key = prefix + name.
 */
export async function listStorageMedia(limit = 1000): Promise<MediaFile[]> {
  if (!storageEnabled()) return []
  const out: MediaFile[] = []
  const queue: string[] = ['']
  let visited = 0

  while (queue.length > 0 && visited < 40 && out.length < limit) {
    const prefix = queue.shift()!
    visited++
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${STORAGE_BUCKET}`, {
        method: 'POST',
        headers: storageHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          prefix,
          limit: 200,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        }),
      })
      if (!res.ok) continue
      const items = (await res.json().catch(() => [])) as StorageItem[]
      for (const it of items) {
        const full = `${prefix}${it.name}`
        if (it.metadata) {
          const ext = (it.name.match(/\.[^.]+$/)?.[0] || '').toLowerCase()
          if (!IMAGE_EXT.includes(ext)) continue
          out.push({
            name: full,
            url: storagePublicUrl(full),
            size: it.metadata?.size ?? 0,
            modified: it.updated_at ?? new Date(0).toISOString(),
          })
        } else {
          queue.push(`${full}/`)
        }
      }
    } catch {
      // satu folder gagal → lanjutkan folder lain
    }
  }

  out.sort((a, b) => b.modified.localeCompare(a.modified))
  return out.slice(0, limit)
}

/** Hapus objek Storage. Return true bila sukses atau memang sudah tidak ada. */
export async function deleteStorageObject(key: string): Promise<boolean> {
  if (!storageEnabled()) return false
  try {
    const res = await fetch(storageObjectUrl(key), { method: 'DELETE', headers: storageHeaders() })
    return res.ok || res.status === 404
  } catch {
    return false
  }
}
