'use client'

import { formatRupiah, hargaSebelumDiskon } from '@/lib/plattertea'
import { cn } from '@/lib/utils'

/**
 * Harga normal dicoret — pasangan visual harga promo di seluruh tampilan publik.
 * <s> dipakai agar semantik "sudah tidak berlaku" benar; sr-only memberi
 * konteks ke pembaca layar ("Harga normal: …").
 */
export function CoretPrice({ price, className }: { price: number; className?: string }) {
  return (
    <s
      className={cn('font-semibold text-forest/35 line-through decoration-[1.5px]', className)}
      title={`Harga normal ${formatRupiah(hargaSebelumDiskon(price))}`}
    >
      <span className="sr-only">Harga normal: </span>
      {formatRupiah(hargaSebelumDiskon(price))}
    </s>
  )
}

/** Badge kecil "Hemat Rp2.000" untuk penegasan promo (halaman detail produk). */
export function HematBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gold-dark',
        className
      )}
    >
      Hemat Rp2.000
    </span>
  )
}
