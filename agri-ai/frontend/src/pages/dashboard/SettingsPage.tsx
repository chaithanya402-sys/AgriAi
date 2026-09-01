import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, MapPin, Languages, LogOut, Palette, Bell, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { useAuth } from '@/services/auth'
import { cn } from '@/lib/utils'

const LANG_KEY = 'agriai_lang'
const THEME_KEY = 'agriai_theme'
const NOTIFY_KEY = 'agriai_notifications_enabled'

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'te', label: 'తెలుగు', native: 'Telugu' },
  { value: 'hi', label: 'हिन्दी', native: 'Hindi' },
]

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  return raw === 'true'
}

// A simple accessible toggle switch
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
        checked ? 'bg-brand' : 'bg-neutral-300',
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
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {description && <p className="text-xs text-neutral-500">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onToggle} label={label} />
    </div>
  )
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [lang, setLang] = useState<string>(() => localStorage.getItem(LANG_KEY) || 'en')
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(THEME_KEY) || 'light')
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() =>
    readBool(NOTIFY_KEY, true),
  )

  // Persist toggles to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFY_KEY, String(notificationsEnabled))
  }, [notificationsEnabled])

  const handleLangChange = (value: string) => {
    setLang(value)
    localStorage.setItem(LANG_KEY, value)
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
    localStorage.setItem(THEME_KEY, value)
    // Apply dark mode where relevant
    document.documentElement.classList.toggle('dark', value === 'dark')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Icons fallback to a default if not present
  const UserIcon = User
  const MailIcon = Mail
  const PinIcon = MapPin

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your profile, preferences and account.</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-brand" />
            Profile
          </CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {(user?.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{user?.name || 'Farmer'}</p>
                <p className="text-sm text-neutral-500">{user?.email || '—'}</p>
              </div>
              <Badge variant="success" className="ml-auto">
                Active
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <MailIcon className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="text-sm font-medium text-neutral-800">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                <PhoneIconFallback />
                <div>
                  <p className="text-xs text-neutral-500">Phone</p>
                  <p className="text-sm font-medium text-neutral-800">{user?.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 sm:col-span-2">
                <PinIcon className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Location</p>
                  <p className="text-sm font-medium text-neutral-800">{user?.location || '—'}</p>
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
            Preferences
          </CardTitle>
          <CardDescription>Language and interface settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language */}
          <div>
            <Label>Language</Label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleLangChange(opt.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    lang === opt.value
                      ? 'border-brand bg-fresh-500/10 text-brand'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
                  )}
                >
                  <span className="text-base">{opt.native}</span>
                  <span className="text-xs text-neutral-400">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              i18n scaffold — English / Telugu / Hindi. Your choice is saved on this device.
            </p>
          </div>

          {/* Theme */}
          <div>
            <Label>Theme</Label>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-neutral-400" />
              <Select
                value={theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Theme preference is stored locally on this device.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand" />
            Notifications
          </CardTitle>
          <CardDescription>Choose which notifications you receive.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-neutral-100">
          <SettingRow
            label="Enable notifications"
            description="Receive alerts about weather, disease, risk and market."
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
            Account
          </CardTitle>
          <CardDescription>Sign out of your AgriAI account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Minimal phone icon fallback so the layout doesn't depend on a rarely-used lucide icon name
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
