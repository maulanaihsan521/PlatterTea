'use client'

import { useState } from 'react'
import { useResource, Field, TextInput, adminFetch } from './shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, UserCog, KeyRound, Copy, Check, Link2 } from 'lucide-react'

interface AdminUserRow {
  id: string
  email: string
  name: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

const EMPTY = { name: '', email: '', password: '', role: 'EDITOR', status: 'ACTIVE' }

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  CONTENT_ADMIN: 'Admin Konten',
  EDITOR: 'Editor',
}

const ROLE_HINT: Record<string, string> = {
  SUPER_ADMIN: 'Akses penuh termasuk kelola user & backup data.',
  CONTENT_ADMIN: 'Kelola semua konten website.',
  EDITOR: 'Kelola produk, promo, dan galeri.',
}

function RoleBadge({ role }: { role: string }) {
  const isSuper = role === 'SUPER_ADMIN'
  return (
    <Badge
      className={
        isSuper
          ? 'bg-gold/20 text-gold-dark hover:bg-gold/30'
          : 'bg-forest/10 text-forest hover:bg-forest/15'
      }
      variant="secondary"
    >
      {isSuper && <ShieldCheck className="mr-1 h-3 w-3" />}
      {ROLE_LABEL[role] || role}
    </Badge>
  )
}

function StatusPill({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        status === 'ACTIVE'
          ? 'border-emerald-600/30 bg-emerald-50 text-[10px] font-bold uppercase tracking-wide text-emerald-700'
          : 'border-red-200 bg-red-50 text-[10px] font-bold uppercase tracking-wide text-red-600'
      }
    >
      {status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
    </Badge>
  )
}

export function UserManager({ meId }: { meId: string }) {
  const { items, loading, error, refresh, create, update, remove } = useResource<AdminUserRow>('/api/admin/users')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUserRow | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<AdminUserRow | null>(null)

  // ===== Reset password via link token =====
  const [resetUser, setResetUser] = useState<AdminUserRow | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [resetExpiry, setResetExpiry] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [copied, setCopied] = useState(false)

  const openReset = (u: AdminUserRow) => {
    setResetUser(u)
    setResetLink(null)
    setResetExpiry(null)
    setResetError('')
    setCopied(false)
  }

  const generateReset = async () => {
    if (!resetUser) return
    setResetLoading(true)
    setResetError('')
    const res = await adminFetch<{ url: string; expiresAt: string }>(
      `/api/admin/users/${resetUser.id}/reset-link`,
      { method: 'POST' }
    )
    setResetLoading(false)
    if (res.ok && res.data) {
      setResetLink(res.data.url)
      setResetExpiry(
        new Date(res.data.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      )
    } else {
      setResetError(res.error || 'Gagal membuat link reset.')
    }
  }

  const copyResetLink = async () => {
    if (!resetLink) return
    const absolute = `${window.location.origin}${resetLink}`
    try {
      await navigator.clipboard.writeText(absolute)
    } catch {
      // fallback untuk browser tanpa clipboard API
      const ta = document.createElement('textarea')
      ta.value = absolute
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY })
    setOpen(true)
  }
  const openEdit = (u: AdminUserRow) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role, status: u.status })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Nama dan email wajib diisi.', variant: 'destructive' })
      return
    }
    if (!editing && form.password.length < 8) {
      toast({ title: 'Password minimal 8 karakter.', variant: 'destructive' })
      return
    }
    if (editing && form.password && form.password.length < 8) {
      toast({ title: 'Password minimal 8 karakter.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    }
    if (form.password) payload.password = form.password
    const res = editing ? await update(editing.id, payload) : await create(payload)
    setSaving(false)
    if (res.ok) {
      toast({ title: editing ? 'User diperbarui' : 'User baru ditambahkan' })
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
      toast({ title: 'User dihapus' })
      void refresh()
    } else {
      toast({ title: 'Gagal menghapus', description: res.error, variant: 'destructive' })
    }
    setDeleting(null)
  }

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">Manajemen User</h2>
          <p className="text-[12.5px] text-forest/55">Kelola akun admin yang dapat mengakses CMS.</p>
        </div>
        <Button
          onClick={openCreate}
          className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark"
        >
          <Plus className="h-4 w-4" /> Tambah User
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-destructive/10 p-4 text-[13px] font-semibold text-destructive">{error}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((u) => {
            const isMe = u.id === meId
            return (
              <li
                key={u.id}
                className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-white p-4 shadow-[0_2px_10px_rgba(23,61,50,0.05)] sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ' +
                      (u.role === 'SUPER_ADMIN' ? 'bg-gold/20 text-gold-dark' : 'bg-forest/10 text-forest')
                    }
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-bold text-forest">
                        {u.name}
                        {isMe && <span className="ml-1.5 text-[11px] font-semibold text-forest/40">(kamu)</span>}
                      </p>
                      <RoleBadge role={u.role} />
                      <StatusPill status={u.status} />
                    </div>
                    <p className="truncate text-[12px] text-forest/55">{u.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(u)}
                    className="h-9 rounded-full border-forest/20 px-3.5 text-xs font-bold text-forest hover:bg-sage-light"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  {!isMe && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReset(u)}
                      className="h-9 rounded-full border-gold/40 px-3.5 text-xs font-bold text-gold-dark hover:bg-gold/10"
                      aria-label={`Buat link reset password untuk ${u.name}`}
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isMe}
                    onClick={() => setDeleting(u)}
                    className="h-9 rounded-full border-destructive/30 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={isMe ? 'Tidak dapat menghapus akun sendiri' : `Hapus user ${u.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-forest">{editing ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
            <DialogDescription>
              {editing ? `Perbarui akun ${editing.name}.` : 'Buat akun admin untuk mengelola konten website.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <Field label="Nama" required>
              <TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="cth. Rizky Pratama" />
            </Field>
            <Field label="Email" required>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="cth. rizky@plattertea.id"
                disabled={!!editing && editing.id === meId}
              />
            </Field>
            <Field
              label={editing ? 'Password Baru (opsional)' : 'Password'}
              required={!editing}
              hint="Minimal 8 karakter. Kosongkan jika tidak ingin mengganti."
            >
              <TextInput
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role">
                <Select
                  value={form.role}
                  onValueChange={(v) => set('role', v)}
                  disabled={!!editing && editing.id === meId}
                >
                  <SelectTrigger className="h-10 rounded-xl border-forest/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="CONTENT_ADMIN">Admin Konten</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(v) => set('status', v)}
                  disabled={!!editing && editing.id === meId}
                >
                  <SelectTrigger className="h-10 rounded-xl border-forest/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <p className="rounded-xl bg-sage-light/60 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-forest/60">
              {ROLE_HINT[form.role]}
            </p>
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

      {/* ===== Dialog: buat link reset password ===== */}
      <Dialog open={!!resetUser} onOpenChange={(v) => !v && setResetUser(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-forest">
              <KeyRound className="h-4.5 w-4.5 text-gold-dark" /> Reset Password
            </DialogTitle>
            <DialogDescription>
              Buat link reset untuk <strong>{resetUser?.name}</strong> ({resetUser?.email}). Website
              ini tidak mengirim email — bagikan link lewat chat pribadi.
            </DialogDescription>
          </DialogHeader>

          {resetLink ? (
            <div className="space-y-3 py-1">
              <div className="rounded-2xl border border-forest/15 bg-sage-light/40 p-3.5">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-forest/50">
                  <Link2 className="h-3.5 w-3.5" /> Link Reset
                </p>
                <p className="break-all font-mono text-[11.5px] leading-relaxed text-forest">
                  {typeof window !== 'undefined' ? `${window.location.origin}${resetLink}` : resetLink}
                </p>
              </div>
              <p className="flex items-start gap-2 rounded-xl bg-gold/10 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-gold-dark">
                <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Berlaku 30 menit (hingga pukul <strong>{resetExpiry}</strong>), sekali pakai, dan akan
                otomatis hangus jika kamu membuat link baru.
              </p>
            </div>
          ) : (
            <p className="py-1 text-[12.5px] leading-relaxed text-forest/65">
              Link berisi kode acak yang hanya berlaku 30 menit dan sekali pakai. User membuka link,
              memasang password baru, dan langsung bisa login.
            </p>
          )}

          {resetError && (
            <p className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-destructive">
              {resetError}
            </p>
          )}

          <DialogFooter className="gap-2 pt-1">
            {resetLink ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResetUser(null)}
                  className="rounded-full border-forest/20 font-bold text-forest"
                >
                  Selesai
                </Button>
                <Button
                  onClick={copyResetLink}
                  className="rounded-full bg-forest font-bold text-cream hover:bg-forest-dark"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Tersalin!' : 'Salin Link'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResetUser(null)}
                  className="rounded-full border-forest/20 font-bold text-forest"
                >
                  Batal
                </Button>
                <Button
                  onClick={generateReset}
                  disabled={resetLoading}
                  className="rounded-full bg-gold font-bold text-forest hover:bg-gold-dark"
                >
                  {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Buat Link Reset
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun {deleting?.name} ({deleting?.email}) tidak akan bisa login lagi ke CMS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-destructive font-bold text-white hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="flex items-start gap-2 rounded-2xl bg-forest/5 p-4 text-[11.5px] leading-relaxed text-forest/55">
        <UserCog className="mt-0.5 h-4 w-4 shrink-0 text-forest/40" />
        Hanya Super Admin yang dapat mengakses halaman ini. Akun yang ditangguhkan otomatis tidak bisa login, dan
        sistem selalu menjaga minimal satu Super Admin aktif.
      </p>
    </div>
  )
}
