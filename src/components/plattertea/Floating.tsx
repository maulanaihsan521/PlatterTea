'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import type { Route } from '@/lib/plattertea'
import { cn } from '@/lib/utils'

/** Mobile bottom navigation bar — per mockup: Home, Menu, Promo, About, Contact */
export function BottomNav({ route, navigate }: { route: Route; navigate: (r: Route) => void }) {
  const items = [
    {
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
      route: { view: 'home' } as Route,
    },
    {
      label: 'Menu',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </svg>
      ),
      route: { view: 'menu' } as Route,
    },
    {
      label: 'Promo',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
      ),
      route: { view: 'promo' } as Route,
    },
    {
      label: 'About',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      ),
      route: { view: 'about' } as Route,
    },
    {
      label: 'Contact',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      route: { view: 'contact' } as Route,
    },
  ]

  const isActive = (r: Route) => {
    if (r.view === 'home') return route.view === 'home'
    if (r.view === 'menu') return route.view === 'menu' || route.view === 'product'
    return route.view === r.view
  }

  return (
    <nav
      aria-label="Navigasi bawah"
      className="pt-safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-forest/10 bg-white/95 shadow-[0_-4px_24px_rgba(23,61,50,0.08)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ label, icon, route: r }) => {
          const active = isActive(r)
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => navigate(r)}
                className={cn(
                  'flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-1 pt-1.5 text-[10.5px] font-semibold transition-colors duration-200',
                  active ? 'text-forest' : 'text-forest/45'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className={cn('transition-transform duration-200', active && '-translate-y-0.5 scale-110')}>
                  {icon}
                </span>
                {label}
                <span
                  className={cn(
                    'h-1 w-6 rounded-full transition-all duration-200',
                    active ? 'bg-gold' : 'bg-transparent'
                  )}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Back to top button (optional per mockup) */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-[92px] left-4 z-30 hidden h-11 w-11 items-center justify-center rounded-full bg-forest text-cream shadow-[0_6px_20px_rgba(23,61,50,0.35)] transition-all duration-300 hover:bg-forest-dark md:bottom-6 md:left-6 md:flex"
      aria-label="Kembali ke atas"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

