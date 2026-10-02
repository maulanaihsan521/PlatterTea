'use client'

import { useEffect, useState } from 'react'
import type { Product, Route } from '@/lib/plattertea'
import { formatRupiah } from '@/lib/plattertea'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import { useCartStore, MAX_QTY_PER_ITEM } from '@/hooks/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, MessageCircle, CheckCircle2, Users, Tag, ArrowRight, Share2, Check, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DocumentMeta } from '../DocumentMeta'
import { LeafPair } from '../Decor'
import { cn } from '@/lib/utils'

interface ProductDetailViewProps {
  slug: string
  navigate: (r: Route) => void
}

interface ProductResult {
  product: Product
  related: Product[]
}

export function ProductDetailView({ slug, navigate }: ProductDetailViewProps) {
  // cache keyed by slug — avoids synchronous setState in effect
  const [results, setResults] = useState<Record<string, ProductResult | 'notfound'>>({})
  const [shared, setShared] = useState(false)
  const entry = results[slug]
  const loading = entry === undefined
  const notFound = entry === 'notfound'
  const product = entry && entry !== 'notfound' ? entry.product : null
  const related = entry && entry !== 'notfound' ? entry.related : []
  const settings = useSettings()
  const { toast } = useToast()
  const add = useCartStore((s) => s.add)
  const openCart = useCartStore((s) => s.openCart)
  const [qty, setQty] = useState(1)
  // Catatan: qty tidak perlu reset manual saat pindah produk — <main> di
  // page.tsx memakai key={routeToHash(route)} sehingga view remount per rute.

  useEffect(() => {
    let mounted = true
    if (results[slug]) return
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (!mounted) return
        setResults((prev) => ({
          ...prev,
          [slug]: res.success ? { product: res.data.product, related: res.data.related || [] } : 'notfound',
        }))
      })
      .catch(() => {
        if (mounted) setResults((prev) => ({ ...prev, [slug]: 'notfound' }))
      })
    return () => {
      mounted = false
    }
     
  }, [slug])

  const wa = product
    ? waLink(settings.whatsapp, WA_MESSAGES.product(product.name))
    : waLink(settings.whatsapp, WA_MESSAGES.general)

  const share = async () => {
    if (!product) return
    const url = window.location.href
    const text = `${product.name} — ${formatRupiah(product.price)} (PlatterTea)`
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text, url })
        return
      }
      await navigator.clipboard.writeText(`${text} · ${url}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // user batal share — abaikan
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-40 rounded-full" />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-[32px]" />
            <div className="space-y-4 py-4">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 pt-20 text-center">
        <p className="font-script text-4xl text-forest">Oops!</p>
        <p className="text-forest/70">Produk yang kamu cari tidak ditemukan.</p>
        <button
          type="button"
          onClick={() => navigate({ view: 'menu' })}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-forest-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Menu
        </button>
      </div>
    )
  }

  const compositions = (product.composition || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen pb-28 lg:pb-16">
      <DocumentMeta
        title={`${product.name} — ${product.category?.name || 'Menu'} | PlatterTea`}
        description={product.shortDesc || product.fullDesc || `Pesan ${product.name} PlatterTea via WhatsApp.`}
        image={product.mainImage}
      />
      <div className="relative overflow-hidden pt-20 sm:pt-24">
        <LeafPair className="absolute right-[6%] top-24 h-16 w-24 text-forest-light/30" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate({ view: 'menu' })}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-forest shadow-sm transition-all duration-200 hover:bg-forest hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="mt-7 grid gap-9 lg:grid-cols-2 lg:gap-14">
            {/* Image */}
            <div className="relative">
              <div className="pt-blob absolute -inset-5 bg-beige/70" />
              { }
              <img
                src={product.mainImage || '/products/tea-only.webp'}
                alt={product.name}
                className="relative aspect-square w-full rounded-[32px] object-cover shadow-[0_20px_50px_rgba(23,61,50,0.18)]"
              />
            </div>

            {/* Info */}
            <div className="pt-fade-up">
              <span className="inline-flex items-center rounded-full bg-sage-light px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-forest">
                {product.category?.name || 'Menu'}
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-forest sm:text-4xl">{product.name}</h1>
              <p className="mt-2 text-2xl font-extrabold text-gold-dark">{formatRupiah(product.price)}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-forest/75">
                {product.fullDesc || product.shortDesc}
              </p>

              {compositions.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-[15px] font-bold text-forest">Komposisi:</h2>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {compositions.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-[14px] text-forest/80">
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-gold" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Info produk */}
              <div className="mt-7 rounded-2xl bg-sage-light p-5">
                <h2 className="text-[14px] font-bold text-forest">Informasi Produk</h2>
                <dl className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="flex items-center gap-2.5">
                    <Tag className="h-4.5 w-4.5 text-forest/60" />
                    <div>
                      <dt className="sr-only">Kategori</dt>
                      <dd className="text-[13px] text-forest/70">
                        Kategori: <span className="font-semibold text-forest">{product.category?.name || '-'}</span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4.5 w-4.5 text-forest/60" />
                    <div>
                      <dt className="sr-only">Porsi</dt>
                      <dd className="text-[13px] text-forest/70">
                        Porsi: <span className="font-semibold text-forest">{product.portion || '1 orang'}</span>
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* CTA: qty + keranjang + WhatsApp + share */}
              <div className="mt-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Stepper jumlah */}
                  <div
                    className="flex items-center gap-1 rounded-full bg-white p-1.5 shadow-[0_2px_10px_rgba(23,61,50,0.08)]"
                    role="group"
                    aria-label="Atur jumlah pesanan"
                  >
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-forest transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <span className="min-w-8 text-center text-[15px] font-extrabold tabular-nums text-forest" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(MAX_QTY_PER_ITEM, q + 1))}
                      disabled={qty >= MAX_QTY_PER_ITEM}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-forest transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Tambah ke keranjang */}
                  <button
                    type="button"
                    onClick={() => {
                      add(
                        {
                          productId: product.id,
                          slug: product.slug,
                          name: product.name,
                          price: product.price,
                          image: product.mainImage,
                        },
                        qty
                      )
                      toast({
                        title: 'Masuk keranjang',
                        description: `${qty} × ${product.name} ditambahkan — buka keranjang untuk pesan.`,
                      })
                      openCart()
                    }}
                    className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full border-2 border-forest bg-white px-5 py-3 text-[14px] font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest hover:text-cream sm:flex-none"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Keranjang
                    <span className="text-[13px] font-extrabold tabular-nums text-gold-dark">{formatRupiah(product.price * qty)}</span>
                  </button>

                  {/* Bagikan */}
                  <button
                    type="button"
                    onClick={share}
                    className={cn(
                      'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                      shared
                        ? 'border-gold bg-gold/15 text-gold-dark'
                        : 'border-forest/20 bg-white text-forest hover:border-forest/40 hover:bg-sage-light'
                    )}
                    aria-label="Bagikan produk ini"
                    title="Bagikan produk ini"
                  >
                    {shared ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                  </button>
                </div>

                {/* Pesan langsung via WhatsApp */}
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-[15px] font-bold text-cream shadow-[0_8px_24px_rgba(23,61,50,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark"
                >
                  <MessageCircle className="h-5 w-5" />
                  Tanya / Pesan Langsung via WhatsApp
                </a>
                {shared && (
                  <p className="mt-2 text-[12px] font-semibold text-gold-dark">Link produk disalin — siap dibagikan! 🎉</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6 lg:px-8" aria-labelledby="related">
          <h2 id="related" className="text-xl font-extrabold text-forest sm:text-2xl">
            Menu Lainnya
          </h2>
          <div className="pt-stagger mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {related.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate({ view: 'product', slug: p.slug })}
                className="group flex items-center gap-4 rounded-2xl bg-white p-3 text-left shadow-[0_2px_12px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,61,50,0.12)]"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                  { }
                  <img
                    src={p.mainImage || '/products/tea-only.webp'}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[15px] font-bold text-forest">{p.name}</h3>
                  <p className="mt-0.5 text-[13px] font-semibold text-gold-dark">{formatRupiah(p.price)}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-forest/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-forest" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
