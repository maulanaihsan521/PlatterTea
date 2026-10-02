'use client'

import { useEffect } from 'react'

interface DocumentMetaProps {
  title: string
  description?: string
  /** URL gambar untuk og:image / twitter:image (diubah ke absolute otomatis bila relatif). */
  image?: string | null
}

function absoluteUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src
  return `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`
}

/** Perbarui / buat meta tag (termasuk yang belum ada di HTML awal). */
function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/**
 * SEO dinamis client-side: perbarui <title>, meta description, dan OG tags
 * setiap kali view berubah (SPA hash-routing tidak punya metadata per route).
 */
export function DocumentMeta({ title, description, image }: DocumentMetaProps) {
  useEffect(() => {
    document.title = title
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:title', title)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:title', title)
      setMeta('name', 'twitter:description', description)
    }
    if (image) {
      const url = absoluteUrl(image)
      setMeta('property', 'og:image', url)
      setMeta('name', 'twitter:image', url)
      setMeta('property', 'og:image:alt', title)
    }
  }, [title, description, image])

  return null
}
