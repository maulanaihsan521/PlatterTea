'use client'

// ============ Media Picker — pilih gambar dari library /uploads ============

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { adminFetch } from './shared'
import type { MediaFile } from '@/app/api/admin/media/route'
import { Search, ImageOff, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSelect: (url: string) => void
}) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  // Muat daftar media saat picker di-mount (komponen di-mount fresh setiap kali dibuka)
  useEffect(() => {
    let mounted = true
    adminFetch<MediaFile[]>('/api/admin/media').then((res) => {
      if (!mounted) return
      if (res.ok && Array.isArray(res.data)) setFiles(res.data)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const filtered = files.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))

  const choose = () => {
    if (!selected) return
    onSelect(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-forest">Pilih dari Media</DialogTitle>
          <DialogDescription>Gambar yang pernah diunggah ke website. Klik untuk memilih.</DialogDescription>
        </DialogHeader>

        <div className="relative mb-3 shrink-0">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <Input
            placeholder="Cari nama file…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 rounded-xl border-forest/15 pl-10"
            aria-label="Cari file media"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-forest/20 bg-sage-light/30 p-10 text-center">
              <ImageOff className="h-6 w-6 text-forest/30" />
              <p className="text-[13px] font-semibold text-forest/55">
                {files.length === 0 ? 'Belum ada media. Unggah lewat tombol “Pilih File” dulu.' : 'Tidak ada file yang cocok.'}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((f) => (
                <li key={f.name}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.url)}
                    className={cn(
                      'group relative block w-full overflow-hidden rounded-xl border-2 bg-sage-light/40 transition-all',
                      selected === f.url
                        ? 'border-gold shadow-[0_0_0_3px_rgba(232,161,38,0.25)]'
                        : 'border-transparent hover:border-forest/25'
                    )}
                    aria-label={`Pilih ${f.name}`}
                    aria-pressed={selected === f.url}
                  >
                    <img src={f.url} alt={f.name} className="aspect-square w-full object-cover" loading="lazy" />
                    <span
                      className={cn(
                        'absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full transition-all',
                        selected === f.url ? 'bg-gold text-forest opacity-100' : 'bg-forest/60 text-white opacity-0 group-hover:opacity-100'
                      )}
                    >
                      {selected === f.url ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-forest/90 to-transparent px-2 pb-1.5 pt-4 text-left text-[9.5px] font-semibold text-cream">
                      {formatBytes(f.size)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-forest/10 pt-4">
          <p className="text-[11.5px] text-forest/50">{filtered.length} file</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 rounded-full border-forest/20 text-xs font-bold text-forest">
              Batal
            </Button>
            <Button type="button" onClick={choose} disabled={!selected} className="h-9 rounded-full bg-forest text-xs font-bold text-cream hover:bg-forest-dark">
              Gunakan Gambar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
