import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Leaf, Menu, X, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/services/auth'
import { useLanguage } from '@/i18n/LanguageContext'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

export function PublicLayout() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: t('landing.navFeatures', 'Features'), href: '#features' },
    { label: t('landing.navHowItWorks', 'How it works'), href: '#how-it-works' },
    { label: t('landing.navBenefits', 'Benefits'), href: '#benefits' },
    { label: t('landing.navFaq', 'FAQ'), href: '#faq' },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col font-sans text-[#10251B] selection:bg-[#EAF7EE] selection:text-[#16803A] bg-white">
      {/* 1. HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: AgriAI Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16803A] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Leaf className="h-5 w-5 fill-white text-white" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#10251B]">
              AgriAI
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[15px] font-medium text-neutral-600 transition-colors hover:text-[#16803A]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Auth Action Buttons & Language Switcher */}
          <div className="hidden items-center gap-4 md:flex">
            <LanguageSelector variant="pills" />
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-full bg-[#16803A] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#136c31] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('landing.goToDashboard', 'Go to Dashboard')}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-[15px] font-medium text-neutral-800 transition-colors hover:text-[#16803A]"
                >
                  {t('landing.login', 'Log in')}
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="rounded-full bg-[#16803A] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#136c31] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('landing.getStarted', 'Get started')}
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector variant="compact" />
            <button
              className="p-2 text-neutral-700"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="border-t border-neutral-100 bg-white px-5 py-6 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-base font-medium text-neutral-700 hover:text-[#16803A]"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-neutral-100">
                {user ? (
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      navigate('/dashboard')
                    }}
                    className="w-full rounded-full bg-[#16803A] py-3 text-center text-sm font-semibold text-white shadow-sm"
                  >
                    {t('landing.goToDashboard', 'Go to Dashboard')}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        navigate('/login')
                      }}
                      className="w-full rounded-full border border-neutral-200 py-2.5 text-center text-sm font-medium text-neutral-800 hover:border-[#16803A]"
                    >
                      {t('landing.login', 'Log in')}
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false)
                        navigate('/register')
                      }}
                      className="w-full rounded-full bg-[#16803A] py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                    >
                      {t('landing.getStarted', 'Get started')}
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16803A] text-white">
                <Leaf className="h-4 w-4 fill-white text-white" />
              </span>
              <span className="font-bold text-lg text-[#10251B]">AgriAI</span>
            </div>
            <p className="text-sm text-neutral-500">
              {t('landing.heroSubtitle', 'AI-powered crop yield prediction & farm optimization for modern agriculture.')}
            </p>
            <p className="text-xs text-neutral-400">© {new Date().getFullYear()} AgriAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
