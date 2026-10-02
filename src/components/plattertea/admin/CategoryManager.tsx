'use client'

import { useState } from 'react'
import type { Category } from '@/lib/plattertea'
import { useResource, StatusBadge, Field, TextInput, TextArea } from './shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

const EMPTY = { name: '', description: '', status: 'PUBLISHED', sortOrder: 0 }

export function CategoryManager() {
  const { items, loading, error, refresh, create, update, remove } = useResource<Category>('/api/admin/categories')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: items.length + 1 })
    setOpen(true)
  }
  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, description: c.description || '', status: c.status, sortOrder: c.sortOrder })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Nama kategori wajib diisi.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'Kategori diperbarui' : 'Kategori ditambahkan', description: form.name })
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
      toast({ title: 'Kategori dihapus', description: deleting.name })
      void refresh()
    } else {
      toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
    }
    setDeleting(null)
  }

  const count = (c: Category) => (c as unknown as { _count?: { products: number } })._count?.products

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">Kategori</h2>
          <p className="text-[12.5px] text-forest/55">Grup menu: Platter, Tea, Combo, dll.</p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-[13px] font-semibold text-destructive">{error}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-forest/10 bg-white p-4 shadow-[0_2px_10px_rgba(23,61,50,0.05)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-bold text-forest">{c.name}</p>
                  <StatusBadge status={c.status} />
                  <span className="rounded-full bg-sage-light px-2 py-0.5 text-[10.5px] font-bold text-forest/60">
                    {count(c) ?? 0} produk
                  </span>
                </div>
                {c.description && <p className="mt-0.5 truncate text-[12px] text-forest/55">{c.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(c)}
                  className="h-9 rounded-full border-forest/20 px-3.5 text-xs font-bold text-forest hover:bg-sage-light"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleting(c)}
                  className="h-9 rounded-full border-destructive/30 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                  aria-label={`Hapus ${c.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-forest">{editing ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
            <DialogDescription>Kategori memudahkan pengunjung memfilter menu.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <Field label="Nama Kategori" required>
              <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="cth. Combo" />
            </Field>
            <Field label="Deskripsi">
              <TextArea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="min-h-[70px]" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Urutan">
                <TextInput type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
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
            <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} akan dihapus. Produk dengan kategori ini tidak ikut terhapus, tapi perlu dipindahkan ke kategori lain.
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
