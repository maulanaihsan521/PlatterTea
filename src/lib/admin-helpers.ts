// Shared helpers for admin CRUD API routes
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireSuperAdmin, AuthError } from '@/lib/auth'

export interface AdminSessionUser {
  id: string
  email: string
  name: string
  role: string
  status: string
}

type Json = Record<string, unknown>

export function ok(data: unknown) {
  return NextResponse.json({ success: true, data })
}

export function bad(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function adminGuard() {
  try {
    return await requireAdmin()
  } catch (error) {
    if (error instanceof AuthError) {
      throw new HttpError(401, error.message)
    }
    throw error
  }
}

export async function superAdminGuard() {
  try {
    return await requireSuperAdmin()
  } catch (error) {
    if (error instanceof AuthError) {
      throw new HttpError(error.status, error.message)
    }
    throw error
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

/** Wrap a route handler with admin auth + error handling. Passes session user to fn. */
export async function handleAdmin(fn: (me: AdminSessionUser) => Promise<NextResponse>): Promise<NextResponse> {
  try {
    const me = await adminGuard()
    return await fn(me)
  } catch (error) {
    if (error instanceof HttpError) {
      return bad(error.message, error.status)
    }
    console.error('Admin API error:', error)
    return bad('Terjadi kesalahan.', 500)
  }
}

/** Wrap a route handler with SUPER_ADMIN auth + error handling */
export async function handleSuperAdmin(fn: (me: Awaited<ReturnType<typeof requireSuperAdmin>>) => Promise<NextResponse>): Promise<NextResponse> {
  try {
    const me = await superAdminGuard()
    return await fn(me)
  } catch (error) {
    if (error instanceof HttpError) {
      return bad(error.message, error.status)
    }
    console.error('Admin API error:', error)
    return bad('Terjadi kesalahan.', 500)
  }
}

export async function readJson(req: NextRequest): Promise<Json> {
  try {
    return (await req.json()) as Json
  } catch {
    return {}
  }
}

// ===== Field sanitizers =====

export function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v.trim() : fallback
}

export function optStr(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : ''
  return s === '' ? null : s
}

/**
 * Seperti optStr, tetapi bila field TIDAK dikirim (undefined) pada PATCH/PUT parsial,
 * pertahankan nilai lama — mencegah data hilang saat payload tidak lengkap.
 */
export function optStrKeep(v: unknown, existing: string | null | undefined): string | null {
  if (v === undefined) return existing ?? null
  return optStr(v)
}

/** Seperti num, tetapi undefined → pertahankan nilai lama (update parsial). */
export function numKeep(v: unknown, existing: number): number {
  if (v === undefined) return existing
  return num(v, existing)
}

export function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : fallback
}

export function bool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return fallback
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function statusVal(v: unknown, fallback = 'PUBLISHED'): string {
  const s = typeof v === 'string' ? v.toUpperCase() : ''
  return ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'EXPIRED'].includes(s) ? s : fallback
}
