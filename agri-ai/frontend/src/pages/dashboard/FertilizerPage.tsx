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
import { fertilizerApi } from '@/services/modules'
import { formatNumber } from '@/lib/utils'
import { FlaskConical, Activity, ShieldAlert, ArrowRight, Beaker } from 'lucide-react'
import { CROPS } from '@/lib/crops'

const NUTRIENT_LABELS: Record<string, string> = {
  N: 'Nitrogen (N)',
  P: 'Phosphorus (P)',
  K: 'Potassium (K)',
}

interface NutrientRec {
  nutrient: string
  current: number
  target: number
  delta: number
}

interface FertilizerResult {
  crop: string
  recommended: NutrientRec[]
  npk_ratio: string
  guidance: string
  disclaimer: string
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

export function FertilizerPage() {
  const { farms, currentFarm, loading: farmsLoading } = useFarm()

  const [farmId, setFarmId] = useState<string>('')
  const [crop, setCrop] = useState<string>('Wheat')
  const [nitrogen, setNitrogen] = useState<string>('60')
  const [phosphorus, setPhosphorus] = useState<string>('40')
  const [potassium, setPotassium] = useState<string>('40')
  const [soilPh, setSoilPh] = useState<string>('')

  useEffect(() => {
    if (!farmId && currentFarm) setFarmId(String(currentFarm.id))
  }, [currentFarm, farmId])

  const result = useAsync<FertilizerResult>()

  const handleSubmit = () => {
    if (!farmId) return
    result.run(() =>
      fertilizerApi.recommend({
        farm_id: Number(farmId),
        crop,
        nitrogen: Number(nitrogen) || 0,
        phosphorus: Number(phosphorus) || 0,
        potassium: Number(potassium) || 0,
        soil_ph: soilPh ? Number(soilPh) : undefined,
      })
    )
  }

  useEffect(() => {
    if (farmId && !result.data && !result.loading && !result.error) handleSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId])

  if (farmsLoading) {
    return <PageLoader label="Loading farms…" />
  }

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farm available"
        description="Create a farm first to run a fertilizer recommendation."
      />
    )
  }

  const res = result.data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Fertilizer recommendation</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Compare current NPK levels against crop targets and see the delta to apply.
          </p>
        </div>
        {res?.demo_mode && <DemoBadge />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Soil NPK input</CardTitle>
          <CardDescription>
            Enter current soil nutrient levels (kg/ha) for the selected crop.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Farm</Label>
            <Select value={farmId} onValueChange={setFarmId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
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

          <div className="space-y-2">
            <Label>
              Soil pH <span className="text-neutral-400">(optional)</span>
            </Label>
            <Input
              type="number"
              step="0.1"
              min={0}
              max={14}
              placeholder="e.g. 6.5"
              value={soilPh}
              onChange={(e) => setSoilPh(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Nitrogen (kg/ha)</Label>
            <Input
              type="number"
              min={0}
              value={nitrogen}
              onChange={(e) => setNitrogen(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Phosphorus (kg/ha)</Label>
            <Input
              type="number"
              min={0}
              value={phosphorus}
              onChange={(e) => setPhosphorus(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Potassium (kg/ha)</Label>
            <Input
              type="number"
              min={0}
              value={potassium}
              onChange={(e) => setPotassium(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={!farmId || result.loading} className="gap-2">
            {result.loading ? (
              <ButtonLoader label="Calculating…" />
            ) : (
              <>
                <FlaskConical className="h-4 w-4" />
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
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-brand" />
                Recommended application
              </CardTitle>
              <CardDescription>
                For <span className="font-medium text-neutral-700">{res.crop}</span> · Recommended NPK
                ratio <span className="font-semibold text-neutral-700">{res.npk_ratio}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                      <th className="py-2 pr-4 font-medium">Nutrient</th>
                      <th className="py-2 pr-4 font-medium">Current</th>
                      <th className="py-2 pr-4 font-medium">Target</th>
                      <th className="py-2 pr-4 font-medium">Apply (delta)</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.recommended.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-neutral-500">
                          All nutrients are at or above target — no application needed.
                        </td>
                      </tr>
                    ) : (
                      res.recommended.map((r) => (
                        <tr key={r.nutrient} className="border-b border-neutral-100">
                          <td className="py-3 pr-4 font-medium text-neutral-900">
                            {NUTRIENT_LABELS[r.nutrient] || r.nutrient} ({r.nutrient})
                          </td>
                          <td className="py-3 pr-4 text-neutral-600">
                            {formatNumber(r.current, 1)} kg/ha
                          </td>
                          <td className="py-3 pr-4 text-neutral-600">
                            {formatNumber(r.target, 1)} kg/ha
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="success">
                              +{formatNumber(r.delta, 1)} kg/ha <ArrowRight className="ml-1 h-3 w-3" />
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="warning">Below target</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Guidance</p>
                <p className="mt-1 text-sm text-neutral-700">{res.guidance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Mandatory product disclaimer — always shown below the results. */}
          <Alert variant="warning" className="flex gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold">Important:</span> {res.disclaimer}
            </span>
          </Alert>
        </>
      )}
    </div>
  )
}
