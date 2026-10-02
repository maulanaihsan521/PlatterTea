'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '../PageHeader'
import { OpenPOSection } from '../MarketDays'
import { DocumentMeta } from '../DocumentMeta'
import type { Promotion, Route } from '@/lib/plattertea'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import { ArrowRight, MessageCircle, CalendarDays } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Leaf, LeafPair } from '../Decor'
import { Mascot } from '../Mascot'

interface PromoViewProps {
  navigate: (r: Route) => void
}

function formatDate(d: string | null): string {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

export function PromoView({ navigate }: PromoViewProps) {
  const [promos, setPromos] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  useEffect(() => {
    let mounted = true
    fetch('/api/promotions')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setPromos(res.data)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const featured = promos.find((p) => p.featured) || promos[0] || null
  const others = promos.filter((p) => p.id !== featured?.id)

  // SEO dinamis: judul + og:image dari promo utama (fallback ke meta statis bila kosong)
  const promoTitle = featured
    ? `${featured.title} — Promo PlatterTea`
    : 'Promo & Info Terbaru — PlatterTea'
  const promoDescription =
    featured?.description?.slice(0, 155) ||
    'Promo menarik, Spesial Market Days, dan layanan Open PO via WhatsApp mulai H-7.'

  return (
    <div className="min-h-screen">
      <DocumentMeta title={promoTitle} description={promoDescription} image={featured?.image} />
      <PageHeader
        title="Promo & Info Terbaru"
        subtitle="Promo menarik dan info terbaru dari PlatterTea untukmu."
      />

      <section className="relative pb-12 pt-10 lg:pb-16">
        <Leaf className="pointer-events-none absolute left-[6%] top-10 h-10 w-16 -rotate-12 text-gold/30" />
        <LeafPair flip className="pointer-events-none absolute bottom-16 right-[4%] h-14 w-20 text-forest-light/30" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-72 rounded-[32px]" />
              <div className="grid gap-5 md:grid-cols-2">
                <Skeleton className="h-40 rounded-3xl" />
                <Skeleton className="h-40 rounded-3xl" />
              </div>
            </div>
          ) : promos.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="flex justify-center">
                <Mascot pose="jump" width={110} animation="float" className="w-24" />
              </div>
              <p className="mt-1 font-hand text-xl font-semibold text-forest/80">Nantikan promo berikutnya!</p>
              <p className="mt-1 text-forest/60">Belum ada promo saat ini — pantengin terus ya.</p>
            </div>
          ) : (
            <>
              {/* Featured promo — big gold card per mockup */}
              {featured && (
                <article className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gold-light via-gold to-gold-dark p-7 shadow-[0_16px_44px_rgba(232,161,38,0.4)] sm:p-10">
                  <Leaf className="pointer-events-none absolute -right-5 -top-3 h-20 w-32 rotate-12 text-white/25" />
                  <LeafPair flip className="pointer-events-none absolute -bottom-5 -left-3 h-24 w-32 text-white/20" />
                  <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
                    <div>
                      <span className="font-hand text-2xl font-bold text-forest/90">Promo Spesial</span>
                      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
                        {featured.title}
                      </h2>
                      {featured.subtitle && (
                        <p className="mt-2 text-lg font-bold text-forest/80">{featured.subtitle}</p>
                      )}
                      {featured.description && (
                        <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-forest/75">
                          {featured.description}
                        </p>
                      )}
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream shadow-[0_6px_18px_rgba(23,61,50,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark"
                        >
                          <MessageCircle className="h-4.5 w-4.5" />
                          {featured.ctaLabel}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    {featured.image && (
                      <div className="relative mx-auto max-w-[420px]">
                        { }
                        <img
                          src={featured.image}
                          alt={featured.title}
                          loading="lazy"
                          className="w-full rounded-[24px] object-cover shadow-[0_16px_44px_rgba(0,0,0,0.25)]"
                        />
                      </div>
                    )}
                  </div>
                </article>
              )}

              {/* Other promos */}
              {others.length > 0 && (
                <>
                  <h2 className="mt-12 text-xl font-extrabold text-forest sm:text-2xl">Promo Lainnya</h2>
                  <div className="pt-stagger mt-6 grid gap-5 md:grid-cols-2 lg:gap-6">
                    {others.map((promo) => (
                      <article
                        key={promo.id}
                        className="group flex items-stretch gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(23,61,50,0.12)]"
                      >
                        {promo.image && (
                          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream sm:h-32 sm:w-32">
                            { }
                            <img
                              src={promo.image}
                              alt={promo.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-1">
                          <h3 className="text-[16px] font-bold leading-snug text-forest">{promo.title}</h3>
                          {promo.description && (
                            <p className="line-clamp-2 text-[13px] leading-relaxed text-forest/65">
                              {promo.description}
                            </p>
                          )}
                          {(promo.startDate || promo.endDate) && (
                            <p className="mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-light/70 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-forest/60">
                              <CalendarDays className="h-3 w-3" />
                              {promo.startDate && promo.endDate
                                ? `${formatDate(promo.startDate)} — ${formatDate(promo.endDate)}`
                                : promo.startDate
                                  ? `Mulai ${formatDate(promo.startDate)}`
                                  : `s.d. ${formatDate(promo.endDate)}`}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate({ view: 'contact' })}
                            className="mt-1.5 inline-flex min-h-[38px] w-fit items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-bold text-cream transition-colors duration-200 hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                          >
                            {promo.ctaLabel}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {/* info period */}
              <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl bg-sage-light px-6 py-6 text-center">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-forest">
                  <CalendarDays className="h-4.5 w-4.5 text-gold-dark" />
                  Promo berlaku untuk periode terbatas
                </p>
                <p className="max-w-md text-[13px] leading-relaxed text-forest/65">
                  {featured?.startDate && featured?.endDate
                    ? `Berlangsung ${formatDate(featured.startDate)} — ${formatDate(featured.endDate)}.`
                    : featured?.startDate
                      ? `Mulai ${formatDate(featured.startDate)}.`
                      : 'Pantau terus halaman ini untuk info promo terbaru dari PlatterTea!'}
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Open PO via WhatsApp — full-bleed section di luar container */}
      {!loading && promos.length > 0 && <OpenPOSection />}

      {/* ruang aman untuk BottomNav di mobile */}
      <div aria-hidden="true" className="h-16 lg:hidden" />
    </div>
  )
}
