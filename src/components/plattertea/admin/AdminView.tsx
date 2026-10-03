'use client'

import { useEffect, useState } from 'react'
import { AdminLogin } from './AdminLogin'
import { AdminDashboard } from './AdminDashboard'
import { ProductManager } from './ProductManager'
import { CategoryManager } from './CategoryManager'
import { PromotionManager } from './PromotionManager'
import { TestimonialManager } from './TestimonialManager'
import { FaqManager } from './FaqManager'
import { GalleryManager } from './GalleryManager'
import { SettingsManager } from './SettingsManager'
import { UserManager } from './UserManager'
import { AuditManager } from './AuditManager'
import { ResetPasswordForm } from './ResetPasswordForm'
import { MediaManager } from './MediaManager'
import { SecurityNotifier } from './SecurityNotifier'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { adminFetch } from './shared'
import {
  LayoutDashboard,
  Package,
  Tags,
  BadgePercent,
  MessageSquareQuote,
  HelpCircle,
  Images,
  FolderOpen,
  Settings,
  Users,
  History,
  LogOut,
  Menu,
  ExternalLink,
  Loader2,
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  status: string
}

const NAV: { key: string; label: string; icon: typeof Package; superOnly?: boolean }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Produk', icon: Package },
  { key: 'categories', label: 'Kategori', icon: Tags },
  { key: 'promotions', label: 'Promo', icon: BadgePercent },
  { key: 'testimonials', label: 'Testimoni', icon: MessageSquareQuote },
  { key: 'faqs', label: 'FAQ', icon: HelpCircle },
  { key: 'gallery', label: 'Galeri', icon: Images },
  { key: 'media', label: 'Media', icon: FolderOpen },
  { key: 'settings', label: 'Pengaturan', icon: Settings },
  { key: 'audit', label: 'Aktivitas', icon: History },
  { key: 'users', label: 'User Admin', icon: Users, superOnly: true },
]

/** Slug URL → section key (dukung slug Bahasa Indonesia & key Bahasa Inggris). */
const SECTION_ALIASES: Record<string, string> = {
  dashboard: 'dashboard',
  products: 'products',
  produk: 'products',
  categories: 'categories',
  kategori: 'categories',
  promotions: 'promotions',
  promo: 'promotions',
  testimonials: 'testimonials',
  testimoni: 'testimonials',
  faqs: 'faqs',
  faq: 'faqs',
  gallery: 'gallery',
  galeri: 'gallery',
  media: 'media',
  settings: 'settings',
  pengaturan: 'settings',
  audit: 'audit',
  aktivitas: 'audit',
  users: 'users',
  'user-admin': 'users',
}

function NavList({
  active,
  onNavigate,
  className,
  isSuperAdmin,
}: {
  active: string
  onNavigate: (k: string) => void
  className?: string
  isSuperAdmin?: boolean
}) {
  return (
    <nav className={cn('flex flex-col gap-1', className)} aria-label="Menu admin">
      {NAV.filter((n) => !n.superOnly || isSuperAdmin).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onNavigate(key)}
          aria-current={active === key ? 'page' : undefined}
          className={cn(
            'flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-left text-[13.5px] font-bold transition-all duration-150',
            active === key
              ? 'bg-gold text-forest shadow-[0_4px_14px_rgba(232,161,38,0.35)]'
              : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
          )}
        >
          <Icon className="h-4.5 w-4.5 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  )
}

function Manager({
  section,
  userName,
  userId,
  isSuperAdmin,
  onNavigate,
}: {
  section: string
  userName: string
  userId: string
  isSuperAdmin: boolean
  onNavigate: (k: string) => void
}) {
  switch (section) {
    case 'products':
      return <ProductManager />
    case 'categories':
      return <CategoryManager />
    case 'promotions':
      return <PromotionManager />
    case 'testimonials':
      return <TestimonialManager />
    case 'faqs':
      return <FaqManager />
    case 'gallery':
      return <GalleryManager />
    case 'media':
      return <MediaManager />
    case 'settings':
      return <SettingsManager />
    case 'audit':
      return <AuditManager isSuperAdmin={isSuperAdmin} />
    case 'users':
      return isSuperAdmin ? <UserManager meId={userId} /> : <AdminDashboard userName={userName} onNavigate={onNavigate} isSuperAdmin={isSuperAdmin} />
    default:
      return <AdminDashboard userName={userName} onNavigate={onNavigate} isSuperAdmin={isSuperAdmin} />
  }
}

export function AdminView({ path = [] }: { path?: string[] }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Deep-link /P578Admin/reset/{token} (legacy hash #/P578Admin/... tetap didukung)
  // — alur reset password berdiri sendiri
  const isResetFlow = path[0] === 'reset'

  // Section diambil langsung dari URL → deep-link, refresh, dan tombol back/forward bekerja
  const section = SECTION_ALIASES[path[0] || ''] || 'dashboard'

  useEffect(() => {
    let mounted = true
    adminFetch<AdminUser>('/api/admin/me').then((res) => {
      if (!mounted) return
      if (res.ok && res.data) setUser(res.data)
      setChecking(false)
    })
  }, [])

  const logout = async () => {
    await adminFetch('/api/admin/logout', { method: 'POST' })
    setUser(null)
  }

  if (isResetFlow) {
    return <ResetPasswordForm token={path[1]} />
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest">
        <div className="flex flex-col items-center gap-3 text-cream/70">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm font-bold">Memuat CMS…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} />
  }

  const onNavigate = (k: string) => {
    // URL-driven: pushState path admin asli + event pt:navigate memicu
    // re-render AdminView dengan path baru (deep-link & back/forward bekerja)
    const target = k === 'dashboard' ? '/P578Admin' : `/P578Admin/${k}`
    if (window.location.pathname !== target) {
      history.pushState(null, '', target)
      window.dispatchEvent(new Event('pt:navigate'))
    }
    setDrawerOpen(false)
  }

  const activeLabel = NAV.find((n) => n.key === section)?.label || 'Dashboard'

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-forest px-4 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <img src="/brand/logo-mark.png" alt="Logo PlatterTea" className="h-10 w-10 rounded-xl bg-white/95 object-contain p-1" />
          <div>
            <p className="text-[15px] font-extrabold text-cream">PlatterTea</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold-light">Content CMS</p>
          </div>
        </div>

        <NavList active={section} onNavigate={onNavigate} className="mt-8 flex-1" isSuperAdmin={user.role === 'SUPER_ADMIN'} />

        <div className="mt-4 border-t border-cream/10 pt-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-[13px] font-extrabold text-gold-light">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-cream">{user.name}</p>
              <p className="truncate text-[11px] text-cream/50">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <a
              href="#/"
              className="flex min-h-[40px] items-center gap-3 rounded-xl px-4 text-[13px] font-bold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <ExternalLink className="h-4 w-4" /> Lihat Website
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex min-h-[40px] w-full items-center gap-3 rounded-xl px-4 text-left text-[13px] font-bold text-cream/70 transition-colors hover:bg-destructive/20 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen w-full flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-forest/10 bg-cream/90 px-4 backdrop-blur sm:px-6">
          {/* Mobile drawer trigger */}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-forest/20 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu admin"
          >
            <Menu className="h-5 w-5 text-forest" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold text-forest">{activeLabel}</p>
          </div>
          {user.role === 'SUPER_ADMIN' && (
            <SecurityNotifier onOpenAudit={() => onNavigate('audit')} />
          )}
          <a
            href="#/"
            className="hidden h-9 items-center gap-1.5 rounded-full border border-forest/20 px-4 text-xs font-bold text-forest transition-colors hover:bg-sage-light sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Lihat Website
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="h-9 rounded-full border-destructive/25 px-3.5 text-xs font-bold text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </Button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Manager
            section={section}
            userName={user.name}
            userId={user.id}
            isSuperAdmin={user.role === 'SUPER_ADMIN'}
            onNavigate={onNavigate}
          />
        </main>

        <footer className="px-4 pb-6 text-center text-[11.5px] text-forest/40 sm:px-6">
          PlatterTea CMS · Website ini tidak memproses transaksi — pemesanan via WhatsApp.
        </footer>
      </div>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-72 border-forest/20 bg-forest p-0 [&>button]:text-cream">
          <SheetHeader className="border-b border-cream/10 px-5 pb-4 pt-5 text-left">
            <SheetTitle className="flex items-center gap-3 text-cream">
              <img src="/brand/logo-mark.png" alt="Logo PlatterTea" className="h-9 w-9 rounded-lg bg-white/95 object-contain p-1" />
              <span className="text-[15px] font-extrabold">PlatterTea CMS</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-[calc(100%-92px)] flex-col px-3 py-4">
            <NavList active={section} onNavigate={onNavigate} className="flex-1" isSuperAdmin={user.role === 'SUPER_ADMIN'} />
            <a
              href="#/"
              className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-[13px] font-bold text-cream/70 hover:bg-cream/10 hover:text-cream"
            >
              <ExternalLink className="h-4 w-4" /> Lihat Website
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
