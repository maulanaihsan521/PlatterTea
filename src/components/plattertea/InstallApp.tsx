'use client'

// ============ PWA Install UI ============
// 1. InstallAppButton — tombol kecil di footer publik
// 2. InstallBanner — banner lembut di atas (home) untuk mobile, bisa ditutup

import { useState } from 'react'
import { usePwaInstall } from '@/hooks/use-pwa-install'
import { Download, Smartphone, X } from 'lucide-react'

/** Tombol "Install App" untuk footer. Hanya tampil bila browser mendukung prompt install. */
export function InstallAppButton() {
  const { canInstall, installed, install } = usePwaInstall()
  const [justInstalled, setJustInstalled] = useState(false)

  if (installed || (!canInstall && !justInstalled)) return null

  const handleClick = async () => {
    const outcome = await install()
    if (outcome === 'accepted') setJustInstalled(true)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 text-[12.5px] font-bold text-gold-light transition-colors hover:bg-gold hover:text-forest"
      aria-label="Install aplikasi PlatterTea"
    >
      <Download className="h-4 w-4" />
      Install App
    </button>
  )
}

/** Banner mobile di halaman home — tampil sekali per sesi, bisa ditutup. */
export function InstallBanner() {
  const { canInstall, installed, install, dismissBanner } = usePwaInstall()
  const [leaving, setLeaving] = useState(false)

  if (installed || !canInstall) return null

  const close = () => {
    setLeaving(true)
    setTimeout(dismissBanner, 200)
  }

  return (
    <div
      className={`fixed inset-x-3 bottom-[76px] z-40 mx-auto max-w-md rounded-2xl border border-gold/30 bg-forest p-3.5 shadow-[0_12px_40px_rgba(23,61,50,0.5)] transition-all duration-200 md:hidden ${
        leaving ? 'translate-y-4 opacity-0' : 'pt-fade-in'
      }`}
      role="complementary"
      aria-label="Ajakan install aplikasi"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15">
          <Smartphone className="h-5 w-5 text-gold-light" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold text-cream">Pasang PlatterTea</p>
          <p className="text-[11px] leading-snug text-cream/60">Akses menu & promo lebih cepat dari home screen.</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cream/60 hover:bg-cream/10 hover:text-cream"
          aria-label="Tutup banner install"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={install}
        className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-gold text-[13px] font-extrabold text-forest transition-colors hover:bg-gold-dark"
      >
        <Download className="h-4 w-4" /> Install Sekarang
      </button>
    </div>
  )
}
