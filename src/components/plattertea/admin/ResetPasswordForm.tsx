'use client'

// ============ Form Reset Password (akses via link/kode dari Super Admin) ============
// Dipasang di #/P578Admin/reset dan #/P578Admin/reset/{token} — alur publik tanpa sesi.

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Leaf, LeafPair } from '../Decor'
import { adminFetch } from './shared'
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react'

export function ResetPasswordForm({ token: initialToken }: { token?: string }) {
  const [token, setToken] = useState(initialToken || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token.trim()) {
      setError('Kode reset wajib diisi. Minta link dari Super Admin PlatterTea.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama.')
      return
    }
    setLoading(true)
    const res = await adminFetch('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: token.trim(), password }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
    } else {
      setError(res.error || 'Gagal memperbarui password.')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest px-4 py-10">
      {/* decorations */}
      <Leaf className="absolute -left-6 top-10 h-16 w-28 -rotate-12 text-forest-light/40" />
      <LeafPair className="absolute -right-8 bottom-8 h-20 w-28 rotate-12 text-forest-light/30" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/brand/logo-white.png" alt="Logo PlatterTea" className="h-16 w-auto" />
          <div>
            <h1 className="text-xl font-extrabold text-cream">Reset Password CMS</h1>
            <p className="mt-1 text-[13px] text-cream/60">
              {done ? 'Password berhasil diperbarui' : 'Atur password baru untuk akun adminmu'}
            </p>
          </div>
        </div>

        {done ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-4 text-[14px] font-extrabold text-forest">Password diperbarui! 🎉</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-forest/60">
              Kode reset sudah tidak bisa dipakai lagi. Silakan masuk dengan password barumu.
            </p>
            <Button
              asChild
              className="mt-5 h-11 w-full rounded-full bg-forest text-sm font-bold text-cream hover:bg-forest-dark"
            >
              <a href="#/P578Admin">Masuk ke Dashboard</a>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-8"
            aria-label="Formulir reset password"
          >
            <div className="flex items-center gap-2 text-forest">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
                <KeyRound className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-extrabold">Punya kode reset?</p>
                <p className="text-[11.5px] text-forest/55">
                  Minta link/kode ke Super Admin — berlaku 30 menit, sekali pakai.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-token" className="text-[13px] font-bold text-forest">
                Kode Reset
              </Label>
              <Input
                id="reset-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Tempel kode dari link reset…"
                autoComplete="off"
                required
                className="h-11 rounded-xl border-forest/15 font-mono text-[12.5px] focus-visible:ring-gold/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-pass" className="text-[13px] font-bold text-forest">
                Password Baru
              </Label>
              <Input
                id="reset-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                required
                className="h-11 rounded-xl border-forest/15 focus-visible:ring-gold/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reset-confirm" className="text-[13px] font-bold text-forest">
                Konfirmasi Password
              </Label>
              <Input
                id="reset-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                required
                className="h-11 rounded-xl border-forest/15 focus-visible:ring-gold/50"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-forest text-sm font-bold text-cream hover:bg-forest-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memproses…
                </>
              ) : (
                'Simpan Password Baru'
              )}
            </Button>

            <p className="text-center text-[11px] text-forest/40">
              <a href="#/P578Admin" className="underline-offset-2 hover:text-forest hover:underline">
                ← Kembali ke halaman masuk
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
