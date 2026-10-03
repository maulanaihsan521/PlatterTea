'use client'

import { formatRupiah, hargaSebelumDiskon, PROMO_DISKON_RP } from '@/lib/plattertea'
import { cn } from '@/lib/utils'
import { BadgePercent } from 'lucide-react'

/**
 * Harga normal dicoret — pasangan visual harga promo di seluruh tampilan publik.
 * <s> dipakai agar semantik "sudah tidak berlaku" benar; sr-only memberi
 * konteks ke pembaca layar ("Harga normal: …").
 */
export function CoretPrice({ price, className }: { price: number; className?: string }) {
  return (
    <s
      className={cn('font-semibold text-forest/40 line-through decoration-[1.5px]', className)}
      title={`Harga normal ${formatRupiah(hargaSebelumDiskon(price))}`}
    >
      <span className="sr-only">Harga normal: </span>
      {formatRupiah(hargaSebelumDiskon(price))}
    </s>
  )
}

/**
 * Badge premium "Hemat Rp2.500" — gradasi emas brand + ikon persen,
 * dipakai di halaman detail produk untuk menegaskan harga promo.
 */
export function HematBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark px-3 py-1.5',
        'text-[10.5px] font-extrabold uppercase tracking-wider text-white',
        'shadow-[0_3px_12px_rgba(232,161,38,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]',
        className
      )}
    >
      <BadgePercent className="h-3 w-3" strokeWidth={2.6} aria-hidden />
      Hemat {formatRupiah(PROMO_DISKON_RP)}
    </span>
  )
}

/**
 * Tag promo kecil untuk sudut gambar kartu produk (kanan-atas) —
 * kontras kuat di atas foto, format e-commerce yang dikenal pelanggan.
 */
export function PromoTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark px-2 py-1',
        'text-[9px] font-extrabold uppercase tracking-wide text-white',
        'shadow-[0_2px_10px_rgba(232,161,38,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]',
        className
      )}
    >
      <BadgePercent className="h-2.5 w-2.5" strokeWidth={2.6} aria-hidden />
      Hemat {formatRupiah(PROMO_DISKON_RP)}
    </span>
  )
}
