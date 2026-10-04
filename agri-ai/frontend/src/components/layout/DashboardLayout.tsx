import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Sprout, FlaskConical, TrendingUp, Droplets,
  CloudSun, Bug, ShieldAlert, LineChart, Wallet, Workflow,
  Bot, Bell, FileText, Settings, LogOut, Menu, X, User,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/services/auth'
import { useLanguage } from '@/i18n/LanguageContext'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: any
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // All sections open by default
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const navGroups: NavGroup[] = [
    {
      id: 'overview',
      label: t('nav.overview', 'OVERVIEW'),
      items: [
        { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
      ],
    },
    {
      id: 'farm',
      label: t('nav.farm', 'FARM'),
      items: [
        { to: '/dashboard/farms', label: t('nav.farms', 'Farm Management'), icon: Sprout },
      ],
    },
    {
      id: 'intelligence',
      label: t('nav.intelligence', 'INTELLIGENCE'),
      items: [
        { to: '/dashboard/soil',        label: t('nav.soil', 'Soil Analysis'),               icon: FlaskConical },
        { to: '/dashboard/crop',        label: t('nav.crop', 'Crop Recommendation'),         icon: Sprout },
        { to: '/dashboard/irrigation',  label: t('nav.irrigation', 'Irrigation'),            icon: Droplets },
        { to: '/dashboard/action-plan', label: t('nav.actionPlan', 'Crop Action Plan'),      icon: Sprout },
        { to: '/dashboard/yield',       label: t('nav.yield', 'Yield Prediction'),           icon: TrendingUp },
        { to: '/dashboard/weather',     label: t('nav.weather', 'Weather'),                  icon: CloudSun },
        { to: '/dashboard/disease',     label: t('nav.disease', 'Disease Detection'),        icon: Bug },
        { to: '/dashboard/fertilizer',  label: t('nav.fertilizer', 'Fertilizer'),            icon: FlaskConical },
      ],
    },
    {
      id: 'business',
      label: t('nav.business', 'BUSINESS'),
      items: [
        { to: '/dashboard/risk',     label: t('nav.risk', 'Risk Assessment'),       icon: ShieldAlert },
        { to: '/dashboard/market',   label: t('nav.market', 'Market Prices'),       icon: LineChart },
        { to: '/dashboard/profit',   label: t('nav.profit', 'Profit Calculator'),   icon: Wallet },
        { to: '/dashboard/optimize', label: t('nav.optimize', 'Optimization'),      icon: Workflow },
      ],
    },
    {
      id: 'assistance',
      label: t('nav.assistance', 'ASSISTANCE'),
      items: [
        { to: '/dashboard/assistant',     label: t('nav.assistant', 'AI Assistant'),         icon: Bot },
        { to: '/dashboard/notifications', label: t('nav.notifications', 'Notifications'),   icon: Bell },
        { to: '/dashboard/reports',       label: t('nav.reports', 'Reports'),                 icon: FileText },
      ],
    },
  ]


  // Auto-expand the section that contains the current route
  useEffect(() => {
    const currentPath = location.pathname
    for (const group of navGroups) {
      if (group.items.some((it) => it.to === currentPath)) {
        setCollapsedSections((prev) => ({ ...prev, [group.id]: false }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="flex">

        {/* ── Desktop Sidebar ─────────────────────────────────────── */}
        <aside className="hidden lg:flex sticky top-0 h-screen w-[248px] shrink-0 flex-col bg-white border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 z-30">
          <SidebarContent
            navGroups={navGroups}
            user={user}
            onLogout={handleLogout}
            t={t}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
          />
        </aside>

        {/* ── Mobile Drawer ────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col bg-white border-r border-neutral-200 shadow-xl dark:bg-neutral-900 dark:border-neutral-800">
              {/* Mobile close button in header */}
              <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
                <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32] text-white">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <span className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">
                    Agri<span className="text-[#2E7D32]">AI</span>
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <LanguageSelector variant="compact" />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarBody
                  navGroups={navGroups}
                  onNavigate={() => setSidebarOpen(false)}
                  user={user}
                  onLogout={handleLogout}
                  t={t}
                  collapsedSections={collapsedSections}
                  toggleSection={toggleSection}
                />
              </div>
            </aside>
          </div>
        )}

        {/* ── Main Content Area ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Mobile top bar ───────────────────────────────────────── */}
          <div className="lg:hidden">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 text-neutral-700 hover:text-[#2E7D32] dark:text-neutral-300"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32] text-white">
                  <Leaf className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Agri<span className="text-[#2E7D32]">AI</span>
                </span>
              </Link>
              <LanguageSelector variant="compact" />
            </header>
          </div>

          {/* ── Main content ─────────────────────────────────────────── */}
          <main className="min-w-0 flex-1 p-4 lg:p-6">
            <div className="w-full pb-20 lg:pb-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// ── SidebarContent: header + scrollable body ──────────────────────────────────
function SidebarContent({
  navGroups,
  onNavigate,
  user,
  onLogout,
  t,
  collapsedSections,
  toggleSection,
}: {
  navGroups: NavGroup[]
  onNavigate?: () => void
  user?: { name?: string; email?: string } | null
  onLogout: () => void
  t: (key: string) => string
  collapsedSections: Record<string, boolean>
  toggleSection: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
        <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2E7D32] text-white shadow-sm">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Agri<span className="text-[#2E7D32]">AI</span>
          </span>
        </Link>
        <LanguageSelector variant="compact" />
      </div>

      {/* Scrollable nav body */}
      <div className="flex-1 overflow-y-auto">
        <SidebarBody
          navGroups={navGroups}
          onNavigate={onNavigate}
          user={user}
          onLogout={onLogout}
          t={t}
          collapsedSections={collapsedSections}
          toggleSection={toggleSection}
        />
      </div>
    </div>
  )
}

// ── SidebarBody: nav groups + user section ─────────────────────────────────────
function SidebarBody({
  navGroups,
  onNavigate,
  user,
  onLogout,
  t,
  collapsedSections,
  toggleSection,
}: {
  navGroups: NavGroup[]
  onNavigate?: () => void
  user?: { name?: string; email?: string } | null
  onLogout: () => void
  t: (key: string, fallback?: string, variables?: Record<string, string | number>) => string
  collapsedSections: Record<string, boolean>
  toggleSection: (id: string) => void
}) {
  return (
    <div className="flex flex-col px-3 py-3">

      {navGroups.map((group) => {
        const isOpen = !collapsedSections[group.id]
        const Chevron = isOpen ? ChevronUp : ChevronDown

        return (
          <div key={group.id} className="mb-1">
            {/* ── Section heading (uppercase, gray, chevron right) ── */}
            <button
              type="button"
              onClick={() => toggleSection(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left select-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-150"
            >
              <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                {group.label}
              </span>
              <Chevron className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
            </button>

            {/* ── Animated collapse/expand ── */}
            <div
              className={cn(
                'grid transition-all duration-200 ease-in-out',
                isOpen
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0 pointer-events-none'
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-0.5 pb-2 pt-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/dashboard'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-all duration-150 mx-0.5',
                          isActive
                            ? 'bg-[#2E7D32] text-white shadow-sm'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={cn(
                              'h-4 w-4 shrink-0',
                              isActive
                                ? 'text-white'
                                : 'text-[#2E7D32] dark:text-[#46c05b]'
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* ── Divider before user section ── */}
      <div className="my-2 border-t border-neutral-200 dark:border-neutral-800" />

      {/* ── User section ── */}
      <div className="pb-2">
        {/* User info */}
        <div className="px-3 py-2 mb-1">
          <p className="text-[13.5px] font-semibold text-neutral-900 truncate dark:text-neutral-100">
            {user?.name || 'chaitu'}
          </p>
          <p className="text-[11.5px] text-neutral-400 truncate dark:text-neutral-500">
            {user?.email || 'chaitu@gmail.com'}
          </p>
        </div>

        {/* Profile */}
        <NavLink
          to="/dashboard/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-all duration-150 mx-0.5',
              isActive
                ? 'bg-[#2E7D32] text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
            )
          }
        >
          {({ isActive }) => (
            <>
              <User className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-[#2E7D32] dark:text-[#46c05b]')} />
              <span>{t('nav.profile', 'Profile')}</span>
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/dashboard/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium transition-all duration-150 mx-0.5',
              isActive
                ? 'bg-[#2E7D32] text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-[#2E7D32] dark:text-[#46c05b]')} />
              <span>{t('nav.settings', 'Settings')}</span>
            </>
          )}
        </NavLink>

        {/* Log out */}
        <button
          type="button"
          onClick={() => { onNavigate?.(); onLogout() }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13.5px] font-medium text-neutral-600 transition-all duration-150 mx-0.5 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 text-left"
        >
          <LogOut className="h-4 w-4 shrink-0 text-[#2E7D32] dark:text-[#46c05b]" />
          <span>{t('nav.logout', 'Log out')}</span>
        </button>
      </div>
    </div>
  )
}
