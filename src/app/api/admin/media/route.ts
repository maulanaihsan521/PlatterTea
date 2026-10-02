import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink } from 'fs/promises'
import path from 'path'
import { handleAdmin, bad } from '@/lib/admin-helpers'
import { logAudit } from '@/lib/audit'
import {
  IMAGE_EXT,
  storageEnabled,
  listStorageMedia,
  deleteStorageObject,
  storagePublicUrl,
  type MediaFile,
} from '@/lib/storage'

export type { MediaFile } from '@/lib/storage'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

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

/** GET /api/admin/media — daftar file gambar (Supabase Storage bila dikonfigurasi, lokal selainnya). */
export async function GET() {
  return handleAdmin(async () => {
    const files = storageEnabled() ? await listStorageMedia() : await listLocal()
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
      const ok = await deleteStorageObject(key)
      if (!ok) {
        return bad('File gagal dihapus dari Storage.', 502)
      }
      logAudit({
        actor: me,
        action: 'MEDIA_DELETE',
        entity: 'Media',
        entityLabel: key,
        detail: { url: storagePublicUrl(key) },
      })
      const files = await listStorageMedia()
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
