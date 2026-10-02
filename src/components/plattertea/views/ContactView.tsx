'use client'

import { useState } from 'react'
import { PageHeader } from '../PageHeader'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import { MessageCircle, Mail, MapPin, Clock, Instagram, Music2, ArrowRight, Navigation, ExternalLink, Copy, Check } from 'lucide-react'
import { LeafPair } from '../Decor'
import { Mascot } from '../Mascot'
import { useToast } from '@/hooks/use-toast'

interface ContactViewProps {
  navigate: (r: Route) => void
}

export function ContactView({ navigate }: ContactViewProps) {
  const settings = useSettings()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  const copyAddress = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(settings.address)
      } else {
        // fallback untuk konteks non-secure (mis. preview http)
        const ta = document.createElement('textarea')
        ta.value = settings.address
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      toast({ title: 'Alamat disalin', description: 'Alamat PlatterTea siap ditempel di mana saja.' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Gagal menyalin', description: 'Browser tidak mengizinkan akses clipboard.', variant: 'destructive' })
    }
  }

  const contacts = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: settings.whatsapp_display,
      href: wa,
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: settings.instagram_display,
      href: settings.instagram_url,
    },
    {
      icon: Music2,
      label: 'TikTok',
      value: settings.tiktok_display,
      href: settings.tiktok_url,
    },
    {
      icon: Mail,
      label: 'Email',
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
  ]

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Kontak Kami"
        subtitle="Hubungi kami untuk informasi lebih lanjut."
      />

      <section className="relative pb-28 pt-12 lg:pb-20">
        <LeafPair className="pointer-events-none absolute right-[5%] top-10 h-14 w-20 rotate-12 text-forest-light/25" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Contact list */}
            <div className="pt-stagger flex flex-col gap-4">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,61,50,0.12)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest transition-colors duration-200 group-hover:bg-forest group-hover:text-cream">
                    <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">{label}</p>
                    <p className="truncate text-[15px] font-bold text-forest">{value}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-forest/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-forest" />
                </a>
              ))}

              {/* Address — klik kartu buka Google Maps, tombol salin alamat */}
              <div className="group relative flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,61,50,0.12)]">
                <a
                  href={settings.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buka alamat di Google Maps"
                  className="flex min-w-0 flex-1 items-center gap-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest transition-colors duration-200 group-hover:bg-forest group-hover:text-cream">
                    <MapPin className="h-5.5 w-5.5" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">Alamat</p>
                    <p className="text-[15px] font-bold leading-snug text-forest">{settings.address}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-forest/30 transition-all duration-200 group-hover:translate-x-1 group-hover:text-forest" />
                </a>
                <button
                  type="button"
                  onClick={copyAddress}
                  aria-label="Salin alamat ke clipboard"
                  className="absolute right-4 top-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-cream px-2.5 text-[11px] font-bold text-forest/70 transition-all duration-200 hover:bg-sage-light hover:text-forest"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-forest" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Tersalin!' : 'Salin'}
                </button>
              </div>

              {/* Opening hours */}
              <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(23,61,50,0.06)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest">
                  <Clock className="h-5.5 w-5.5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">Jam Operasional</p>
                  <p className="text-[15px] font-bold text-forest">{settings.opening_hours}</p>
                </div>
              </div>
            </div>

            {/* Map + big CTA */}
            <div className="flex flex-col gap-6">
              {/* Map + action bar */}
              <div className="overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_2px_20px_rgba(23,61,50,0.08)]">
                <div className="relative overflow-hidden rounded-[24px]">
                  <iframe
                    title="Lokasi PlatterTea — Telkom University Purwokerto"
                    src={settings.maps_embed || 'https://maps.google.com/maps?q=Telkom+University+Purwokerto&z=16&output=embed'}
                    className="h-[260px] w-full border-0 sm:h-[300px]"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                  {/* Pin badge — identitas lokasi di atas peta */}
                  <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-[0_2px_10px_rgba(23,61,50,0.18)] backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5 text-caramel" />
                    <span className="text-[11.5px] font-bold text-forest">Booth PlatterTea</span>
                  </div>
                </div>
                {/* Action bar — rute & buka maps */}
                <div className="flex gap-2.5 p-2.5 pt-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('Telkom University Purwokerto')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-forest px-3 py-2.5 text-[13px] font-bold text-cream shadow-[0_4px_14px_rgba(23,61,50,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark sm:px-4 sm:text-sm"
                  >
                    <Navigation className="h-4 w-4 shrink-0" />
                    Petunjuk Arah
                  </a>
                  <a
                    href={settings.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-2 border-forest/15 bg-white px-3 py-2.5 text-[13px] font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/40 hover:bg-forest/5 sm:px-4 sm:text-sm"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    Buka di Maps
                  </a>
                </div>
              </div>

              {/* Big CTA card */}
              <div className="relative overflow-hidden rounded-[28px] bg-forest p-8 text-center shadow-[0_16px_40px_rgba(15,46,38,0.3)] sm:px-28 sm:py-10 lg:px-36">
                <LeafPair flip className="pointer-events-none absolute -bottom-4 -left-3 h-16 w-24 text-forest-light/50" />
                <LeafPair className="pointer-events-none absolute -right-4 -top-3 h-16 w-24 text-forest-light/50" />
                {/* Maskot jempol — tim kami siap membantu */}
                <Mascot
                  pose="thumbs"
                  width={96}
                  animation="float"
                  flip
                  className="absolute bottom-3 right-4 hidden w-20 drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)] sm:block lg:w-24"
                />
                <Mascot
                  pose="tea"
                  width={96}
                  animation="sway"
                  className="absolute bottom-3 left-4 hidden w-20 drop-shadow-[0_10px_18px_rgba(0,0,0,0.3)] sm:block lg:w-24"
                />
                <p className="font-script text-3xl text-gold-light">Masih bingung?</p>
                <h2 className="mt-2 text-xl font-extrabold text-cream sm:text-2xl">
                  Hubungi kami via WhatsApp
                </h2>
                <p className="mx-auto mt-2.5 max-w-sm text-[14px] leading-relaxed text-cream/70">
                  Tim kami siap membantu kamu untuk info produk, promo, maupun Open PO acara.
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[52px] items-center gap-2.5 whitespace-nowrap rounded-full bg-gold px-8 py-3.5 text-[15px] font-bold text-forest shadow-[0_8px_24px_rgba(232,161,38,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
