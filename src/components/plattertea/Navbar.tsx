'use client'

import { useEffect, useState } from 'react'
import { LogoFull, LogoFullWhite } from './Logo'
import { SearchOverlay } from './SearchOverlay'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import type { Route } from '@/lib/plattertea'
import { Menu, Search, X, Home, UtensilsCrossed, Tag, Info, Phone, CircleHelp, Instagram, MessageCircle, Music2, Images } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  route: Route
  navigate: (r: Route) => void
}

/** Views whose top area is dark green (PageHeader) — navbar needs light text when not scrolled */
const DARK_TOP_VIEWS = new Set<Route['view']>(['menu', 'promo', 'about', 'contact', 'faq'])

const NAV_ITEMS: { label: string; route: Route }[] = [
  { label: 'Home', route: { view: 'home' } },
  { label: 'Menu', route: { view: 'menu' } },
  { label: 'Promo', route: { view: 'promo' } },
  { label: 'About', route: { view: 'about' } },
  { label: 'Contact', route: { view: 'contact' } },
  { label: 'FAQ', route: { view: 'faq' } },
]

export function Navbar({ route, navigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const settings = useSettings()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const isActive = (r: Route) => {
    if (r.view === 'home') return route.view === 'home'
    if (r.view === 'menu') return route.view === 'menu' || route.view === 'product'
    return route.view === r.view
  }

  const onDark = DARK_TOP_VIEWS.has(route.view) && !scrolled

  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-cream/95 shadow-[0_2px_20px_rgba(23,61,50,0.08)] backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:h-[96px] sm:px-6 lg:px-8"
        >
          <button
            type="button"
            onClick={() => navigate({ view: 'home' })}
            className="flex min-h-[44px] items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-label="PlatterTea — ke halaman utama"
          >
            <LogoFullWhite height={54} fetchPriority="high" className={cn('drop-shadow-[0_2px_6px_rgba(23,61,50,0.18)]', onDark ? 'sm:!h-[72px]' : 'hidden sm:!h-[72px]')} />
            <LogoFull height={54} fetchPriority="high" className={cn('drop-shadow-[0_2px_6px_rgba(23,61,50,0.12)]', onDark ? 'hidden sm:!h-[72px]' : 'sm:!h-[72px]')} />
          </button>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-[14.5px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                    isActive(item.route)
                      ? onDark
                        ? 'text-gold'
                        : 'text-forest'
                      : onDark
                        ? 'text-cream/75 hover:text-cream'
                        : 'text-forest/65 hover:text-forest'
                  )}
                  aria-current={isActive(item.route) ? 'page' : undefined}
                >
                  {item.label}
                  {isActive(item.route) && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-gold" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className={cn(
                'hidden h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:flex',
                onDark ? 'text-cream/75 hover:bg-white/10 hover:text-cream' : 'text-forest/70 hover:bg-forest/5 hover:text-forest'
              )}
              aria-label="Cari produk"
              aria-keyshortcuts="Meta+K Control+K"
              title="Cari produk (Ctrl+K)"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-[0_4px_16px_rgba(23,61,50,0.25)] transition-all duration-200 sm:inline-flex',
                onDark
                  ? 'bg-gold text-forest hover:-translate-y-0.5 hover:bg-gold-light'
                  : 'bg-forest text-cream hover:bg-forest-dark hover:shadow-[0_6px_20px_rgba(23,61,50,0.35)]'
              )}
            >
              <MessageCircle className="h-4 w-4" />
              Hubungi Kami
            </a>

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-colors lg:hidden',
                onDark ? 'text-cream hover:bg-white/10' : 'text-forest hover:bg-forest/5'
              )}
              aria-label="Buka menu navigasi"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer — dark green full menu per mockup */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!drawerOpen}
      >
        {/* overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-forest-dark/60 backdrop-blur-sm transition-opacity duration-300',
            drawerOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setDrawerOpen(false)}
        />
        {/* panel */}
        <aside
          className={cn(
            'absolute right-0 top-0 flex h-full w-[290px] max-w-[85vw] flex-col bg-forest px-6 pb-6 pt-5 text-cream shadow-2xl transition-transform duration-300 ease-out',
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          <div className="flex items-center justify-between">
            <LogoFullWhite height={52} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-cream/80 transition-colors hover:bg-white/10 hover:text-cream"
              aria-label="Tutup menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false)
                  setSearchOpen(true)
                }}
                className="flex min-h-[48px] w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-[15px] font-semibold text-gold transition-colors duration-200 hover:bg-white/15"
              >
                <Search className="h-5 w-5" />
                Cari Produk
              </button>
            </li>
            {[
              { label: 'Home', icon: Home, r: { view: 'home' } as Route },
              { label: 'Menu', icon: UtensilsCrossed, r: { view: 'menu' } as Route },
              { label: 'Promo', icon: Tag, r: { view: 'promo' } as Route },
              { label: 'About', icon: Info, r: { view: 'about' } as Route },
              { label: 'Gallery', icon: Images, r: { view: 'about' } as Route },
              { label: 'FAQ', icon: CircleHelp, r: { view: 'faq' } as Route },
              { label: 'Contact', icon: Phone, r: { view: 'contact' } as Route },
            ].map(({ label, icon: Icon, r }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => {
                    navigate(r)
                    setDrawerOpen(false)
                  }}
                  className={cn(
                    'flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors duration-200',
                    isActive(r) ? 'bg-white/10 text-gold' : 'text-cream/85 hover:bg-white/10 hover:text-cream'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: settings.instagram_url, label: 'Instagram PlatterTea' },
                { icon: Music2, href: settings.tiktok_url, label: 'TikTok PlatterTea' },
                { icon: MessageCircle, href: wa, label: 'WhatsApp PlatterTea' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-gold hover:text-forest"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="font-script text-2xl text-gold">Mix, Sip, Enjoy!</p>
          </div>
        </aside>
      </div>

      {/* Search overlay (⌘K) */}
      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} navigate={navigate} />
    </>
  )
}
