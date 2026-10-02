'use client'

import { useState } from 'react'
import type { Testimonial } from '@/lib/plattertea'
import { useResource, StatusBadge, Field, TextInput, TextArea, ImageField } from './shared'
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
import { Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react'

const EMPTY = { name: '', role: '', photo: '', content: '', rating: 5, status: 'PUBLISHED', sortOrder: 0 }

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < rating ? 'fill-gold text-gold' : 'text-forest/20'}`} />
      ))}
    </span>
  )
}

export function TestimonialManager() {
  const { items, loading, error, refresh, create, update, remove } = useResource<Testimonial>('/api/admin/testimonials')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Testimonial | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: items.length + 1 })
    setOpen(true)
  }
  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({
      name: t.name,
      role: t.role || '',
      photo: t.photo || '',
      content: t.content,
      rating: t.rating,
      status: t.status,
      sortOrder: t.sortOrder,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast({ title: 'Nama dan isi testimoni wajib diisi.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = { ...form, rating: Number(form.rating), sortOrder: Number(form.sortOrder) || 0 }
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'Testimoni diperbarui' : 'Testimoni ditambahkan' })
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
      toast({ title: 'Testimoni dihapus' })
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
          <h2 className="text-lg font-extrabold text-forest">Testimoni</h2>
          <p className="text-[12.5px] text-forest/55">Ulasan pelanggan yang tampil di beranda.</p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark">
          <Plus className="h-4 w-4" /> Tambah Testimoni
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-[13px] font-semibold text-destructive">{error}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-white p-4 shadow-[0_2px_10px_rgba(23,61,50,0.05)] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-bold text-forest">{t.name}</p>
                  <Stars rating={t.rating} />
                  <StatusBadge status={t.status} />
                </div>
                {t.role && <p className="text-[11.5px] font-semibold text-gold-dark">{t.role}</p>}
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-forest/60">“{t.content}”</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(t)}
                  className="h-9 rounded-full border-forest/20 px-3.5 text-xs font-bold text-forest hover:bg-sage-light"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleting(t)}
                  className="h-9 rounded-full border-destructive/30 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                  aria-label={`Hapus testimoni ${t.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-forest">{editing ? 'Edit Testimoni' : 'Tambah Testimoni'}</DialogTitle>
            <DialogDescription>Tampilkan ulasan asli pelanggan PlatterTea.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama" required>
                <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="cth. Sari M." />
              </Field>
              <Field label="Peran / Keterangan">
                <TextInput value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="cth. Mahasiswa" />
              </Field>
            </div>
            <Field label="Isi Testimoni" required>
              <TextArea value={form.content} onChange={(e) => set('content', e.target.value)} className="min-h-[110px]" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rating (1–5)">
                <Select value={String(form.rating)} onValueChange={(v) => set('rating', Number(v))}>
                  <SelectTrigger className="h-10 rounded-xl border-forest/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} bintang
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Urutan">
                <TextInput type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
              </Field>
            </div>
            <ImageField value={form.photo} onChange={(v) => set('photo', v)} label="Foto (opsional)" aspect="aspect-square" />
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
            <AlertDialogTitle>Hapus testimoni?</AlertDialogTitle>
            <AlertDialogDescription>Testimoni {deleting?.name} akan dihapus permanen.</AlertDialogDescription>
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
