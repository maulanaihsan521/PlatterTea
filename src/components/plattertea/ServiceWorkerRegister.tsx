'use client'

// Register service worker untuk PWA offline support
import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // registrasi gagal — biarkan website berjalan normal tanpa PWA
      })
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
