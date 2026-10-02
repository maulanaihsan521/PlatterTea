'use client'

// ============ Gallery Lightbox — pratinjau foto galeri fullscreen ============

import { useEffect, useCallback } from 'react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import type { GalleryItem } from '@/lib/plattertea'
import { cn } from '@/lib/utils'

const CAT_LABEL: Record<string, string> = {
  produk: 'Produk',
  booth: 'Booth',
  event: 'Event',
  bts: 'Behind the Scene',
  brand: 'Brand',
}

interface GalleryLightboxProps {
  items: GalleryItem[]
  index: number | null
  onIndexChange: (index: number | null) => void
}

export function GalleryLightbox({ items, index, onIndexChange }: GalleryLightboxProps) {
  const open = index !== null && index >= 0 && index < items.length
  const item = open ? items[index] : null

  const prev = useCallback(() => {
    if (index === null || items.length === 0) return
    onIndexChange((index - 1 + items.length) % items.length)
  }, [index, items.length, onIndexChange])

  const next = useCallback(() => {
    if (index === null || items.length === 0) return
    onIndexChange((index + 1) % items.length)
  }, [index, items.length, onIndexChange])

  // Navigasi keyboard saat lightbox terbuka
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, prev, next])

  if (!item) {
    // Dialog tetap dirender agar transisi tutup halus
    return (
      <Dialog open={false} onOpenChange={() => onIndexChange(null)}>
        <DialogContent className="hidden" aria-label="Galeri" />
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onIndexChange(null)}>
      <DialogContent
        className="max-w-4xl gap-0 overflow-hidden rounded-3xl border-forest/10 bg-cream p-0 sm:rounded-3xl"
        aria-label={`Foto galeri: ${item.title}`}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{item.title}</DialogTitle>

        {/* Gambar */}
        <div className="relative bg-forest/95">
          {/* Tombol tutup kustom — X default Dialog tak terlihat di atas gambar gelap */}
          <DialogClose
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-forest shadow-lg transition-all hover:scale-105 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-label="Tutup galeri"
          >
            <X className="h-5 w-5" />
          </DialogClose>
          <img
            src={item.image}
            alt={item.title}
            className="mx-auto max-h-[62vh] w-full object-contain sm:max-h-[68vh]"
            draggable={false}
          />

          {/* Counter */}
          <span className="absolute left-4 top-4 rounded-full bg-forest/70 px-3 py-1 text-[11px] font-bold tabular-nums text-cream backdrop-blur">
            {(index ?? 0) + 1} / {items.length}
          </span>

          {/* Prev / Next */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-forest shadow-lg transition-all hover:scale-105 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-forest shadow-lg transition-all hover:scale-105 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption */}
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15.5px] font-extrabold text-forest">{item.title}</h3>
              {CAT_LABEL[item.category] && (
                <Badge className="bg-sage-light text-[10px] font-bold uppercase tracking-wide text-forest hover:bg-sage-light">
                  {CAT_LABEL[item.category]}
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="mt-1.5 text-[13px] leading-relaxed text-forest/70">{item.description}</p>
            )}
            <p className="mt-2 hidden items-center gap-1 text-[11px] font-semibold text-forest/40 sm:flex">
              Gunakan tombol ← → pada keyboard untuk berpindah foto
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Hint ikon zoom yang muncul di kartu galeri saat hover */
export function GalleryZoomHint({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-forest/70 text-cream opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100',
        className
      )}
    >
      <Expand className="h-3.5 w-3.5" />
    </span>
  )
}
