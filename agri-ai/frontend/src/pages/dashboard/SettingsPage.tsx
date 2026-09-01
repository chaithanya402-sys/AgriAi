import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, MapPin, Languages, LogOut, Palette, Bell, ShieldCheck, Sun, Moon, Laptop, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { useAuth } from '@/services/auth'
import { useTheme, type Theme } from '@/context/ThemeContext'
import { useLanguage, type Language } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

const NOTIFY_KEY = 'agriai_notifications_enabled'

const LANGUAGE_OPTIONS: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'te', label: 'Telugu', native: 'తెలుగు' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
]

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  return raw === 'true'
}

// Accessible toggle switch
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fresh-500',
        checked ? 'bg-brand' : 'bg-neutral-300 dark:bg-neutral-700',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}

function SettingRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string
  description?: string
  checked: boolean
  onToggle: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
        {description && <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onToggle} label={label} />
    </div>
  )
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() =>
    readBool(NOTIFY_KEY, true),
  )
  const [feedback, setFeedback] = useState<string | null>(null)

  // Persist toggles to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFY_KEY, String(notificationsEnabled))
  }, [notificationsEnabled])

  const handleLangChange = (value: Language) => {
    setLang(value)
    const selected = LANGUAGE_OPTIONS.find((o) => o.value === value)
    setFeedback(`Language changed to ${selected?.native || value}`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleThemeChange = (value: string) => {
    const validTheme = value as Theme
    setTheme(validTheme)
    setFeedback(`Theme changed to ${validTheme.charAt(0).toUpperCase() + validTheme.slice(1)}`)
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const UserIcon = User
  const MailIcon = Mail
  const PinIcon = MapPin

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t('settings.title')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('settings.subtitle')}</p>
        </div>
        {feedback && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-fresh-500/15 border border-fresh-500/30 px-3 py-1.5 text-xs font-semibold text-fresh-400 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4" />
            {feedback}
          </div>
        )}
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-brand" />
            {t('settings.profile')}
          </CardTitle>
          <CardDescription>{t('settings.profileDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white shadow-sm">
                {(user?.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{user?.name || 'Farmer'}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email || '—'}</p>
              </div>
              <Badge variant="success" className="ml-auto">
                {t('settings.active')}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                <MailIcon className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('settings.email')}</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/50">
                <PhoneIconFallback />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('settings.phone')}</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{user?.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 sm:col-span-2 dark:border-neutral-800 dark:bg-neutral-900/50">
                <PinIcon className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('settings.location')}</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{user?.location || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-brand" />
            {t('settings.preferences')}
          </CardTitle>
          <CardDescription>{t('settings.prefDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div>
            <Label className="text-sm font-semibold">{t('settings.language')}</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleLangChange(opt.value)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all shadow-sm',
                    lang === opt.value
                      ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/30 dark:bg-brand/20 dark:text-fresh-400'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
                  )}
                >
                  <span className="text-base font-semibold">{opt.native}</span>
                  <span className="text-xs opacity-75">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t('settings.languageDesc')}
            </p>
          </div>

          {/* Theme */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Label className="text-sm font-semibold">{t('settings.theme')}</Label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {/* Quick Select Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all',
                    theme === 'light'
                      ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/30 dark:text-fresh-400'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                  )}
                >
                  <Sun className="h-4 w-4 text-amber-500" />
                  {t('settings.themeLight')}
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all',
                    theme === 'dark'
                      ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/30 dark:bg-brand/20 dark:text-fresh-400'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                  )}
                >
                  <Moon className="h-4 w-4 text-indigo-400" />
                  {t('settings.themeDark')}
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all',
                    theme === 'system'
                      ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/30 dark:bg-brand/20 dark:text-fresh-400'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                  )}
                >
                  <Laptop className="h-4 w-4 text-neutral-400" />
                  {t('settings.themeSystem')}
                </button>
              </div>

              {/* Or Select Dropdown */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-neutral-400" />
                <Select
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder={t('settings.selectTheme')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                    <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                    <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {t('settings.themeDesc')} ({resolvedTheme === 'dark' ? 'Dark active' : 'Light active'})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand" />
            {t('settings.notifications')}
          </CardTitle>
          <CardDescription>{t('settings.notifyDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-100 dark:divide-neutral-800">
          <SettingRow
            label={t('settings.enableNotifications')}
            description={t('settings.enableNotificationsDesc')}
            checked={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
        </CardContent>
      </Card>

      {/* Account / logout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            {t('settings.account')}
          </CardTitle>
          <CardDescription>{t('settings.accountDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            {t('settings.logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function PhoneIconFallback() {
  return (
    <svg
      className="h-4 w-4 text-neutral-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
