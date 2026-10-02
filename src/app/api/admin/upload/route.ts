import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { handleAdmin, bad } from '@/lib/admin-helpers'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_DIM = 1600 // sisi terpanjang gambar setelah resize (hemat storage free plan)
const WEBP_QUALITY = 82

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media'

function storageEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY)
}

function nowPrefix(): string {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Unggah buffer ke Supabase Storage (REST) dan kembalikan URL publiknya. */
async function uploadToSupabase(buffer: Buffer, key: string, contentType: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: new Uint8Array(buffer),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Supabase Storage gagal (${res.status}). ${detail.slice(0, 180)}`)
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${key}`
}

export async function POST(req: NextRequest) {
  return handleAdmin(async () => {
    const form = await req.formData().catch(() => null)
    const file = form?.get('file')
    if (!form || !(file instanceof File)) {
      return bad('Tidak ada file yang diunggah.')
    }
    if (!ALLOWED.includes(file.type)) {
      return bad('Format gambar tidak sesuai. Gunakan JPG, PNG, WEBP, atau GIF.')
    }
    if (file.size > MAX_SIZE) {
      return bad('Ukuran gambar terlalu besar. Maksimal 5 MB.')
    }

    const raw = Buffer.from(await file.arrayBuffer())
    const isGif = file.type === 'image/gif' // GIF animasi dipertahankan apa adanya

    // Validasi & optimasi: semua raster dikonversi ke WebP (ukuran jauh lebih
    // kecil — penting untuk free plan Vercel + Supabase). Jika sharp gagal
    // mem-parse, file bukan gambar sah → ditolak (proteksi ekstra di luar
    // Content-Type yang mudah dipalsukan).
    let outBuffer = raw
    let outName: string
    let outType: string
    let width = 0
    let height = 0

    if (isGif) {
      outName = `${randomUUID()}.gif`
      outType = 'image/gif'
    } else {
      try {
        const pipeline = sharp(raw, { failOn: 'error' }).rotate() // auto-orient EXIF
        const meta = await pipeline.metadata()
        if (!meta.format) throw new Error('bukan gambar sah')
        const converted = await pipeline
          .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer()
        const outMeta = await sharp(converted).metadata()
        width = outMeta.width ?? 0
        height = outMeta.height ?? 0
        outBuffer = converted
        outName = `${randomUUID()}.webp`
        outType = 'image/webp'
      } catch {
        return bad('File tidak dapat dibaca sebagai gambar yang sah.')
      }
    }

    const key = `${nowPrefix()}/${outName}`

    let url: string
    if (storageEnabled()) {
      // Mode produksi (Vercel): simpan ke Supabase Storage — filesystem read-only.
      url = await uploadToSupabase(outBuffer, key, outType).catch((err: Error) => err)
      if (url instanceof Error) return bad(url.message, 502)
    } else {
      // Mode dev: simpan ke public/uploads lokal (struktur flat agar kompatibel
      // dengan listing & deteksi pemakaian yang ada).
      const dir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(dir, { recursive: true })
      await writeFile(path.join(dir, outName), outBuffer)
      url = `/uploads/${outName}`
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          url,
          name: outName,
          key,
          bytes: outBuffer.length,
          originalBytes: raw.length,
          format: isGif ? 'gif' : 'webp',
          width,
          height,
        },
      },
      { status: 201 },
    )
  })
}
