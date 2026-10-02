'use client'

// ============ Aktivitas Admin — audit log viewer ============

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { adminFetch } from './shared'
import { cn } from '@/lib/utils'
import {
  History,
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  ShieldX,
  Upload,
  Search,
  ChevronDown,
  Loader2,
  Eraser,
  Inbox,
  KeyRound,
} from 'lucide-react'

interface AuditItem {
  id: string
  userId: string | null
  userName: string | null
  userEmail: string | null
  action: string
  entity: string
  entityId: string | null
  entityLabel: string | null
  detail: string | null
  createdAt: string
}

interface AuditPage {
  items: AuditItem[]
  page: number
  total: number
  totalPages: number
  hasMore: boolean
}

const ACTION_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string; dot: string }
> = {
  CREATE: { label: 'Buat', icon: Plus, badge: 'bg-forest text-cream', dot: 'bg-forest' },
  UPDATE: { label: 'Ubah', icon: Pencil, badge: 'bg-gold text-forest', dot: 'bg-gold' },
  DELETE: { label: 'Hapus', icon: Trash2, badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  LOGIN: { label: 'Masuk', icon: LogIn, badge: 'bg-sage-light text-forest', dot: 'bg-sage' },
  LOGIN_FAILED: { label: 'Gagal Masuk', icon: ShieldX, badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive/70' },
  LOGOUT: { label: 'Keluar', icon: LogOut, badge: 'bg-forest/10 text-forest', dot: 'bg-forest/50' },
  IMPORT: { label: 'Import', icon: Upload, badge: 'bg-gold-light text-forest', dot: 'bg-gold-light' },
  PASSWORD_RESET_REQUEST: { label: 'Link Reset', icon: KeyRound, badge: 'bg-gold/20 text-gold-dark', dot: 'bg-gold' },
  PASSWORD_RESET: { label: 'Reset Password', icon: KeyRound, badge: 'bg-sage-light text-forest', dot: 'bg-sage' },
  PASSWORD_RESET_FAILED: { label: 'Reset Gagal', icon: ShieldX, badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive/70' },
  MEDIA_DELETE: { label: 'Hapus Media', icon: Trash2, badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
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
  Data: 'Data (Backup)',
  Auth: '',
  Media: 'Media',
}

const ACTION_VERB: Record<string, string> = {
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
  MEDIA_DELETE: 'menghapus file media',
}

const FILTERS: { key: string; label: string }[] = [
  { key: '', label: 'Semua' },
  { key: 'CREATE', label: 'Buat' },
  { key: 'UPDATE', label: 'Ubah' },
  { key: 'DELETE', label: 'Hapus' },
  { key: 'LOGIN', label: 'Masuk' },
  { key: 'LOGIN_FAILED', label: 'Gagal Masuk' },
  { key: 'IMPORT', label: 'Import' },
  { key: 'PASSWORD_RESET', label: 'Reset Password' },
  { key: 'MEDIA_DELETE', label: 'Media' },
]

// Waktu relatif Bahasa Indonesia
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDetail(item: AuditItem): string | null {
  if (!item.detail) return null
  try {
    return JSON.stringify(JSON.parse(item.detail), null, 2)
  } catch {
    return item.detail
  }
}

function ActivityRow({ item }: { item: AuditItem }) {
  const [open, setOpen] = useState(false)
  const meta = ACTION_META[item.action] || ACTION_META.UPDATE
  const Icon = meta.icon
  const detail = formatDetail(item)
  const hasDetail = !!detail && detail !== 'null'

  return (
    <li className="relative flex gap-3.5">
      {/* timeline dot */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-cream',
            meta.badge
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="mt-1 w-px flex-1 bg-forest/10" aria-hidden />
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-[13.5px] font-extrabold text-forest">
            {item.userName || 'Anonim'}
          </p>
          <span className="text-[11.5px] text-forest/45">{item.userEmail}</span>
          <span className="ml-auto shrink-0 text-[11px] font-semibold text-forest/40">
            {relativeTime(item.createdAt)}
          </span>
        </div>

        <p className="mt-0.5 text-[13px] leading-relaxed text-forest/75">
          <span className="font-bold">{ACTION_VERB[item.action] || meta.label.toLowerCase()}</span>
          {item.entity !== 'Auth' && (
            <>
              {' '}
              {ENTITY_LABEL[item.entity] || item.entity}
            </>
          )}
          {item.entityLabel && (
            <>
              {' — '}
              <span className="font-semibold text-forest">{item.entityLabel}</span>
            </>
          )}
        </p>

        {hasDetail && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="mt-1 inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 text-[11.5px] font-bold text-forest/55 transition-colors hover:bg-sage-light hover:text-forest"
            >
              Detail
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
            </button>
            {open && (
              <pre className="mt-1.5 max-h-56 overflow-auto rounded-xl bg-forest p-3.5 text-[11px] leading-relaxed text-cream/90">
                {detail}
              </pre>
            )}
          </>
        )}
      </div>
    </li>
  )
}

export function AuditManager({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  // pages === null → sedang memuat
  const [pages, setPages] = useState<AuditPage[] | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [clearing, setClearing] = useState(false)

  const buildParams = useCallback(
    (action: string, q: string, page: number) => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (action) params.set('action', action)
      if (q) params.set('q', q)
      return params.toString()
    },
    []
  )

  const fetchPage = useCallback(
    async (action: string, q: string, page: number): Promise<AuditPage | null> => {
      const res = await adminFetch<AuditPage>(`/api/admin/audit?${buildParams(action, q, page)}`)
      if (res.ok && res.data) {
        setError('')
        return res.data
      }
      setError(res.error || 'Gagal memuat aktivitas.')
      return null
    },
    [buildParams]
  )

  useEffect(() => {
    let mounted = true
    const params = buildParams(filter, query, 1)
    adminFetch<AuditPage>(`/api/admin/audit?${params}`).then((res) => {
      if (!mounted) return
      if (res.ok && res.data) {
        setError('')
        setPages([res.data])
      } else {
        setError(res.error || 'Gagal memuat aktivitas.')
        setPages([])
      }
    })
    return () => {
      mounted = false
    }
  }, [filter, query, buildParams])

  const loadMore = async () => {
    if (!pages || pages.length === 0) return
    const next = pages[pages.length - 1].page + 1
    setLoadingMore(true)
    const p = await fetchPage(filter, query, next)
    if (p) setPages((prev) => (prev ? [...prev, p] : [p]))
    setLoadingMore(false)
  }

  const clearLogs = async () => {
    setClearing(true)
    await adminFetch('/api/admin/audit', { method: 'DELETE' })
    setPages(null)
    const p = await fetchPage(filter, query, 1)
    setPages(p ? [p] : [])
    setClearing(false)
  }

  const items = useMemo(() => pages?.flatMap((p) => p.items) ?? [], [pages])
  const total = pages?.[0]?.total ?? 0
  const hasMore = !!pages && pages.length > 0 && pages[pages.length - 1].hasMore
  const loading = pages === null

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest">Aktivitas Admin</h2>
          <p className="mt-0.5 text-[13px] text-forest/60">
            {isSuperAdmin
              ? 'Riwayat semua perubahan konten & login di CMS.'
              : 'Riwayat aktivitasmu di CMS.'}
          </p>
        </div>
        {isSuperAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={clearing || items.length === 0}
                className="h-9 rounded-full border-destructive/25 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                <Eraser className="h-3.5 w-3.5" /> Bersihkan Log
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-forest">Bersihkan semua log aktivitas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Seluruh riwayat aktivitas admin akan dihapus permanen ({total} entri). Tindakan ini
                  tidak bisa dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearLogs}
                  className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                >
                  Ya, Bersihkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Filter pills + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter aktivitas">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={cn(
                'min-h-[36px] rounded-full px-3.5 text-[12px] font-bold transition-all duration-150',
                filter === f.key
                  ? 'bg-forest text-cream shadow-[0_3px_10px_rgba(23,61,50,0.25)]'
                  : 'bg-white text-forest/60 hover:bg-sage-light hover:text-forest'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-56">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-forest/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari aktivitas…"
            aria-label="Cari aktivitas"
            className="h-10 w-full rounded-xl border border-forest/15 bg-white pl-9 pr-3 text-[13px] text-forest placeholder:text-forest/35 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>
      </div>

      <Card className="rounded-2xl border-forest/10 shadow-[0_2px_12px_rgba(23,61,50,0.05)]">
        <CardContent className="p-5 sm:p-6">
          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3.5">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="py-8 text-center text-[13px] font-semibold text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-forest/40">
              <Inbox className="h-10 w-10" />
              <p className="text-[13.5px] font-bold">Belum ada aktivitas tercatat.</p>
              <p className="max-w-xs text-center text-[12px] text-forest/40">
                Setiap perubahan konten, login, dan import backup akan otomatis tercatat di sini.
              </p>
            </div>
          ) : (
            <ul className="list-none" aria-label="Daftar aktivitas">
              {items.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ul>
          )}

          {hasMore && !loading && (
            <div className="mt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={loadingMore}
                className="h-10 rounded-full border-forest/20 px-6 text-xs font-bold text-forest hover:bg-sage-light"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat…
                  </>
                ) : (
                  <>
                    <History className="h-3.5 w-3.5" /> Muat Lebih Banyak
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
