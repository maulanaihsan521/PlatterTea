'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '../PageHeader'
import type { Faq } from '@/lib/plattertea'
import { useSettings, waLink, WA_MESSAGES } from '@/hooks/use-plattertea'
import { MessageCircle, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { LeafPair } from '../Decor'
import { Mascot } from '../Mascot'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqViewProps {
  navigate: (r: Route) => void
}

export function FaqView({ navigate }: FaqViewProps) {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const settings = useSettings()
  const wa = waLink(settings.whatsapp, WA_MESSAGES.general)

  useEffect(() => {
    let mounted = true
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res.success) setFaqs(res.data)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen">
      <PageHeader
        title="FAQ"
        subtitle="Pertanyaan yang sering ditanyakan."
      />

      <section className="relative pb-28 pt-12 lg:pb-20">
        <LeafPair className="pointer-events-none absolute left-[4%] top-12 h-14 w-20 -rotate-12 text-forest-light/25" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Maskot berbisik — pembuka FAQ yang playful */}
          {!loading && faqs.length > 0 && (
            <div className="mb-6 flex items-end gap-3">
              <Mascot pose="quiet" width={64} animation="sway" className="w-14 shrink-0" />
              <p className="rotate-[-2deg] font-hand text-xl font-semibold text-forest/85 sm:text-2xl">
                Psst… jawabannya ada di sini!
              </p>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="flex justify-center">
                <Mascot pose="point" width={100} animation="float" className="w-20" />
              </div>
              <p className="mt-1 text-forest/70">Belum ada FAQ yang ditampilkan.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3.5">
              {faqs.map((f) => (
                <AccordionItem
                  key={f.id}
                  value={f.id}
                  className="overflow-hidden rounded-2xl border-0 bg-white shadow-[0_2px_16px_rgba(23,61,50,0.06)] transition-shadow duration-200 data-[state=open]:shadow-[0_10px_28px_rgba(23,61,50,0.12)]"
                >
                  <AccordionTrigger className="px-5 py-4.5 text-left text-[15px] font-bold text-forest hover:no-underline [&>svg:last-child]:hidden [&>svg:first-child]:hidden">
                    <span className="flex-1 pr-3">{f.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest transition-transform duration-200 [[data-state=open]>&]:rotate-45">
                      <Plus className="h-4.5 w-4.5" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-0 text-[14px] leading-relaxed text-forest/75">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Bottom CTA card */}
          <div className="relative mt-10 overflow-hidden rounded-[28px] bg-forest p-8 text-center shadow-[0_16px_40px_rgba(15,46,38,0.3)] sm:p-9">
            <LeafPair flip className="pointer-events-none absolute -bottom-4 -left-3 h-14 w-20 text-forest-light/50" />
            <LeafPair className="pointer-events-none absolute -right-4 -top-3 h-14 w-20 text-forest-light/50" />
            <p className="font-script text-3xl text-gold-light">Masih ada pertanyaan?</p>
            <p className="mt-2 text-[14px] text-cream/75">Hubungi kami via WhatsApp</p>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-cream px-7 py-3 text-[15px] font-bold text-forest shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
            >
              <MessageCircle className="h-5 w-5" />
              Chat via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
