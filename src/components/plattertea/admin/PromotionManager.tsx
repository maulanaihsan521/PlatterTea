'use client'

import { useState } from 'react'
import type { Promotion } from '@/lib/plattertea'
import { formatRupiah, PROMO_DISKON_RP } from '@/lib/plattertea'
import { useResource, StatusBadge, Field, TextInput, TextArea, ToggleField, ImageField } from './shared'
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

const EMPTY = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  startDate: '',
  endDate: '',
  status: 'PUBLISHED',
  featured: false,
  ctaLabel: 'Chat via WhatsApp',
  sortOrder: 0,
}

export function PromotionManager() {
  const { items, loading, error, refresh, create, update, remove } = useResource<Promotion>('/api/admin/promotions')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Promotion | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: items.length + 1 })
    setOpen(true)
  }
  const openEdit = (p: Promotion) => {
    setEditing(p)
    setForm({
      title: p.title,
      subtitle: p.subtitle || '',
      description: p.description || '',
      image: p.image || '',
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      status: p.status,
      featured: p.featured,
      ctaLabel: p.ctaLabel,
      sortOrder: p.sortOrder,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Judul promo wajib diisi.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    }
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'Promo diperbarui' : 'Promo ditambahkan', description: form.title })
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
      toast({ title: 'Promo dihapus', description: deleting.title })
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
          <h2 className="text-lg font-extrabold text-forest">Promo</h2>
          <p className="text-[12.5px] text-forest/55">
            Promo yang tampil di halaman Promo & banner beranda. Satu promo ditandai utama.
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark">
          <Plus className="h-4 w-4" /> Tambah Promo
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
          {items.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-white p-3 shadow-[0_2px_10px_rgba(23,61,50,0.05)] sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gold/15">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] font-bold text-forest/30">—</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-forest">{p.title}</p>
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gold-dark">
                        <Star className="h-2.5 w-2.5 fill-current" /> Utama
                      </span>
                    )}
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-forest/55">
                    {p.subtitle || p.description || '—'} · CTA: {p.ctaLabel}
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
                  aria-label={`Hapus ${p.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-forest">{editing ? 'Edit Promo' : 'Tambah Promo'}</DialogTitle>
            <DialogDescription>Promo utama tampil besar di beranda & halaman promo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <Field label="Judul Promo" required>
              <TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="cth. SPESIAL MARKET DAYS" />
            </Field>
            <Field label="Subjudul">
              <TextInput value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder={`Diskon ${formatRupiah(PROMO_DISKON_RP)} Semua Produk!`} />
            </Field>
            <Field label="Deskripsi">
              <TextArea value={form.description} onChange={(e) => set('description', e.target.value)} className="min-h-[100px]" />
            </Field>
            <ImageField value={form.image} onChange={(v) => set('image', v)} label="Gambar Promo" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mulai">
                <TextInput type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </Field>
              <Field label="Berakhir">
                <TextInput type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Label Tombol CTA">
                <TextInput value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="Chat via WhatsApp" />
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
                  <SelectItem value="EXPIRED">Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <ToggleField
              label="Jadikan Promo Utama"
              description="Tampil di kartu emas beranda & bagian atas halaman promo."
              checked={form.featured}
              onChange={(v) => set('featured', v)}
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full border-forest/20 font-bold text-forest">
              Batal
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-full bg-forest font-bold text-cream hover:bg-forest-dark">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Simpan Perubahan' : 'Tambah Promo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus promo?</AlertDialogTitle>
            <AlertDialogDescription>{deleting?.title} akan dihapus permanen dari website.</AlertDialogDescription>
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
