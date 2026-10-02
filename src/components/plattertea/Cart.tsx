'use client'

// PlatterTea — Keranjang pesanan → checkout WhatsApp
// Terdiri dari:
//  - AddToCartButton : tombol bulat kecil (+) untuk kartu produk
//  - CartButton      : tombol ikon keranjang dengan badge (navbar)
//  - CartSheet       : sheet keranjang global (mobile: bawah, desktop: kanan)
// Alur: item masuk keranjang → "Pesan via WhatsApp" → wa.me dengan teks
// pesanan otomatis sesuai isi keranjang (nama item, qty, subtotal, total).

import { useMemo, useState } from 'react'
import { Plus, Minus, Trash2, ShoppingBag, MessageCircle, X, ShoppingBasket } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCartStore, useCartCount, cartTotal, MAX_QTY_PER_ITEM } from '@/hooks/use-cart'
import { useSettings, waLink } from '@/hooks/use-plattertea'
import { buildWaOrderMessage, formatRupiah, type Route } from '@/lib/plattertea'
import { cn } from '@/lib/utils'
import { WhatsAppIcon } from './ProductCard'

// ============ Tombol tambah ke keranjang (kartu produk) ============

export function AddToCartButton({
  item,
  className,
  label = 'Tambah ke keranjang',
}: {
  item: { productId: string; slug: string; name: string; price: number; image: string | null }
  className?: string
  label?: string
}) {
  const add = useCartStore((s) => s.add)
  const { toast } = useToast()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        add(item, 1)
        toast({
          title: 'Masuk keranjang',
          description: `${item.name} ditambahkan. Buka keranjang untuk memesan via WhatsApp.`,
        })
      }}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-forest shadow-[0_2px_10px_rgba(232,161,38,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
        className
      )}
      aria-label={`${label}: ${item.name}`}
      title={label}
    >
      <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
    </button>
  )
}

// ============ Tombol keranjang dengan badge (navbar) ============

export function CartButton({ className }: { className?: string }) {
  const openCart = useCartStore((s) => s.openCart)
  const count = useCartCount()

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        className
      )}
      aria-label={`Buka keranjang${count > 0 ? `, ${count} item` : ''}`}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.9} />
      {count > 0 && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-forest shadow-[0_2px_8px_rgba(232,161,38,0.5)]"
          aria-hidden
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

// ============ Sheet keranjang global ============

interface CartSheetProps {
  navigate: (r: Route) => void
}

export function CartSheet({ navigate }: CartSheetProps) {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const settings = useSettings()

  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)

  const [customerName, setCustomerName] = useState('')
  const [note, setNote] = useState('')

  const total = useMemo(() => cartTotal(items), [items])

  const order = () => {
    if (items.length === 0) return
    // Batasi panjang input agar URL wa.me tetap wajar (< 2k karakter)
    const message = buildWaOrderMessage(
      items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      { customerName: customerName.slice(0, 60), note: note.slice(0, 200) }
    )
    const link = waLink(settings.whatsapp, message)
    window.open(link, '_blank', 'noopener,noreferrer')
    toast({
      title: 'WhatsApp dibuka 🎉',
      description: 'Pesananmu sudah terisi otomatis — tinggal tekan kirim di WhatsApp.',
    })
  }

  const goMenu = () => {
    closeCart()
    navigate({ view: 'menu' })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={false}
        className={cn(
          'flex flex-col gap-0 rounded-t-[28px] bg-cream p-0',
          !isMobile && 'w-[420px] rounded-none rounded-l-[28px] border-l-0 sm:max-w-[420px]',
          isMobile && 'max-h-[88vh]'
        )}
      >
        {/* ===== Header ===== */}
        <div className="relative flex items-center gap-3 border-b border-forest/10 bg-white px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light text-forest">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-[16px] font-extrabold text-forest">Keranjang Pesanan</SheetTitle>
            <SheetDescription className="text-[12px] font-medium text-forest/55">
              {items.length > 0
                ? `${items.reduce((n, i) => n + i.qty, 0)} item siap dipesan via WhatsApp`
                : 'Belum ada menu yang dipilih'}
            </SheetDescription>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-cream px-3 text-[11.5px] font-bold text-forest/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Kosongkan keranjang"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Kosongkan
            </button>
          )}
          <button
            type="button"
            onClick={closeCart}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-forest/70 transition-colors hover:bg-sage-light hover:text-forest"
            aria-label="Tutup keranjang"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* ===== Kosong ===== */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-light text-forest/60">
              <ShoppingBasket className="h-9 w-9" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-[15px] font-extrabold text-forest">Keranjang masih kosong</p>
              <p className="mt-1 text-[13px] leading-relaxed text-forest/55">
                Pilih menu favoritmu dulu, nanti pesanannya kami siapkan otomatis di WhatsApp.
              </p>
            </div>
            <Button
              onClick={goMenu}
              className="min-h-[44px] rounded-full bg-forest px-6 text-[13.5px] font-bold text-cream hover:bg-forest-dark"
            >
              Lihat Menu
            </Button>
          </div>
        ) : (
          <>
            {/* ===== Daftar item (scrollable) ===== */}
            <ul className="flex-1 divide-y divide-forest/8 overflow-y-auto px-5 py-2 max-h-[46vh] min-h-[180px] lg:max-h-none" aria-label="Daftar item di keranjang">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 py-3.5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(23,61,50,0.08)]">
                    <img
                      src={item.image || '/products/tea-only.png'}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-bold leading-snug text-forest">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-forest/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-forest/55">
                      {formatRupiah(item.price)} / porsi
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* Stepper qty */}
                      <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_1px_6px_rgba(23,61,50,0.08)]" role="group" aria-label={`Atur jumlah ${item.name}`}>
                        <button
                          type="button"
                          onClick={() => decrement(item.productId)}
                          disabled={item.qty <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-forest transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Kurangi jumlah ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="min-w-6 text-center text-[13px] font-extrabold tabular-nums text-forest" aria-live="polite">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.productId)}
                          disabled={item.qty >= MAX_QTY_PER_ITEM}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-forest transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Tambah jumlah ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                      <p className="text-[13.5px] font-extrabold tabular-nums text-gold-dark">
                        {formatRupiah(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ===== Footer: identitas + total + CTA WhatsApp ===== */}
            <div className="border-t border-forest/10 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-forest/50">
                    Nama (opsional)
                  </span>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    maxLength={60}
                    placeholder="Nama kamu"
                    className="h-10 rounded-xl border-forest/15 bg-cream/60 text-[13.5px] focus-visible:ring-gold/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-forest/50">
                    Catatan (opsional)
                  </span>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={200}
                    placeholder="Pedas, tanpa bawang, dll."
                    className="h-10 rounded-xl border-forest/15 bg-cream/60 text-[13.5px] focus-visible:ring-gold/50"
                  />
                </label>
              </div>

              <div className="mt-3.5 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-forest/60">Total pesanan</span>
                <span className="text-[19px] font-extrabold tabular-nums text-forest">{formatRupiah(total)}</span>
              </div>

              <button
                type="button"
                onClick={order}
                className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-gold px-6 text-[15px] font-extrabold text-forest shadow-[0_8px_24px_rgba(232,161,38,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <MessageCircle className="h-5 w-5" />
                Pesan via WhatsApp
              </button>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-forest/45">
                <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                Chat terbuka dengan pesanan terisi otomatis — konfirmasi & pembayaran via WhatsApp.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
