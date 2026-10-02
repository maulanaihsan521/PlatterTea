'use client'

// ============ Security Notifier — polling percobaan masuk gagal (SUPER_ADMIN) ============
// Polling ringan tiap 60 detik: hitung LOGIN_FAILED dalam 1 jam terakhir.
// Badge merah berdenyut saat ada percobaan; klik → halaman Aktivitas.
// Lonjakan baru sejak poll sebelumnya → toast peringatan.

import { useEffect, useRef, useState } from 'react'
import { adminFetch } from './shared'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert } from 'lucide-react'

export function SecurityNotifier({ onOpenAudit }: { onOpenAudit: () => void }) {
  const [failed, setFailed] = useState(0)
  const prevRef = useRef<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const poll = async () => {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const res = await adminFetch<{ total: number }>(
        `/api/admin/audit?action=LOGIN_FAILED&since=${encodeURIComponent(since)}&limit=1`
      )
      if (!mounted) return
      if (res.ok && res.data) {
        const total = res.data.total ?? 0
        setFailed(total)
        // Peringatkan hanya bila jumlah NAIK dibanding poll sebelumnya (bukan saat pertama load)
        if (prevRef.current !== null && total > prevRef.current) {
          const delta = total - prevRef.current
          toast({
            title: `⚠️ ${delta} percobaan masuk gagal baru`,
            description: `Total ${total} kegagalan dalam 1 jam terakhir. Periksa halaman Aktivitas.`,
            variant: 'destructive',
          })
        }
        prevRef.current = total
      }
    }

    void poll()
    const interval = setInterval(poll, 60_000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [toast])

  // Tidak ada percobaan gagal → tidak mengganggu topbar
  if (failed === 0) return null

  return (
    <button
      type="button"
      onClick={onOpenAudit}
      title={`${failed} percobaan masuk gagal dalam 1 jam terakhir — klik untuk melihat Aktivitas`}
      className="relative inline-flex h-9 items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 text-xs font-extrabold text-destructive transition-colors hover:bg-destructive/15"
      aria-label={`${failed} percobaan masuk gagal dalam 1 jam terakhir. Buka halaman aktivitas.`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
      </span>
      <ShieldAlert className="h-3.5 w-3.5" />
      {failed}
    </button>
  )
}
