'use client'

import { useState } from 'react'
import {
  Store,
  MessageCircle,
  ClipboardList,
  Heart,
  Copy,
  Check,
  ArrowRight,
  BadgePercent,
  CalendarClock,
} from 'lucide-react'
import { Leaf, LeafPair, Blob } from './Decor'
import { Mascot } from './Mascot'
import { useSettings, waLink, WA_MESSAGES, OPEN_PO_MESSAGE_TEMPLATE } from '@/hooks/use-plattertea'
import { cn } from '@/lib/utils'
import type { Route } from '@/lib/plattertea'

interface MarketDaysProps {
  navigate: (r: Route) => void
}

/**
 * SPESIAL MARKET DAYS — banner promo terbaru.
 * Ticket/kupon style: gold gradient, notches, dashed divider.
 * Sesuai Business Plan: diskon saat Market Days + Open PO via WhatsApp mulai H-7.
 */
export function MarketDaysBanner({ navigate }: MarketDaysProps) {
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.marketdays)

  return (
    <section className="relative py-6 lg:py-10" aria-labelledby="marketdays-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <article className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gold-light via-gold to-gold-dark shadow-[0_18px_48px_rgba(232,161,38,0.4)]">
          {/* decorations */}
          <Blob className="absolute -right-20 -top-24 h-64 w-64 text-white/20" />
          <Leaf className="absolute -left-4 bottom-4 h-12 w-24 -rotate-12 text-white/20" />

          <div className="relative grid items-stretch gap-0 lg:grid-cols-[1fr_320px]">
            {/* content side */}
            <div className="p-7 sm:p-9 lg:p-10">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-cream shadow-sm">
                  Promo Terbaru
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-forest">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Open PO via WhatsApp mulai H-7
                </span>
              </div>

              <h2
                id="marketdays-title"
                className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-forest sm:text-4xl"
              >
                Spesial{' '}
                <span className="font-script text-4xl font-bold text-forest sm:text-5xl">
                  Market Days!
                </span>
              </h2>

              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-forest/75">
                Diskon{' '}
                <strong className="font-extrabold text-forest">Rp2.000 semua produk</strong>{' '}
                saat event Market Days di kampus. Mau lebih praktis? Pesan lebih awal lewat
                Open PO via WhatsApp, ambil di booth tanpa antre!
              </p>

              {/* benefits chips */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                {[
                  { icon: Store, label: 'Booth Market Days kampus' },
                  { icon: BadgePercent, label: 'Diskon Rp2.000 semua produk' },
                  { icon: MessageCircle, label: 'Order via WhatsApp H-7' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3.5 py-2 text-xs font-bold text-forest"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ view: 'promo' })}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream shadow-[0_6px_18px_rgba(23,61,50,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark"
                >
                  Lihat Promo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-forest/70 bg-white/60 px-6 py-3 text-sm font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  Chat via WhatsApp
                </a>
              </div>
            </div>

            {/* image side — coupon perforation on desktop */}
            <div className="relative flex items-center justify-center border-t-2 border-dashed border-forest/25 bg-forest/[0.06] p-7 lg:border-l lg:border-t-0">
              {/* coupon notches (desktop) */}
              <span
                aria-hidden="true"
                className="absolute -left-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-cream lg:block"
              />
              <span
                aria-hidden="true"
                className="absolute -right-5 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-cream lg:block"
              />
              <div className="relative w-full max-w-[240px]">
                <img
                  src="/products/plattertea-combo.png"
                  alt="PlatterTea Combo — promo Spesial Market Days"
                  loading="lazy"
                  className="w-full rounded-[20px] object-cover shadow-[0_14px_36px_rgba(15,46,38,0.35)]"
                />
                {/* discount tag */}
                <span className="absolute -right-3 -top-4 flex rotate-6 items-center gap-1 rounded-full bg-forest px-3.5 py-2 text-xs font-extrabold text-gold shadow-[0_6px_16px_rgba(15,46,38,0.4)]">
                  <BadgePercent className="h-3.5 w-3.5" />
                  -Rp2.000
                </span>
                <p className="absolute -bottom-5 left-1 -rotate-3 font-hand text-2xl font-semibold text-forest">
                  tanpa antre!
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

/**
 * OPEN PO — layanan pre-order via WhatsApp sejak H-7 (Business Plan: pembeda utama).
 * Timeline H-7 → H-1 → H → H+1 + panduan format pesanan (bukan form transaksi).
 */
const PO_MILESTONES = [
  {
    day: 'H-7',
    title: 'Open PO Dibuka',
    desc: 'Pesan lewat WhatsApp: tentukan paket, varian tea, dan jumlahnya.',
    icon: MessageCircle,
    highlight: true,
  },
  {
    day: 'H-1',
    title: 'PO Ditutup',
    desc: 'Pesanan direkap dan produksi disiapkan sesuai pesanan masuk.',
    icon: ClipboardList,
    highlight: false,
  },
  {
    day: 'H',
    title: 'Market Days',
    desc: 'Ambil pesanan di booth & bayar di kasir (tunai/QRIS).',
    icon: Store,
    highlight: false,
  },
  {
    day: 'H+1',
    title: 'Sampai Jumpa!',
    desc: 'Terima kasih atas feedbacknya — sampai jumpa di acara berikutnya.',
    icon: Heart,
    highlight: false,
  },
] as const

export function OpenPOSection() {
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.openPO)
  const [copied, setCopied] = useState(false)

  const copyTemplate = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(OPEN_PO_MESSAGE_TEMPLATE)
      } else {
        // fallback untuk konteks non-secure / browser lama
        const ta = document.createElement('textarea')
        ta.value = OPEN_PO_MESSAGE_TEMPLATE
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // gagal menyalin — user bisa salin manual dari bubble
      setCopied(false)
    }
  }

  return (
    <section className="relative overflow-hidden py-14 lg:py-20" aria-labelledby="open-po-title">
      {/* soft band background */}
      <div className="absolute inset-0 bg-sage-light/60" aria-hidden="true" />
      <LeafPair className="absolute left-[4%] top-14 h-14 w-20 -rotate-6 text-forest-light/25" />
      <LeafPair flip className="absolute bottom-16 right-[3%] h-16 w-24 text-gold/25" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-fade-up text-center">
          <p className="font-hand text-2xl font-semibold text-gold-dark">mulai H-7 sebelum acara!</p>
          <h2 id="open-po-title" className="mt-1 text-2xl font-extrabold text-forest sm:text-3xl">
            Open PO via WhatsApp
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[15px] leading-relaxed text-forest/70">
            Pesan lebih awal lewat WhatsApp, ambil di booth saat Market Days —
            <strong className="font-bold text-forest"> tanpa antre!</strong> Open PO juga tersedia
            untuk seminar dan acara kampus lainnya.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-10" role="list" aria-label="Alur Open PO">
          {/* connector: desktop horizontal */}
          <div
            aria-hidden="true"
            className="absolute left-[12%] right-[12%] top-6 hidden border-t-2 border-dashed border-forest/25 lg:block"
          />
          {/* connector: mobile vertical */}
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-6 top-8 border-l-2 border-dashed border-forest/25 lg:hidden"
          />
          <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-4">
            {PO_MILESTONES.map(({ day, title, desc, icon: Icon, highlight }) => (
              <li key={day} className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
                <span
                  className={cn(
                    'z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-[0_6px_16px_rgba(15,46,38,0.25)]',
                    highlight ? 'bg-gold text-forest' : 'bg-forest text-cream'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div className="lg:mt-4">
                  <span
                    className={cn(
                      'inline-block rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider',
                      highlight ? 'bg-gold-dark text-cream' : 'bg-forest/10 text-forest'
                    )}
                  >
                    {day}
                  </span>
                  <h3 className="mt-1.5 text-[15.5px] font-extrabold text-forest">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-forest/65 lg:max-w-[220px] lg:mx-auto">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Format pesanan + CTA */}
        <div className="mt-12 grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
          {/* chat bubble format */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            {/* Si Box mengintip dari belakang bubble — desktop besar saja */}
            <Mascot
              pose="boxchar"
              width={120}
              animation="sway"
              className="absolute -left-28 -bottom-2 z-0 hidden w-28 xl:block"
            />
            <div className="relative rounded-2xl rounded-tr-sm bg-white p-5 shadow-[0_10px_30px_rgba(23,61,50,0.12)]">
              <div className="flex items-center gap-2 border-b border-forest/10 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-cream">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <p className="text-[13px] font-extrabold text-forest">Format pesanan Open PO</p>
                <span className="ml-auto font-hand text-lg text-gold-dark">gampang banget!</span>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-forest/80">
{OPEN_PO_MESSAGE_TEMPLATE}
              </pre>
            </div>
          </div>

          {/* CTA side */}
          <div className="text-center lg:text-left">
            <p className="text-[15px] font-bold text-forest">Siap pesan lebih awal?</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-forest/70">
              Salin format di samping, isi datanya, lalu kirim ke WhatsApp kami. Admin akan
              konfirmasi pesananmu sampai PO ditutup H-1.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button
                type="button"
                onClick={copyTemplate}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-forest/25 bg-white px-6 py-3 text-sm font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:border-forest/50"
              >
                {copied ? <Check className="h-4.5 w-4.5 text-forest" /> : <Copy className="h-4.5 w-4.5" />}
                {copied ? 'Tersalin!' : 'Salin Format Pesanan'}
              </button>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-cream shadow-[0_6px_18px_rgba(23,61,50,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                Chat via WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-forest/50">
              Website ini tidak memproses pesanan — semua komunikasi dan pembayaran terjadi
              langsung dengan admin via WhatsApp / di booth.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
