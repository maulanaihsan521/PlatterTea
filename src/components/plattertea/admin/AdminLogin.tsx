'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Leaf, LeafPair } from '../Decor'
import { adminFetch } from './shared'
import { Loader2, LockKeyhole, ShieldAlert, Eye, EyeOff } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  status: string
}

export function AdminLogin({ onLogin }: { onLogin: (u: AdminUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [lockSecs, setLockSecs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown ketika akun terkunci sementara (rate-limit)
  useEffect(() => {
    if (!locked) return
    timerRef.current = setInterval(() => {
      setLockSecs((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setLocked(false)
          setError('')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [locked])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    setLoading(true)
    setError('')
    const res = await adminFetch<AdminUser>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.ok && res.data) {
      onLogin(res.data)
    } else if (res.status === 429) {
      setLocked(true)
      setLockSecs(res.lockedUntilSec || 900)
      setError(res.error || 'Terlalu banyak percobaan gagal.')
    } else {
      setError(res.error || 'Gagal masuk.')
    }
    setLoading(false)
  }

  const lockMm = String(Math.floor(lockSecs / 60)).padStart(2, '0')
  const lockSs = String(lockSecs % 60).padStart(2, '0')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest px-4 py-10">
      {/* decorations */}
      <Leaf className="absolute -left-6 top-10 h-16 w-28 -rotate-12 text-forest-light/40" />
      <LeafPair className="absolute -right-8 bottom-8 h-20 w-28 rotate-12 text-forest-light/30" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-2xl" />
      {/* Maskot berjaga di dekat formulir */}
      <img
        src="/brand/mascot-cool.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute bottom-[6%] left-[4%] hidden w-24 select-none opacity-95 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] md:block lg:w-28"
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/brand/logo-white.png" alt="Logo PlatterTea" className="h-16 w-auto" />
          <div>
            <h1 className="text-xl font-extrabold text-cream">PlatterTea CMS</h1>
            <p className="mt-1 text-[13px] text-cream/60">Masuk untuk mengelola konten website</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-8"
          aria-label="Formulir login admin"
        >
          <div className="flex items-center gap-2 text-forest">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15">
              <LockKeyhole className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-extrabold">Area Admin</p>
              <p className="text-[11.5px] text-forest/55">Khusus pengelola PlatterTea</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-email" className="text-[13px] font-bold text-forest">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@domain.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-forest/15 focus-visible:ring-gold/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-[13px] font-bold text-forest">
              Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-forest/15 pr-11 focus-visible:ring-gold/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-forest/40 transition-colors hover:bg-sage-light/60 hover:text-forest"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {locked ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl bg-gold/15 px-3.5 py-3 text-[12.5px] font-semibold leading-relaxed text-gold-dark"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Terlalu banyak percobaan gagal. Login terkunci sementara — coba lagi dalam{' '}
                <strong className="tabular-nums">
                  {lockMm}:{lockSs}
                </strong>
                .
              </span>
            </div>
          ) : error ? (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={loading || locked}
            className="h-11 w-full rounded-full bg-forest text-sm font-bold text-cream hover:bg-forest-dark disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses…
              </>
            ) : locked ? (
              <>
                <ShieldAlert className="h-4 w-4" /> Terkunci ({lockMm}:{lockSs})
              </>
            ) : (
              'Masuk ke Dashboard'
            )}
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-forest/40">
            Akses dashboard hanya untuk administrator resmi PlatterTea.
          </p>

          <p className="text-center text-[12px]">
            <a
              href="#/P578Admin/reset"
              className="font-bold text-forest/60 underline-offset-2 transition-colors hover:text-gold-dark hover:underline"
            >
              Lupa password? Gunakan kode reset dari Super Admin →
            </a>
          </p>
        </form>

        <p className="mt-6 text-center text-[12px] text-cream/50">
          <a href="#/" className="underline-offset-2 hover:text-cream hover:underline">
            ← Kembali ke website publik
          </a>
        </p>
      </div>
    </div>
  )
}
