'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProductCard, TeaCard } from '../ProductCard'
import { MarketDaysBanner, OpenPOSection } from '../MarketDays'
import { TestimonialForm } from '../TestimonialForm'
import { Leaf, LeafPair, Blob, Swoosh } from '../Decor'
import { Mascot } from '../Mascot'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import { formatRupiah, promoHighlight, type Product, type Promotion, type Testimonial, type Route } from '@/lib/plattertea'
import { ArrowRight, MessageCircle, Star, HandPlatter, BadgePercent, ShieldCheck, Clock, CheckCircle2, Instagram, Music2, UtensilsCrossed, ShoppingBag, MapPin, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface HomeViewProps {
  navigate: (r: Route) => void
}

// ============ Hero ============

function Hero({ navigate }: HomeViewProps) {
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32" aria-label="Pembuka">
      {/* organic background decorations — daun sisi disembunyikan <lg: wordmark bawaan sudah punya daun sendiri (dulu tabrakan/tumpang tindih) */}
      <Blob className="pointer-events-none absolute -left-24 top-24 h-72 w-72 text-beige/70" />
      <Blob className="pointer-events-none absolute -right-32 top-40 h-96 w-96 text-beige/60" />
      <Leaf className="pointer-events-none absolute left-[6%] top-40 hidden h-14 w-24 -rotate-12 text-forest-light/70 sm:left-[10%] sm:top-44 lg:block" />
      <Leaf flip className="pointer-events-none absolute bottom-10 left-[38%] hidden h-12 w-20 rotate-6 text-gold/60 lg:block" />
      <LeafPair className="pointer-events-none absolute right-[4%] top-28 hidden h-20 w-28 rotate-12 text-forest-light/60 lg:block" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8 lg:pb-20">
        {/* Text */}
        <div className="pt-fade-up text-center lg:text-left">
          {/* H1 ganda-visual: wordmark resmi utk mobile/tablet, teks script + swoosh utk desktop.
              SR membaca teks sekali via sr-only; gambar & teks visual masing2 aria-hidden (duplikat dekoratif). */}
          <h1 className="relative">
            <img
              src="/brand/mix-sip-enjoy.webp"
              alt=""
              aria-hidden="true"
              width={1400}
              height={467}
              fetchPriority="high"
              draggable={false}
              className="mx-auto w-full max-w-[350px] select-none sm:max-w-[430px] lg:hidden"
            />
            <span aria-hidden="true" className="relative hidden lg:block">
              <span className="font-script text-6xl leading-[1.15] text-forest lg:text-[64px]">
                Mix, Sip, Enjoy!
              </span>
              <Swoosh className="absolute -bottom-3 left-8 h-5 w-64 text-gold" />
            </span>
            <span className="sr-only">Mix, Sip, Enjoy!</span>
          </h1>

          <p className="mx-auto mt-7 max-w-md text-[16.5px] font-medium leading-relaxed text-forest sm:text-lg sm:text-forest/90 lg:mx-0 lg:text-lg">
            {settings.hero_subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-start">
            <button
              type="button"
              onClick={() => navigate({ view: 'menu' })}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold px-[14px] py-3 text-[14px] font-bold text-forest shadow-[0_6px_20px_rgba(232,161,38,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-dark hover:text-cream hover:shadow-[0_10px_28px_rgba(232,161,38,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:px-7 sm:text-[15px]"
            >
              Lihat Menu
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-forest/15 bg-white/70 px-[14px] py-3 text-[14px] font-bold text-forest backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-forest hover:bg-forest hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:px-7 sm:text-[15px]"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              Hubungi Kami
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="relative pt-fade-in">
          <div className="relative mx-auto max-w-[540px]">
            <div className="pt-blob absolute inset-0 -z-0 translate-y-4 scale-105 bg-cream-dark" />
            { }
            <img
              src="/products/hero.webp"
              alt="PlatterTea Mix Platter dan Teh Segar"
              className="relative z-10 w-full rounded-[32px] object-cover shadow-[0_24px_60px_rgba(23,61,50,0.18)]"
              fetchPriority="high"
            />
            {/* handwritten badge — melayang di atas gambar (di area cream, sesuai mockup) */}
            <div className="absolute -top-11 right-0 z-20 rotate-6 sm:-top-14 sm:right-2">
              <p className="font-hand text-[22px] font-semibold leading-[1.15] text-forest drop-shadow-sm sm:text-3xl">
                Segar,<br />Lezat, Praktis!
              </p>
            </div>
            {/* Maskot membawa platter — hadir memperkenalkan produk */}
            <Mascot
              pose="box"
              width={210}
              animation="float"
              className="absolute -bottom-7 -left-3 z-30 w-[104px] drop-shadow-[0_12px_20px_rgba(23,61,50,0.28)] sm:w-[130px] lg:-left-12 lg:w-[180px]"
            />
            <Leaf className="absolute -bottom-3 -left-4 z-10 hidden h-12 w-20 -rotate-12 text-forest-light lg:hidden" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ Feature Strip ============

const FEATURES = [
  {
    icon: HandPlatter,
    title: 'Makanan & Minuman',
    desc: 'Dalam Satu Transaksi',
  },
  {
    icon: BadgePercent,
    title: 'Harga Jelas',
    desc: 'Tanpa Ribet',
  },
  {
    icon: ShieldCheck,
    title: 'Higienis &',
    desc: 'Kualitas Terjaga',
  },
  {
    icon: Clock,
    title: 'Open PO',
    desc: 'H-4 s.d. H-1',
  },
]

function FeatureStrip() {
  return (
    <section aria-label="Keunggulan PlatterTea" className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-3xl bg-white px-6 py-7 shadow-[0_2px_20px_rgba(23,61,50,0.06)] sm:px-8 md:grid-cols-4 md:gap-2 md:py-8">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className="flex items-center justify-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-forest/15 text-forest sm:h-12 sm:w-12">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <p className="text-[12.5px] font-semibold leading-snug text-forest/90 sm:text-[13.5px]">
              {title}
              <br />
              <span className="text-forest/60">{desc}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============ Brand Intro ============

function BrandIntro({ navigate }: HomeViewProps) {
  const settings = useSettings()
  return (
    <section className="relative overflow-hidden py-16 lg:py-24" aria-labelledby="kenalan">
      <LeafPair className="pointer-events-none absolute left-2 top-16 h-16 w-24 -rotate-12 text-forest-light/50" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="pt-fade-up order-2 lg:order-1">
          <h2 id="kenalan" className="text-2xl font-extrabold text-forest sm:text-3xl lg:text-[32px]">
            Kenalan dengan PlatterTea
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-forest/75 sm:text-base">
            {settings.about_story}
          </p>
          <button
            type="button"
            onClick={() => navigate({ view: 'about' })}
            className="mt-7 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-forest shadow-[0_4px_16px_rgba(232,161,38,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-dark hover:text-cream"
          >
            Selengkapnya
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto max-w-[480px]">
            <Blob className="absolute -inset-6 text-beige/80" />
            { }
            <img
              src="/products/brand-intro.webp"
              alt="Produk PlatterTea"
              loading="lazy"
              className="relative w-full rounded-[28px] object-cover shadow-[0_16px_44px_rgba(23,61,50,0.16)]"
            />
            <p className="absolute -right-2 -top-6 rotate-3 font-hand text-2xl font-semibold leading-tight text-forest sm:-right-6 sm:text-[28px]">
              Good Food<br />Good Mood
            </p>
            {/* Maskot peluk hati — brand yang menyayangi pelanggan */}
            <Mascot
              pose="heart"
              width={110}
              animation="sway"
              className="absolute -bottom-8 -right-2 z-10 w-[92px] drop-shadow-[0_10px_18px_rgba(23,61,50,0.25)] sm:w-[108px] lg:-right-8"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ Product Showcase ============

const CATEGORIES = [
  { key: 'all', label: 'Semua' },
  { key: 'platter', label: 'Platter' },
  { key: 'tea', label: 'Tea' },
  { key: 'combo', label: 'Combo' },
]

function ProductShowcase({ navigate }: HomeViewProps) {
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
    <section className="relative pt-4 pb-10 lg:pt-6 lg:pb-16" aria-labelledby="menu-plattertea">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-fade-up">
          <h2 id="menu-plattertea" className="text-2xl font-extrabold text-forest sm:text-3xl">
            Menu PlatterTea
          </h2>
          <p className="mt-2 text-[15px] text-forest/70">
            Pilihan makanan dan minuman untuk menemani harimu.
          </p>
        </div>

        {/* Filter pills */}
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Kategori menu">
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
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="flex justify-center">
              <Mascot pose="sit" width={120} animation="float" className="w-24" />
            </div>
            <p className="mt-2 font-hand text-xl font-semibold text-forest/80">Waduh, menunya kosong…</p>
            <p className="mt-1 text-forest/60">Belum ada produk yang ditampilkan. Cek lagi nanti ya!</p>
          </div>
        ) : (
          <div className="pt-stagger mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={(slug) => navigate({ view: 'product', slug })} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ============ Tea Collection + Promo Card ============

function TeaCollection({ navigate }: HomeViewProps) {
  const [teas, setTeas] = useState<Product[]>([])
  const [featuredPromo, setFeaturedPromo] = useState<Promotion | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/products?category=tea').then((r) => r.json()),
      fetch('/api/promotions').then((r) => r.json()),
    ])
      .then(([teaRes, promoRes]) => {
        if (!mounted) return
        if (teaRes.success) setTeas(teaRes.data.slice(0, 4))
        if (promoRes.success) {
          const featured = promoRes.data.find((p: Promotion) => p.featured) || promoRes.data[0]
          setFeaturedPromo(featured || null)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const wa = waLink(useSettings().whatsapp, WA_MESSAGES.general)

  return (
    <section className="relative py-10 lg:py-16" aria-labelledby="tea-collection">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-fade-up">
          <h2 id="tea-collection" className="text-2xl font-extrabold text-forest sm:text-3xl">
            Tea Collection
          </h2>
          <p className="mt-2 text-[15px] text-forest/70">
            Pilihan teh favorit dengan rasa yang menyegarkan.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Teas */}
          <div className="pt-stagger grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {teas.map((t) => (
              <TeaCard key={t.id} product={t} onOpen={(slug) => navigate({ view: 'product', slug })} />
            ))}
          </div>

          {/* Featured promo card — gold gradient per mockup */}
          {featuredPromo && (
            <aside className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-gold-light via-gold to-gold-dark p-6 shadow-[0_12px_36px_rgba(232,161,38,0.35)] sm:p-7">
              <Leaf className="pointer-events-none absolute -right-4 -top-2 h-14 w-24 rotate-12 text-white/25" />
              <LeafPair flip className="pointer-events-none absolute -bottom-4 -left-2 h-16 w-24 text-white/20" />
              <div className="relative z-10 flex flex-1 flex-col">
              <p className="font-hand text-xl font-bold text-forest/90">Promo Spesial</p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-forest sm:text-[28px]">
                {featuredPromo.title}
              </h3>
              {featuredPromo.subtitle && (
                <p className="mt-1 text-[15px] font-bold text-forest/80">{featuredPromo.subtitle}</p>
              )}
              <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-forest/70">
                {featuredPromo.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                {promoHighlight(featuredPromo.title) && (
                  <p className="text-2xl font-extrabold text-forest">
                    {promoHighlight(featuredPromo.title)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => navigate({ view: 'promo' })}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-cream shadow-[0_6px_18px_rgba(23,61,50,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-forest-dark"
                >
                  {featuredPromo.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}

// ============ Dark Green CTA ============

function DarkCTA({ navigate }: HomeViewProps) {
  return (
    <section className="relative py-10 lg:py-16" aria-labelledby="dark-cta">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-forest px-6 py-10 shadow-[0_20px_50px_rgba(15,46,38,0.35)] sm:px-10 lg:px-14 lg:py-14">
          <Leaf className="pointer-events-none absolute -left-6 bottom-6 h-16 w-28 rotate-12 text-forest-light/50" />
          <LeafPair className="pointer-events-none absolute right-[30%] top-4 h-14 w-20 text-forest-light/40" />
          <LeafPair flip className="pointer-events-none absolute -right-6 -top-6 h-24 w-32 text-forest-light/40" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 id="dark-cta" className="font-script text-3xl leading-snug text-cream sm:text-4xl">
                Camilan Lezat, Teh Segar, Satu Pilihan.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cream/75">
                PlatterTea menghadirkan kombinasi makanan dan minuman dalam satu paket pengalaman
                yang praktis, lezat, dan mudah dinikmati.
              </p>
              <button
                type="button"
                onClick={() => navigate({ view: 'menu' })}
                className="mt-7 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-forest shadow-[0_6px_20px_rgba(232,161,38,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light"
              >
                Lihat Menu
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative mx-auto max-w-[460px]">
              { }
              <img
                src="/products/plattertea-combo.webp"
                alt="PlatterTea Combo"
                loading="lazy"
                className="w-full rounded-[24px] object-cover shadow-[0_16px_44px_rgba(0,0,0,0.35)]"
              />
              <p className="absolute -top-5 right-1 rotate-6 font-hand text-[26px] font-bold text-gold-light [text-shadow:0_1px_2px_rgba(15,46,38,0.85),0_3px_10px_rgba(15,46,38,0.6)] sm:text-3xl">
                Mix, Sip, Enjoy!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ Cara Pesan (How to Order) ============

const STEPS = [
  {
    title: 'Pilih menu favoritmu',
    desc: 'Klik tombol + pada menu untuk masuk ke keranjang.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Buka keranjang',
    desc: 'Atur jumlah, isi nama & catatan pesananmu.',
    icon: ShoppingBag,
  },
  {
    title: 'Pesan via WhatsApp',
    desc: 'Teks pesanan terisi otomatis — tinggal kirim.',
    icon: MessageCircle,
  },
  {
    title: 'Konfirmasi dengan admin',
    desc: 'Admin akan mengonfirmasi pesanan & totalnya.',
    icon: CheckCircle2,
  },
  {
    title: 'Ambil pesanan sesuai lokasi',
    desc: 'Ambil sesuai lokasi & jam operasional.',
    icon: Clock,
  },
]

function HowToOrder({ navigate }: HomeViewProps) {
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  // Sinkron indikator titik + gradasi tepi dengan posisi scroll (mobile).
  // Lebar langkah diukur dari jarak antar item — anti-glitch di semua lebar layar.
  const syncTrack = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-step]')
    if (items.length >= 2) {
      const step = items[1].offsetLeft - items[0].offsetLeft
      if (step > 0) {
        setActive(Math.min(STEPS.length - 1, Math.max(0, Math.round(el.scrollLeft / step))))
      }
    }
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    syncTrack()
    window.addEventListener('resize', syncTrack, { passive: true })
    return () => window.removeEventListener('resize', syncTrack)
  }, [syncTrack])

  const gotoStep = (i: number) => {
    const el = trackRef.current
    if (!el) return
    const items = el.querySelectorAll<HTMLElement>('[data-step]')
    if (items.length >= 2) {
      const step = items[1].offsetLeft - items[0].offsetLeft
      el.scrollTo({ left: i * step, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden pt-14 pb-10 lg:pt-20 lg:pb-12" aria-labelledby="cara-pesan">
      <Leaf className="pointer-events-none absolute left-[8%] top-8 h-12 w-20 -rotate-12 text-forest-light/40" />
      <LeafPair flip className="pointer-events-none absolute bottom-10 right-[6%] h-16 w-24 text-gold/30" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-fade-up relative">
          <div className="flex items-end justify-between gap-2">
            <h2 id="cara-pesan" className="text-2xl font-extrabold text-forest sm:text-3xl">
              Cara Pesan
            </h2>
            {/* Maskot di samping judul, menunjuk ke teks — mobile & tablet (xl memakai maskot floating besar) */}
            <Mascot
              pose="point"
              width={56}
              flip
              animation="sway"
              className="w-14 shrink-0 xl:hidden"
            />
          </div>
          <p className="mt-2 text-[15px] text-forest/70">Mudah banget! Cukup 5 langkah — pesanan terkirim lewat WhatsApp:</p>
          {/* Maskot floating menunjuk langkah-langkah — layar sangat lebar */}
          <Mascot
            pose="point"
            width={104}
            animation="sway"
            className="absolute -top-8 right-[2%] hidden w-24 xl:block"
          />
        </div>

        {/* Steps — horizontal scroll snap di mobile (dengan indikator titik +
            gradasi tepi agar jelas bisa di-swipe & teks tak lagi terpotong),
            grid 5 kolom di desktop */}
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={syncTrack}
            className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scroll-padding-left:1rem] sm:[scroll-padding-left:1.5rem] lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible"
          >
            {STEPS.map(({ title, desc, icon: Icon }, i) => (
              <div
                key={i}
                data-step
                className="relative flex w-[200px] shrink-0 snap-start flex-col items-center gap-3 text-center lg:w-auto"
              >
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute left-[104%] top-6 hidden h-5 w-5 -translate-y-1/2 text-gold lg:block" />
                )}
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-forest/15 bg-white text-forest shadow-sm">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-forest">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <p className="text-[13px] font-semibold leading-snug text-forest/85">{title}</p>
                  <p className="mt-1 text-[11.5px] leading-snug text-forest/55">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gradasi tepi — penanda visual masih ada langkah di kiri/kanan (mobile) */}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-cream via-cream/70 to-transparent transition-opacity duration-300 lg:hidden',
              canLeft ? 'opacity-100' : 'opacity-0'
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream via-cream/70 to-transparent transition-opacity duration-300 lg:hidden',
              canRight ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>

        {/* Indikator titik langkah — bisa diklik utk lompat ke langkah (mobile) */}
        <div
          className="mt-4 flex justify-center gap-1.5 lg:hidden"
          role="tablist"
          aria-label="Pilih langkah cara pesan"
        >
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Langkah ${i + 1} dari ${STEPS.length}`}
              onClick={() => gotoStep(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                i === active ? 'w-7 bg-gold' : 'w-2 bg-forest/20 hover:bg-forest/35'
              )}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ view: 'menu' })}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gold px-8 py-3 text-[15px] font-bold text-forest shadow-[0_8px_24px_rgba(232,161,38,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-dark hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
          >
            <ShoppingBag className="h-5 w-5" />
            Mulai Pesan Sekarang
            <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border-2 border-forest/15 bg-white px-6 py-3 text-[14px] font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:border-forest hover:bg-forest hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            Tanya Admin Dulu
          </a>
        </div>
      </div>
    </section>
  )
}

// ============ Testimonials ============

function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    fetch('/api/testimonials')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setItems(res.data)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="relative py-10 lg:py-16" aria-labelledby="testimoni">
      <TestimonialForm open={formOpen} onOpenChange={setFormOpen} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pt-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="testimoni" className="text-2xl font-extrabold text-forest sm:text-3xl">
              Apa Kata Mereka?
            </h2>
            <p className="mt-2 text-[15px] text-forest/70">Cerita nyata dari pelanggan setia kami.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-forest/15 bg-white px-5 py-2 text-[13.5px] font-bold text-forest shadow-[0_2px_10px_rgba(23,61,50,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:text-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-98"
          >
            <PenLine className="h-4 w-4 text-gold-dark" aria-hidden="true" />
            Tulis Testimoni
          </button>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-forest/70">Belum ada testimoni yang ditampilkan.</p>
          </div>
        ) : (
          <div className="pt-stagger mt-8 grid gap-5 md:grid-cols-3 lg:gap-6">
            {items.slice(0, 6).map((t) => (
              <figure
                key={t.id}
                className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(23,61,50,0.12)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-base font-bold text-cream" aria-hidden="true">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <figcaption className="text-[14.5px] font-bold text-forest">{t.name}</figcaption>
                    {t.role && <p className="text-xs text-forest/60">{t.role}</p>}
                  </div>
                  <span className="ml-auto flex gap-0.5" aria-label={`Rating ${t.rating} dari 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5',
                          i < t.rating ? 'fill-gold text-gold' : 'fill-forest/10 text-forest/10'
                        )}
                      />
                    ))}
                  </span>
                </div>
                <blockquote className="text-[13.5px] leading-relaxed text-forest/75">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ============ Pre-Footer CTA ============

function PreFooterCTA({ navigate }: HomeViewProps) {
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  return (
    <section className="relative py-10 lg:py-14" aria-label="Ajakan berhubungan">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(15,46,38,0.25)] lg:grid-cols-[340px_1fr]">
          {/* mascot side — panel maskot keluarga PlatterTea */}
          <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-gradient-to-br from-sage-light via-beige to-cream-dark p-7 lg:min-h-full lg:p-10">
            <Blob className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 text-white/50" />
            <Blob className="pointer-events-none absolute -bottom-12 -right-10 h-44 w-44 text-forest/5" />
            <img
              src="/brand/mascot-group.png"
              alt="Keluarga maskot PlatterTea — karakter gelas teh dan platter box"
              loading="lazy"
              className="relative w-full max-w-[430px] object-contain drop-shadow-[0_18px_32px_rgba(23,61,50,0.18)]"
            />
            <p className="absolute bottom-3.5 left-4 font-hand text-2xl font-semibold text-forest/75">
              &ldquo;Mix, Sip, Enjoy!&rdquo;
            </p>
          </div>

          {/* content side */}
          <div className="relative grid gap-6 bg-forest p-7 sm:p-9 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div>
              <h2 className="text-xl font-extrabold text-cream sm:text-2xl">Kenalan Lebih Dekat</h2>
              <p className="mt-2.5 text-[14px] leading-relaxed text-cream/75">
                Ingin tahu lebih banyak tentang PlatterTea? Yuk baca cerita di balik brand makanan
                dan minuman yang siap menemani harimu.
              </p>
              <button
                type="button"
                onClick={() => navigate({ view: 'about' })}
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light"
              >
                Selengkapnya
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="text-[15px] font-bold text-cream">Ingin tahu lebih lanjut?</p>
              <p className="mt-1.5 text-[13.5px] text-cream/70">
                Hubungi kami melalui WhatsApp untuk info produk, promo, dan Open PO.
              </p>
              <div className="mt-4 flex items-center gap-2.5">
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
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-forest transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-light"
              >
                <MessageCircle className="h-4 w-4" />
                Chat via WhatsApp
              </a>
              {/* Strip lokasi booth — info alamat singkat + link rute */}
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-4 flex items-center gap-2.5 rounded-2xl bg-white/5 px-3.5 py-2.5 transition-colors duration-200 hover:bg-white/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-light">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-cream/45">Temukan kami</span>
                  {/* wrap 2 baris (bukan truncate) agar alamat selalu terbaca jelas di layar sempit */}
                  <span className="line-clamp-2 block text-[13px] font-semibold leading-snug text-cream/90">Booth — Telkom University Purwokerto</span>
                </span>
                <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-gold-light transition-colors duration-200 group-hover:bg-gold group-hover:text-forest">
                  Rute
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ Home View ============

export function HomeView({ navigate }: HomeViewProps) {
  return (
    <>
      <Hero navigate={navigate} />
      <FeatureStrip />
      {/* Urutan: Kenalan → Cara Pesan → Menu (Cara Pesan dipindah naik sesuai permintaan) */}
      <BrandIntro navigate={navigate} />
      <HowToOrder navigate={navigate} />
      <ProductShowcase navigate={navigate} />
      <TeaCollection navigate={navigate} />
      <MarketDaysBanner navigate={navigate} />
      <DarkCTA navigate={navigate} />
      <OpenPOSection />
      <Testimonials />
      <PreFooterCTA navigate={navigate} />
    </>
  )
}
