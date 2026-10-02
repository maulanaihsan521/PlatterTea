'use client'

// PlatterTea — Keranjang pesanan (client-only)
// State: Zustand + persist localStorage (key plattertea-cart-v1)
// Catatan desain: website TETAP bukan e-commerce — keranjang hanya
// merangkai pesanan menjadi teks otomatis yang dikirim via WhatsApp
// (pembayaran & konfirmasi tetap manual oleh admin).

import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  image: string | null
  qty: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  // UI sheet (tidak di-persist)
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  // Operasi keranjang
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  clear: () => void
}

export const MAX_QTY_PER_ITEM = 20

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, qty: Math.min(MAX_QTY_PER_ITEM, i.qty + qty) }
                  : i
              ),
            }
          }
          return { items: [...s.items, { ...item, qty: Math.min(MAX_QTY_PER_ITEM, qty) }] }
        }),

      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      setQty: (productId, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) =>
                  i.productId === productId
                    ? { ...i, qty: Math.min(MAX_QTY_PER_ITEM, qty) }
                    : i
                ),
        })),

      increment: (productId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, qty: Math.min(MAX_QTY_PER_ITEM, i.qty + 1) }
              : i
          ),
        })),

      decrement: (productId) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'plattertea-cart-v1',
      storage: createJSONStorage(() => localStorage),
      // hanya items yang disimpan — posisi sheet tidak perlu diingat
      partialize: (s) => ({ items: s.items }) as Pick<CartState, 'items'>,
    }
  )
)

// Deteksi "sudah mount" tanpa setState dalam effect (aman SSR/hydration):
// server snapshot = false, client snapshot = true
const subscribeNoop = () => () => {}
const useMounted = () => useSyncExternalStore(subscribeNoop, () => true, () => false)

/** Jumlah total unit di keranjang (aman SSR — selalu 0 sebelum mount). */
export function useCartCount(): number {
  const mounted = useMounted()
  const items = useCartStore((s) => s.items)
  if (!mounted) return 0
  return items.reduce((n, i) => n + i.qty, 0)
}

/** Total harga keranjang (pemakaian di client setelah mount). */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.price * i.qty, 0)
}
