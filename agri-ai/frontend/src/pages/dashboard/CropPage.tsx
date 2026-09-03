import { useState, useEffect } from 'react'
import { useFarm } from '@/components/farm/FarmContext'
import { cropApi } from '@/services/modules'
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
import { formatNumber, formatCurrency } from '@/lib/utils'
import type { CropRecommendationResult } from '@/types'
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
  Sprout,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Shield,
} from 'lucide-react'

import { chartColors } from '@/lib/theme'
const CHART_COLORS = chartColors

function FeatureImportanceChart({
  data,
}: {
  data: { label: string; importance: number }[]
}) {
  const sorted = [...data].sort((a, b) => b.importance - a.importance)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.neutralGrid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: chartColors.neutralText }} />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fontSize: 12, fill: chartColors.neutralText }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.white,
            border: `1px solid ${chartColors.neutralGrid}`,
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
        />
        <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
          {sorted.map((_, index) => (
            <Cell
              key={index}
              fill={index === 0 ? CHART_COLORS.deep : index === 1 ? CHART_COLORS.fresh : CHART_COLORS.freshLight}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CropPage() {
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, loading: farmsLoading } = useFarm()
  const { data: result, loading, error, run } = useAsync<CropRecommendationResult>()

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null

  const [form, setForm] = useState({
    farm_id: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    area: '',
  })

  const [noDataError, setNoDataError] = useState<string | null>(null)

  // Use active farm location
  const loc = useAgriculturalLocation(activeFarm?.id)

  // Automatically populate values from state dataset + district filter and run recommendation
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
        const farmArea = activeFarm?.total_area ? String(activeFarm.total_area) : '1'
        setForm({
          farm_id: activeFarm?.id ? String(activeFarm.id) : '',
          nitrogen: data.nitrogen != null ? String(data.nitrogen) : '',
          phosphorus: data.phosphorus != null ? String(data.phosphorus) : '',
          potassium: data.potassium != null ? String(data.potassium) : '',
          temperature: data.temperature != null ? String(data.temperature) : '',
          humidity: data.humidity != null ? String(data.humidity) : '',
          ph: data.ph != null ? String(data.ph) : '',
          rainfall: data.rainfall != null ? String(data.rainfall) : '',
          area: farmArea,
        })

        // Auto-run crop recommendation for this farm's location
        run(async () => {
          const res = await agriculturalDataService.getCropRecommendations(
            loc.state!,
            loc.district!,
            Number(farmArea) || 1
          )
          return {
            recommendations: res.recommendations,
            input_features: {
              nitrogen: Number(data.nitrogen),
              phosphorus: Number(data.phosphorus),
              potassium: Number(data.potassium),
              temperature: Number(data.temperature),
              humidity: Number(data.humidity),
              ph: Number(data.ph),
              rainfall: Number(data.rainfall),
            },
            feature_importance: res.feature_importance,
            demo_mode: false,
          }
        })
      })
      .catch((err) => {
        console.error('Failed to load crop parameters from dataset:', err)
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
      // If live or farm location available, fetch real ranked crops directly from dataset
      if (loc.state && loc.district) {
        const res = await agriculturalDataService.getCropRecommendations(
          loc.state,
          loc.district,
          Number(form.area) || currentFarm?.total_area || 1
        )
        return {
          recommendations: res.recommendations,
          input_features: {
            nitrogen: Number(form.nitrogen),
            phosphorus: Number(form.phosphorus),
            potassium: Number(form.potassium),
            temperature: Number(form.temperature),
            humidity: Number(form.humidity),
            ph: Number(form.ph),
            rainfall: Number(form.rainfall),
          },
          feature_importance: res.feature_importance,
          demo_mode: false,
        }
      }

      return cropApi.recommend({
        farm_id: Number(form.farm_id) || currentFarm?.id,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        ph: Number(form.ph),
        rainfall: Number(form.rainfall),
        area: Number(form.area) || currentFarm?.total_area || 1,
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
        description="Create a farm first to get crop recommendations."
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
          <h1 className="text-2xl font-bold text-neutral-900">Crop Recommendations</h1>
          <p className="text-sm text-neutral-500">
            Get AI-powered crop recommendations based on your soil and climate conditions.
          </p>
        </div>
        {result?.demo_mode && <Badge variant="info">Demo data</Badge>}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-brand" />
            Input Parameters
          </CardTitle>
          <CardDescription>Enter soil nutrients and climate data.</CardDescription>
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
                {loading ? <ButtonLoader label="Recommending..." /> : 'Get Recommendations'}
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
          {/* Ranked Crop Cards */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Top Crop Recommendations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result.recommendations.map((crop, i) => (
                <Card key={i} className={i === 0 ? 'ring-2 ring-brand' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {i === 0 && <Sprout className="h-5 w-5 text-brand" />}
                        <span className="capitalize">{crop.crop}</span>
                        {i === 0 && <Badge variant="primary">Best Match</Badge>}
                      </CardTitle>
                      <span className="text-xs text-neutral-400">#{i + 1}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Score */}
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Match Score</span>
                        <span className="font-medium text-neutral-700">
                          {(crop.score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={crop.score * 100}
                        indicatorClassName={
                          crop.score >= 0.8
                            ? 'bg-success'
                            : crop.score >= 0.6
                              ? 'bg-info'
                              : 'bg-warning'
                        }
                      />
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-neutral-600 leading-relaxed">{crop.reason}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="rounded-md bg-neutral-50 p-2 text-center">
                        <p className="text-xs text-neutral-500">Yield</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatNumber(crop.expected_yield)} t/ha
                        </p>
                      </div>
                      <div className="rounded-md bg-neutral-50 p-2 text-center">
                        <p className="text-xs text-neutral-500">Revenue</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(crop.revenue)}
                        </p>
                      </div>
                      <div className="rounded-md bg-neutral-50 p-2 text-center">
                        <p className="text-xs text-neutral-500">Production</p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatNumber(crop.production)} t
                        </p>
                      </div>
                      <div className="rounded-md bg-neutral-50 p-2 text-center">
                        <p className="text-xs text-neutral-500">Risk</p>
                        <div className="flex items-center justify-center gap-1">
                          <Shield className="h-3 w-3" />
                          <p
                            className={`text-sm font-semibold ${
                              crop.risk <= 0.3
                                ? 'text-success'
                                : crop.risk <= 0.6
                                  ? 'text-warning'
                                  : 'text-danger'
                            }`}
                          >
                            {crop.risk <= 0.3 ? 'Low' : crop.risk <= 0.6 ? 'Medium' : 'High'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Explainable AI Panel */}
          {result.feature_importance && result.feature_importance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-info" />
                  Explainable AI - Feature Importance
                </CardTitle>
                <CardDescription>
                  How each input factor influenced the recommendation.
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
