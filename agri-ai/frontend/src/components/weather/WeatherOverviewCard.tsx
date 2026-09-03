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
  if (c.includes('cloud')) return '⛅'
  if (c.includes('thunder') || c.includes('storm')) return '⛈️'
  if (c.includes('clear') || c.includes('sunny')) return '☀️'
  return '🌤️'
}

interface Props {
  farmId: number | null
  lat: number | null
  lon: number | null
}

export function WeatherOverviewCard({ farmId, lat, lon }: Props) {
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
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-neutral-900">Weather Overview</h3>
          <Link
            to="/dashboard/weather"
            className="flex items-center gap-1 text-xs text-brand hover:underline font-medium"
          >
            View Full Forecast
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* No coords */}
        {!hasCoords && (
          <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Add farm location to see weather data.</span>
          </div>
        )}

        {/* Loading */}
        {hasCoords && loading && (
          <div className="flex items-center gap-2 text-sm text-neutral-400 py-4">
            <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
            <span>Loading weather…</span>
          </div>
        )}

        {/* Error */}
        {hasCoords && !loading && !current.data && (
          <div className="flex items-center gap-2 text-sm text-amber-600 py-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Weather unavailable. Check network or farm location.</span>
          </div>
        )}

        {/* Current conditions */}
        {hasCoords && !loading && current.data && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{conditionIcon(current.data.condition)}</span>
              <div>
                <p className="text-sm text-neutral-500 capitalize">{current.data.condition}</p>
                <p className="text-3xl font-bold text-neutral-900 leading-none">
                  {current.data.temperature.toFixed(0)}°C
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-neutral-500 mb-4">
              <span className="flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-info" />
                Humidity {current.data.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3.5 w-3.5 text-info" />
                Wind {current.data.wind_speed.toFixed(0)} km/h
              </span>
            </div>

            {/* 4-day mini forecast */}
            {forecast.data?.forecast && forecast.data.forecast.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5">
                {forecast.data.forecast.slice(0, 4).map((day) => (
                  <div
                    key={day.date}
                    className="flex flex-col items-center rounded-lg bg-neutral-50 py-2 px-1 text-center"
                  >
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase">
                      {shortDay(day.date)}
                    </p>
                    <span className="text-base my-0.5">{conditionIcon(day.condition)}</span>
                    <p className="text-xs font-bold text-neutral-800">{day.temp_max.toFixed(0)}°</p>
                    <p className="text-[10px] text-neutral-400">{day.temp_min.toFixed(0)}°</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
