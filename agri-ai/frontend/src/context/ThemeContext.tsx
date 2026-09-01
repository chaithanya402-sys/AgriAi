import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const THEME_KEY = 'agriai_theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    return getSystemTheme()
  })

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (currentTheme: Theme) => {
      let isDark = false
      if (currentTheme === 'dark') {
        isDark = true
      } else if (currentTheme === 'light') {
        isDark = false
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      setResolvedTheme(isDark ? 'dark' : 'light')
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme(theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
