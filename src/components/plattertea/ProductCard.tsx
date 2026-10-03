'use client'

import { formatRupiah, type Product } from '@/lib/plattertea'
import { useCartStore } from '@/hooks/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ArrowRight, Plus, Check, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/** WhatsApp brand glyph (simple-icons path) — dipakai tombol checkout WhatsApp di keranjang */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/** Hook kecil: tambah produk ke keranjang + umpan balik toast & centang sesaat */
function useQuickAdd(product: Product) {
  const add = useCartStore((s) => s.add)
  const openCart = useCartStore((s) => s.openCart)
  const { toast } = useToast()
  const [added, setAdded] = useState(false)

  const quickAdd = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.mainImage,
      },
      1
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
    toast({
      title: 'Masuk keranjang',
      description: `${product.name} ditambahkan — buka keranjang untuk pesan via WhatsApp.`,
    })
  }

  return { quickAdd, added, openCart }
}

interface ProductCardProps {
  product: Product
  onOpen: (slug: string) => void
  className?: string
}

/**
 * Product card sesuai referensi user (card_menu_ref):
 * - gambar edge-to-edge di atas kartu (tanpa bingkai putih), sudut atas mengikuti kartu
 * - badge FAVORIT emas pill (produk featured)
 * - nama besar + tag kategori pill di kanan
 * - deskripsi 2 baris
 * - harga besar + tombol tambah keranjang bulat + tombol "Lihat Detail" pill hijau tua dengan panah
 */
export function ProductCard({ product, onOpen, className }: ProductCardProps) {
  const { quickAdd, added } = useQuickAdd(product)

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(23,61,50,0.14)]',
        className
      )}
    >
      {/* Image — edge-to-edge mengikuti sudut atas kartu, sesuai referensi */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {product.featured && (
          <span className="absolute left-3.5 top-3.5 z-10 rounded-full bg-gold px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(232,161,38,0.5)]">
            Favorit
          </span>
        )}
        <img
          src={product.mainImage || '/products/tea-only.webp'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[16.5px] font-bold leading-tight text-forest">{product.name}</h3>
          {product.category && (
            <span className="shrink-0 rounded-full bg-sage-light px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-forest/55">
              {product.category.name}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-forest/55">
          {product.shortDesc}
        </p>

        {/* Harga + aksi — harga besar, tombol tambah bulat, pill hijau tua + panah (wrap pada kartu sempit) */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 gap-y-2 pt-4">
          <p className="shrink-0 text-[16.5px] font-extrabold tracking-tight text-forest">
            {formatRupiah(product.price)}
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                quickAdd()
              }}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
                added
                  ? 'bg-gold text-forest shadow-[0_2px_10px_rgba(232,161,38,0.45)]'
                  : 'bg-forest text-cream hover:-translate-y-0.5 hover:bg-gold hover:text-forest'
              )}
              aria-label={`Tambah ${product.name} ke keranjang`}
              title="Tambah ke keranjang"
            >
              {added ? <Check className="h-4.5 w-4.5" strokeWidth={2.5} /> : (
                /* Satu ikon "tambah keranjang": ShoppingBag (identik ikon keranjang situs) + plus dlm badge krem di sudut — jelas & tak bertabrakan dgn garis tas */
                <span className="relative inline-flex" aria-hidden>
                  <ShoppingBag className="h-4.5 w-4.5" strokeWidth={2} />
                  <Plus strokeWidth={4} className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-cream p-[1.5px] text-forest shadow-[0_1px_3px_rgba(23,61,50,0.35)]" />
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpen(product.slug)}
              className="inline-flex min-h-[36px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-forest px-3 py-2 text-[11.5px] font-bold text-cream transition-colors duration-200 hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={`Lihat detail ${product.name}`}
            >
              Lihat Detail
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Compact horizontal card used in mobile menu list — bahasa visual sama dgn kartu utama */
export function ProductCardRow({ product, onOpen }: ProductCardProps) {
  const { quickAdd, added } = useQuickAdd(product)

  return (
    <article className="group flex items-stretch gap-3.5 overflow-hidden rounded-[18px] bg-white p-2.5 shadow-[0_2px_12px_rgba(23,61,50,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(23,61,50,0.12)]">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] bg-cream sm:h-28 sm:w-28">
        {product.featured && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gold px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(232,161,38,0.45)]">
            Favorit
          </span>
        )}
        <img
          src={product.mainImage || '/products/tea-only.webp'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1 pr-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold text-forest">{product.name}</h3>
          {product.category && (
            <span className="shrink-0 rounded-full bg-sage-light px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-forest/55">
              {product.category.name}
            </span>
          )}
        </div>
        <p className="text-[13.5px] font-extrabold tracking-tight text-forest">{formatRupiah(product.price)}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <button
            type="button"
            onClick={quickAdd}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200',
              added
                ? 'bg-gold text-forest shadow-[0_2px_10px_rgba(232,161,38,0.45)]'
                : 'bg-forest text-cream hover:bg-gold hover:text-forest'
            )}
            aria-label={`Tambah ${product.name} ke keranjang`}
            title="Tambah ke keranjang"
          >
            {added ? <Check className="h-4 w-4" strokeWidth={2.5} /> : (
              /* Satu ikon "tambah keranjang": ShoppingBag (identik ikon keranjang situs) + plus dlm badge krem di sudut — ukuran badge disamakan dgn varian grid agar tetap terbaca di layar kecil */
              <span className="relative inline-flex" aria-hidden>
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                <Plus strokeWidth={4} className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-cream p-[1.5px] text-forest shadow-[0_1px_3px_rgba(23,61,50,0.35)]" />
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onOpen(product.slug)}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-full bg-forest px-3.5 py-1.5 text-[11.5px] font-bold text-cream transition-colors duration-200 hover:bg-forest-dark"
            aria-label={`Lihat detail ${product.name}`}
          >
            Lihat Detail
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

/** Small tea card for the Tea Collection row — edge-to-edge image, harga tegas (sejajar kartu utama) */
export function TeaCard({ product, onOpen }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product.slug)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-white text-center shadow-[0_2px_12px_rgba(23,61,50,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,61,50,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      aria-label={`Lihat detail ${product.name}`}
    >
      {/* Gambar edge-to-edge (baris grid bisa stretch di samping kartu promo) */}
      <div className="relative min-h-[120px] flex-1 w-full overflow-hidden bg-cream">
        <img
          src={product.mainImage || '/products/tea-only.webp'}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="px-2.5 pb-2.5 pt-2">
        <h3 className="truncate text-[13.5px] font-bold leading-tight text-forest">{product.name}</h3>
        <p className="mt-0.5 text-[13.5px] font-extrabold tracking-tight text-forest">{formatRupiah(product.price)}</p>
      </div>
      {/* Hint hover — affordance klik */}
      <span
        className="mx-2.5 mb-2.5 inline-flex items-center justify-center gap-1 rounded-full bg-forest/[0.05] py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-forest/50 transition-colors duration-200 group-hover:bg-forest group-hover:text-cream"
        aria-hidden
      >
        Lihat Detail
      </span>
    </button>
  )
}
