'use client'

// ============ PWA Install (A2HS) hook ============
// Menangkap event beforeinstallprompt agar tombol "Install App" bisa
// memicu prompt instalasi native Chrome/Edge/Samsung Internet.

import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pt-install-dismissed'

export function usePwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Sudah berjalan sebagai app (installed / display standalone)
    const mq = window.matchMedia('(display-mode: standalone)')
    const syncStandalone = () => setInstalled(mq.matches || (window.navigator as { standalone?: boolean }).standalone === true)
    syncStandalone()

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    mq.addEventListener?.('change', syncStandalone)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      mq.removeEventListener?.('change', syncStandalone)
    }
  }, [])

  const canInstall = !!deferred && !installed
  const dismissed = typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1'

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferred(null)
    return choice.outcome
  }, [deferred])

  const dismissBanner = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
    setDeferred(null)
  }, [])

  return { canInstall: canInstall && !dismissed, installed, install, dismissBanner }
}
