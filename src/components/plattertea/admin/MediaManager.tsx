'use client'

// ============ Media Manager — kelola file gambar di /uploads ============

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MediaFile } from '@/app/api/admin/media/route'
import { adminFetch } from './shared'
import { formatBytes } from './MediaPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, Trash2, Copy, Check, ImageOff, Upload, Loader2, Link2 } from 'lucide-react'

interface MediaUsage {
  url: string
  usages: { type: string; label: string }[]
}

export function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState<MediaFile | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [usageMap, setUsageMap] = useState<Map<string, MediaUsage>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const fetchData = useCallback(
    async () =>
      Promise.all([
        adminFetch<MediaFile[]>('/api/admin/media'),
        adminFetch<MediaUsage[]>('/api/admin/media/usage'),
      ]),
    []
  )

  const load = useCallback(async () => {
    const [res, usageRes] = await fetchData()
    if (usageRes.ok && Array.isArray(usageRes.data)) {
      setUsageMap(new Map(usageRes.data.map((u) => [u.url, u])))
    }
    if (res.ok && Array.isArray(res.data)) {
      setFiles(res.data)
      setError('')
    } else {
      setError(res.error || 'Gagal memuat media.')
    }
    setLoading(false)
  }, [fetchData])

  useEffect(() => {
    let mounted = true
    void fetchData().then(([res, usageRes]) => {
      if (!mounted) return
      if (usageRes.ok && Array.isArray(usageRes.data)) {
        setUsageMap(new Map(usageRes.data.map((u) => [u.url, u])))
      }
      if (res.ok && Array.isArray(res.data)) {
        setFiles(res.data)
        setError('')
      } else {
        setError(res.error || 'Gagal memuat media.')
      }
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [fetchData])

  const filtered = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase())),
    [files, query]
  )

  const upload = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await adminFetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: form })
    if (res.ok) {
      toast({ title: 'Gambar terunggah', description: file.name })
      await load()
    } else {
      toast({ title: 'Gagal mengunggah', description: res.error, variant: 'destructive' })
    }
    setUploading(false)
  }

  const copyUrl = async (f: MediaFile) => {
    try {
      await navigator.clipboard.writeText(f.url)
    } catch {
      // fallback clipboard lama
      const ta = document.createElement('textarea')
      ta.value = f.url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(f.name)
    toast({ title: 'URL disalin', description: f.url })
    setTimeout(() => setCopied(null), 2000)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    // File Supabase Storage memakai param key (path di bucket), lokal memakai file
    const isRemote = deleting.url.includes('/storage/v1/object/public/')
    const qs = isRemote
      ? `key=${encodeURIComponent(deleting.name)}`
      : `file=${encodeURIComponent(deleting.name)}`
    const res = await adminFetch<MediaFile[]>(`/api/admin/media?${qs}`, { method: 'DELETE' })
    if (res.ok && Array.isArray(res.data)) {
      toast({ title: 'File media dihapus', description: deleting.name })
      setFiles(res.data)
      // refresh pemetaan pemakaian
      const usageRes = await adminFetch<MediaUsage[]>('/api/admin/media/usage')
      if (usageRes.ok && Array.isArray(usageRes.data)) setUsageMap(new Map(usageRes.data.map((u) => [u.url, u])))
    } else {
      toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
    }
    setDeleting(null)
  }

  const usageOf = (f: MediaFile): MediaUsage | undefined => {
    // Pemakaian file Storage di-map dengan key path-nya, lokal dengan /uploads/{name}
    const m = f.url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    return usageMap.get(m ? `key:${m[1]}` : f.url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">Media</h2>
          <p className="text-[12.5px] text-forest/55">
            Semua gambar yang diunggah lewat CMS ({files.length} file) — otomatis dikonversi ke WebP agar hemat storage. Salin URL-nya atau hapus yang tak terpakai.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Mengunggah…' : 'Unggah Gambar'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
        <Input
          placeholder="Cari nama file…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 rounded-xl border-forest/15 pl-10"
          aria-label="Cari file media"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-[13px] font-semibold text-destructive">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-forest/20 bg-white p-10 text-center">
          <ImageOff className="h-7 w-7 text-forest/30" />
          <p className="text-[13.5px] font-semibold text-forest/60">
            {files.length === 0
              ? 'Belum ada media. Unggah gambar lewat form Produk, Galeri, atau Promo — otomatis masuk ke sini.'
              : 'Tidak ada file yang cocok dengan pencarian.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((f) => (
            <li
              key={f.name}
              className="group overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-[0_2px_10px_rgba(23,61,50,0.05)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-sage-light">
                <img
                  src={f.url}
                  alt={f.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-forest/0 opacity-0 transition-all duration-200 group-hover:bg-forest/45 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => copyUrl(f)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest shadow-md transition-transform hover:scale-110"
                    aria-label={`Salin URL ${f.name}`}
                  >
                    {copied === f.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(f)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-destructive shadow-md transition-transform hover:scale-110"
                    aria-label={`Hapus ${f.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="truncate text-[11.5px] font-bold text-forest" title={f.name}>
                  {/* File Storage ber-folder (YYYY/MM/…) — tampilkan nama file saja */}
                  {f.name.split('/').pop() || f.name}
                </p>
                <p className="text-[10.5px] text-forest/50">
                  {formatBytes(f.size)} · {new Date(f.modified).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
                {(() => {
                  const u = usageOf(f)
                  if (!u || u.usages.length === 0) return null
                  const types = Array.from(new Set(u.usages.map((x) => x.type)))
                  return (
                    <p
                      className="mt-1.5 inline-flex max-w-full items-center gap-1 truncate rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold-dark"
                      title={`Dipakai oleh: ${u.usages.map((x) => `${x.type} — ${x.label}`).join(', ')}`}
                    >
                      <Link2 className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{types.join(', ')}</span>
                    </p>
                  )
                })()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Hidden file input untuk unggah langsung dari Media Manager */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void upload(f)
          e.target.value = ''
        }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus file media?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  {deleting?.name} akan dihapus dari server. Tindakan ini tidak bisa dibatalkan.
                </p>
                {(() => {
                  const u = deleting ? usageOf(deleting) : undefined
                  if (u && u.usages.length > 0) {
                    return (
                      <div className="rounded-xl border border-gold/40 bg-gold/10 p-3">
                        <p className="text-[12.5px] font-extrabold text-gold-dark">
                          ⚠️ File ini masih dipakai di {u.usages.length} konten:
                        </p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5 text-[12px] text-forest/80">
                          {u.usages.slice(0, 8).map((x, i) => (
                            <li key={i}>
                              <span className="font-bold">{x.type}</span> — {x.label}
                            </li>
                          ))}
                          {u.usages.length > 8 && <li>… dan {u.usages.length - 8} lainnya</li>}
                        </ul>
                        <p className="mt-1.5 text-[11.5px] italic text-forest/60">
                          Gambarnya akan berhenti tampil di konten tersebut. Pertimbangkan ganti gambarnya dulu.
                        </p>
                      </div>
                    )
                  }
                  return (
                    <p className="text-[12px] font-semibold text-forest/70">✓ File ini tidak dipakai di konten mana pun — aman dihapus.</p>
                  )
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-destructive font-bold text-white hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
