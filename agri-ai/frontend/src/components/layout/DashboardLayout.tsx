import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Sprout, FlaskConical, TrendingUp, Droplets,
  CloudSun, Bug, ShieldAlert, LineChart, Wallet, Workflow,
  Bot, Bell, FileText, Settings, LogOut, Menu, X, User,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/services/auth'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navGroups = [
    {
      label: t('nav.overview'),
      items: [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      ],
    },
    {
      label: t('nav.farm'),
      items: [
        { to: '/dashboard/farms', label: t('nav.farms'), icon: Sprout },
      ],
    },
    {
      label: t('nav.intelligence'),
      items: [
        { to: '/dashboard/soil', label: t('nav.soil'), icon: FlaskConical },
        { to: '/dashboard/crop', label: t('nav.crop'), icon: Sprout },
        { to: '/dashboard/yield', label: t('nav.yield'), icon: TrendingUp },
        { to: '/dashboard/irrigation', label: t('nav.irrigation'), icon: Droplets },
        { to: '/dashboard/weather', label: t('nav.weather'), icon: CloudSun },
        { to: '/dashboard/disease', label: t('nav.disease'), icon: Bug },
        { to: '/dashboard/fertilizer', label: t('nav.fertilizer'), icon: FlaskConical },
      ],
    },
    {
      label: t('nav.business'),
      items: [
        { to: '/dashboard/risk', label: t('nav.risk'), icon: ShieldAlert },
        { to: '/dashboard/market', label: t('nav.market'), icon: LineChart },
        { to: '/dashboard/profit', label: t('nav.profit'), icon: Wallet },
        { to: '/dashboard/optimize', label: t('nav.optimize'), icon: Workflow },
      ],
    },
    {
      label: t('nav.assistance'),
      items: [
        { to: '/dashboard/assistant', label: t('nav.assistant'), icon: Bot },
        { to: '/dashboard/notifications', label: t('nav.notifications'), icon: Bell },
        { to: '/dashboard/reports', label: t('nav.reports'), icon: FileText },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4 lg:block dark:border-neutral-800 dark:bg-neutral-900">
          <SidebarContent
            navGroups={navGroups}
            user={user}
            onLogout={handleLogout}
            t={t}
          />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl dark:bg-neutral-900 dark:border-r dark:border-neutral-800">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{t('nav.menu')}</span>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent
                navGroups={navGroups}
                onNavigate={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
                t={t}
              />
            </aside>
          </div>
        )}

        {/* Mobile top bar */}
        <div className="flex-1 lg:hidden">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="text-neutral-700 dark:text-neutral-300">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Agri<span className="text-brand">AI</span></span>
            </Link>
            <div className="w-6" />
          </header>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-6xl pb-20 lg:pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  navGroups,
  onNavigate,
  user,
  onLogout,
  t,
}: {
  navGroups: { label: string; items: { to: string; label: string; icon: any }[] }[]
  onNavigate?: () => void
  user?: { name?: string; email?: string } | null
  onLogout: () => void
  t: (key: string) => string
}) {
  return (
    <nav className="flex h-full flex-col space-y-6">
      <div className="flex items-center gap-2 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Agri<span className="text-brand">AI</span></span>
      </div>

      <div className="flex-1 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Account section (bottom of sidebar) */}
      <div className="space-y-1 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {user?.name || 'Farmer'}
          </p>
          {user?.email && (
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
          )}
        </div>
        <NavLink
          to="/dashboard/profile"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <User className="h-4 w-4 shrink-0" />
          <span>{t('nav.profile')}</span>
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>{t('nav.settings')}</span>
        </NavLink>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </nav>
  )
}
