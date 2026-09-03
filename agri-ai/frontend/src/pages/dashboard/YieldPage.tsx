import { useState, useEffect } from 'react'
import { useFarm } from '@/components/farm/FarmContext'
import { yieldApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { useAgriculturalLocation } from '@/hooks/useAgriculturalLocation'
import { agriculturalDataService } from '@/services/agriculturalDataService'
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
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { formatNumber } from '@/lib/utils'
import { chartColors } from '@/lib/theme'
import { CROPS as CROPS_LIST } from '@/lib/crops'
import type { YieldPredictionResult } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Target,
  Wheat,
} from 'lucide-react'

const CROPS = [...CROPS_LIST]

const CHART_COLORS = chartColors

function FeatureImportanceChart({
  data,
}: {
  data: { label: string; importance: number }[]
}) {
  const sorted = [...data].sort((a, b) => b.importance - a.importance)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={sorted} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8e1" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#64756d' }}
          angle={-35}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11, fill: '#64756d' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8e1',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
        />
        <Bar dataKey="importance" radius={[4, 4, 0, 0]} barSize={32}>
          {sorted.map((_, index) => (
            <Cell
              key={index}
              fill={
                index === 0
                  ? CHART_COLORS.deep
                  : index === 1
                    ? CHART_COLORS.fresh
                    : index === 2
                      ? CHART_COLORS.freshLight
                      : CHART_COLORS.earth
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function YieldPage() {
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, loading: farmsLoading } = useFarm()
  const { data: result, loading, error, run } = useAsync<YieldPredictionResult>()

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null

  const [form, setForm] = useState({
    farm_id: '',
    crop: '',
    area: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
  })

  const [districtCrops, setDistrictCrops] = useState<string[]>([])
  const [noDataError, setNoDataError] = useState<string | null>(null)

  // Use active farm location
  const loc = useAgriculturalLocation(activeFarm?.id)

  // Automatically populate values from state dataset + district filter and run yield prediction
  useEffect(() => {
    if (!loc.state || !loc.district) {
      if (loc.error && !loc.loading) {
        setNoDataError(loc.error)
      }
      return
    }

    let isMounted = true
    agriculturalDataService
      .getCropData(loc.state, loc.district)
      .then((data) => {
        if (!isMounted) return
        if (!data.found) {
          setNoDataError('No agricultural data available for this district.')
          return
        }

        setNoDataError(null)
        const cropsList = data.crops && data.crops.length > 0 ? data.crops : ['Rice']
        setDistrictCrops(cropsList)

        const selectedCrop = cropsList[0]
        const farmArea = activeFarm?.total_area ? String(activeFarm.total_area) : '1'

        setForm({
          farm_id: activeFarm?.id ? String(activeFarm.id) : '',
          crop: selectedCrop,
          nitrogen: data.nitrogen != null ? String(data.nitrogen) : '',
          phosphorus: data.phosphorus != null ? String(data.phosphorus) : '',
          potassium: data.potassium != null ? String(data.potassium) : '',
          temperature: data.temperature != null ? String(data.temperature) : '',
          humidity: data.humidity != null ? String(data.humidity) : '',
          ph: data.ph != null ? String(data.ph) : '',
          rainfall: data.rainfall != null ? String(data.rainfall) : '',
          area: farmArea,
        })

        // Auto-run yield prediction for the selected farm and first crop
        run(async () => {
          const res = await agriculturalDataService.getYieldData(
            loc.state!,
            loc.district!,
            selectedCrop,
            Number(farmArea) || 1
          )
          return {
            predicted_yield: res.predicted_yield,
            unit: res.unit,
            confidence: res.confidence,
            area: res.area,
            crop: res.crop,
            feature_importance: res.feature_importance,
            demo_mode: false,
          }
        })
      })
      .catch((err) => {
        console.error('Failed to load yield inputs from dataset:', err)
      })

    return () => {
      isMounted = false
    }
  }, [loc.state, loc.district, loc.error, loc.loading, activeFarm?.id])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await run(async () => {
      // If live or farm location available, fetch real historical yield calculation
      if (loc.state && loc.district && form.crop) {
        const res = await agriculturalDataService.getYieldData(
          loc.state,
          loc.district,
          form.crop,
          Number(form.area) || currentFarm?.total_area || 1
        )
        return {
          predicted_yield: res.predicted_yield,
          unit: res.unit,
          confidence: res.confidence,
          area: res.area,
          crop: res.crop,
          feature_importance: res.feature_importance,
          demo_mode: false,
        }
      }

      return yieldApi.predict({
        farm_id: Number(form.farm_id) || currentFarm?.id,
        crop: form.crop,
        area: Number(form.area) || currentFarm?.total_area || 1,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        ph: Number(form.ph),
        rainfall: Number(form.rainfall),
        state: loc.state || undefined,
        district: loc.district || undefined,
      })
    })
  }

  if (farmsLoading) return <PageLoader />

  if (!farms.length) {
    return (
      <EmptyState
        title="No farms found"
        description="Create a farm first to run yield prediction."
        action={
          <Button onClick={() => (window.location.href = '/dashboard/farms')}>
            Create Farm
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Yield Prediction</h1>
          <p className="text-sm text-neutral-500">
            Predict crop yield based on soil nutrients and climate conditions.
          </p>
        </div>
        {result?.demo_mode && <Badge variant="info">Demo data</Badge>}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-earth-500" />
            Prediction Parameters
          </CardTitle>
          <CardDescription>Select crop and enter growing conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Farm</Label>
                <Select
                  value={selectedFarmId?.toString() || activeFarm?.id?.toString() || ''}
                  onValueChange={(v) => {
                    const id = Number(v)
                    setSelectedFarmId(id)
                    handleChange('farm_id', v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id.toString()}>
                        {farm.name}{farm.district && farm.state ? ` (${farm.district}, ${farm.state})` : (farm.location && !/^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/.test(farm.location) && !/lat|lon|coord/i.test(farm.location)) ? ` (${farm.location})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Crop</Label>
                <Select value={form.crop} onValueChange={(v) => handleChange('crop', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {(districtCrops.length > 0 ? districtCrops : CROPS).map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Area (hectares)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={form.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Nitrogen (N) mg/kg</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 45"
                  value={form.nitrogen}
                  onChange={(e) => handleChange('nitrogen', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Phosphorus (P) mg/kg</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 22"
                  value={form.phosphorus}
                  onChange={(e) => handleChange('phosphorus', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Potassium (K) mg/kg</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 180"
                  value={form.potassium}
                  onChange={(e) => handleChange('potassium', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Temperature (C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 25"
                  value={form.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Humidity (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 80"
                  value={form.humidity}
                  onChange={(e) => handleChange('humidity', e.target.value)}
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
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Rainfall (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 200"
                  value={form.rainfall}
                  onChange={(e) => handleChange('rainfall', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? <ButtonLoader label="Predicting..." /> : 'Predict Yield'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* No Data / Location Alert */}
      {noDataError && !error && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <span>{noDataError}</span>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Hero Stat */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Predicted Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-brand">
                    {formatNumber(result.predicted_yield)}
                  </span>
                  <span className="mb-1 text-lg text-neutral-500">{result.unit}</span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  For {formatNumber(result.area)} hectares of {result.crop}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-4 w-4 text-info" />
                  Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <span className="text-2xl font-bold text-neutral-900">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                  <Progress
                    value={result.confidence * 100}
                    className="h-3"
                    indicatorClassName={
                      result.confidence >= 0.8
                        ? 'bg-success'
                        : result.confidence >= 0.6
                          ? 'bg-info'
                          : 'bg-warning'
                    }
                  />
                  <p className="text-xs text-neutral-500">
                    {result.confidence >= 0.8
                      ? 'High confidence prediction'
                      : result.confidence >= 0.6
                        ? 'Moderate confidence'
                        : 'Low confidence - consider more data'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Importance Chart */}
          {result.feature_importance && result.feature_importance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-info" />
                  Feature Importance
                </CardTitle>
                <CardDescription>
                  Which factors most influenced this yield prediction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureImportanceChart data={result.feature_importance} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
