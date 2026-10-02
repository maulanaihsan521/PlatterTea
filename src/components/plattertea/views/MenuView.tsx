'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../PageHeader'
import { ProductCard, ProductCardRow } from '../ProductCard'
import type { Product, Route } from '@/lib/plattertea'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Leaf } from '../Decor'
import { Mascot } from '../Mascot'

interface MenuViewProps {
  navigate: (r: Route) => void
}

const CATEGORIES = [
  { key: 'all', label: 'Semua' },
  { key: 'platter', label: 'Platter' },
  { key: 'tea', label: 'Tea' },
  { key: 'combo', label: 'Combo' },
]

export function MenuView({ navigate }: MenuViewProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('all')

  useEffect(() => {
    let mounted = true
    fetch('/api/products')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setProducts(res.data)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.category?.slug === active)),
    [products, active]
  )

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Menu Kami"
        subtitle="Pilih menu favoritmu. Mix Platter dan Tea dalam satu tempat."
      />

      <section className="relative pb-28 pt-10 lg:pb-20">
        <Leaf className="pointer-events-none absolute right-[5%] top-8 h-12 w-20 rotate-12 text-forest-light/30" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Filter pills — sticky di bawah navbar saat scroll */}
          <div className="sticky top-[64px] z-20 -mx-4 bg-cream/85 px-4 py-2.5 backdrop-blur-md sm:top-[80px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Kategori menu">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={active === cat.key}
                  onClick={() => setActive(cat.key)}
                  className={cn(
                    'min-h-[40px] shrink-0 rounded-full px-5 py-2 text-[13.5px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                    active === cat.key
                      ? 'bg-forest text-cream shadow-[0_4px_14px_rgba(23,61,50,0.3)]'
                      : 'bg-white text-forest/70 shadow-sm hover:bg-forest/5 hover:text-forest'
                  )}
                >
                  {cat.label}
                </button>
              ))}
              <span className="ml-auto hidden shrink-0 pl-3 text-[12px] font-semibold text-forest/45 sm:inline" aria-live="polite">
                {loading ? 'Memuat…' : `${filtered.length} menu`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[22px] bg-white">
                  <Skeleton className="aspect-[4/3] rounded-none" />
                  <div className="space-y-2 px-4 pt-3.5 pb-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-5 w-1/3" />
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="flex justify-center">
                <Mascot pose="quiet" width={100} animation="float" className="w-20" />
              </div>
              <p className="mt-1 font-hand text-xl font-semibold text-forest/80">Belum ada menu di kategori ini</p>
              <p className="mt-1 text-forest/60">Coba pilih kategori lain ya!</p>
            </div>
          ) : (
            <>
              {/* Mobile: compact rows; Desktop: grid */}
              <div className="pt-stagger mt-8 flex flex-col gap-4 md:hidden">
                {filtered.map((p) => (
                  <ProductCardRow
                    key={p.id}
                    product={p}
                    onOpen={(slug) => navigate({ view: 'product', slug })}
                  />
                ))}
              </div>
              <div className="pt-stagger mt-8 hidden grid-cols-2 gap-5 md:grid lg:grid-cols-4 lg:gap-6">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onOpen={(slug) => navigate({ view: 'product', slug })}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
