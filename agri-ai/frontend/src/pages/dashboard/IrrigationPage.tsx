import { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAsync } from '@/hooks/useAsync'
import { useFarm } from '@/components/farm/FarmContext'
import { irrigationApi } from '@/services/modules'
import { formatNumber } from '@/lib/utils'
import { Droplets, Activity, Info, Timer } from 'lucide-react'
import { CROPS } from '@/lib/crops'

interface IrrigationResult {
  recommendation: string
  amount_mm: number
  reason: string
  crop: string
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

const RECOMMENDATION_TONE: Record<string, 'danger' | 'warning' | 'success' | 'info'> = {
  'Water immediately': 'danger',
  'Water soon': 'warning',
  'Optimal — no action': 'success',
  'Hold off — soil already wet': 'info',
}

import { soilApi } from '@/services/modules'
import { agriculturalDataService } from '@/services/agriculturalDataService'

export function IrrigationPage() {
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, loading: farmsLoading } = useFarm()

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null

  const [farmId, setFarmId] = useState<string>(() => (activeFarm ? String(activeFarm.id) : ''))
  const [soilMoisture, setSoilMoisture] = useState<number>(45)
  const [crop, setCrop] = useState<string>('Wheat')
  const [temperature, setTemperature] = useState<string>('')
  const [forecastRainfall, setForecastRainfall] = useState<string>('')

  const result = useAsync<IrrigationResult>()

  // When selected farm changes, update moisture, temperature, and re-compute recommendation
  useEffect(() => {
    if (!activeFarm?.id) return

    const targetId = activeFarm.id
    setFarmId(String(targetId))

    soilApi
      .getFarmSoil(targetId)
      .then(async (soil) => {
        let moistureVal = 45
        if (soil.found && soil.moisture != null) {
          moistureVal = soil.moisture
          setSoilMoisture(moistureVal)
        }

        let tempVal = ''
        let rainVal = ''
        let activeCrop = crop

        if (soil.state && soil.district) {
          try {
            const cropData = await agriculturalDataService.getCropData(soil.state, soil.district)
            if (cropData.found) {
              if (cropData.temperature != null) {
                tempVal = String(cropData.temperature)
                setTemperature(tempVal)
              }
              if (cropData.rainfall != null) {
                rainVal = String(Math.round(cropData.rainfall / 30))
                setForecastRainfall(rainVal)
              }
              if (cropData.crops && cropData.crops.length > 0) {
                activeCrop = cropData.crops[0]
                setCrop(activeCrop)
              }
            }
          } catch {
            /* ignore */
          }
        }

        result.run(() =>
          irrigationApi.recommend({
            farm_id: targetId,
            soil_moisture: moistureVal,
            crop: activeCrop || 'Wheat',
            temperature: tempVal ? Number(tempVal) : undefined,
            forecast_rainfall_mm: rainVal ? Number(rainVal) : undefined,
          })
        )
      })
      .catch((err) => {
        console.warn('Failed to fetch farm soil moisture for irrigation:', err)
      })
  }, [activeFarm?.id])

  const handleSubmit = () => {
    const targetFarmId = Number(farmId) || activeFarm?.id
    if (!targetFarmId) return
    result.run(() =>
      irrigationApi.recommend({
        farm_id: targetFarmId,
        soil_moisture: soilMoisture,
        crop,
        temperature: temperature ? Number(temperature) : undefined,
        forecast_rainfall_mm: forecastRainfall ? Number(forecastRainfall) : undefined,
      })
    )
  }

  if (farmsLoading) {
    return <PageLoader label="Loading farms…" />
  }

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farm available"
        description="Create a farm first to run an irrigation recommendation."
      />
    )
  }

  const res = result.data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Irrigation recommendation</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Estimate how much water to apply based on soil moisture and forecast rainfall.
          </p>
        </div>
        {res?.demo_mode && <DemoBadge />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field conditions</CardTitle>
          <CardDescription>
            Enter current soil moisture. The recommendation is recomputed from these inputs — change
            the moisture and re-run to see the result respond.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Farm</Label>
            <Select
              value={selectedFarmId?.toString() || activeFarm?.id?.toString() || ''}
              onValueChange={(v) => {
                const id = Number(v)
                setSelectedFarmId(id)
                setFarmId(v)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name} {f.location ? `(${f.location})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Crop</Label>
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Soil moisture (%)</Label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-fresh-500"
                aria-label="Soil moisture percent"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <p className="text-xs text-neutral-500">
              Lower moisture feeds a larger deficit and raises the water amount.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Temperature (°C) <span className="text-neutral-400">(optional)</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g. 28"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Forecast rainfall (mm) <span className="text-neutral-400">(optional)</span>
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 5"
              value={forecastRainfall}
              onChange={(e) => setForecastRainfall(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Expected rainfall is factored in and reduces the amount applied.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={!farmId || result.loading} className="gap-2">
            {result.loading ? (
              <ButtonLoader label="Calculating…" />
            ) : (
              <>
                <Droplets className="h-4 w-4" />
                Get recommendation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result.error && (
        <Alert variant="danger">Unable to generate a recommendation: {result.error}</Alert>
      )}

      {res && !result.loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-brand" />
              Recommendation
            </CardTitle>
            <CardDescription>
              Computed from the soil moisture you entered for{' '}
              <span className="font-medium text-neutral-700">{res.crop}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant={RECOMMENDATION_TONE[res.recommendation] || 'default'} className="px-3 py-1 text-sm">
                {res.recommendation}
              </Badge>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2">
                <p className="text-xs uppercase tracking-wide text-neutral-500">Water amount</p>
                <p className="text-xl font-semibold text-neutral-900">
                  {formatNumber(res.amount_mm, 1)} mm
                </p>
              </div>
            </div>

            <Alert variant="info" className="whitespace-pre-line">
              <div className="flex gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{res.reason}</span>
              </div>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
