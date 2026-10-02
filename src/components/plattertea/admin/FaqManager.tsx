'use client'

import { useState } from 'react'
import type { Faq } from '@/lib/plattertea'
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

const EMPTY = { question: '', answer: '', category: 'umum', status: 'PUBLISHED', sortOrder: 0 }

export function FaqManager() {
  const { items, loading, error, refresh, create, update, remove } = useResource<Faq>('/api/admin/faqs')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Faq | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: items.length + 1 })
    setOpen(true)
  }
  const openEdit = (f: Faq) => {
    setEditing(f)
    setForm({ question: f.question, answer: f.answer, category: f.category, status: f.status, sortOrder: f.sortOrder })
    setOpen(true)
  }

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ title: 'Pertanyaan dan jawaban wajib diisi.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'FAQ diperbarui' : 'FAQ ditambahkan' })
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
      toast({ title: 'FAQ dihapus' })
      void refresh()
    } else {
      toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">FAQ</h2>
          <p className="text-[12.5px] text-forest/55">Pertanyaan yang sering diajukan pengunjung.</p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark">
          <Plus className="h-4 w-4" /> Tambah FAQ
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
          {items.map((f) => (
            <li
              key={f.id}
              className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-white p-4 shadow-[0_2px_10px_rgba(23,61,50,0.05)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-bold text-forest">{f.question}</p>
                  <StatusBadge status={f.status} />
                  <span className="rounded-full bg-sage-light px-2 py-0.5 text-[10.5px] font-bold capitalize text-forest/60">
                    {f.category}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-forest/60">{f.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(f)}
                  className="h-9 rounded-full border-forest/20 px-3.5 text-xs font-bold text-forest hover:bg-sage-light"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleting(f)}
                  className="h-9 rounded-full border-destructive/30 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                  aria-label={`Hapus FAQ ${f.question}`}
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
            <DialogTitle className="text-forest">{editing ? 'Edit FAQ' : 'Tambah FAQ'}</DialogTitle>
            <DialogDescription>Tulis pertanyaan dan jawaban dengan bahasa yang jelas.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <Field label="Pertanyaan" required>
              <TextInput value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} placeholder="cth. Bagaimana cara memesan?" />
            </Field>
            <Field label="Jawaban" required>
              <TextArea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} className="min-h-[120px]" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kategori">
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-10 rounded-xl border-forest/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umum">Umum</SelectItem>
                    <SelectItem value="pemesanan">Pemesanan</SelectItem>
                    <SelectItem value="produk">Produk</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Urutan">
                <TextInput type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
              </Field>
            </div>
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
            <AlertDialogTitle>Hapus FAQ?</AlertDialogTitle>
            <AlertDialogDescription>FAQ ini akan dihapus permanen dari halaman website.</AlertDialogDescription>
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
