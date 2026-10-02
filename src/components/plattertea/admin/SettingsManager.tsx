'use client'

import { useEffect, useRef, useState } from 'react'
import { adminFetch, Field, TextInput, TextArea } from './shared'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-plattertea'
import { Loader2, Save, RotateCcw, Download, Upload, DatabaseBackup, ShieldCheck } from 'lucide-react'

interface FieldDef {
  key: string
  label: string
  hint?: string
  textarea?: boolean
}

const GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Kontak & Alamat',
    fields: [
      { key: 'whatsapp', label: 'Nomor WhatsApp', hint: 'Format internasional tanpa +, cth. 6285175397747 (= 085175397747)' },
      { key: 'whatsapp_display', label: 'Nomor WhatsApp (tampilan)', hint: 'cth. +62 851-7539-7747' },
      { key: 'email', label: 'Email' },
      { key: 'address', label: 'Alamat', textarea: true },
      { key: 'maps_url', label: 'URL Google Maps (link "Lihat Peta")', hint: 'cth. https://www.google.com/maps/search/?api=1&query=Telkom+University+Purwokerto' },
      { key: 'maps_embed', label: 'URL Embed Google Maps (peta di halaman Kontak)', textarea: true, hint: 'Salin dari Google Maps > Bagikan > Sematkan peta — ambil nilai src pada kode iframe' },
      { key: 'opening_hours', label: 'Jam Operasional' },
    ],
  },
  {
    title: 'Media Sosial',
    fields: [
      { key: 'instagram_url', label: 'URL Instagram' },
      { key: 'instagram_display', label: 'Instagram (tampilan)', hint: 'cth. @plattertea' },
      { key: 'tiktok_url', label: 'URL TikTok' },
      { key: 'tiktok_display', label: 'TikTok (tampilan)' },
    ],
  },
  {
    title: 'Tentang Kami',
    fields: [
      { key: 'about_story', label: 'Cerita Singkat Brand', textarea: true },
      { key: 'about_vision', label: 'Visi', textarea: true },
      { key: 'about_mission', label: 'Misi (satu per baris)', textarea: true },
    ],
  },
  {
    title: 'SEO',
    fields: [
      { key: 'seo_title', label: 'Judul SEO' },
      { key: 'seo_description', label: 'Deskripsi SEO', textarea: true },
    ],
  },
]

export function SettingsManager() {
  const { toast } = useToast()
  const settings = useSettings()
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    adminFetch<Record<string, string>>('/api/admin/settings').then((res) => {
      if (!mounted) return
      if (res.ok && res.data) setForm(res.data)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setSaving(true)
    const res = await adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      toast({
        title: 'Pengaturan tersimpan',
        description: 'Perubahan langsung tampil di website (refresh halaman publik bila perlu).',
      })
    } else {
      toast({ title: 'Gagal menyimpan', description: res.error, variant: 'destructive' })
    }
  }

  const reset = () => setForm({ ...settings })

  // ===== Backup & Restore =====
  const importRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const exportData = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/export')
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error || 'Gagal mengekspor data.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plattertea-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: 'Backup berhasil diunduh', description: 'Simpan file JSON ini dengan baik.' })
    } catch (e) {
      toast({ title: 'Gagal mengekspor', description: e instanceof Error ? e.message : 'Terjadi kesalahan.', variant: 'destructive' })
    }
    setExporting(false)
  }

  const importData = async (file: File) => {
    setImporting(true)
    try {
      const text = await file.text()
      const res = await adminFetch<Record<string, number>>('/api/admin/import', {
        method: 'POST',
        body: text,
      })
      if (res.ok && res.data) {
        const total = Object.values(res.data).reduce((a, b) => a + b, 0)
        toast({
          title: 'Restore selesai',
          description: `${total} data diproses: ${Object.entries(res.data)
            .map(([k, v]) => `${v} ${k}`)
            .join(', ')}.`,
        })
      } else {
        toast({ title: 'Gagal mengimpor', description: res.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal membaca file backup.', variant: 'destructive' })
    }
    setImporting(false)
  }

  // ===== Keamanan Akun — ubah password sendiri (POST /api/admin/change-password) =====
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const changePassword = async () => {
    if (!pwCurrent || !pwNew || !pwConfirm) {
      toast({ title: 'Lengkapi semua kolom password.', variant: 'destructive' })
      return
    }
    if (pwNew.length < 10) {
      toast({ title: 'Password baru minimal 10 karakter.', variant: 'destructive' })
      return
    }
    if (pwNew !== pwConfirm) {
      toast({ title: 'Konfirmasi password tidak cocok.', variant: 'destructive' })
      return
    }
    setChangingPw(true)
    const res = await adminFetch('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
    })
    setChangingPw(false)
    if (res.ok) {
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
      toast({
        title: 'Password berhasil diganti',
        description: 'Gunakan password baru pada login berikutnya. Aktivitas ini tercatat di log audit.',
      })
    } else {
      toast({ title: 'Gagal mengganti password', description: res.error, variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-3xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-forest">Pengaturan Website</h2>
          <p className="text-[12.5px] text-forest/55">Kontak, media sosial, cerita brand, dan SEO.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={reset}
            className="h-10 rounded-full border-forest/20 px-4 text-[13px] font-bold text-forest hover:bg-sage-light"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button onClick={save} disabled={saving} className="h-10 rounded-full bg-forest px-5 text-[13px] font-bold text-cream hover:bg-forest-dark">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Semua
          </Button>
        </div>
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-3xl border border-forest/10 bg-white p-5 shadow-[0_2px_12px_rgba(23,61,50,0.05)] sm:p-6">
          <h3 className="text-[15px] font-extrabold text-forest">{group.title}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.fields.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint} className={f.textarea ? 'sm:col-span-2' : ''}>
                {f.textarea ? (
                  <TextArea value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                ) : (
                  <TextInput value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}

      {/* Keamanan Akun — ubah password sendiri (semua role) */}
      <section className="rounded-3xl border border-forest/10 bg-white p-5 shadow-[0_2px_12px_rgba(23,61,50,0.05)] sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-forest">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold text-forest">Keamanan Akun</h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-forest/55">
              Ganti password akun CMS Anda secara berkala. Minimal 10 karakter — kombinasi huruf,
              angka, dan simbol lebih aman. Percobaan perubahan tercatat di log aktivitas.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Password Saat Ini">
                <TextInput
                  type="password"
                  autoComplete="current-password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  placeholder="••••••••••"
                />
              </Field>
              <Field label="Password Baru" hint="Minimal 10 karakter.">
                <TextInput
                  type="password"
                  autoComplete="new-password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="••••••••••"
                />
              </Field>
              <Field label="Konfirmasi Password Baru">
                <TextInput
                  type="password"
                  autoComplete="new-password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="••••••••••"
                />
              </Field>
            </div>
            <Button
              onClick={changePassword}
              disabled={changingPw}
              className="mt-4 h-10 rounded-full bg-forest px-5 text-[13px] font-bold text-cream hover:bg-forest-dark"
            >
              {changingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Ganti Password
            </Button>
          </div>
        </div>
      </section>

      {/* Backup & Restore — hanya bermakna untuk Super Admin (API menolak role lain) */}
      <section className="rounded-3xl border border-gold/30 bg-gold/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold-dark">
            <DatabaseBackup className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold text-forest">Backup &amp; Restore Konten</h3>
            <p className="mt-0.5 text-[12px] leading-relaxed text-forest/55">
              Unduh seluruh konten website (produk, kategori, promo, galeri, testimoni, FAQ, pengaturan) sebagai
              file JSON, atau pulihkan dari file backup sebelumnya. Data dengan ID yang sama akan diperbarui.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                onClick={exportData}
                disabled={exporting}
                className="h-10 rounded-full bg-forest px-4 text-[13px] font-bold text-cream hover:bg-forest-dark"
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Backup
              </Button>
              <Button
                variant="outline"
                onClick={() => importRef.current?.click()}
                disabled={importing}
                className="h-10 rounded-full border-forest/20 px-4 text-[13px] font-bold text-forest hover:bg-sage-light"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Import Backup
              </Button>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void importData(f)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
