import { useState, useEffect } from 'react'
import { useFarm } from '@/components/farm/FarmContext'
import { soilApi, FarmSoilData } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select'
import { PageLoader, ButtonLoader, LoadingSpinner } from '@/components/ui/Loading'
import { formatNumber } from '@/lib/utils'
import type { SoilAnalysisResult } from '@/types'
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Info,
  Leaf,
  Droplets,
  MapPin,
} from 'lucide-react'

const gradeColors: Record<string, string> = {
  A: 'success',
  B: 'info',
  C: 'warning',
  D: 'danger',
  F: 'danger',
}

const statusConfig: Record<
  string,
  { icon: typeof CheckCircle2; color: string; progressColor: string }
> = {
  Low: { icon: AlertTriangle, color: 'text-warning', progressColor: 'bg-warning' },
  Optimal: { icon: CheckCircle2, color: 'text-success', progressColor: 'bg-success' },
  High: { icon: AlertTriangle, color: 'text-danger', progressColor: 'bg-danger' },
}

export function SoilPage() {
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, activeLocation, loading: farmsLoading } = useFarm()
  const { data: analyzeResult, loading: analyzing, error: analyzeError, run } = useAsync<SoilAnalysisResult & { demo_mode?: boolean }>()

  const [form, setForm] = useState({
    farm_id: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    organic_carbon: '',
    moisture: '',
  })

  const [soilLoading, setSoilLoading] = useState(false)
  const [soilError, setSoilError] = useState<string | null>(null)
  const [soilData, setSoilData] = useState<FarmSoilData | null>(null)
  const [activeAnalysis, setActiveAnalysis] = useState<SoilAnalysisResult | null>(null)

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null

  // Automatically fetch farm-specific soil data whenever selected farm changes
  useEffect(() => {
    if (!activeFarm?.id) return

    const targetFarmId = activeFarm.id
    let isCancelled = false

    setSoilLoading(true)
    setSoilError(null)
    // Clear previous farm's values and analysis immediately
    setSoilData(null)
    setActiveAnalysis(null)

    soilApi
      .getFarmSoil(targetFarmId)
      .then((data) => {
        if (isCancelled) return

        // Data validation: verify that the returned data belongs to the selected farmId
        if (data.farmId !== targetFarmId) {
          return
        }

        // Required debug logs
        console.log("Selected Farm ID:", targetFarmId)
        console.log("Selected Farm:", activeFarm)
        console.log("Soil Data:", data)

        if (!data.found) {
          setSoilError("Soil data is not available for this location.")
          setForm({
            farm_id: String(targetFarmId),
            nitrogen: '',
            phosphorus: '',
            potassium: '',
            ph: '',
            organic_carbon: '',
            moisture: '',
          })
          setSoilLoading(false)
          return
        }

        setSoilData(data)
        setSoilError(null)

        // Populate form inputs with returned soil values
        setForm({
          farm_id: String(targetFarmId),
          nitrogen: data.nitrogen != null ? String(data.nitrogen) : '',
          phosphorus: data.phosphorus != null ? String(data.phosphorus) : '',
          potassium: data.potassium != null ? String(data.potassium) : '',
          ph: data.ph != null ? String(data.ph) : '',
          organic_carbon: data.organicCarbon != null ? String(data.organicCarbon) : 'Not available',
          moisture: data.moisture != null ? String(data.moisture) : '',
        })

        // Immediate analysis results for this farm's soil
        if (data.healthScore != null && data.grade) {
          setActiveAnalysis({
            id: 0,
            health_score: data.healthScore,
            grade: data.grade,
            nutrients: data.nutrients || [],
            recommendations: data.recommendations || [],
            explanation: data.explanation || '',
          })
        }
        setSoilLoading(false)
      })
      .catch((err) => {
        if (isCancelled) return
        console.error("Failed to load soil data for farm:", err)
        setSoilError("Soil data is not available for this location.")
        setSoilLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [activeFarm?.id])

  const handleFarmSelect = (idStr: string) => {
    const id = Number(idStr)
    setSelectedFarmId(id)
  }

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ocValue =
      form.organic_carbon === 'Not available' || !form.organic_carbon
        ? 0
        : Number(form.organic_carbon)

    const res = await run(() =>
      soilApi.analyze({
        farm_id: activeFarm?.id,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        ph: Number(form.ph),
        organic_carbon: ocValue,
        moisture: Number(form.moisture),
      })
    )
    if (res) {
      setActiveAnalysis(res)
    }
  }

  if (farmsLoading) return <PageLoader />

  if (!farms.length) {
    return (
      <EmptyState
        title="No farms found"
        description="Create a farm first to run soil analysis."
        action={
          <Button onClick={() => (window.location.href = '/dashboard/farms')}>
            Create Farm
          </Button>
        }
      />
    )
  }

  const displayResult = activeAnalysis || analyzeResult

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Soil Health Analysis</h1>
          <p className="text-sm text-neutral-500">
            Analyze soil composition and get actionable recommendations.
          </p>
        </div>
        {soilData?.source && (
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {soilData.source}
          </Badge>
        )}
      </div>

      {/* Farm & Soil Parameters Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-brand" />
            Soil Parameters
          </CardTitle>
          <CardDescription>
            {(() => {
              const state = (activeLocation.farmId === activeFarm?.id && activeLocation.state) || activeFarm?.state
              const district = (activeLocation.farmId === activeFarm?.id && activeLocation.district) || activeFarm?.district
              if (district && state) return `Location: ${district}, ${state}`
              if (activeFarm?.location && !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(activeFarm.location) && !/lat|lon|coord/i.test(activeFarm.location)) {
                return `Location: ${activeFarm.location}`
              }
              return activeFarm ? 'Location: —' : 'Enter soil test values for analysis.'
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Farm Selector */}
              <div className="space-y-1.5">
                <Label>Farm</Label>
                <Select
                  value={selectedFarmId?.toString() || activeFarm?.id?.toString() || ''}
                  onValueChange={handleFarmSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id.toString()}>
                        {farm.name} {farm.district && farm.state ? `(${farm.district}, ${farm.state})` : farm.location && !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(farm.location) ? `(${farm.location})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Nitrogen (mg/kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 45"
                  value={form.nitrogen}
                  onChange={(e) => handleChange('nitrogen', e.target.value)}
                  disabled={soilLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Phosphorus (mg/kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 22"
                  value={form.phosphorus}
                  onChange={(e) => handleChange('phosphorus', e.target.value)}
                  disabled={soilLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Potassium (mg/kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 180"
                  value={form.potassium}
                  onChange={(e) => handleChange('potassium', e.target.value)}
                  disabled={soilLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>pH</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6.5"
                  value={form.ph}
                  onChange={(e) => handleChange('ph', e.target.value)}
                  disabled={soilLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Organic Carbon (%)</Label>
                <Input
                  type="text"
                  placeholder="Not available"
                  value={form.organic_carbon}
                  onChange={(e) => handleChange('organic_carbon', e.target.value)}
                  disabled={soilLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Moisture (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 35"
                  value={form.moisture}
                  onChange={(e) => handleChange('moisture', e.target.value)}
                  disabled={soilLoading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-neutral-500">
                {(() => {
                  const state = (activeLocation.farmId === activeFarm?.id && activeLocation.state) || activeFarm?.state
                  const district = (activeLocation.farmId === activeFarm?.id && activeLocation.district) || activeFarm?.district
                  return district && state ? (
                    <span>
                      Location: <strong>{district}, {state}</strong>
                    </span>
                  ) : null
                })()}
              </div>
              <Button type="submit" disabled={analyzing || soilLoading}>
                {analyzing ? <ButtonLoader label="Analyzing..." /> : 'Analyze Soil'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Village-level soil data panel — shown when AP dataset match found */}
      {soilData?.found && !soilLoading && (soilData.ec != null || soilData.soilType || soilData.fertilityIndex) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-brand" />
                Village-Level Soil Profile
              </span>
              <Badge variant={
                soilData.matchLevel === 1 ? 'success' :
                soilData.matchLevel === 2 ? 'success' :
                soilData.matchLevel === 3 ? 'info' : 'warning'
              } className="text-xs">
                {soilData.dataSource || 'Dataset match'}
              </Badge>
            </CardTitle>
            {(soilData.mandal || soilData.village) && (
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[soilData.village, soilData.mandal, soilData.district].filter(Boolean).join(', ')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {soilData.ph != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Soil pH</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.ph}</p>
                </div>
              )}
              {soilData.ec != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">EC (dS/m)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.ec}</p>
                </div>
              )}
              {soilData.organicCarbon != null && soilData.organicCarbon !== 'Not available' && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Organic Carbon (%)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.organicCarbon}</p>
                </div>
              )}
              {soilData.nitrogen != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Available N (kg/ha)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.nitrogen}</p>
                </div>
              )}
              {soilData.phosphorus != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Available P₂O₅ (kg/ha)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.phosphorus}</p>
                </div>
              )}
              {soilData.potassium != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Available K₂O (kg/ha)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.potassium}</p>
                </div>
              )}
              {soilData.sulfur != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Sulfur (ppm)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.sulfur}</p>
                </div>
              )}
              {soilData.zinc != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Zinc (ppm)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.zinc}</p>
                </div>
              )}
              {soilData.iron != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Iron (ppm)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.iron}</p>
                </div>
              )}
              {soilData.copper != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Copper (ppm)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.copper}</p>
                </div>
              )}
              {soilData.manganese != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Manganese (ppm)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.manganese}</p>
                </div>
              )}
              {soilData.boron != null && (
                <div className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs text-neutral-500">Boron (ppm)</p>
                  <p className="text-base font-bold text-neutral-900">{soilData.boron}</p>
                </div>
              )}
            </div>

            {/* Soil type + fertility index */}
            <div className="mt-3 flex flex-wrap gap-3">
              {soilData.soilType && (
                <div className="rounded-lg border border-neutral-200 px-3 py-2">
                  <p className="text-xs text-neutral-500">Soil Type</p>
                  <p className="text-sm font-semibold text-neutral-900">{soilData.soilType}</p>
                </div>
              )}
              {soilData.croppingSeason && (
                <div className="rounded-lg border border-neutral-200 px-3 py-2">
                  <p className="text-xs text-neutral-500">Cropping Season</p>
                  <p className="text-sm font-semibold text-neutral-900">{soilData.croppingSeason}</p>
                </div>
              )}
              {soilData.fertilityIndex && (
                <div className={`rounded-lg border px-3 py-2 ${
                  soilData.fertilityIndex === 'High' ? 'border-green-200 bg-green-50' :
                  soilData.fertilityIndex === 'Low' ? 'border-red-200 bg-red-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <p className="text-xs text-neutral-500">Fertility Index</p>
                  <p className={`text-sm font-bold ${
                    soilData.fertilityIndex === 'High' ? 'text-green-700' :
                    soilData.fertilityIndex === 'Low' ? 'text-red-700' :
                    'text-yellow-700'
                  }`}>{soilData.fertilityIndex}</p>
                </div>
              )}
            </div>

            {/* Advisory */}
            {soilData.advisory && (
              <div className="mt-3 rounded-lg bg-fresh-50 border border-fresh-200 p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-brand mb-0.5">Plot-Specific Advisory</p>
                  <p className="text-sm text-neutral-700">{soilData.advisory}</p>
                </div>
              </div>
            )}

            {soilData.recordCount != null && soilData.recordCount > 0 && (
              <p className="mt-2 text-xs text-neutral-400">
                Based on {soilData.recordCount} matching soil sample{soilData.recordCount !== 1 ? 's' : ''}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading state indicator */}
      {soilLoading && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-fresh-50 border border-fresh-200 text-sm text-fresh-800">
          <LoadingSpinner className="h-4 w-4 text-brand animate-spin" />
          <span className="font-medium">Loading soil data...</span>
        </div>
      )}

      {/* No Data / Location Error */}
      {soilError && !soilLoading && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <span>{soilError}</span>
        </Alert>
      )}

      {/* Submit Error */}
      {analyzeError && (
        <Alert variant="danger">
          <AlertTriangle className="h-4 w-4" />
          <span>{analyzeError}</span>
        </Alert>
      )}

      {/* Results */}
      {displayResult && !soilLoading && (
        <div className="space-y-6">
          {/* Score & Grade */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative flex-1">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-neutral-900">
                        {formatNumber(displayResult.health_score, 0)}
                      </span>
                      <span className="text-sm text-neutral-500">/ 100</span>
                    </div>
                    <Progress
                      value={displayResult.health_score}
                      className="h-3"
                      indicatorClassName={
                        displayResult.health_score >= 70
                          ? 'bg-success'
                          : displayResult.health_score >= 40
                            ? 'bg-warning'
                            : 'bg-danger'
                      }
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <Badge
                      variant={(gradeColors[displayResult.grade] as any) || 'default'}
                      className="text-lg font-bold px-3 py-1"
                    >
                      {displayResult.grade}
                    </Badge>
                    <span className="mt-1 text-xs text-neutral-500">Grade</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-4 w-4 text-info" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {displayResult.explanation}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Nutrient Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-brand" />
                Nutrient Breakdown
              </CardTitle>
              <CardDescription>Per-nutrient status with plain-language explanations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayResult.nutrients.map((n, i) => {
                  const cfg = statusConfig[n.status] || statusConfig.Optimal
                  const Icon = cfg.icon
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4"
                    >
                      <div className={`mt-0.5 ${cfg.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-neutral-900">{n.nutrient}</span>
                          <Badge variant={n.status === 'Optimal' ? 'success' : n.status === 'Low' ? 'warning' : 'danger'}>
                            {n.status}
                          </Badge>
                          <span className="text-sm text-neutral-500">
                            ({formatNumber(n.value)})
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-neutral-600">{n.explanation}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-info" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {displayResult.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-fresh-500/5 p-3 text-sm text-neutral-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
