import { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Gauge,
  AlertTriangle,
} from 'lucide-react'
import { optimizeApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { useFarm } from '@/components/farm/FarmContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { CROPS as CROP_OPTIONS } from '@/lib/crops'

interface Plan {
  crop: string
  area_ha: number
  yield_per_ha: number
  cost_per_ha: number
  total_cost: number
  revenue: number
  profit: number
  margin_pct: number
}

interface OptimizeResult {
  current_plan: Plan
  optimized_plan: Plan
  improvements: {
    yield_pct: number
    cost_reduction_pct: number
    profit_increase_pct: number
  }
  summary: string
  demo_mode: boolean
}

export function OptimizePage() {
  const { currentFarm } = useFarm()
  const { data: result, loading, error, run } = useAsync<OptimizeResult>()

  const [form, setForm] = useState({
    crop: '',
    current_yield: '',
    current_cost_per_ha: '',
    area_ha: '',
    price_per_unit: '',
    optimized_yield_per_ha: '',
    optimized_cost_per_ha: '',
  })

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFarm) return

    const payload: Record<string, unknown> = {
      farm_id: currentFarm.id,
      crop: form.crop,
      current_yield: parseFloat(form.current_yield) || 0,
      current_cost_per_ha: parseFloat(form.current_cost_per_ha) || 0,
      area_ha: parseFloat(form.area_ha) || 0,
      price_per_unit: parseFloat(form.price_per_unit) || 0,
    }

    // Include optional optimized overrides only if provided
    if (form.optimized_yield_per_ha) {
      payload.optimized_yield_per_ha = parseFloat(form.optimized_yield_per_ha)
    }
    if (form.optimized_cost_per_ha) {
      payload.optimized_cost_per_ha = parseFloat(form.optimized_cost_per_ha)
    }

    await run(() => optimizeApi.plan(payload))
  }

  if (!currentFarm) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Farm Optimizer</h1>
        <EmptyState
          title="No farm selected"
          description="Please create or select a farm from the Farm Management page before optimizing."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Farm Optimizer</h1>
        <p className="text-sm text-neutral-500">
          Get AI-powered optimization recommendations to maximize your farm's profitability
        </p>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fresh-500" />
            Optimization Parameters
          </CardTitle>
          <CardDescription>
            Enter your current farming setup and optional optimization targets for {currentFarm.name}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-6">
              {/* Crop & area */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-700">Crop Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor="crop">Crop *</Label>
                    <Select value={form.crop} onValueChange={(v) => setField('crop', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROP_OPTIONS.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="area_ha">Area (ha) *</Label>
                    <Input
                      id="area_ha"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g. 5"
                      value={form.area_ha}
                      onChange={(e) => setField('area_ha', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_per_unit">Price / unit *</Label>
                    <Input
                      id="price_per_unit"
                      type="number"
                      step="1"
                      min="0"
                      required
                      placeholder="e.g. 25000 / tonne"
                      value={form.price_per_unit}
                      onChange={(e) => setField('price_per_unit', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Current plan inputs */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-700">Current Plan</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="current_yield">Current Yield / ha *</Label>
                    <Input
                      id="current_yield"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g. 4.0 tonnes"
                      value={form.current_yield}
                      onChange={(e) => setField('current_yield', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_cost">Current Cost / ha *</Label>
                    <Input
                      id="current_cost"
                      type="number"
                      step="100"
                      min="0"
                      required
                      placeholder="e.g. 45000 INR"
                      value={form.current_cost_per_ha}
                      onChange={(e) => setField('current_cost_per_ha', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Optional optimization overrides */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-700">
                  Optimization Targets{' '}
                  <span className="font-normal text-neutral-400">(optional - override to see scenarios)</span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="opt_yield">Target Yield / ha</Label>
                    <Input
                      id="opt_yield"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Leave blank for auto-optimize"
                      value={form.optimized_yield_per_ha}
                      onChange={(e) => setField('optimized_yield_per_ha', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opt_cost">Target Cost / ha</Label>
                    <Input
                      id="opt_cost"
                      type="number"
                      step="100"
                      min="0"
                      placeholder="Leave blank for auto-optimize"
                      value={form.optimized_cost_per_ha}
                      onChange={(e) => setField('optimized_cost_per_ha', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || !form.crop}>
              {loading ? <ButtonLoader label="Optimizing..." /> : 'Run Optimization'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="flex items-center gap-2">
          <span className="font-medium">Optimization error:</span> {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && <PageLoader label="Running optimization analysis..." />}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Demo badge */}
          {result.demo_mode && (
            <Alert variant="warning" className="flex items-center gap-2">
              <Badge variant="warning">Demo data</Badge>
              <span>
                Showing simulated optimization results. Results are for demonstration purposes only.
              </span>
            </Alert>
          )}

          {/* Improvement stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Yield improvement */}
            <Card className="bg-success/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                  <TrendingUp className="h-4 w-4" />
                  Yield Improvement
                </div>
                <p className="mt-2 text-3xl font-bold text-success">
                  +{formatNumber(result.improvements.yield_pct, 1)}%
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatNumber(result.current_plan.yield_per_ha, 1)} t/ha &rarr;{' '}
                  {formatNumber(result.optimized_plan.yield_per_ha, 1)} t/ha
                </p>
              </CardContent>
            </Card>

            {/* Cost reduction */}
            <Card className="bg-info/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-info">
                  <DollarSign className="h-4 w-4" />
                  Cost Reduction
                </div>
                <p className="mt-2 text-3xl font-bold text-info">
                  -{formatNumber(result.improvements.cost_reduction_pct, 1)}%
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatCurrency(result.current_plan.cost_per_ha)}/ha &rarr;{' '}
                  {formatCurrency(result.optimized_plan.cost_per_ha)}/ha
                </p>
              </CardContent>
            </Card>

            {/* Profit increase */}
            <Card className="bg-brand/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-brand">
                  <Gauge className="h-4 w-4" />
                  Profit Increase
                </div>
                <p className="mt-2 text-3xl font-bold text-brand">
                  +{formatNumber(result.improvements.profit_increase_pct, 1)}%
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatCurrency(result.current_plan.profit)} &rarr;{' '}
                  {formatCurrency(result.optimized_plan.profit)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Side-by-side plan comparison */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Current Plan */}
            <Card className="border-neutral-200">
              <CardHeader className="rounded-t-lg bg-neutral-50">
                <CardTitle className="text-base text-neutral-700">Current Plan</CardTitle>
                <CardDescription>Your existing farming approach</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: 'Crop', value: result.current_plan.crop },
                      { label: 'Area', value: `${formatNumber(result.current_plan.area_ha, 1)} ha` },
                      {
                        label: 'Yield / ha',
                        value: `${formatNumber(result.current_plan.yield_per_ha, 2)} tonnes`,
                      },
                      {
                        label: 'Cost / ha',
                        value: formatCurrency(result.current_plan.cost_per_ha),
                      },
                      {
                        label: 'Total Cost',
                        value: formatCurrency(result.current_plan.total_cost),
                      },
                      {
                        label: 'Revenue',
                        value: formatCurrency(result.current_plan.revenue),
                      },
                      {
                        label: 'Profit',
                        value: formatCurrency(result.current_plan.profit),
                      },
                      {
                        label: 'Margin',
                        value: `${formatNumber(result.current_plan.margin_pct, 1)}%`,
                      },
                    ].map(({ label, value }) => (
                      <tr key={label} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2.5 font-medium text-neutral-600">{label}</td>
                        <td className="py-2.5 text-right font-semibold text-neutral-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Optimized Plan */}
            <Card className="border-fresh-300 ring-1 ring-fresh-500/10">
              <CardHeader className="rounded-t-lg bg-success/5">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base text-success">Optimized Plan</CardTitle>
                  <Badge variant="success">AI Recommended</Badge>
                </div>
                <CardDescription>Recommended improvements for maximum profitability</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      { label: 'Crop', value: result.optimized_plan.crop },
                      { label: 'Area', value: `${formatNumber(result.optimized_plan.area_ha, 1)} ha` },
                      {
                        label: 'Yield / ha',
                        value: `${formatNumber(result.optimized_plan.yield_per_ha, 2)} tonnes`,
                        highlight: true,
                      },
                      {
                        label: 'Cost / ha',
                        value: formatCurrency(result.optimized_plan.cost_per_ha),
                        highlight: true,
                      },
                      {
                        label: 'Total Cost',
                        value: formatCurrency(result.optimized_plan.total_cost),
                      },
                      {
                        label: 'Revenue',
                        value: formatCurrency(result.optimized_plan.revenue),
                        highlight: true,
                      },
                      {
                        label: 'Profit',
                        value: formatCurrency(result.optimized_plan.profit),
                        highlight: true,
                      },
                      {
                        label: 'Margin',
                        value: `${formatNumber(result.optimized_plan.margin_pct, 1)}%`,
                        highlight: true,
                      },
                    ].map(({ label, value, highlight }) => (
                      <tr key={label} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2.5 font-medium text-neutral-600">{label}</td>
                        <td
                          className={`py-2.5 text-right font-semibold ${
                            highlight ? 'text-success' : 'text-neutral-900'
                          }`}
                        >
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Arrow between the two cards (visible on md+) */}
          <div className="hidden md:flex items-center justify-center -mt-4">
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success">
              <ArrowRight className="h-4 w-4" />
              Improvements applied
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-fresh-500" />
                  Optimization Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-neutral-700">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Demo mode disclaimer */}
          {result.demo_mode && (
            <Alert variant="info" className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-info" />
              <div>
                <p className="font-medium text-info">About these results</p>
                <p className="mt-1 text-sm">
                  These optimization recommendations are based on simulated data for demonstration
                  purposes. Actual optimization results will vary based on real market conditions,
                  soil analysis, weather patterns, and local agronomic factors.
                </p>
              </div>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
