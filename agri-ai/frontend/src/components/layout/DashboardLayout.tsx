import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Sprout, FlaskConical, TrendingUp, Droplets,
  CloudSun, Bug, ShieldAlert, LineChart, Wallet, Workflow,
  Bot, Bell, FileText, Settings, LogOut, Menu, X, User, ChevronRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/services/auth'
import { useLanguage } from '@/i18n/LanguageContext'
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
      label: t('nav.overview'),
      items: [
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      ],
    },
    {
      id: 'farm',
      label: t('nav.farm'),
      items: [
        { to: '/dashboard/farms', label: t('nav.farms'), icon: Sprout },
      ],
    },
    {
      id: 'intelligence',
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
      id: 'business',
      label: t('nav.business'),
      items: [
        { to: '/dashboard/risk', label: t('nav.risk'), icon: ShieldAlert },
        { to: '/dashboard/market', label: t('nav.market'), icon: LineChart },
        { to: '/dashboard/profit', label: t('nav.profit'), icon: Wallet },
        { to: '/dashboard/optimize', label: t('nav.optimize'), icon: Workflow },
      ],
    },
    {
      id: 'assistance',
      label: t('nav.assistance'),
      items: [
        { to: '/dashboard/assistant', label: t('nav.assistant'), icon: Bot },
        { to: '/dashboard/notifications', label: t('nav.notifications'), icon: Bell },
        { to: '/dashboard/reports', label: t('nav.reports'), icon: FileText },
      ],
    },
  ]

  // Automatically keep current section expanded if user navigates to a nested page
  useEffect(() => {
    const currentPath = location.pathname
    for (const group of navGroups) {
      if (group.items.some((it) => it.to === currentPath)) {
        if (collapsedSections[group.id]) {
          setCollapsedSections((prev) => ({ ...prev, [group.id]: false }))
        }
      }
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-2.5 my-2.5 ml-2.5 hidden h-[calc(100vh-1.25rem)] w-64 xl:w-72 shrink-0 flex-col rounded-[8px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:flex dark:border-neutral-800 dark:bg-neutral-900 z-30">
          <SidebarContent
            navGroups={navGroups}
            user={user}
            onLogout={handleLogout}
            t={t}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
          />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-[290px] max-w-[85vw] flex-col border-r border-[#E5E7EB] bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-14 items-center justify-between border-b border-[#E5E7EB] px-4 dark:border-neutral-800">
                <Link
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32] text-white shadow-sm">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <span className="text-[17px] font-semibold tracking-tight text-[#17231A] dark:text-neutral-100">
                    Agri<span className="text-[#2E7D32] dark:text-[#46c05b]">AI</span>
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="rounded-md p-1.5 text-[#5F6B63] hover:bg-[#F3F4F6] hover:text-[#17231A] dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 custom-doc-scrollbar">
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

        {/* Mobile top bar */}
        <div className="flex-1 lg:hidden">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="p-1 text-[#17231A] hover:text-[#2E7D32] dark:text-neutral-300"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32] text-white shadow-sm">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold text-[#17231A] dark:text-neutral-100">
                Agri<span className="text-[#2E7D32]">AI</span>
              </span>
            </Link>
            <div className="w-7" />
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
      {/* AgriAI Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 dark:border-neutral-800">
        <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32] text-white shadow-sm transition-transform duration-150 group-hover:scale-105">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-[18px] font-semibold tracking-tight text-[#17231A] dark:text-neutral-100">
            Agri<span className="text-[#2E7D32] dark:text-[#46c05b]">AI</span>
          </span>
        </Link>
      </div>

      {/* Independently Scrollable Navigation Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 custom-doc-scrollbar">
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
  t: (key: string) => string
  collapsedSections: Record<string, boolean>
  toggleSection: (id: string) => void
}) {
  return (
    <nav className="flex flex-col">
      {navGroups.map((group, index) => {
        const isCollapsed = Boolean(collapsedSections[group.id])

        return (
          <div key={group.id} className="flex flex-col">
            {/* Documentation-style Section Heading with Collapsible Chevron */}
            <button
              type="button"
              onClick={() => toggleSection(group.id)}
              aria-expanded={!isCollapsed}
              className="group flex w-full items-center justify-between rounded-[6px] py-3 px-3 text-left transition-colors duration-150 hover:bg-[#F9FAFB] select-none dark:hover:bg-neutral-800/40"
            >
              <span className="text-[17px] font-medium tracking-normal text-[#17231A] transition-colors duration-150 group-hover:text-[#2E7D32] dark:text-neutral-100 dark:group-hover:text-[#46c05b]">
                {group.label}
              </span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-[#5F6B63] transition-transform duration-200 ease-in-out group-hover:text-[#2E7D32] dark:text-neutral-400 dark:group-hover:text-[#46c05b]',
                  !isCollapsed ? 'rotate-90' : 'rotate-0'
                )}
              />
            </button>

            {/* Nested Items with Accordion Smooth Transition */}
            <div
              className={cn(
                'grid transition-all duration-200 ease-in-out',
                isCollapsed
                  ? 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  : 'grid-rows-[1fr] opacity-100'
              )}
            >
              <div className="overflow-hidden pl-[22px] space-y-1 pt-1 pb-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[14.5px] transition-all duration-150',
                        isActive
                          ? 'bg-[#EAF6EA] font-medium text-[#2E7D32] dark:bg-[#1b3d26]/80 dark:text-[#46c05b]'
                          : 'font-normal text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17231A] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            'h-[17px] w-[17px] shrink-0 transition-colors duration-150',
                            isActive
                              ? 'text-[#2E7D32] dark:text-[#46c05b]'
                              : 'text-[#5F6B63] group-hover:text-[#17231A] dark:text-neutral-400 dark:group-hover:text-neutral-200'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Subtle Divider between major sections */}
            {index < navGroups.length - 1 && (
              <div className="my-2.5 border-t border-[#E5E7EB] dark:border-neutral-800" />
            )}
          </div>
        )
      })}

      {/* Subtle Divider before User Section */}
      <div className="my-2.5 border-t border-[#E5E7EB] dark:border-neutral-800" />

      {/* Documentation-style User Profile Section */}
      <div className="pt-1 pb-2">
        <div className="px-3 py-1.5 mb-1.5">
          <p className="truncate text-[15px] font-semibold text-[#17231A] dark:text-neutral-100">
            {user?.name || 'chaitu'}
          </p>
          <p className="truncate text-xs text-[#5F6B63] dark:text-neutral-400">
            {user?.email || 'chaitu@gmail.com'}
          </p>
        </div>
        <div className="pl-[22px] space-y-1">
          <NavLink
            to="/dashboard/profile"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[14.5px] transition-all duration-150',
                isActive
                  ? 'bg-[#EAF6EA] font-medium text-[#2E7D32] dark:bg-[#1b3d26]/80 dark:text-[#46c05b]'
                  : 'font-normal text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17231A] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <User
                  className={cn(
                    'h-[17px] w-[17px] shrink-0 transition-colors duration-150',
                    isActive
                      ? 'text-[#2E7D32] dark:text-[#46c05b]'
                      : 'text-[#5F6B63] group-hover:text-[#17231A] dark:text-neutral-400 dark:group-hover:text-neutral-200'
                  )}
                />
                <span className="truncate">{t('nav.profile')}</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-[14.5px] transition-all duration-150',
                isActive
                  ? 'bg-[#EAF6EA] font-medium text-[#2E7D32] dark:bg-[#1b3d26]/80 dark:text-[#46c05b]'
                  : 'font-normal text-[#374151] hover:bg-[#F3F4F6] hover:text-[#17231A] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={cn(
                    'h-[17px] w-[17px] shrink-0 transition-colors duration-150',
                    isActive
                      ? 'text-[#2E7D32] dark:text-[#46c05b]'
                      : 'text-[#5F6B63] group-hover:text-[#17231A] dark:text-neutral-400 dark:group-hover:text-neutral-200'
                  )}
                />
                <span className="truncate">{t('nav.settings')}</span>
              </>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              onLogout()
            }}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-[14.5px] font-normal text-[#374151] transition-all duration-150 text-left',
              'hover:bg-[#F3F4F6] hover:text-[#17231A] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
            )}
          >
            <LogOut className="h-[17px] w-[17px] shrink-0 text-[#5F6B63] transition-colors duration-150 group-hover:text-[#17231A] dark:text-neutral-400 dark:group-hover:text-neutral-200" />
            <span className="truncate">{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
