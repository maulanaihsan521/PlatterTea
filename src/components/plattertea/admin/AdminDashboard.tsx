'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { adminFetch } from './shared'
import { Leaf, LeafPair } from '../Decor'
import { cn } from '@/lib/utils'
import {
  Package,
  FileClock,
  BadgePercent,
  Images,
  MessageSquareQuote,
  HelpCircle,
  ArrowUpRight,
  History,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  Upload,
  Inbox,
  KeyRound,
  ShieldX,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from 'lucide-react'

interface Stats {
  totalProducts: number
  activeProducts: number
  draftProducts: number
  promotions: number
  gallery: number
  testimonials: number
  faqs: number
  activity7d?: { date: string; label: string; total: number }[]
}

interface RecentActivity {
  id: string
  userName: string | null
  action: string
  entity: string
  entityLabel: string | null
  createdAt: string
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGIN_FAILED: ShieldX,
  LOGOUT: LogIn,
  IMPORT: Upload,
  PASSWORD_RESET_REQUEST: KeyRound,
  PASSWORD_RESET: KeyRound,
  PASSWORD_RESET_FAILED: ShieldX,
  PASSWORD_CHANGE: KeyRound,
}

const ACTIVITY_LABEL: Record<string, string> = {
  CREATE: 'menambahkan',
  UPDATE: 'mengubah',
  DELETE: 'menghapus',
  LOGIN: 'masuk ke CMS',
  LOGIN_FAILED: 'gagal masuk ke CMS',
  LOGOUT: 'keluar dari CMS',
  IMPORT: 'memulihkan data dari',
  PASSWORD_RESET_REQUEST: 'membuat link reset password untuk',
  PASSWORD_RESET: 'mengganti password (via token reset) —',
  PASSWORD_RESET_FAILED: 'gagal reset password —',
  PASSWORD_CHANGE: 'mengganti password akunnya sendiri',
}

const ENTITY_LABEL: Record<string, string> = {
  Product: 'Produk',
  Category: 'Kategori',
  Promotion: 'Promo',
  Testimonial: 'Testimoni',
  Faq: 'FAQ',
  Gallery: 'Galeri',
  Settings: 'Pengaturan',
  User: 'User Admin',
  Data: 'Backup',
  Auth: '',
}

function activityTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'baru saja'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

const QUICK_LINKS: { statsKey: keyof Stats; label: string; section: string; icon: React.ComponentType<{ className?: string }>; tile: string }[] = [
  { statsKey: 'totalProducts', label: 'Produk', section: 'products', icon: Package, tile: 'bg-gold/20 text-gold-dark' },
  { statsKey: 'promotions', label: 'Promo Aktif', section: 'promotions', icon: BadgePercent, tile: 'bg-sage-light text-forest' },
  { statsKey: 'gallery', label: 'Galeri', section: 'gallery', icon: Images, tile: 'bg-forest/10 text-forest' },
  { statsKey: 'testimonials', label: 'Testimoni', section: 'testimonials', icon: MessageSquareQuote, tile: 'bg-gold/15 text-gold-dark' },
  { statsKey: 'faqs', label: 'FAQ', section: 'faqs', icon: HelpCircle, tile: 'bg-sage-light text-forest' },
  { statsKey: 'draftProducts', label: 'Produk Draft', section: 'products', icon: FileClock, tile: 'bg-forest/[0.07] text-forest/70' },
]

export function AdminDashboard({
  userName,
  onNavigate,
  isSuperAdmin = false,
}: {
  userName: string
  onNavigate: (section: string) => void
  isSuperAdmin?: boolean
}) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<RecentActivity[] | null>(null)
  const [failedLogins, setFailedLogins] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    adminFetch<Stats>('/api/admin/stats').then((res) => {
      if (!mounted) return
      if (res.ok && res.data) setStats(res.data)
      setLoading(false)
    })
    adminFetch<{ items: RecentActivity[] }>('/api/admin/audit?limit=5').then((res) => {
      if (!mounted) return
      if (res.ok && res.data) setRecent(res.data.items)
    })
    if (isSuperAdmin) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      adminFetch<{ total: number }>(
        `/api/admin/audit?action=LOGIN_FAILED&limit=1&since=${encodeURIComponent(since)}`
      ).then((res) => {
        if (!mounted) return
        if (res.ok && res.data) setFailedLogins(res.data.total)
      })
    }
    return () => {
      mounted = false
    }
  }, [isSuperAdmin])

  // Sapaan mengikuti WIB (Asia/Jakarta) — audiens admin selalu Indonesia
  const hour = parseInt(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).format(new Date()),
    10
  )
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest to-forest-light p-6 sm:p-8">
        <LeafPair className="absolute -right-6 -top-6 h-24 w-32 rotate-12 text-forest-light/25" />
        <Leaf className="absolute -bottom-3 right-24 h-10 w-16 -rotate-12 text-gold/20" />
        {/* Maskot si Box mengintip dari kanan banner (sembunyi di layar sempit agar tidak ramai) */}
        <img
          src="/brand/mascot-point.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute bottom-0 right-4 hidden h-24 w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)] pt-float md:block lg:right-8 lg:h-28"
        />
        <p className="font-hand text-2xl text-gold-light">{greeting},</p>
        <h2 className="mt-0.5 text-xl font-extrabold text-cream sm:text-2xl md:max-w-[calc(100%-7rem)]">{userName} 👋</h2>
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-cream/65">
          Kelola menu, promo, dan konten website PlatterTea dari satu tempat. Semua perubahan
          langsung tampil di halaman publik.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button
            size="sm"
            onClick={() => onNavigate('products')}
            className="h-9 rounded-full bg-gold text-xs font-bold text-forest hover:bg-gold-light"
          >
            Kelola Produk <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('settings')}
            className="h-9 rounded-full border-cream/30 bg-transparent text-xs font-bold text-cream hover:bg-cream/10 hover:text-cream"
          >
            Pengaturan Website
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-[15px] font-extrabold text-forest">Ringkasan Konten</h3>
        {loading ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_LINKS.map(({ statsKey, label, section, icon: Icon, tile }) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate(section)}
                className="group text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <Card className="h-full rounded-2xl border-forest/10 shadow-[0_2px_12px_rgba(23,61,50,0.06)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_24px_rgba(23,61,50,0.12)]">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110', tile)}>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="text-2xl font-extrabold tabular-nums tracking-tight text-forest">
                      {stats ? stats[statsKey] : '—'}
                    </p>
                    <p className="text-[11.5px] font-bold uppercase tracking-wide text-forest/50">{label}</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aktivitas 7 hari — mini bar chart (data dari /api/admin/stats, bucket WIB) */}
      <Card className="rounded-2xl border-forest/10 shadow-[0_2px_12px_rgba(23,61,50,0.05)]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-forest">
              <Activity className="h-4.5 w-4.5 text-gold-dark" /> Aktivitas 7 Hari Terakhir
            </h3>
            {stats?.activity7d && (
              <span className="rounded-full bg-sage-light px-3 py-1 text-[11.5px] font-extrabold tabular-nums text-forest">
                {stats.activity7d.reduce((s, d) => s + d.total, 0)} aksi
              </span>
            )}
          </div>
          {stats?.activity7d ? (
            <div className="mt-4 flex items-end gap-2 sm:gap-3" role="img" aria-label="Grafik jumlah aktivitas CMS per hari, tujuh hari terakhir">
              {stats.activity7d.map((d, i) => {
                const max = Math.max(...stats.activity7d!.map((x) => x.total), 1)
                const h = Math.round((d.total / max) * 100)
                const isToday = i === stats.activity7d!.length - 1
                return (
                  <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                    <span className={cn('text-[10.5px] font-extrabold tabular-nums', d.total > 0 ? 'text-forest' : 'text-forest/30')}>
                      {d.total}
                    </span>
                    <div className="flex h-20 w-full items-end overflow-hidden rounded-lg bg-sage-light/50 sm:h-24">
                      <div
                        className={cn(
                          'w-full rounded-lg transition-all duration-500 pt-fade-up',
                          isToday ? 'bg-gold' : 'bg-forest/60'
                        )}
                        style={{ height: `${d.total > 0 ? Math.max(h, 8) : 4}%` }}
                        title={`${d.label}: ${d.total} aktivitas`}
                      />
                    </div>
                    <span className={cn('text-[10.5px] font-bold', isToday ? 'text-gold-dark' : 'text-forest/45')}>
                      {d.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <Skeleton className="mt-4 h-24 rounded-xl" />
          )}
        </CardContent>
      </Card>

      {/* Security strip (Super Admin) — gagal login 24 jam */}
      {isSuperAdmin && failedLogins !== null && (
        <button
          type="button"
          onClick={() => onNavigate('audit')}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
            failedLogins === 0 && 'bg-emerald-50 text-emerald-800',
            failedLogins > 0 && failedLogins < 5 && 'bg-gold/15 text-gold-dark',
            failedLogins >= 5 && 'bg-destructive/10 text-destructive'
          )}
        >
          {failedLogins === 0 ? (
            <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert
              className={cn('h-4.5 w-4.5 shrink-0', failedLogins >= 5 ? 'text-destructive' : 'text-gold-dark')}
            />
          )}
          <p className="min-w-0 flex-1 text-[12.5px] font-semibold leading-snug">
            {failedLogins === 0 && (
              <>Aman — tidak ada percobaan masuk gagal dalam 24 jam terakhir.</>
            )}
            {failedLogins > 0 && failedLogins < 5 && (
              <>
                <strong>{failedLogins} percobaan masuk gagal</strong> dalam 24 jam terakhir.
              </>
            )}
            {failedLogins >= 5 && (
              <>
                <strong>{failedLogins} percobaan masuk gagal</strong> dalam 24 jam — kemungkinan
                upaya tidak sah. Akun dengan 5 kegagalan terkunci otomatis 15 menit.
              </>
            )}
          </p>
          <span className="shrink-0 text-[11.5px] font-bold">Lihat Aktivitas →</span>
        </button>
      )}

      {/* Recent activity + info card — minmax(0,…) mencegah label panjang memaksa track melebar (overflow mobile) */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 rounded-2xl border-forest/10 shadow-[0_2px_12px_rgba(23,61,50,0.05)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-forest">
                <History className="h-4.5 w-4.5 text-gold-dark" /> Aktivitas Terbaru
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('audit')}
                className="min-h-[32px] rounded-full px-3 text-[11.5px] font-bold text-forest/55 transition-colors hover:bg-sage-light hover:text-forest"
              >
                Lihat Semua →
              </button>
            </div>

            {recent === null ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full rounded-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-sage-light/60 p-4 text-forest/50">
                <Inbox className="h-5 w-5 shrink-0" />
                <p className="text-[12.5px] font-semibold">
                  Belum ada aktivitas. Mulai ubah konten dan riwayatnya muncul di sini.
                </p>
              </div>
            ) : (
              <ul className="mt-3.5 space-y-0" aria-label="Aktivitas terbaru">
                {recent.map((a, i) => {
                  const Icon = ACTIVITY_ICONS[a.action] || Pencil
                  const label = ACTIVITY_LABEL[a.action] || a.action.toLowerCase()
                  const isAuth = a.entity === 'Auth'
                  const entity = ENTITY_LABEL[a.entity] || a.entity
                  return (
                    <li
                      key={a.id}
                      className={cn(
                        'flex items-center gap-3 py-2.5',
                        i > 0 && 'border-t border-forest/[0.07]'
                      )}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest">
                        <Icon className="h-3 w-3" />
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[12.5px] leading-relaxed text-forest/75">
                        <span className="font-extrabold text-forest">
                          {a.userName || 'Anonim'}
                        </span>{' '}
                        {label}
                        {!isAuth && entity && ` ${entity}`}
                        {a.entityLabel && ' —'}{' '}
                        {a.entityLabel && (
                          <span className="font-bold text-forest">{a.entityLabel}</span>
                        )}
                      </p>
                      <span className="shrink-0 text-[10.5px] font-semibold text-forest/40">
                        {activityTime(a.createdAt)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit min-w-0 rounded-2xl border-gold/25 bg-gold/[0.07]">
          <CardContent className="flex items-start gap-3 p-5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
              <HelpCircle className="h-4.5 w-4.5" />
            </span>
            <div className="text-[13px] leading-relaxed text-forest/75">
              <p className="font-extrabold text-forest">Ingat aturan brand:</p>
              Website PlatterTea <strong>tidak memproses transaksi</strong>. Semua pemesanan tetap
              melalui WhatsApp dan booth. CMS hanya untuk mengelola konten tampilan.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
