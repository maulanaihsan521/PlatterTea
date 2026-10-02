import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink } from 'fs/promises'
import path from 'path'
import { handleAdmin, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'

function storageEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

export interface MediaFile {
  name: string
  url: string
  size: number
  modified: string
}

async function listLocal(): Promise<MediaFile[]> {
  try {
    const files = await readdir(UPLOAD_DIR)
    const out: MediaFile[] = []
    for (const name of files) {
      if (!IMAGE_EXT.includes(path.extname(name).toLowerCase())) continue
      try {
        const st = await stat(path.join(UPLOAD_DIR, name))
        if (!st.isFile()) continue
        out.push({
          name,
          url: `/uploads/${name}`,
          size: st.size,
          modified: st.mtime.toISOString(),
        })
      } catch {
        // file terhapus di antara readdir & stat — abaikan
      }
    }
    out.sort((a, b) => b.modified.localeCompare(a.modified))
    return out
  } catch {
    // folder uploads belum ada
    return []
  }
}

interface StorageItem {
  name: string
  updated_at?: string
  metadata?: { size?: number } | null
}

async function listStorage(): Promise<MediaFile[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${STORAGE_BUCKET}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prefix: '',
      limit: 200,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    }),
  })
  if (!res.ok) return []
  const items = (await res.json().catch(() => [])) as StorageItem[]
  return items
    .filter((it) => it.metadata && IMAGE_EXT.includes(path.extname(it.name).toLowerCase()))
    .map((it) => ({
      name: it.name,
      url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${it.name}`,
      size: it.metadata?.size ?? 0,
      modified: it.updated_at ?? new Date(0).toISOString(),
    }))
}

/** GET /api/admin/media — daftar file gambar (Supabase Storage bila dikonfigurasi, lokal selainnya). */
export async function GET() {
  return handleAdmin(async () => {
    const files = storageEnabled() ? await listStorage() : await listLocal()
    return NextResponse.json({ success: true, data: files })
  })
}

/** DELETE /api/admin/media?file=nama.png (lokal) atau ?key=2026/10/nama.webp (Supabase Storage). */
export async function DELETE(req: NextRequest) {
  return handleAdmin(async (me) => {
    const params = new URL(req.url).searchParams
    const key = params.get('key') || ''

    if (storageEnabled()) {
      // Mode Storage: key adalah path relatif di bucket — validasi karakter aman.
      if (!key) return bad('Key file tidak boleh kosong.')
      if (!/^[\w\-./]+$/.test(key) || key.includes('..')) {
        return bad('Key file tidak valid.')
      }
      if (!IMAGE_EXT.includes(path.extname(key).toLowerCase())) {
        return bad('Hanya file gambar yang dapat dihapus.')
      }
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
      })
      if (!res.ok && res.status !== 404) {
        return bad('File gagal dihapus dari Storage.', 502)
      }
      logAudit({
        actor: me,
        action: 'MEDIA_DELETE',
        entity: 'Media',
        entityLabel: key,
        detail: { url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}` },
      })
      const files = await listStorage()
      return NextResponse.json({ success: true, data: files })
    }

    // Mode lokal
    const name = key || params.get('file') || ''
    if (!name) return bad('Nama file tidak boleh kosong.')
    // Cegah path traversal: hanya nama file sederhana dengan ekstensi gambar
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
      return bad('Nama file tidak valid.')
    }
    if (!IMAGE_EXT.includes(path.extname(name).toLowerCase())) {
      return bad('Hanya file gambar yang dapat dihapus.')
    }

    const filePath = path.join(UPLOAD_DIR, name)
    try {
      await unlink(filePath)
    } catch {
      return bad('File tidak ditemukan atau gagal dihapus.', 404)
    }

    logAudit({
      actor: me,
      action: 'MEDIA_DELETE',
      entity: 'Media',
      entityLabel: name,
      detail: { url: `/uploads/${name}` },
    })

    const files = await listLocal()
    return NextResponse.json({ success: true, data: files })
  })
}
