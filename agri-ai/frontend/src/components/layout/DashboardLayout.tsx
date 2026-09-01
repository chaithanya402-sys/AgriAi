import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Leaf, LayoutDashboard, Sprout, FlaskConical, TrendingUp, Droplets,
  CloudSun, Bug, ShieldAlert, LineChart, Wallet, Workflow,
  Bot, Bell, FileText, Languages, Settings, LogOut, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/services/auth'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Farm',
    items: [
      { to: '/dashboard/farms', label: 'Farm Management', icon: Sprout },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/dashboard/soil', label: 'Soil Analysis', icon: FlaskConical },
      { to: '/dashboard/crop', label: 'Crop Recommendation', icon: Sprout },
      { to: '/dashboard/yield', label: 'Yield Prediction', icon: TrendingUp },
      { to: '/dashboard/irrigation', label: 'Irrigation', icon: Droplets },
      { to: '/dashboard/weather', label: 'Weather', icon: CloudSun },
      { to: '/dashboard/disease', label: 'Disease Detection', icon: Bug },
      { to: '/dashboard/fertilizer', label: 'Fertilizer', icon: FlaskConical },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/dashboard/risk', label: 'Risk', icon: ShieldAlert },
      { to: '/dashboard/market', label: 'Market', icon: LineChart },
      { to: '/dashboard/profit', label: 'Profit', icon: Wallet },
      { to: '/dashboard/optimize', label: 'Optimization', icon: Workflow },
    ],
  },
  {
    label: 'Assistance',
    items: [
      { to: '/dashboard/assistant', label: 'AI Assistant', icon: Bot },
      { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/reports', label: 'Reports', icon: FileText },
    ],
  },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-neutral-900">Agri<span className="text-brand">AI</span></span>
          </Link>
        </div>

        {/* Top nav (spec section 5) */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-fresh-500/10 text-brand' : 'text-neutral-600 hover:bg-neutral-100'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <div className="hidden sm:flex h-9 items-center px-3 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-full">
            {user?.name?.split(' ')[0] || 'Farmer'}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4 lg:block">
          <SidebarContent />
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-neutral-900">Menu</span>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
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
                    isActive ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
