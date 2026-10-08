/**
 * Compact Weather Overview card for the Dashboard.
 * Fetches fresh weather when farm coordinates change.
 * Shows loading / error gracefully. Never displays lat/lon.
 */
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CloudSun, Droplets, Wind, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useAsync } from '@/hooks/useAsync'
import { weatherApi } from '@/services/modules'
import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/lib/utils'

interface WeatherData {
  temperature: number
  humidity: number
  wind_speed: number
  rainfall: number
  condition: string
  demo_mode?: boolean
}

interface DayForecast {
  date: string
  temp_min: number
  temp_max: number
  condition: string
}

interface ForecastData {
  forecast: DayForecast[]
}

function shortDay(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

function conditionIcon(cond: string) {
  const c = cond.toLowerCase()
  if (c.includes('rain')) return '🌧️'
  if (c.includes('drizzle')) return '🌦️'
  if (c.includes('cloud') || c.includes('overcast')) return '⛅'
  if (c.includes('thunder') || c.includes('storm')) return '⛈️'
  if (c.includes('clear') || c.includes('sunny')) return '☀️'
  return '🌤️'
}

interface Props {
  farmId: number | null
  lat: number | null
  lon: number | null
  className?: string
}

export function WeatherOverviewCard({ farmId, lat, lon, className }: Props) {
  const { t } = useLanguage()
  const current  = useAsync<WeatherData>()
  const forecast = useAsync<ForecastData>()

  // Track which farmId the current data belongs to
  const loadedForFarmRef = useRef<number | null>(null)

  useEffect(() => {
    if (!farmId || lat == null || lon == null) return

    // Clear stale data immediately when farm changes
    if (loadedForFarmRef.current !== farmId) {
      loadedForFarmRef.current = farmId
    }

    const currentFarmId = farmId
    current.run(() => weatherApi.current(lat, lon))
    forecast.run(() => weatherApi.forecast(lat, lon))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, lat, lon])

  const loading = current.loading || forecast.loading
  const hasCoords = lat != null && lon != null

  return (
    <Card className={cn('overflow-hidden flex flex-col', className)}>
      <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                {t('dashboard.currentWeather', 'Current Weather')}
              </h3>
              {current.data && !current.data.demo_mode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <Link
              to="/dashboard/weather"
              className="flex items-center gap-1 text-xs text-brand hover:underline font-medium shrink-0"
            >
              <span>{t('dashboard.viewForecast', 'View full forecast')}</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* No coords */}
          {!hasCoords && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Add farm location to see weather data.</span>
            </div>
          )}

          {/* Loading */}
          {hasCoords && loading && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 py-3">
              <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
              <span>{t('common.loading', 'Loading weather…')}</span>
            </div>
          )}

          {/* Error */}
          {hasCoords && !loading && !current.data && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-600 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Weather unavailable. Check network or farm location.</span>
            </div>
          )}

          {/* Current conditions */}
          {hasCoords && !loading && current.data && (
            <>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-2xl sm:text-3xl">{conditionIcon(current.data.condition)}</span>
                <div>
                  <p className="text-xs text-neutral-500 capitalize leading-tight">{current.data.condition}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-none mt-0.5">
                    {current.data.temperature.toFixed(0)}°C
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-xs text-neutral-500 mb-2">
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-info shrink-0" />
                  {t('dashboard.humidity', 'Humidity')} {current.data.humidity}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-info shrink-0" />
                  {t('dashboard.wind', 'Wind')} {current.data.wind_speed.toFixed(0)} km/h
                </span>
              </div>
            </>
          )}
        </div>

        {/* 4-day mini forecast */}
        {hasCoords && !loading && current.data && forecast.data?.forecast && forecast.data.forecast.length > 0 && (
          <div className="grid grid-cols-4 gap-1 pt-2 border-t border-neutral-100">
            {forecast.data.forecast.slice(0, 4).map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center rounded-lg bg-neutral-50 py-1.5 px-0.5 text-center"
              >
                <p className="text-[9px] font-semibold text-neutral-400 uppercase leading-none">
                  {shortDay(day.date)}
                </p>
                <span className="text-sm my-0.5 leading-none">{conditionIcon(day.condition)}</span>
                <p className="text-xs font-bold text-neutral-800 leading-tight">{day.temp_max.toFixed(0)}°</p>
                <p className="text-[9px] text-neutral-400 leading-none">{day.temp_min.toFixed(0)}°</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
