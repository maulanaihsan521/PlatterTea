'use client'

import { useMemo, useState } from 'react'
import type { Product, Category } from '@/lib/plattertea'
import { formatRupiah } from '@/lib/plattertea'
import { useResource, StatusBadge, Field, TextInput, TextArea, ToggleField, ImageField, BulkBar, BULK_ACTIONS_CONTENT, useReorder, DragHandle } from './shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Loader2, Search, Star, ArrowUp, ArrowDown, GripHorizontal } from 'lucide-react'
import { adminFetch } from './shared'

const EMPTY = {
  name: '',
  categoryId: '',
  price: 0,
  shortDesc: '',
  fullDesc: '',
  composition: '',
  mainImage: '',
  featured: false,
  status: 'PUBLISHED',
  sortOrder: 0,
  portion: '1 orang',
}

type FormState = typeof EMPTY

export function ProductManager() {
  const { items, loading, error, refresh, create, update, remove } = useResource<Product>('/api/admin/products')
  const { items: categories } = useResource<Category>('/api/admin/categories')
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState<'delete' | null>(null)

  // ===== Reorder (drag-and-drop + tombol ▲▼) =====
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null)
  const [dragArmed, setDragArmed] = useState<string | null>(null)

  const displayed = useMemo(() => {
    const base = items
    if (!orderOverride) return base
    // override hanya berlaku bila kumpulan id masih sama (stale otomatis gugur)
    if (orderOverride.length === base.length && base.every((p) => orderOverride.includes(p.id))) {
      return orderOverride.map((id) => base.find((p) => p.id === id)!)
    }
    return base
  }, [items, orderOverride])

  const reorder = useReorder<Product>(displayed)

  const commitReorder = (next: Product[]) => {
    setOrderOverride(next.map((p) => p.id))
    void reorder.persist(next, '/api/admin/products/reorder', refresh, toast)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return displayed
    return displayed.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category?.name || '').toLowerCase().includes(q)
    )
  }, [displayed, query])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: displayed.length + 1 })
    setDialogOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      categoryId: p.categoryId || '',
      price: p.price,
      shortDesc: p.shortDesc || '',
      fullDesc: p.fullDesc || '',
      composition: p.composition || '',
      mainImage: p.mainImage || '',
      featured: p.featured,
      status: p.status,
      sortOrder: p.sortOrder,
      portion: p.portion || '',
    })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Nama produk wajib diisi.', variant: 'destructive' })
      return
    }
    if (Number(form.price) < 0 || !Number.isFinite(Number(form.price))) {
      toast({ title: 'Harga tidak valid.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = { ...form, price: Number(form.price), sortOrder: Number(form.sortOrder) || 0 }
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'Produk diperbarui' : 'Produk ditambahkan', description: form.name })
      setDialogOpen(false)
      void refresh()
    } else {
      toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' })
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    const res = await remove(deleting.id)
    if (res.ok) {
      toast({ title: 'Produk dihapus', description: deleting.name })
      void refresh()
    } else {
      toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
    }
    setDeleting(null)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  // ===== Bulk selection =====
  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id))
  const toggleAll = () => {
    setSelected((s) => {
      if (filtered.every((p) => s.has(p.id)) && filtered.length > 0) {
        const next = new Set(s)
        filtered.forEach((p) => next.delete(p.id))
        return next
      }
      const next = new Set(s)
      filtered.forEach((p) => next.add(p.id))
      return next
    })
  }

  const runBulk = async (action: string) => {
    if (action === 'delete') {
      setBulkConfirm('delete')
      return
    }
    setBulkBusy(true)
    const res = await adminFetch<{ affected: number }>('/api/admin/products/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ action, ids: Array.from(selected) }),
    })
    setBulkBusy(false)
    if (res.ok) {
      const label = action === 'publish' ? 'dipublikasikan' : action === 'draft' ? 'dijadikan draft' : 'diarsipkan'
      toast({ title: `${res.data?.affected ?? selected.size} produk ${label}` })
      setSelected(new Set())
      void refresh()
    } else {
      toast({ title: 'Aksi massal gagal', description: res.error, variant: 'destructive' })
    }
  }

  const confirmBulkDelete = async () => {
    setBulkBusy(true)
    const res = await adminFetch<{ affected: number }>('/api/admin/products/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'delete', ids: Array.from(selected) }),
    })
    setBulkBusy(false)
    setBulkConfirm(null)
    if (res.ok) {
      toast({ title: `${res.data?.affected ?? selected.size} produk dihapus` })
      setSelected(new Set())
      void refresh()
    } else {
      toast({ title: 'Aksi massal gagal', description: res.error, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">Produk</h2>
          <p className="text-[12.5px] text-forest/55">Kelola menu Platter & Tea yang tampil di website.</p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark">
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {/* Search + select all */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <TextInput
            placeholder="Cari produk atau kategori…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            aria-label="Cari produk"
          />
        </div>
        {!loading && filtered.length > 0 && (
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-forest/15 bg-white px-3 text-[12.5px] font-bold text-forest">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              aria-label="Pilih semua produk"
            />
            Pilih semua
          </label>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-[13px] font-semibold text-destructive">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest/20 bg-white p-10 text-center">
          <p className="text-[13.5px] font-semibold text-forest/60">
            {query ? 'Tidak ada produk yang cocok dengan pencarian.' : 'Belum ada produk. Klik “Tambah Produk” untuk mulai.'}
          </p>
        </div>
      ) : (
        <>
        {!query && displayed.length > 1 && (
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-forest/45">
            <GripHorizontal className="h-3.5 w-3.5" />
            Tarik pegangan ⠿ atau tekan tombol ▲▼ untuk mengatur urutan tampil di menu.
          </p>
        )}
        <ul className="space-y-3">
          {filtered.map((p, idx) => {
            const isDragging = reorder.dragId === p.id
            const isOver = reorder.overId === p.id && !isDragging
            return (
            <li
              key={p.id}
              draggable={dragArmed === p.id && !query}
              onDragStart={(e) => {
                reorder.onDragStart(p.id)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', p.id)
              }}
              onDragEnter={() => reorder.onDragEnter(p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (query) return
                reorder.onDrop(p.id, commitReorder)
              }}
              onDragEnd={reorder.onDragEnd}
              className={`flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-[0_2px_10px_rgba(23,61,50,0.05)] transition-all duration-150 sm:flex-row sm:items-center ${
                selected.has(p.id) ? 'border-gold bg-gold/[0.06]' : 'border-forest/10'
              } ${isDragging ? 'opacity-40 border-dashed' : ''} ${isOver ? 'ring-2 ring-gold/50 border-gold' : ''} hover:shadow-[0_6px_18px_rgba(23,61,50,0.09)]`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Checkbox
                  checked={selected.has(p.id)}
                  onCheckedChange={() => toggleSelect(p.id)}
                  aria-label={`Pilih ${p.name}`}
                  className="shrink-0 border-forest/30 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-forest"
                />
                {!query && (
                  <div className="flex shrink-0 flex-col items-center">
                    <button
                      type="button"
                      disabled={idx === 0 || reorder.saving}
                      onClick={() => {
                        const next = reorder.move(p.id, -1)
                        if (next) commitReorder(next)
                      }}
                      className="flex h-5 w-6 items-center justify-center rounded text-forest/40 transition-colors hover:bg-sage-light hover:text-forest disabled:opacity-20 disabled:hover:bg-transparent"
                      aria-label={`Naikkan urutan ${p.name}`}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <DragHandle
                      dragging={isDragging}
                      onMouseDown={() => setDragArmed(p.id)}
                      onMouseUp={() => setDragArmed(null)}
                      onTouchStart={() => setDragArmed(p.id)}
                    />
                    <button
                      type="button"
                      disabled={idx === filtered.length - 1 || reorder.saving}
                      onClick={() => {
                        const next = reorder.move(p.id, 1)
                        if (next) commitReorder(next)
                      }}
                      className="flex h-5 w-6 items-center justify-center rounded text-forest/40 transition-colors hover:bg-sage-light hover:text-forest disabled:opacity-20 disabled:hover:bg-transparent"
                      aria-label={`Turunkan urutan ${p.name}`}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sage-light">
                  {p.mainImage ? (
                    <img src={p.mainImage} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-bold text-forest/30">—</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-forest">{p.name}</p>
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gold-dark">
                        <Star className="h-2.5 w-2.5 fill-current" /> Favorit
                      </span>
                    )}
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-forest/55">
                    {p.category?.name || 'Tanpa kategori'} · {formatRupiah(p.price)} · Urutan {p.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(p)}
                  className="h-9 rounded-full border-forest/20 px-3.5 text-xs font-bold text-forest hover:bg-sage-light"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleting(p)}
                  className="h-9 rounded-full border-destructive/30 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                  aria-label={`Hapus ${p.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
            )
          })}
        </ul>
        </>
      )}

      {/* Bulk toolbar */}
      <BulkBar count={selected.size} actions={BULK_ACTIONS_CONTENT} onAction={runBulk} onClear={() => setSelected(new Set())} busy={bulkBusy} />

      {/* Bulk delete confirm */}
      <AlertDialog open={bulkConfirm === 'delete'} onOpenChange={(v) => !v && setBulkConfirm(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk terpilih?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected.size} produk akan dihapus permanen dari menu website. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="rounded-full bg-destructive font-bold text-white hover:bg-destructive/90">
              Ya, Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-forest">{editing ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
            <DialogDescription>
              {editing ? `Perbarui detail untuk ${editing.name}.` : 'Isi detail produk baru untuk menu website.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <Field label="Nama Produk" required>
              <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="cth. Platter Only" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori">
                <Select value={form.categoryId || undefined} onValueChange={(v) => set('categoryId', v)}>
                  <SelectTrigger className="h-10 rounded-xl border-forest/15">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Harga (Rp)" required>
                <TextInput
                  type="number"
                  min={0}
                  value={form.price || ''}
                  onChange={(e) => set('price', Number(e.target.value))}
                  placeholder="15000"
                />
              </Field>
            </div>

            <Field label="Deskripsi Singkat" hint="Tampil di card menu (maks ~2 baris).">
              <TextArea value={form.shortDesc} onChange={(e) => set('shortDesc', e.target.value)} placeholder="Mix Platter dengan kentang goreng…" />
            </Field>

            <Field label="Deskripsi Lengkap">
              <TextArea value={form.fullDesc} onChange={(e) => set('fullDesc', e.target.value)} className="min-h-[110px]" />
            </Field>

            <Field label="Komposisi" hint="Satu item per baris.">
              <TextArea value={form.composition} onChange={(e) => set('composition', e.target.value)} placeholder={'Kentang Goreng\nSosis\nSaus Mayones'} />
            </Field>

            <ImageField value={form.mainImage} onChange={(v) => set('mainImage', v)} label="Gambar Utama" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Porsi">
                <TextInput value={form.portion} onChange={(e) => set('portion', e.target.value)} placeholder="1 orang" />
              </Field>
              <Field label="Urutan Tampil">
                <TextInput type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
              </Field>
            </div>

            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger className="h-10 rounded-xl border-forest/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Publik</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <ToggleField
              label="Tandai sebagai Favorit"
              description="Menampilkan badge FAVORIT emas di card menu."
              checked={form.featured}
              onChange={(v) => set('featured', v)}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full border-forest/20 font-bold text-forest">
              Batal
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-forest font-bold text-cream hover:bg-forest-dark">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} akan dihapus permanen dari menu website. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-destructive font-bold text-white hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
