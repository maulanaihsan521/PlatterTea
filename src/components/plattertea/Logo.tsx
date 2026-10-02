'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  height?: number
}

/** Full PlatterTea logo (mark + wordmark + FOOD & TEA) — color version */
export function LogoFull({ className, height = 44 }: LogoProps) {
  return (
     
    <img
      src="/brand/logo.png"
      alt="PlatterTea — Food & Tea"
      className={cn('object-contain select-none', className)}
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  )
}

/** Full PlatterTea logo — cream/white version for dark backgrounds */
export function LogoFullWhite({ className, height = 44 }: LogoProps) {
  return (
     
    <img
      src="/brand/logo-white.png"
      alt="PlatterTea — Food & Tea"
      className={cn('object-contain select-none', className)}
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  )
}

/** Mark-only (P cup icon) color version */
export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
     
    <img
      src="/brand/logo-mark.png"
      alt="PlatterTea"
      className={cn('object-contain select-none', className)}
      style={{ height: size, width: 'auto' }}
      draggable={false}
    />
  )
}

/** Mark-only cream/white version */
export function LogoMarkWhite({ className, size = 40 }: { className?: string; size?: number }) {
  return (
     
    <img
      src="/brand/logo-mark-white.png"
      alt="PlatterTea"
      className={cn('object-contain select-none', className)}
      style={{ height: size, width: 'auto' }}
      draggable={false}
    />
  )
}
