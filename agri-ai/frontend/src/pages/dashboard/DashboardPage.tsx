import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { useLanguage } from '@/i18n/LanguageContext'
import { farmApi } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Loading'
import { formatNumber, formatArea } from '@/lib/utils'
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
  Plus,
} from 'lucide-react'

export function DashboardPage() {
  const { farms, currentFarm, loading: farmsLoading } = useFarm()
  const { t } = useLanguage()
  const [farmDetails, setFarmDetails] = useState<Farm | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

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

  // Fetch current farm details
  useEffect(() => {
    if (!currentFarm) {
      setFarmDetails(null)
      return
    }
    let cancelled = false
    setDetailsLoading(true)
    farmApi
      .get(currentFarm.id)
      .then((data: any) => {
        if (!cancelled) setFarmDetails(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDetailsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentFarm])

  if (farmsLoading) return <PageLoader />

  // No farms at all
  if (!farms.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t('dashboard.welcome')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('dashboard.welcomeDesc')}
          </p>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {t('dashboard.welcome')}
          {currentFarm ? (
            <span className="text-brand"> - {currentFarm.name}</span>
          ) : null}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t('dashboard.welcomeDesc')}
        </p>
      </div>

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

      {/* Current Farm Details */}
      {currentFarm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Farm Details</span>
              <Link to="/dashboard/farms">
                <Button variant="ghost" size="sm">
                  Manage
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading farm details...</p>
            ) : farmDetails ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Name</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{farmDetails.name}</p>
                </div>
                {farmDetails.location && (
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Location</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{farmDetails.location}</p>
                  </div>
                )}
                {farmDetails.total_area != null && (
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Area</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatArea(farmDetails.total_area, farmDetails.area_unit)}
                    </p>
                  </div>
                )}
                {farmDetails.soil_type && (
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Soil Type</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{farmDetails.soil_type}</p>
                  </div>
                )}
                {farmDetails.irrigation_type && (
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Irrigation</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {farmDetails.irrigation_type}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Fields</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {farmDetails.fields?.length || 0}
                  </p>
                </div>
                {farmDetails.description && (
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Description</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{farmDetails.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No details available.</p>
            )}
          </CardContent>
        </Card>
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
                  className="cursor-pointer"
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
