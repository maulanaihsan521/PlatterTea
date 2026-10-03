'use client'

import { cn } from '@/lib/utils'

/**
 * Decorative leaf SVG matching the PlatterTea brand illustration style.
 * Used as organic decorations across sections.
 */
export function Leaf({
  className,
  style,
  flip = false,
}: {
  className?: string
  style?: React.CSSProperties
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      aria-hidden="true"
      className={cn('pointer-events-none select-none', className)}
      style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    >
      <path
        d="M96 52C70 52 22 44 4 8c30-14 74-6 88 26 2 6 3 12 4 18z"
        fill="currentColor"
      />
      <path
        d="M4 8c20 24 52 36 84 40"
        stroke="#173D32"
        strokeOpacity="0.35"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LeafPair({
  className,
  style,
  flip = false,
}: {
  className?: string
  style?: React.CSSProperties
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      aria-hidden="true"
      className={cn('pointer-events-none select-none', className)}
      style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    >
      <path d="M112 84C86 84 44 76 26 40c26-12 66-4 82 24 2 6 3 13 4 20z" fill="currentColor" />
      <path d="M84 42c10 16 6 34-10 42-10-18-4-36 10-42z" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

/** Soft beige blob background shape */
export function Blob({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={cn('pointer-events-none select-none', className)} style={style}>
      <path
        d="M43.9,-63.6C57.2,-55.9,68.7,-44.5,75.9,-30.5C83.2,-16.5,86.1,0.2,82.3,15.1C78.4,30,67.7,43.2,54.6,53.4C41.5,63.7,25.9,71,9.3,74.4C-7.3,77.8,-24.8,77.4,-39.4,70.1C-54,62.8,-65.6,48.6,-72.3,32.5C-79,16.3,-80.8,-1.9,-75.7,-17.8C-70.7,-33.8,-58.8,-47.5,-44.6,-55.4C-30.4,-63.3,-13.9,-65.4,1.5,-67.2C16.9,-69,30.6,-71.2,43.9,-63.6Z"
        transform="translate(100 80)"
        fill="currentColor"
      />
    </svg>
  )
}

/** Gold underline swoosh for script headings */
export function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 24" fill="none" aria-hidden="true" className={cn('pointer-events-none select-none', className)}>
      <path
        d="M6 16C50 6 120 3 214 10"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** 4-point sparkle (kilau emas) — aksen dekoratif di sekitar maskot/judul */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn('pointer-events-none select-none', className)}>
      <path d="M12 1.5c.65 5.2 2.6 8 8.5 8.7-5.9.7-7.85 3.5-8.5 8.7-.65-5.2-2.6-8-8.5-8.7 5.9-.7 7.85-3.5 8.5-8.7Z" />
    </svg>
  )
}
