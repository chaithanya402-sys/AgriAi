import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Leaf, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/services/auth'
import { Button } from '@/components/ui/Button'

export function PublicLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold text-neutral-900">Agri<span className="text-brand">AI</span></span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-neutral-600 transition-colors hover:text-brand">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>
                <User className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button>
                <Button onClick={() => navigate('/register')}>Get started</Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-neutral-200 bg-white p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-neutral-700" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex gap-3">
                {user ? (
                  <Button className="flex-1" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => navigate('/login')}>Log in</Button>
                    <Button className="flex-1" onClick={() => navigate('/register')}>Get started</Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-10">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="font-semibold text-neutral-900">AgriAI</span>
            </div>
            <p className="text-sm text-neutral-500">
              AI-powered crop yield prediction & farm optimization for modern agriculture.
            </p>
            <p className="text-xs text-neutral-400">© {new Date().getFullYear()} AgriAI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
