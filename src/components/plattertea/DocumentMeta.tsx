'use client'

import { useEffect } from 'react'

interface DocumentMetaProps {
  title: string
  description?: string
  /** URL gambar untuk og:image / twitter:image (diubah ke absolute otomatis bila relatif). */
  image?: string | null
  /**
   * Path canonical view ini (mis. '/menu'). SEO path-routing: Google membaca
   * canonical hasil render — wajib di-update per view agar /menu, /promo, dst.
   * terindeks sebagai halaman berbeda (syarat sitelinks).
   */
  path?: string
  /**
   * Rantai breadcrumb JSON-LD (dari view, tanpa beranda — otomatis ditambahkan).
   * Contoh: [{ name: 'Menu', path: '/menu' }, { name: 'Tea Only', path: '/produk/tea-only' }]
   * Menghasilkan rich result breadcrumb Google (jalur navigasi di hasil pencarian).
   */
  breadcrumb?: { name: string; path: string }[]
  /**
   * True → meta robots noindex,nofollow (node ber-id khusus, mudah dibersihkan
   * saat pindah ke view publik). Dipakai view admin — jalur /P578Admin.
   */
  noindex?: boolean
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

/** Perbarui / buat <link rel="canonical"> — sinyal utama URL versi Google. */
function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * SEO dinamis client-side: <title> per view (React 19 hoisting), meta
 * description, OG/Twitter tags, canonical, dan breadcrumb JSON-LD.
 *
 * PENTING — kenapa <title> dirender sbg elemen React (bukan document.title):
 * React 19 mengelola <title> hoisted milik layout metadata dan ME-RESTORE
 * text node-nya ±20ms setelah penulisan imperatif document.title (terverifikasi
 * via MutationObserver). Dengan me-render <title> di dalam pohon komponen,
 * React sendiri yang menyinkronkan document.title per view — tidak ada perang.
 * SPA path-routing tidak punya metadata per route di server — sinkronisasi
 * di sini dibaca Google saat merender halaman (renderer JS Google resmi).
 */
export function DocumentMeta({ title, description, image, path, breadcrumb, noindex }: DocumentMetaProps) {
  useEffect(() => {
    // noindex admin — node ber-id agar tidak menghapus meta robots milik layout
    const ROBOTS_ID = 'pt-robots-noindex'
    if (noindex) {
      let el = document.getElementById(ROBOTS_ID) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.id = ROBOTS_ID
        el.setAttribute('name', 'robots')
        document.head.appendChild(el)
      }
      el.setAttribute('content', 'noindex, nofollow')
    } else {
      document.getElementById(ROBOTS_ID)?.remove()
    }

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
    if (path) {
      const url = absoluteUrl(path)
      setCanonical(url)
      setMeta('property', 'og:url', url)
    }

    // Breadcrumb JSON-LD — selalu mulai dari beranda (konvensi schema.org)
    const scriptId = 'pt-jsonld-breadcrumb'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (breadcrumb && breadcrumb.length > 0) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: window.location.origin + '/' },
          ...breadcrumb.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: b.name,
            item: absoluteUrl(b.path),
          })),
        ],
      }
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [title, description, image, path, breadcrumb, noindex])

  // <title> hoisted React 19 → head; document.title ikut tersinkron otomatis
  return <title>{title}</title>
}
