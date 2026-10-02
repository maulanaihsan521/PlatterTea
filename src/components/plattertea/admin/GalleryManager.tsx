'use client'

import { useMemo, useState } from 'react'
import type { GalleryItem } from '@/lib/plattertea'
import { useResource, StatusBadge, Field, TextInput, TextArea, ImageField, BulkBar, BULK_ACTIONS_GALLERY, adminFetch, useReorder, DragHandle } from './shared'
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
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown, GripHorizontal } from 'lucide-react'

const EMPTY = { title: '', description: '', image: '', category: 'produk', status: 'PUBLISHED', sortOrder: 0 }

export function GalleryManager() {
  const { items, loading, error, refresh, create, update, remove } = useResource<GalleryItem>('/api/admin/gallery')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<GalleryItem | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkConfirm, setBulkConfirm] = useState<'delete' | null>(null)

  // ===== Reorder (drag-and-drop + tombol ▲▼) =====
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null)
  const [dragArmed, setDragArmed] = useState<string | null>(null)

  const displayed = useMemo(() => {
    if (!orderOverride) return items
    if (orderOverride.length === items.length && items.every((g) => orderOverride.includes(g.id))) {
      return orderOverride.map((id) => items.find((g) => g.id === id)!)
    }
    return items
  }, [items, orderOverride])

  const reorder = useReorder<GalleryItem>(displayed)

  const commitReorder = (next: GalleryItem[]) => {
    setOrderOverride(next.map((g) => g.id))
    void reorder.persist(next, '/api/admin/gallery/reorder', refresh, toast)
  }

  // ===== Bulk selection =====
  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const allSelected = items.length > 0 && items.every((g) => selected.has(g.id))
  const toggleAll = () => {
    setSelected((s) => {
      if (items.every((g) => s.has(g.id)) && items.length > 0) return new Set()
      return new Set(items.map((g) => g.id))
    })
  }

  const runBulk = async (action: string) => {
    if (action === 'delete') {
      setBulkConfirm('delete')
      return
    }
    setBulkBusy(true)
    const res = await adminFetch<{ affected: number }>('/api/admin/gallery/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ action, ids: Array.from(selected) }),
    })
    setBulkBusy(false)
    if (res.ok) {
      toast({ title: `${res.data?.affected ?? selected.size} foto ${action === 'publish' ? 'dipublikasikan' : 'dijadikan draft'}` })
      setSelected(new Set())
      void refresh()
    } else {
      toast({ title: 'Aksi massal gagal', description: res.error, variant: 'destructive' })
    }
  }

  const confirmBulkDelete = async () => {
    setBulkBusy(true)
    const res = await adminFetch<{ affected: number }>('/api/admin/gallery/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'delete', ids: Array.from(selected) }),
    })
    setBulkBusy(false)
    setBulkConfirm(null)
    if (res.ok) {
      toast({ title: `${res.data?.affected ?? selected.size} foto galeri dihapus` })
      setSelected(new Set())
      void refresh()
    } else {
      toast({ title: 'Aksi massal gagal', description: res.error, variant: 'destructive' })
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: displayed.length + 1 })
    setOpen(true)
  }
  const openEdit = (g: GalleryItem) => {
    setEditing(g)
    setForm({
      title: g.title,
      description: g.description || '',
      image: g.image,
      category: g.category,
      status: g.status,
      sortOrder: g.sortOrder,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Judul wajib diisi.', variant: 'destructive' })
      return
    }
    if (!form.image.trim()) {
      toast({ title: 'Gambar wajib diunggah atau isi URL-nya.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'Galeri diperbarui' : 'Foto galeri ditambahkan' })
      setOpen(false)
      void refresh()
    } else {
      toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' })
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    const res = await remove(deleting.id)
    if (res.ok) {
      toast({ title: 'Foto galeri dihapus' })
      void refresh()
    } else {
      toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
    }
    setDeleting(null)
  }

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">Galeri</h2>
          <p className="text-[12.5px] text-forest/55">Momen booth, produk, dan event PlatterTea.</p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark">
          <Plus className="h-4 w-4" /> Tambah Foto
        </Button>
      </div>

      {/* Select all + reorder hint */}
      {!loading && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-forest/15 bg-white px-3 text-[12.5px] font-bold text-forest">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              aria-label="Pilih semua foto"
            />
            Pilih semua
          </label>
          {displayed.length > 1 && (
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-forest/45">
              <GripHorizontal className="h-3.5 w-3.5" />
              Tarik pegangan ⠿ atau tekan ▲▼ pada foto untuk mengatur urutan tampil.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-[13px] font-semibold text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest/20 bg-white p-10 text-center">
          <p className="text-[13.5px] font-semibold text-forest/60">
            Galeri masih kosong. Tambahkan foto booth atau produk pertamamu!
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {displayed.map((g, idx) => {
            const isDragging = reorder.dragId === g.id
            const isOver = reorder.overId === g.id && !isDragging
            return (
            <li
              key={g.id}
              draggable={dragArmed === g.id}
              onDragStart={(e) => {
                reorder.onDragStart(g.id)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', g.id)
              }}
              onDragEnter={() => reorder.onDragEnter(g.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                reorder.onDrop(g.id, commitReorder)
              }}
              onDragEnd={reorder.onDragEnd}
              className={`group overflow-hidden rounded-2xl border bg-white shadow-[0_2px_10px_rgba(23,61,50,0.05)] transition-all duration-150 ${
                selected.has(g.id) ? 'border-gold ring-2 ring-gold/30' : 'border-forest/10'
              } ${isDragging ? 'opacity-40 border-dashed' : ''} ${isOver ? 'ring-2 ring-gold/50 border-gold' : ''} hover:shadow-[0_8px_22px_rgba(23,61,50,0.12)]`}
            >
              <div className="relative aspect-[4/3] bg-sage-light">
                {g.image && <img src={g.image} alt={g.title} className="h-full w-full object-cover" loading="lazy" />}
                <span className="absolute left-2 top-2 rounded-full bg-forest/85 px-2 py-0.5 text-[10px] font-bold capitalize text-cream">
                  {g.category}
                </span>
                <div className="absolute right-2 top-2">
                  <Checkbox
                    checked={selected.has(g.id)}
                    onCheckedChange={() => toggleSelect(g.id)}
                    aria-label={`Pilih ${g.title}`}
                    className="border-forest/30 bg-white/90 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-forest"
                  />
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-full bg-forest/80 px-1 py-0.5 backdrop-blur-sm transition-opacity">
                  <button
                    type="button"
                    disabled={idx === 0 || reorder.saving}
                    onClick={() => {
                      const next = reorder.move(g.id, -1)
                      if (next) commitReorder(next)
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-cream/80 transition-colors hover:bg-cream/20 hover:text-cream disabled:opacity-30"
                    aria-label={`Naikkan urutan ${g.title}`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <DragHandle
                    dragging={isDragging}
                    className="h-5 w-5 text-cream/80 hover:bg-cream/20 hover:text-forest"
                    onMouseDown={() => setDragArmed(g.id)}
                    onMouseUp={() => setDragArmed(null)}
                    onTouchStart={() => setDragArmed(g.id)}
                  />
                  <button
                    type="button"
                    disabled={idx === displayed.length - 1 || reorder.saving}
                    onClick={() => {
                      const next = reorder.move(g.id, 1)
                      if (next) commitReorder(next)
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-cream/80 transition-colors hover:bg-cream/20 hover:text-cream disabled:opacity-30"
                    aria-label={`Turunkan urutan ${g.title}`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-[13px] font-bold text-forest">{g.title}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <StatusBadge status={g.status} />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-forest/15 text-forest transition-colors hover:bg-sage-light"
                      aria-label={`Edit ${g.title}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(g)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-destructive/25 text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={`Hapus ${g.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
            )
          })}
        </ul>
      )}

      {/* Bulk toolbar */}
      <BulkBar count={selected.size} actions={BULK_ACTIONS_GALLERY} onAction={runBulk} onClear={() => setSelected(new Set())} busy={bulkBusy} />

      {/* Bulk delete confirm */}
      <AlertDialog open={bulkConfirm === 'delete'} onOpenChange={(v) => !v && setBulkConfirm(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus foto terpilih?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected.size} foto galeri akan dihapus. Tindakan ini tidak bisa dibatalkan.
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-forest">{editing ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}</DialogTitle>
            <DialogDescription>Foto tampil di halaman Tentang Kami.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <Field label="Judul" required>
              <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="cth. Booth di Market Days" />
            </Field>
            <ImageField value={form.image} onChange={(v) => set('image', v)} label="Foto" />
            <Field label="Deskripsi">
              <TextArea value={form.description} onChange={(e) => set('description', e.target.value)} className="min-h-[70px]" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kategori">
                <Select value={form.category} onValueChange={(v) => set('category', v)}>
                  <SelectTrigger className="h-10 rounded-xl border-forest/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produk">Produk</SelectItem>
                    <SelectItem value="booth">Booth</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Urutan">
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
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full border-forest/20 font-bold text-forest">
              Batal
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-forest font-bold text-cream hover:bg-forest-dark">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus foto?</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.title} akan dihapus dari galeri.</AlertDialogDescription>
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
