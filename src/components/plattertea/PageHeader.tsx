'use client'

import { Leaf, LeafPair } from './Decor'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  script?: boolean
  className?: string
}

/** Dark green header with organic wave bottom edge — matches mockup "Menu Kami" header */
export function PageHeader({ title, subtitle, script = true, className }: PageHeaderProps) {
  return (
    <header className={cn('relative overflow-hidden bg-forest pb-14 pt-24 sm:pb-16 sm:pt-28', className)}>
      <Leaf className="absolute right-[12%] top-24 h-10 w-16 rotate-12 text-gold/40" />
      <LeafPair flip className="absolute -left-4 top-16 h-16 w-24 text-forest-light/50" />
      <LeafPair className="absolute right-[4%] bottom-10 h-12 w-20 text-forest-light/40" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className={cn(script ? 'font-script text-4xl text-cream sm:text-5xl' : 'text-3xl font-extrabold text-cream sm:text-4xl', 'pt-fade-up')}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl text-[15px] text-cream/75 sm:text-base">{subtitle}</p>
        )}
      </div>

      {/* wave bottom */}
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-[36px] w-full text-background sm:h-[46px]"
        aria-hidden="true"
      >
        <path
          d="M0,40 C240,90 480,-10 720,20 C960,50 1200,80 1440,30 L1440,70 L0,70 Z"
          fill="currentColor"
        />
      </svg>
    </header>
  )
}
