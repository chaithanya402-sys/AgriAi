import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { useAuth } from '@/services/auth'
import { useLanguage } from '@/i18n/LanguageContext'
import { farmApi } from '@/services/api'
import { agriculturalDataService } from '@/services/agriculturalDataService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Loading'
import { FarmOverviewCard } from '@/components/farm/FarmOverviewCard'
import { WeatherOverviewCard } from '@/components/weather/WeatherOverviewCard'
import { formatNumber, formatArea, cn } from '@/lib/utils'
import type { Farm } from '@/types'
import {
  Sprout,
  Wheat,
  FlaskConical,
  CloudSun,
  Bug,
  BarChart3,
  Target,
  Settings,
  MapPin,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'

export function DashboardPage() {
  const { farms, currentFarm, activeLocation, activeLocationLoading, setSelectedFarmId, loading: farmsLoading } = useFarm()
  const { user } = useAuth()
  const { t } = useLanguage()
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close farm dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFarmDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const quickActions = [
    { label: t('action.soil'), description: t('action.soilDesc'), icon: FlaskConical, href: '/dashboard/soil', color: 'text-earth-500' },
    { label: t('action.crop'), description: t('action.cropDesc'), icon: Sprout, href: '/dashboard/crop', color: 'text-brand' },
    { label: t('action.yield'), description: t('action.yieldDesc'), icon: Wheat, href: '/dashboard/yield', color: 'text-earth-600' },
    { label: t('action.fertilizer'), description: t('action.fertilizerDesc'), icon: FlaskConical, href: '/dashboard/fertilizer', color: 'text-info' },
    { label: t('action.weather'), description: t('action.weatherDesc'), icon: CloudSun, href: '/dashboard/weather', color: 'text-info' },
    { label: t('action.disease'), description: t('action.diseaseDesc'), icon: Bug, href: '/dashboard/disease', color: 'text-danger' },
    { label: t('action.market'), description: t('action.marketDesc'), icon: BarChart3, href: '/dashboard/market', color: 'text-fresh-500' },
    { label: t('action.risk'), description: t('action.riskDesc'), icon: Target, href: '/dashboard/risk', color: 'text-warning' },
  ]

  // Fetch current farm details - handled by FarmOverviewCard directly
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' })
      return
    }

    setLocating(true)
    setLocationStatus(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          const resolved = await agriculturalDataService.resolveLocation({ lat, lon }, currentFarm?.id)

          const place = [resolved.district, resolved.state].filter(Boolean).join(', ')
          const locationName = place || `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`

          if (currentFarm) {
            try {
              await farmApi.update(currentFarm.id, {
                latitude: lat,
                longitude: lon,
                state: resolved.state || currentFarm.state,
                district: resolved.district || currentFarm.district,
                location: place || currentFarm.location,
              })
              if (activeLocation) {
                activeLocation.latitude = lat
                activeLocation.longitude = lon
                if (resolved.state) activeLocation.state = resolved.state
                if (resolved.district) activeLocation.district = resolved.district
              }
            } catch (err) {
              console.warn('Could not persist farm location to backend:', err)
            }
          }

          setLocationStatus({
            type: 'success',
            message: `Location detected: ${locationName}`,
          })
        } catch (err: any) {
          setLocationStatus({ type: 'error', message: 'Failed to resolve location from coordinates.' })
        } finally {
          setLocating(false)
        }
      },
      (error) => {
        setLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus({ type: 'error', message: 'Location permission denied by browser.' })
        } else {
          setLocationStatus({ type: 'error', message: 'Unable to retrieve GPS location.' })
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  if (farmsLoading) return <PageLoader />

  // No farms at all
  if (!farms.length) {
    return (
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-1.5 shadow-2xs">
            <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">Selected Farm</p>
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">No Farm</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/notifications"
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#134e4a] text-white flex items-center justify-center font-medium text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
            </Link>
          </div>
        </div>

        {/* Page Title Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Dashboard</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Welcome back! Here’s what’s happening with your farm.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
          </button>
        </div>

        <EmptyState
          title={t('dashboard.emptyTitle')}
          description={t('dashboard.emptyDesc')}
          action={
            <Link to="/dashboard/farms">
              <Button>
                <Plus className="h-4 w-4" />
                {t('dashboard.createFirstFarm')}
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Selected Farm on Left, Notifications & User on Right */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        {/* Selected Farm Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
            className="flex items-center justify-between gap-5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-1.5 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left cursor-pointer"
          >
            <div>
              <p className="text-[11px] font-normal text-neutral-400 dark:text-neutral-500 leading-tight">
                Selected Farm
              </p>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight mt-0.5">
                {currentFarm?.name || 'Select Farm'}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-neutral-500 transition-transform duration-200 shrink-0 ml-1',
                farmDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Farm Switcher Dropdown */}
          {farmDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-lg z-50">
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Your Farms ({farms.length})
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {farms.map((farm) => {
                  const isSelected = farm.id === currentFarm?.id
                  return (
                    <button
                      key={farm.id}
                      type="button"
                      onClick={() => {
                        setSelectedFarmId(farm.id)
                        setFarmDropdownOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-left transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      )}
                    >
                      <div className="truncate">
                        <p className="font-medium text-sm truncate">{farm.name}</p>
                        {farm.location && (
                          <p className="text-xs text-neutral-400 truncate">{farm.location}</p>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-brand shrink-0 ml-2" />}
                    </button>
                  )
                })}
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                <Link
                  to="/dashboard/farms"
                  onClick={() => setFarmDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-brand hover:underline font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Manage or Add Farm
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Bell icon & User profile */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/notifications"
            className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors p-1"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#134e4a] text-white flex items-center justify-center font-medium text-sm shadow-2xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
          </Link>
        </div>
      </div>

      {/* Page Title & Location Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Welcome back! Here’s what’s happening with your farm.
          </p>
        </div>

        {/* Use Current Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] text-white text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
        </button>
      </div>

      {/* Location Status Feedback Banner (if user clicked location button) */}
      {locationStatus && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2.5 rounded-lg text-sm border animate-in fade-in-0 duration-200',
            locationStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-300'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
          )}
        >
          <div className="flex items-center gap-2">
            {locationStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{locationStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocationStatus(null)}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fresh-500/10 dark:bg-fresh-500/20">
                <Sprout className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Farms</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{farms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-earth-500/10 dark:bg-earth-500/20">
                <MapPin className="h-5 w-5 text-earth-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Area</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {formatNumber(
                    farms.reduce((sum, f) => sum + (f.total_area || 0), 0)
                  )}
                  <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 ml-1">ha</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 dark:bg-info/20">
                <Wheat className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Fields</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {farms.reduce((sum, f) => sum + (f.fields?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 dark:bg-warning/20">
                <Settings className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Active Farm</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]">
                  {currentFarm?.name || '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farm Overview + Weather side-by-side */}
      {currentFarm && (
        <div className="grid gap-4 lg:grid-cols-2">
          <FarmOverviewCard
            farm={currentFarm}
            activeState={activeLocation.farmId === currentFarm.id ? activeLocation.state : currentFarm.state}
            activeDistrict={activeLocation.farmId === currentFarm.id ? activeLocation.district : currentFarm.district}
            activeMandal={activeLocation.farmId === currentFarm.id ? activeLocation.mandal : currentFarm.mandal}
            activeVillage={activeLocation.farmId === currentFarm.id ? activeLocation.village : currentFarm.village}
            locationSource={activeLocation.farmId === currentFarm.id ? 'farm_saved' : undefined}
            locationLoading={activeLocationLoading}
          />
          <WeatherOverviewCard
            farmId={currentFarm.id}
            lat={(activeLocation.farmId === currentFarm.id ? activeLocation.latitude : null) ?? currentFarm.latitude ?? null}
            lon={(activeLocation.farmId === currentFarm.id ? activeLocation.longitude : null) ?? currentFarm.longitude ?? null}
          />
        </div>
      )}

      {/* Farm Selector (if multiple farms) */}
      {farms.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Switch Farm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {farms.map((farm) => (
                <Badge
                  key={farm.id}
                  variant={farm.id === currentFarm?.id ? 'primary' : 'outline'}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedFarmId(farm.id)}
                >
                  {farm.name}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Visit the <Link to="/dashboard/farms" className="text-brand underline">Farm Management</Link> page to switch or manage farms.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t('dashboard.quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} to={action.href}>
                <Card className="transition-shadow hover:shadow-card-hover cursor-pointer h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{action.label}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
