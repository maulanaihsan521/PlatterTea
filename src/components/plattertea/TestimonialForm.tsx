'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2, PenLine, Send, Star } from 'lucide-react'

interface TestimonialFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_LEN = 300

/**
 * Form "Tulis Testimoni" untuk pengunjung publik.
 * Kiriman masuk sebagai DRAFT — tampil setelah disetujui admin (moderasi).
 * Termasuk honeypot anti-bot (field "website" tersembunyi).
 */
export function TestimonialForm({ open, onOpenChange }: TestimonialFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const reset = () => {
    setName('')
    setRole('')
    setContent('')
    setRating(5)
    setHoneypot('')
    setErrorMsg('')
  }

  const close = (v: boolean) => {
    if (!v) {
      // beri jeda agar dialog tertutup dulu sebelum state direset
      setTimeout(() => {
        reset()
        setDone(false)
      }, 250)
    }
    onOpenChange(v)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (name.trim().length < 2 || content.trim().length < 10) {
      setErrorMsg('Nama minimal 2 karakter dan cerita minimal 10 karakter ya.')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role: role.trim(), content: content.trim(), rating, website: honeypot }),
      })
      const json = (await res.json()) as { success?: boolean; error?: string }

      if (res.ok && json.success) {
        setDone(true)
        toast({ title: 'Testimoni terkirim — terima kasih!' })
      } else {
        setErrorMsg(json.error || 'Gagal mengirim. Coba lagi.')
      }
    } catch {
      setErrorMsg('Koneksi bermasalah. Periksa internetmu dan coba lagi.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-light">
              <CheckCircle2 className="h-9 w-9 text-forest" aria-hidden="true" />
            </span>
            <DialogHeader className="items-center gap-2">
              <DialogTitle className="text-xl text-forest">Terima kasih! 💚</DialogTitle>
              <DialogDescription className="max-w-[280px] text-[13.5px] leading-relaxed">
                Testimoni kamu sudah kami terima dan akan tampil di website setelah ditinjau tim PlatterTea.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => close(false)}
              className="mt-1 h-11 rounded-full bg-forest px-8 font-bold text-cream hover:bg-forest-dark"
            >
              Selesai
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-forest">
                <PenLine className="h-5 w-5 text-gold-dark" aria-hidden="true" />
                Tulis Testimoni
              </DialogTitle>
              <DialogDescription>
                Ceritakan pengalamanmu menikmati PlatterTea — ulasan membantu kami tumbuh.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="grid gap-4 pt-1" noValidate>
              {/* Honeypot anti-bot — tersembunyi dari manusia */}
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="tf-nama" className="text-[12.5px] font-bold text-forest">
                    Nama <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="tf-nama"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 40))}
                    placeholder="cth. Sari M."
                    maxLength={40}
                    required
                    className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-[13.5px] text-forest outline-none transition-colors placeholder:text-forest/35 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="tf-peran" className="text-[12.5px] font-bold text-forest">
                    Keterangan
                  </label>
                  <input
                    id="tf-peran"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value.slice(0, 40))}
                    placeholder="cth. Mahasiswa (opsional)"
                    maxLength={40}
                    className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-[13.5px] text-forest outline-none transition-colors placeholder:text-forest/35 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <span id="tf-rating-label" className="text-[12.5px] font-bold text-forest">
                  Rating <span className="text-destructive">*</span>
                </span>
                <div className="flex items-center gap-1.5" role="radiogroup" aria-labelledby="tf-rating-label">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1
                    const active = val <= rating
                    return (
                      <button
                        key={val}
                        type="button"
                        role="radio"
                        aria-checked={val === rating}
                        aria-label={`${val} bintang`}
                        onClick={() => setRating(val)}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
                          active ? 'bg-gold/10' : 'bg-forest/5'
                        )}
                      >
                        <Star className={cn('h-5 w-5 transition-colors', active ? 'fill-gold text-gold' : 'text-forest/25')} />
                      </button>
                    )
                  })}
                  <span className="ml-1 text-[12.5px] font-semibold text-forest/55">{rating}/5</span>
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="tf-isi" className="text-[12.5px] font-bold text-forest">
                  Cerita Kamu <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="tf-isi"
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
                  placeholder="Bagaimana rasa menunya, pelayanan booth, momen favoritmu…"
                  rows={4}
                  maxLength={MAX_LEN}
                  required
                  className="rounded-xl border border-forest/15 bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-forest outline-none transition-colors placeholder:text-forest/35 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/25"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-forest/40">{content.length}/{MAX_LEN}</span>
                  <span className="text-[11px] text-forest/40">Moderasi dulu sebelum tampil ✓</span>
                </div>
              </div>

              {errorMsg && (
                <p role="alert" className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-destructive">
                  {errorMsg}
                </p>
              )}

              <Button
                type="submit"
                disabled={sending || name.trim().length < 2 || content.trim().length < 10}
                className="h-11 rounded-full bg-forest font-bold text-cream hover:bg-forest-dark disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                {sending ? 'Mengirim…' : 'Kirim Testimoni'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
