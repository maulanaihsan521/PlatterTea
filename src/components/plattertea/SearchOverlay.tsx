'use client'

import { useEffect, useMemo, useState } from 'react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { formatRupiah, type Product, type Route } from '@/lib/plattertea'
import { Home, UtensilsCrossed, Tag, Info, Phone, CircleHelp, Search, ArrowUpRight } from 'lucide-react'

interface SearchOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  navigate: (r: Route) => void
}

const QUICK_LINKS: { label: string; icon: React.ComponentType<{ className?: string }>; route: Route }[] = [
  { label: 'Home', icon: Home, route: { view: 'home' } },
  { label: 'Menu Kami', icon: UtensilsCrossed, route: { view: 'menu' } },
  { label: 'Promo', icon: Tag, route: { view: 'promo' } },
  { label: 'Tentang Kami', icon: Info, route: { view: 'about' } },
  { label: 'FAQ', icon: CircleHelp, route: { view: 'faq' } },
  { label: 'Kontak', icon: Phone, route: { view: 'contact' } },
]

/**
 * Pencarian produk fungsional (⌘K / Ctrl+K):
 * mencari semua menu + navigasi cepat, langsung buka detail produk.
 */
export function SearchOverlay({ open, onOpenChange, navigate }: SearchOverlayProps) {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [query, setQuery] = useState('')

  // Ambil produk hanya saat overlay pertama kali dibuka
  useEffect(() => {
    if (!open || products) return
    let mounted = true
    fetch('/api/products')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setProducts(res.data as Product[])
      })
      .catch(() => {
        if (mounted) setProducts([])
      })
    return () => {
      mounted = false
    }
  }, [open, products])

  // Shortcut keyboard ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const filtered = useMemo(() => {
    if (!products) return []
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.name || '').toLowerCase().includes(q) ||
        (p.shortDesc || '').toLowerCase().includes(q)
    )
  }, [products, query])

  const go = (r: Route) => {
    onOpenChange(false)
    navigate(r)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      className="rounded-3xl"
    >
      {/* label sr-only agar aksesibel */}
      <span className="sr-only">Cari produk atau halaman</span>
      <CommandInput
        placeholder="Cari menu… (cth. Platter, Tea, Combo)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[360px]">
        {products === null ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[13.5px] font-semibold text-forest/50">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest/20 border-t-gold" aria-hidden="true" />
            Memuat menu…
          </div>
        ) : filtered.length === 0 && query ? (
          <CommandEmpty>
            <div className="flex flex-col items-center gap-1.5 py-4">
              <img
                src="/brand/mascot-sit.png"
                alt=""
                aria-hidden="true"
                className="w-16 select-none opacity-90"
                draggable={false}
                loading="lazy"
              />
              <p className="text-[13.5px] font-semibold text-forest/70">
                Tidak ada menu yang cocok dengan &ldquo;{query}&rdquo;.
              </p>
              <p className="font-hand text-base font-semibold text-forest/55">Coba kata kunci lain ya…</p>
            </div>
          </CommandEmpty>
        ) : (
          <>
            {filtered.length > 0 && (
              <CommandGroup heading="Menu PlatterTea">
                {filtered.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`product-${p.slug}`}
                    onSelect={() => go({ view: 'product', slug: p.slug })}
                    className="gap-3 rounded-xl py-2.5"
                  >
                    <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                      {p.mainImage && <img src={p.mainImage} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-forest">{p.name}</span>
                        {p.featured && (
                          <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-gold-dark">
                            Favorit
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[12px] text-forest/55">
                        {p.category?.name || 'Menu'} · {formatRupiah(p.price)}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-forest/30" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
            <CommandGroup heading="Navigasi Cepat">
              {QUICK_LINKS.map(({ label, icon: Icon, route }) => (
                <CommandItem
                  key={label}
                  value={`nav-${label}`}
                  onSelect={() => go(route)}
                  className="gap-3 rounded-xl"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-light text-forest">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* hint keyboard */}
      <div className="flex items-center gap-4 border-t border-forest/10 px-4 py-2.5 text-[11px] font-semibold text-forest/40">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-md border border-forest/15 bg-sage-light px-1.5 py-0.5 font-sans text-[10px]">↵</kbd>
          buka
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded-md border border-forest/15 bg-sage-light px-1.5 py-0.5 font-sans text-[10px]">esc</kbd>
          tutup
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <Search className="h-3 w-3" /> {products ? `${products.length} menu` : '…'}
        </span>
      </div>
    </CommandDialog>
  )
}
