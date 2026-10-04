import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from './translations'
import { getCropDisplayName } from './cropTranslations'

export type Language = 'en' | 'te' | 'hi'

export interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, fallback?: string, variables?: Record<string, string | number>) => string
  tCrop: (nameOrId: string | null | undefined) => string
}

const LANG_KEY = 'agriai_lang'

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language | null
    if (saved === 'en' || saved === 'te' || saved === 'hi') return saved
    return 'en'
  })

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(LANG_KEY, newLang)
  }

  const t = (
    key: string,
    fallback?: string,
    variables?: Record<string, string | number>
  ): string => {
    const dict = translations[lang] || translations.en
    let text = (dict && dict[key]) || (translations.en && translations.en[key]) || fallback || key
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }
    return text
  }

  const tCrop = (nameOrId: string | null | undefined): string => {
    return getCropDisplayName(nameOrId, lang)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tCrop }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

