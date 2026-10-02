'use client'

// Client-side helpers for Admin API calls

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json().catch(() => ({ success: false, error: 'Respon tidak valid.' }))
  if (!res.ok || !json.success) {
    const err = new Error(json.error || `Gagal memuat data (${res.status}).`)
    if (res.status === 401) (err as Error & { status?: number }).status = 401
    throw err
  }
  return json.data as T
}

async function apiSend<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({ success: false, error: 'Respon tidak valid.' }))
  if (!res.ok || !json.success) {
    const err = new Error(json.error || `Gagal (${res.status}).`)
    if (res.status === 401) (err as Error & { status?: number }).status = 401
    throw err
  }
  return json.data as T
}

export const apiPost = <T,>(url: string, body?: unknown) => apiSend<T>(url, 'POST', body)
export const apiPut = <T,>(url: string, body?: unknown) => apiSend<T>(url, 'PUT', body)
export const apiDelete = <T,>(url: string) => apiSend<T>(url, 'DELETE')

export async function apiUpload(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const json = await res.json().catch(() => ({ success: false, error: 'Respon tidak valid.' }))
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Gagal mengunggah gambar.')
  }
  return json.data
}
