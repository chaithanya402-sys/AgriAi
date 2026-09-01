import { useState } from 'react'
import { useFarm } from '@/components/farm/FarmContext'
import { soilApi } from '@/services/modules'
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
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { formatNumber } from '@/lib/utils'
import type { SoilAnalysisResult } from '@/types'
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Info,
  Leaf,
  Droplets,
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
  const { farms, currentFarm, loading: farmsLoading } = useFarm()
  const { data: result, loading, error, run } = useAsync<SoilAnalysisResult & { demo_mode?: boolean }>()

  const [form, setForm] = useState({
    farm_id: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    organic_carbon: '',
    moisture: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await run(() =>
      soilApi.analyze({
        farm_id: Number(form.farm_id) || currentFarm?.id,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        ph: Number(form.ph),
        organic_carbon: Number(form.organic_carbon),
        moisture: Number(form.moisture),
      })
    )
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Soil Health Analysis</h1>
          <p className="text-sm text-neutral-500">
            Analyze soil composition and get actionable recommendations.
          </p>
        </div>
        {result?.demo_mode && <Badge variant="info">Demo data</Badge>}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-brand" />
            Soil Parameters
          </CardTitle>
          <CardDescription>Enter soil test values for analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Farm Selector */}
              <div className="space-y-1.5">
                <Label>Farm</Label>
                <Select
                  value={form.farm_id || currentFarm?.id?.toString() || ''}
                  onValueChange={(v) => handleChange('farm_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id.toString()}>
                        {farm.name}
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
                <Label>Organic Carbon (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1.2"
                  value={form.organic_carbon}
                  onChange={(e) => handleChange('organic_carbon', e.target.value)}
                  required
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
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? <ButtonLoader label="Analyzing..." /> : 'Analyze Soil'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
                        {formatNumber(result.health_score, 0)}
                      </span>
                      <span className="text-sm text-neutral-500">/ 100</span>
                    </div>
                    <Progress
                      value={result.health_score}
                      className="h-3"
                      indicatorClassName={
                        result.health_score >= 70
                          ? 'bg-success'
                          : result.health_score >= 40
                            ? 'bg-warning'
                            : 'bg-danger'
                      }
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <Badge
                      variant={(gradeColors[result.grade] as any) || 'default'}
                      className="text-lg font-bold px-3 py-1"
                    >
                      {result.grade}
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
                  {result.explanation}
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
                {result.nutrients.map((n, i) => {
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
                {result.recommendations.map((rec, i) => (
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
