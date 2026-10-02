'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../PageHeader'
import type { GalleryItem, Route } from '@/lib/plattertea'
import { GalleryLightbox, GalleryZoomHint } from '../GalleryLightbox'
import { useSettings } from '@/hooks/use-plattertea'
import { Leaf, LeafPair, Blob } from '../Decor'
import { Mascot } from '../Mascot'
import { HeartHandshake, Leaf as LeafIcon, ChefHat, BadgeCheck, Smile, TrendingUp, Target, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AboutViewProps {
  navigate: (r: Route) => void
}

const VALUES = [
  { icon: BadgeCheck, label: 'Praktis' },
  { icon: LeafIcon, label: 'Fresh' },
  { icon: ChefHat, label: 'Lezat' },
  { icon: HeartHandshake, label: 'Berkualitas' },
  { icon: Smile, label: 'Ramah' },
  { icon: TrendingUp, label: 'Modern' },
]

/** Label kategori galeri — urutan kanonik; kategori tak dikenal memakai nama mentahnya */
const CAT_LABELS: Record<string, string> = {
  produk: 'Produk',
  booth: 'Booth',
  event: 'Event',
  bts: 'Behind the Scene',
  brand: 'Brand',
}
const CAT_ORDER = ['produk', 'booth', 'event', 'bts', 'brand']

/** Ambil item galeri PUBLISHED dari API — dipakai AboutView untuk memutuskan apakah section Galeri dirender */
function useGalleryItems() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/gallery', { cache: 'no-store' })
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

  return { items, loading }
}

export function AboutView({ navigate }: AboutViewProps) {
  const settings = useSettings()
  const { items: galleryItems, loading: galleryLoading } = useGalleryItems()
  const missions = (settings.about_mission || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Kenalan dengan PlatterTea"
        subtitle={settings.about_story}
      />

      {/* Nilai Kami */}
      <section className="relative py-12 lg:py-16" aria-labelledby="nilai">
        <LeafPair className="pointer-events-none absolute left-[4%] top-10 h-14 w-20 -rotate-12 text-forest-light/30" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 id="nilai" className="text-2xl font-extrabold text-forest sm:text-3xl">
            Nilai Kami
          </h2>
          <div className="pt-stagger mt-8 grid grid-cols-3 gap-4 sm:gap-5 lg:grid-cols-6">
            {VALUES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-3xl bg-white px-3 py-6 text-center shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(23,61,50,0.12)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-forest">
                  <Icon className="h-5.5 w-5.5" strokeWidth={1.8} />
                </span>
                <p className="text-[13px] font-bold text-forest sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ekspresi Maskot — brand board */}
      {/* overflow-x-clip: blob dekoratif -right-20 jangan melebar keluar viewport (bug mobile: header tampak tidak full-width) */}
      <section className="relative overflow-x-clip py-8 lg:py-14" aria-labelledby="maskot">
        <Blob className="pointer-events-none absolute -right-20 top-24 h-64 w-64 text-beige/60" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
            <div className="pt-fade-up order-2 lg:order-1">
              <p className="font-hand text-xl font-semibold text-gold">Teman baru kamu!</p>
              <h2 id="maskot" className="mt-1.5 text-2xl font-extrabold text-forest sm:text-3xl">
                Kenalan Sama Maskot Kami
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-forest/75 sm:text-base">
                Ini dia keluarga PlatterTea! Si Gelas Teh ceria yang selalu semangat, dan sahabatnya
                si Box yang penuh snack lezat. Bersama mereka, makan dan minum jadi momen paling
                seru — ramah, praktis, dan siap menemani harimu.
              </p>
              <ul className="mt-5 grid max-w-md grid-cols-2 gap-2.5">
                {[
                  { label: 'Semangat', pose: 'thumbs' as const },
                  { label: 'Keren', pose: 'cool' as const },
                  { label: 'Penuh Kasih', pose: 'heart' as const },
                  { label: 'Santai', pose: 'tea' as const },
                ].map(({ label, pose }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-[0_2px_12px_rgba(23,61,50,0.06)]"
                  >
                    <Mascot pose={pose} width={34} className="w-8 shrink-0" decorative />
                    <span className="text-[13px] font-bold text-forest">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative mx-auto max-w-[480px]">
                <Blob className="pointer-events-none absolute -inset-4 text-beige/80" />
                <img
                  src="/brand/mascot-group.png"
                  alt="Keluarga maskot PlatterTea — karakter gelas teh dan platter box"
                  loading="lazy"
                  className="relative w-full object-contain drop-shadow-[0_20px_36px_rgba(23,61,50,0.18)]"
                />
                <p className="absolute -right-1 top-2 rotate-6 font-hand text-xl font-semibold leading-tight text-forest sm:-right-4 sm:text-2xl">
                  Keluarga<br />PlatterTea!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="relative py-8 lg:py-14" aria-labelledby="visi-misi">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Vision */}
            <div className="relative overflow-hidden rounded-[28px] bg-forest p-7 shadow-[0_16px_40px_rgba(15,46,38,0.3)] sm:p-9">
              <Leaf className="pointer-events-none absolute -right-4 -top-2 h-14 w-24 rotate-12 text-forest-light/50" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold">
                <Target className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-cream">Visi Kami</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-cream/75">
                {settings.about_vision}
              </p>
            </div>

            {/* Mission */}
            <div className="relative overflow-hidden rounded-[28px] bg-white p-7 shadow-[0_2px_20px_rgba(23,61,50,0.08)] sm:p-9">
              <LeafPair flip className="pointer-events-none absolute -bottom-3 -right-3 h-14 w-20 text-sage-light" />
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-forest">
                <Rocket className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-forest">Misi Kami</h3>
              <ul className="mt-3 space-y-2.5">
                {missions.map((m, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-forest/75">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery — section disembunyikan rapi saat belum ada foto (isi via Admin → Galeri)
          sehingga halaman tidak menampilkan blok kosong yang terkesan belum selesai */}
      {!galleryLoading && galleryItems.length > 0 && (
        <section className="relative overflow-x-clip py-10 lg:py-16" aria-labelledby="galeri">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Blob diperkecil & dinaikkan agar tidak menimpa baris chip filter di bawahnya */}
              <Blob className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 text-beige/60" />
              <div className="relative">
                <h2 id="galeri" className="text-2xl font-extrabold text-forest sm:text-3xl">
                  Galeri
                </h2>
                <p className="mt-2 text-[15px] text-forest/70">
                  Momen dan keseruan bersama PlatterTea.
                </p>
              </div>
            </div>
            <GalleryGrid items={galleryItems} />
          </div>
        </section>
      )}
    </div>
  )
}

/** Gallery grid with dynamic category filter — items di-pass dari AboutView */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Pill kategori dibangun dinamis HANYA dari kategori yang punya foto
  // (termasuk bts/brand yang sebelumnya tidak muncul di pill)
  const cats = useMemo(() => {
    const present = CAT_ORDER.filter((c) => items.some((g) => g.category === c))
    const extra = [...new Set(items.map((g) => g.category))].filter((c) => !CAT_ORDER.includes(c))
    return [
      { key: 'all', label: 'Semua' },
      ...[...present, ...extra].map((c) => ({ key: c, label: CAT_LABELS[c] ?? c })),
    ]
  }, [items])

  const filtered = active === 'all' ? items : items.filter((g) => g.category === active)

  return (
    <>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Kategori galeri">
        {cats.map((cat) => (
          <button
            key={cat.key}
            type="button"
            role="tab"
            aria-selected={active === cat.key}
            onClick={() => setActive(cat.key)}
            className={cn(
              'min-h-[40px] shrink-0 rounded-full px-5 py-2 text-[13.5px] font-semibold transition-all duration-200',
              active === cat.key
                ? 'bg-forest text-cream shadow-[0_4px_14px_rgba(23,61,50,0.3)]'
                : 'bg-white text-forest/70 shadow-sm hover:bg-forest/5 hover:text-forest'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-[15px] text-forest/60">
          Belum ada foto pada kategori ini.
        </p>
      ) : (
        <>
          <div className="pt-stagger mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {filtered.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`Perbesar foto: ${g.title}`}
                className={cn(
                  'group relative cursor-zoom-in overflow-hidden rounded-2xl bg-white text-left shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(23,61,50,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                  i % 5 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                )}
              >
                <img
                  src={g.image}
                  alt={g.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <GalleryZoomHint />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent p-3 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="block text-[12.5px] font-bold text-cream">{g.title}</span>
                  {g.description && (
                    <span className="mt-0.5 line-clamp-2 block text-[11px] text-cream/75">{g.description}</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <GalleryLightbox items={filtered} index={lightbox} onIndexChange={setLightbox} />
        </>
      )}
    </>
  )
}
