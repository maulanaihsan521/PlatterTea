'use client'

import { cn } from '@/lib/utils'

export type MascotPose =
  | 'thumbs'  // jempol (Semangat)
  | 'point'   // tunjuk + kedip (Wink)
  | 'tea'     // bawa gelas teh (Santai)
  | 'jump'    // lompat girang
  | 'box'     // gendong platter box
  | 'cool'    // kacamata hitam (Keren)
  | 'heart'   // peluk hati
  | 'quiet'   // celetuk jari (psst)
  | 'sit'     // duduk santai bawa teh
  | 'sign'    // papan "Mix, Sip, Enjoy!"
  | 'boxchar' // karakter si Box (platter box)

const SR_LABELS: Record<MascotPose, string> = {
  thumbs: 'Maskot PlatterTea memberi jempol',
  point: 'Maskot PlatterTea menunjuk sambil kedip',
  tea: 'Maskot PlatterTea membawa segelas teh',
  jump: 'Maskot PlatterTea melompat girang',
  box: 'Maskot PlatterTea menggendong platter box',
  cool: 'Maskot PlatterTea memakai kacamata hitam',
  heart: 'Maskot PlatterTea memeluk hati',
  quiet: 'Maskot PlatterTea berbisik',
  sit: 'Maskot PlatterTea duduk santai',
  sign: 'Maskot PlatterTea memegang papan Mix, Sip, Enjoy!',
  boxchar: 'Karakter platter box PlatterTea',
}

interface MascotProps {
  pose: MascotPose
  /** width px — height mengikuti rasio gambar asli */
  width?: number
  className?: string
  /** animasi halus: float naik-turun / sway goyang */
  animation?: 'float' | 'sway' | 'none'
  flip?: boolean
  /** decorative (default) — disembunyikan dari screen reader */
  decorative?: boolean
}

const DIMENSIONS: Record<MascotPose, { w: number; h: number }> = {
  thumbs: { w: 297, h: 457 },
  point: { w: 307, h: 436 },
  tea: { w: 307, h: 426 },
  jump: { w: 307, h: 416 },
  box: { w: 285, h: 428 },
  cool: { w: 272, h: 460 },
  heart: { w: 292, h: 460 },
  quiet: { w: 286, h: 460 },
  sit: { w: 302, h: 399 },
  sign: { w: 260, h: 460 },
  boxchar: { w: 326, h: 420 },
}

export function Mascot({
  pose,
  width = 120,
  className,
  animation = 'none',
  flip = false,
  decorative = true,
}: MascotProps) {
  const dim = DIMENSIONS[pose]
  const height = dim ? Math.round((width * dim.h) / dim.w) : Math.round(width * 1.3)
  return (
    <img
      src={`/brand/mascot-${pose}.png`}
      alt={decorative ? '' : SR_LABELS[pose]}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      loading="lazy"
      draggable={false}
      className={cn(
        'pointer-events-none select-none object-contain',
        animation === 'float' && 'pt-float',
        animation === 'sway' && 'pt-mascot-sway',
        flip && '-scale-x-100',
        className
      )}
    />
  )
}
