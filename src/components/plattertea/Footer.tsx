'use client'

import { LogoFullWhite } from './Logo'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import { LeafPair } from './Decor'
import { InstallAppButton } from './InstallApp'
import type { Route } from '@/lib/plattertea'
import { Instagram, MessageCircle, Music2, MapPin, Clock, Phone } from 'lucide-react'

interface FooterProps {
  navigate: (r: Route) => void
}

export function Footer({ navigate }: FooterProps) {
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  const links: { label: string; r: Route }[] = [
    { label: 'Home', r: { view: 'home' } },
    { label: 'Menu', r: { view: 'menu' } },
    { label: 'Promo', r: { view: 'promo' } },
    { label: 'About', r: { view: 'about' } },
    { label: 'Contact', r: { view: 'contact' } },
    { label: 'FAQ', r: { view: 'faq' } },
  ]

  const contacts = [
    { icon: Phone, label: 'WhatsApp', value: settings.whatsapp_display || settings.whatsapp, href: wa },
    { icon: MapPin, label: 'Lokasi', value: settings.address, href: settings.maps_url },
    { icon: Clock, label: 'Jam Buka', value: settings.opening_hours, href: undefined },
  ].filter((c) => c.value)

  return (
    <footer className="relative mt-auto overflow-hidden bg-forest pb-24 pt-14 text-cream md:pb-12">
      {/* decorative leaves */}
      <LeafPair className="absolute -left-6 top-8 h-24 w-32 text-forest-light opacity-40" />
      <LeafPair flip className="absolute -right-8 bottom-16 h-24 w-32 text-forest-light opacity-40" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 text-center md:grid-cols-[1.2fr_0.8fr_1fr] md:gap-8 md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <button
              type="button"
              onClick={() => navigate({ view: 'home' })}
              className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              aria-label="PlatterTea — ke halaman utama"
            >
              <LogoFullWhite height={56} />
            </button>
            <p className="max-w-xs text-[13px] leading-relaxed text-cream/65">
              Perpaduan Mix Platter dan Tea dalam satu paket praktis — <span className="font-script text-[15px] text-gold-light">Mix, Sip, Enjoy!</span>
            </p>
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-all duration-200 hover:scale-105 hover:bg-gold hover:text-forest"
                  aria-label={label}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <nav aria-label="Navigasi footer" className="flex flex-col items-center gap-2 md:items-start">
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gold-light">Jelajahi</p>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 md:flex-col md:items-start md:gap-y-0.5">
              {links.map(({ label, r }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => navigate(r)}
                    className="min-h-[36px] text-[13.5px] font-semibold text-cream/75 transition-colors hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak */}
          <div className="flex flex-col items-center gap-2.5 md:items-start">
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-gold-light">Hubungi Kami</p>
            <ul className="space-y-2.5">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start justify-center gap-2.5 md:justify-start">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold-light">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-left">
                    <span className="block text-[10.5px] font-bold uppercase tracking-wide text-cream/45">{label}</span>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-semibold text-cream/90 transition-colors hover:text-gold"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-[13px] font-semibold text-cream/90">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <InstallAppButton />
            </div>
          </div>
        </div>

        <div className="mt-10 h-px w-full bg-white/10" />

        <p className="pt-5 text-center text-[12.5px] text-cream/55">
          © 2026 PlatterTea · Dibuat dengan <span className="text-gold-light">♥</span> untuk pecahan platter & tea · Pemesanan via WhatsApp
        </p>
      </div>
    </footer>
  )
}
