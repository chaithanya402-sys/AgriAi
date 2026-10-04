import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useLanguage, type Language } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export interface LanguageOption {
  code: Language
  label: string
  nativeName: string
  shortLabel: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', shortLabel: 'EN' },
  { code: 'te', label: 'Telugu',  nativeName: 'తెలుగు',  shortLabel: 'తె' },
  { code: 'hi', label: 'Hindi',   nativeName: 'हिन्दी',  shortLabel: 'हि' },
]

interface LanguageSelectorProps {
  variant?: 'pills' | 'dropdown' | 'compact'
  className?: string
}

export function LanguageSelector({ variant = 'dropdown', className }: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 1. Pill switcher: quick 1-click toggle buttons
  if (variant === 'pills') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800 text-xs font-medium',
          className
        )}
      >
        {LANGUAGES.map((item) => {
          const isActive = item.code === lang
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium',
                isActive
                  ? 'bg-white text-[#2E7D32] shadow-xs font-semibold dark:bg-neutral-900 dark:text-[#46c05b]'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              )}
              title={`${item.label} (${item.nativeName})`}
            >
              {item.nativeName}
            </button>
          )
        })}
      </div>
    )
  }

  // 2. Compact pill switcher: EN | తె | హి
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-md border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-900 text-[11px] font-semibold',
          className
        )}
      >
        {LANGUAGES.map((item) => {
          const isActive = item.code === lang
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLang(item.code)}
              className={cn(
                'px-2 py-0.5 rounded transition-all cursor-pointer',
                isActive
                  ? 'bg-[#2E7D32] text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
              )}
              title={`${item.label} (${item.nativeName})`}
            >
              {item.shortLabel}
            </button>
          )
        })}
      </div>
    )
  }

  // 3. Dropdown switcher: Globe + Name + Menu
  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Globe className="h-3.5 w-3.5 text-[#2E7D32] dark:text-[#46c05b] shrink-0" />
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{current.nativeName}</span>
        <ChevronDown className={cn('h-3 w-3 text-neutral-400 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-40 origin-top-right rounded-lg border border-neutral-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Language / భాష / भाषा
          </div>
          {LANGUAGES.map((item) => {
            const isActive = item.code === lang
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLang(item.code)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors text-left cursor-pointer',
                  isActive
                    ? 'bg-neutral-50 font-semibold text-[#2E7D32] dark:bg-neutral-800/60 dark:text-[#46c05b]'
                    : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                )}
              >
                <div className="flex flex-col">
                  <span>{item.nativeName}</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{item.label}</span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-[#2E7D32] dark:text-[#46c05b]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
