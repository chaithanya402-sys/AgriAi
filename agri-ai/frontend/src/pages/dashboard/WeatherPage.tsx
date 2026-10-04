import { useEffect, useMemo, type ReactNode } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Alert } from '@/components/ui/Alert'
import { useAsync } from '@/hooks/useAsync'
import { useFarm } from '@/components/farm/FarmContext'
import { weatherApi } from '@/services/modules'
import { formatNumber } from '@/lib/utils'
import {
  CloudSun,
  Droplets,
  Wind,
  ThermometerSun,
  Umbrella,
  RefreshCw,
  MapPin,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface CurrentWeather {
  temperature: number
  humidity: number
  wind_speed: number
  rainfall: number
  condition: string
  source: string
  demo_mode: boolean
  recorded_at: string
}

interface DailyForecast {
  date: string
  temp_min: number
  temp_max: number
  humidity: number
  rainfall_probability: number
  condition: string
}

interface ForecastResponse {
  forecast: DailyForecast[]
  source: string
  demo_mode: boolean
}

function DemoBadge() {
  return (
    <Badge variant="warning" className="gap-1">
      <Activity className="h-3 w-3" />
      Demo data
    </Badge>
  )
}

function LiveBadge() {
  return (
    <Badge variant="success" className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      Live OpenWeather
    </Badge>
  )
}

function formatWeatherSource(source: string) {
  if (!source) return 'Live Telemetry'
  if (source.toLowerCase() === 'openweather') return 'OpenWeather (Live)'
  if (source.toLowerCase() === 'demo') return 'Demo'
  return source
}

const STATUS_ICONS = {
  temperature: <ThermometerSun className="h-5 w-5" />,
  humidity: <Droplets className="h-5 w-5" />,
  wind: <Wind className="h-5 w-5" />,
  rainfall: <Umbrella className="h-5 w-5" />,
}

// District centroids for offline or missing GPS fallback
const DISTRICT_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  nellore: { lat: 14.4426, lon: 79.9865 },
  kadapa: { lat: 14.4673, lon: 78.8242 },
  visakhapatnam: { lat: 17.6868, lon: 83.2185 },
  krishna: { lat: 16.5062, lon: 80.6480 },
  guntur: { lat: 16.3067, lon: 80.4365 },
  kurnool: { lat: 15.8281, lon: 78.0373 },
  anantapur: { lat: 14.6819, lon: 77.6006 },
  chittoor: { lat: 13.2172, lon: 79.1003 },
  vizianagaram: { lat: 18.1067, lon: 83.3956 },
  srikakulam: { lat: 18.2969, lon: 83.8968 },
  prakasam: { lat: 15.5057, lon: 80.0499 },
}

export function WeatherPage() {
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, activeLocation } = useFarm()

  const coords = useMemo(() => {
    const lat = (activeLocation.farmId === currentFarm?.id ? activeLocation.latitude : null) ?? currentFarm?.latitude
    const lon = (activeLocation.farmId === currentFarm?.id ? activeLocation.longitude : null) ?? currentFarm?.longitude
    if (typeof lat === 'number' && typeof lon === 'number' && !(lat === 0 && lon === 0)) {
      return { lat, lon }
    }
    // District centroid fallback
    const dist = (activeLocation.farmId === currentFarm?.id ? activeLocation.district : null) || currentFarm?.district
    if (dist) {
      const clean = dist.toLowerCase().trim()
      for (const [k, v] of Object.entries(DISTRICT_CENTROIDS)) {
        if (clean.includes(k) || k.includes(clean)) return v
      }
    }
    return null
  }, [currentFarm, activeLocation])

  const current = useAsync<CurrentWeather>()
  const forecast = useAsync<ForecastResponse>()

  useEffect(() => {
    if (!currentFarm?.id) return
    console.log("FARM CHANGED:", currentFarm.id)
    console.log("FARM LOCATION:", currentFarm.location || activeLocation.district || '')

    if (!coords) return
    current.run(() => weatherApi.current(coords.lat, coords.lon))
    forecast.run(() => weatherApi.forecast(coords.lat, coords.lon))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, currentFarm?.id])

  const demo = Boolean(current.data?.demo_mode || forecast.data?.demo_mode)
  const loading = current.loading || forecast.loading

  // Recharts expects numeric-comparable values; expose a clean label too.
  const chartData = useMemo(
    () =>
      (forecast.data?.forecast || []).map((d) => ({
        label: formatDateShort(d.date),
        date: d.date,
        temp_min: d.temp_min,
        temp_max: d.temp_max,
        humidity: d.humidity,
        rainfall_probability: d.rainfall_probability,
        condition: d.condition,
      })),
    [forecast.data]
  )

  const handleRefresh = () => {
    if (!coords) return
    current.run(() => weatherApi.current(coords.lat, coords.lon))
    forecast.run(() => weatherApi.forecast(coords.lat, coords.lon))
  }

  // ---- Missing farm / coords state ----
  if (!currentFarm) {
    return (
      <EmptyState
        title="No farm selected"
        description="Create or select a farm to see live weather for your location."
      />
    )
  }

  if (!coords) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Weather"
          description="Current conditions and 7-day forecast for your farm."
        />
        <Card>
          <CardContent className="py-8">
            <EmptyState
              title="Farm location missing"
              description="This farm has no location saved. Add its location in Farm Management to fetch live weather, or use a farm with an address."
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weather"
        description="Current conditions and 7-day forecast for your farm."
        right={
          <div className="flex items-center gap-3">
            <select
              value={selectedFarmId?.toString() || currentFarm?.id?.toString() || ''}
              onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer shadow-2xs"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id.toString()}>
                  {f.name} {f.district ? `(${f.district})` : ''}
                </option>
              ))}
            </select>
            {demo ? <DemoBadge /> : <LiveBadge />}
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? <ButtonLoader label="Refreshing…" /> : <RefreshCw className="h-4 w-4" />}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      <Alert variant="info" className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>
          Showing weather for{' '}
          <span className="font-semibold">{currentFarm.name}</span>
          {(() => {
            const state = (activeLocation.farmId === currentFarm.id && activeLocation.state) || currentFarm.state
            const district = (activeLocation.farmId === currentFarm.id && activeLocation.district) || currentFarm.district
            if (district && state) return ` — ${district}, ${state}`
            if (currentFarm.location && !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(currentFarm.location) && !/lat|lon|coord/i.test(currentFarm.location)) {
              return ` — ${currentFarm.location}`
            }
            return ''
          })()}
        </span>
      </Alert>

      {current.data && !current.loading ? (
        <CurrentConditions weather={current.data} />
      ) : (
        <Card>
          <CardContent className="py-4">
            <PageLoader label="Loading current weather…" />
          </CardContent>
        </Card>
      )}

      {forecast.data && !forecast.loading ? (
        <Card>
          <CardHeader>
            <CardTitle>7-day forecast</CardTitle>
            <CardDescription>Temperature range and rainfall probability per day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradMax" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2ea848" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#2ea848" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="gradMin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2a6ea8" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#2a6ea8" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e1" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64756d' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64756d' }} tickLine={false} axisLine={false} width={34} />
                    <Tooltip content={<ForecastTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="temp_max"
                      name="High (°C)"
                      stroke="#1e7a3a"
                      strokeWidth={2}
                      fill="url(#gradMax)"
                    />
                    <Area
                      type="monotone"
                      dataKey="temp_min"
                      name="Low (°C)"
                      stroke="#2a6ea8"
                      strokeWidth={2}
                      fill="url(#gradMin)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No forecast data returned.</p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {chartData.map((day) => (
                <Card key={day.date} className="card-hover bg-white">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      {day.label}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-semibold text-neutral-900">
                        {formatNumber(day.temp_max, 0)}°
                      </span>
                      <span className="text-sm text-neutral-500">{formatNumber(day.temp_min, 0)}°</span>
                    </div>
                    <p className="mt-1 text-sm capitalize text-neutral-600">{day.condition}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Umbrella className="h-3 w-3" />
                        {day.rainfall_probability}%
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {day.humidity}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4">
            <PageLoader label="Loading forecast…" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PageHeader({
  title,
  description,
  right,
}: {
  title: string
  description: string
  right?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      {right}
    </div>
  )
}

function CurrentConditions({ weather }: { weather: CurrentWeather }) {
  const stats = [
    {
      key: 'temperature',
      label: 'Temperature',
      value: `${formatNumber(weather.temperature, 1)}°C`,
      icon: STATUS_ICONS.temperature,
    },
    {
      key: 'humidity',
      label: 'Humidity',
      value: `${weather.humidity}%`,
      icon: STATUS_ICONS.humidity,
    },
    {
      key: 'wind',
      label: 'Wind Speed',
      value: `${formatNumber(weather.wind_speed, 1)} km/h`,
      icon: STATUS_ICONS.wind,
    },
    {
      key: 'rainfall',
      label: 'Rainfall (24h)',
      value: `${formatNumber(weather.rainfall, 1)} mm`,
      icon: STATUS_ICONS.rainfall,
    },
  ]

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Current conditions</CardTitle>
          <CardDescription>
            {weather.condition} · {formatWeatherSource(weather.source)}
          </CardDescription>
        </div>
        <Badge variant="info" className="gap-1">
          <CloudSun className="h-3 w-3" />
          {weather.condition}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.key} className="bg-neutral-50">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-fresh-500/10 text-brand">
                  {s.icon}
                </span>
                <div>
                  <p className="text-xs font-medium text-neutral-500">{s.label}</p>
                  <p className="text-lg font-semibold text-neutral-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]?.payload
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-card">
      <p className="font-semibold text-neutral-900">{label}</p>
      {entry && <p className="mt-0.5 capitalize text-neutral-500">{entry.condition}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-neutral-600">
          {p.name}: {formatNumber(p.value, 1)}°
        </p>
      ))}
    </div>
  )
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}
