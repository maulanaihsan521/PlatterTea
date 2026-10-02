'use client'

// ============ Admin shared helpers, hooks & form primitives ============

import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Upload, X, Images, XCircle, CheckCircle2, FileArchive, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaPicker } from './MediaPicker'

// ===== API helper =====

export async function adminFetch<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string; status: number; lockedUntilSec?: number }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: init?.body instanceof FormData ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
    })
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean
      data?: T
      error?: string
      lockedUntilSec?: number
    }
    if (res.ok && json.success) return { ok: true, data: json.data, status: res.status }
    return {
      ok: false,
      error: json.error || 'Terjadi kesalahan.',
      status: res.status,
      lockedUntilSec: json.lockedUntilSec,
    }
  } catch {
    return { ok: false, error: 'Tidak dapat terhubung ke server.', status: 0 }
  }
}

// ===== CRUD resource hook =====

export function useResource<T extends { id: string }>(endpoint: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const res = await adminFetch<T[]>(endpoint)
    if (res.ok && Array.isArray(res.data)) {
      setItems(res.data)
      setError('')
    } else {
      setError(res.error || 'Gagal memuat data.')
    }
    setLoading(false)
  }, [endpoint])

  useEffect(() => {
    let mounted = true
    adminFetch<T[]>(endpoint).then((res) => {
      if (!mounted) return
      if (res.ok && Array.isArray(res.data)) setItems(res.data)
      else setError(res.error || 'Gagal memuat data.')
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [endpoint])

  const create = useCallback(
    async (payload: Record<string, unknown>) => adminFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(payload) }),
    [endpoint]
  )
  const update = useCallback(
    async (id: string, payload: Record<string, unknown>) =>
      adminFetch<T>(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    [endpoint]
  )
  const remove = useCallback(async (id: string) => adminFetch(`${endpoint}/${id}`, { method: 'DELETE' }), [endpoint])

  return { items, loading, error, refresh, create, update, remove }
}

// ===== Status badge =====

export function StatusBadge({ status }: { status: string }) {
  const variant: 'default' | 'secondary' | 'outline' | 'destructive' =
    status === 'PUBLISHED' ? 'default' : status === 'DRAFT' ? 'secondary' : status === 'ARCHIVED' ? 'outline' : 'destructive'
  return (
    <Badge variant={variant} className="text-[10px] font-bold uppercase tracking-wide">
      {status === 'PUBLISHED' ? 'Publik' : status === 'DRAFT' ? 'Draft' : status === 'ARCHIVED' ? 'Arsip' : 'Kadaluarsa'}
    </Badge>
  )
}

// ===== Form primitives =====

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-[13px] font-bold text-forest">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11.5px] leading-relaxed text-forest/50">{hint}</p>}
    </div>
  )
}

export function TextInput(props: React.ComponentProps<typeof Input>) {
  return <Input {...props} className={cn('h-10 rounded-xl border-forest/15 bg-white focus-visible:ring-gold/50', props.className)} />
}

export function TextArea(props: React.ComponentProps<typeof Textarea>) {
  return <Textarea {...props} className={cn('min-h-[88px] rounded-xl border-forest/15 bg-white focus-visible:ring-gold/50', props.className)} />
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-forest/10 bg-white px-4 py-3">
      <div>
        <p className="text-[13px] font-bold text-forest">{label}</p>
        {description && <p className="text-[11.5px] text-forest/55">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

// ===== Image upload field =====

export function ImageField({
  value,
  onChange,
  label = 'Gambar',
  aspect = 'aspect-video',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
  aspect?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const upload = async (file: File) => {
    setUploading(true)
    setErr('')
    const form = new FormData()
    form.append('file', file)
    const res = await adminFetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: form })
    if (res.ok && res.data?.url) onChange(res.data.url)
    else setErr(res.error || 'Gagal mengunggah gambar.')
    setUploading(false)
  }

  return (
    <Field label={label} hint="JPG/PNG/WEBP maks 5MB, atau tempel URL gambar.">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'relative flex w-36 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-forest/20 bg-sage-light/50 transition-colors hover:border-gold',
            aspect
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          aria-label="Pilih gambar"
        >
          {value ? (
            <>
              <img src={value} alt="Pratinjau" className="absolute inset-0 h-full w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-forest/80 text-white hover:bg-forest"
                aria-label="Hapus gambar"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-forest/50">
              <Upload className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Unggah</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <TextInput
            placeholder="/uploads/gambar.png atau https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void upload(f)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-forest/20 text-xs font-bold text-forest hover:bg-sage-light"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Mengunggah…' : 'Pilih File…'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-gold/50 text-xs font-bold text-gold-dark hover:bg-gold/10"
            onClick={() => setPickerOpen(true)}
          >
            <Images className="h-3.5 w-3.5" /> Pilih dari Media
          </Button>
          {err && <p className="text-[11.5px] font-semibold text-destructive">{err}</p>}
        </div>
      </div>

      {pickerOpen && <MediaPicker open onOpenChange={setPickerOpen} onSelect={onChange} />}
    </Field>
  )
}

// ===== Bulk selection toolbar =====

export interface BulkAction {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}

/** Toolbar melayang berisi aksi massal — tampil saat ada item terpilih. */
export function BulkBar({
  count,
  actions,
  onAction,
  onClear,
  busy,
}: {
  count: number
  actions: BulkAction[]
  onAction: (key: string) => void
  onClear: () => void
  busy?: boolean
}) {
  if (count === 0) return null
  return (
    <div
      className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 lg:bottom-8"
      role="toolbar"
      aria-label="Aksi massal"
    >
      <div className="flex max-w-full flex-wrap items-center gap-2 rounded-2xl bg-forest px-4 py-3 shadow-[0_12px_40px_rgba(23,61,50,0.45)]">
        <span className="mr-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-gold px-2 text-[12px] font-extrabold text-forest">
          {count}
        </span>
        <span className="mr-2 hidden text-[12.5px] font-bold text-cream/85 sm:inline">item dipilih</span>
        {actions.map(({ key, label, icon: Icon, className }) => (
          <Button
            key={key}
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => onAction(key)}
            className={cn(
              'h-9 rounded-full px-3.5 text-xs font-bold',
              className || 'bg-cream/10 text-cream hover:bg-cream/20'
            )}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
            {label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={onClear}
          className="h-9 rounded-full px-3 text-xs font-bold text-cream/60 hover:bg-transparent hover:text-cream"
          aria-label="Bersihkan pilihan"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/** Aksi baku untuk status konten (publik/draft/arsip + hapus). */
export const BULK_ACTIONS_CONTENT: BulkAction[] = [
  { key: 'publish', label: 'Publikasikan', icon: CheckCircle2, className: 'bg-sage text-white hover:bg-sage/90' },
  { key: 'draft', label: 'Jadikan Draft', icon: XCircle },
  { key: 'archive', label: 'Arsipkan', icon: FileArchive },
  { key: 'delete', label: 'Hapus', icon: Trash2, className: 'bg-destructive text-white hover:bg-destructive/90' },
]

export const BULK_ACTIONS_GALLERY: BulkAction[] = BULK_ACTIONS_CONTENT.filter((a) => a.key !== 'archive')

// ===== Drag-and-drop reorder =====

export interface ReorderItem {
  id: string
}

/**
 * Hook drag-and-drop reorder (HTML5 DnD) + fallback tombol naik/turun (aksesibel).
 * onCommit menerima urutan id final — kirim ke API reorder.
 */
export function useReorder<T extends ReorderItem>(items: T[]) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const onDragStart = useCallback((id: string) => {
    setDragId(id)
  }, [])

  const onDragEnter = useCallback((id: string) => {
    setOverId(id)
  }, [])

  const onDragEnd = useCallback(() => {
    setDragId(null)
    setOverId(null)
  }, [])

  /** Susun ulang array bila drag selesai di atas target. */
  const resolveNewOrder = useCallback(
    (targetId: string): T[] | null => {
      if (!dragId || dragId === targetId) return null
      const from = items.findIndex((i) => i.id === dragId)
      const to = items.findIndex((i) => i.id === targetId)
      if (from === -1 || to === -1) return null
      const next = [...items]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    },
    [dragId, items]
  )

  const onDrop = useCallback(
    (targetId: string, commit: (next: T[]) => void) => {
      const next = resolveNewOrder(targetId)
      onDragEnd()
      if (next) commit(next)
    },
    [resolveNewOrder, onDragEnd]
  )

  /** Geser item satu posisi (tombol ▲/▼ — aksesibel tanpa mouse). */
  const move = useCallback(
    (id: string, dir: -1 | 1): T[] | null => {
      const from = items.findIndex((i) => i.id === id)
      const to = from + dir
      if (from === -1 || to < 0 || to >= items.length) return null
      const next = [...items]
      const tmp = next[from]
      next[from] = next[to]
      next[to] = tmp
      return next
    },
    [items]
  )

  const persist = useCallback(
    async (next: T[], endpoint: string, refresh: () => void, toastFn: (t: { title: string; description?: string; variant?: 'destructive' }) => void) => {
      const ids = next.map((i) => i.id)
      // Optimistic: terapkan urutan baru di UI dulu — refresh() akan mengkonfirmasi dari server
      setSaving(true)
      const res = await adminFetch<{ affected: number }>(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ ids }),
      })
      setSaving(false)
      if (res.ok) {
        toastFn({ title: 'Urutan tampil disimpan' })
        refresh()
      } else {
        toastFn({ title: 'Gagal menyimpan urutan', description: res.error, variant: 'destructive' })
        refresh()
      }
    },
    []
  )

  return { dragId, overId, saving, onDragStart, onDragEnter, onDragEnd, onDrop, move, persist }
}

/** Handle pegangan drag (GripVertical) — indikator visual item bisa digeser. */
export function DragHandle({ dragging, className, ...props }: { dragging?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Geser untuk mengubah urutan"
      title="Tarik untuk mengubah urutan — atau gunakan tombol ▲▼"
      className={cn(
        'flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-forest/35 transition-colors hover:bg-sage-light hover:text-forest active:cursor-grabbing',
        dragging && 'opacity-40',
        className
      )}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <circle cx="4" cy="2" r="1.4" />
        <circle cx="10" cy="2" r="1.4" />
        <circle cx="4" cy="7" r="1.4" />
        <circle cx="10" cy="7" r="1.4" />
        <circle cx="4" cy="12" r="1.4" />
        <circle cx="10" cy="12" r="1.4" />
      </svg>
    </button>
  )
}
