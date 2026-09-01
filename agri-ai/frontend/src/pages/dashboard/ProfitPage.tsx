import { useState } from 'react'
import { Calculator, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { profitApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { useFarm } from '@/components/farm/FarmContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { colors } from '@/lib/theme'
import { CROPS as CROP_OPTIONS } from '@/lib/crops'

// --- Chart colors sourced from the centralized design tokens (lib/theme.ts) ---
const CHART_COLORS = {
  seed: colors.status.info,       // blue
  fertilizer: colors.earth['500'], // amber
  labor: colors.freshGreen['500'], // green
  irrigation: colors.earth['400'], // lighter amber
  pesticide: colors.deepGreen['600'], // deep green
  other: colors.neutral['400'],    // gray
}

interface ProfitResult {
  total_revenue: number
  total_cost: number
  gross_profit: number
  profit_per_ha: number
  margin_pct: number
  breakdown: Record<string, number>
  demo_mode: boolean
  disclaimer: string
}

function formatField(label: string): string {
  return label.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ProfitPage() {
  const { currentFarm } = useFarm()
  const { data: result, loading, error, run } = useAsync<ProfitResult>()

  const [form, setForm] = useState({
    crop: '',
    area_ha: '',
    expected_yield_per_ha: '',
    price_per_unit: '',
    seed_cost: '',
    fertilizer_cost: '',
    labor_cost: '',
    irrigation_cost: '',
    pesticide_cost: '',
    other_costs: '',
  })

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentFarm) return

    const payload = {
      farm_id: currentFarm.id,
      crop: form.crop,
      area_ha: parseFloat(form.area_ha) || 0,
      expected_yield_per_ha: parseFloat(form.expected_yield_per_ha) || 0,
      price_per_unit: parseFloat(form.price_per_unit) || 0,
      seed_cost: parseFloat(form.seed_cost) || 0,
      fertilizer_cost: parseFloat(form.fertilizer_cost) || 0,
      labor_cost: parseFloat(form.labor_cost) || 0,
      irrigation_cost: parseFloat(form.irrigation_cost) || 0,
      pesticide_cost: parseFloat(form.pesticide_cost) || 0,
      other_costs: parseFloat(form.other_costs) || 0,
    }

    await run(() => profitApi.calculate(payload))
  }

  if (!currentFarm) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Profit Calculator</h1>
        <EmptyState
          title="No farm selected"
          description="Please create or select a farm from the Farm Management page before calculating profit."
        />
      </div>
    )
  }

  // Build cost breakdown data for the pie chart
  const costBreakdown = result?.breakdown
    ? Object.entries(result.breakdown)
        .filter(([key, val]) => key !== 'total_revenue' && key !== 'total_cost' && val > 0)
        .map(([key, val]) => ({ name: formatField(key), value: val }))
    : []

  // Recharts colors array for the pie segments
  const pieColors = [
    CHART_COLORS.seed,
    CHART_COLORS.fertilizer,
    CHART_COLORS.labor,
    CHART_COLORS.irrigation,
    CHART_COLORS.pesticide,
    CHART_COLORS.other,
  ]

  const marginColor =
    (result?.margin_pct ?? 0) >= 20
      ? 'text-success'
      : (result?.margin_pct ?? 0) >= 10
        ? 'text-warning'
        : 'text-danger'

  const marginProgressIndicator =
    (result?.margin_pct ?? 0) >= 20
      ? 'bg-success'
      : (result?.margin_pct ?? 0) >= 10
        ? 'bg-warning'
        : 'bg-danger'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Profit Calculator</h1>
        <p className="text-sm text-neutral-500">
          Analyze crop profitability with detailed cost breakdown and revenue projections
        </p>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-fresh-500" />
            Input Parameters
          </CardTitle>
          <CardDescription>
            Enter crop details and cost breakdown for {currentFarm.name}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-6">
              {/* Crop details */}
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
                    <Label htmlFor="expected_yield">Yield / ha *</Label>
                    <Input
                      id="expected_yield"
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="e.g. 4.5 tonnes"
                      value={form.expected_yield_per_ha}
                      onChange={(e) => setField('expected_yield_per_ha', e.target.value)}
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

              {/* Cost inputs */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-neutral-700">Cost Breakdown (INR / ha)</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { id: 'seed_cost', label: 'Seed Cost' },
                    { id: 'fertilizer_cost', label: 'Fertilizer Cost' },
                    { id: 'labor_cost', label: 'Labor Cost' },
                    { id: 'irrigation_cost', label: 'Irrigation Cost' },
                    { id: 'pesticide_cost', label: 'Pesticide Cost' },
                    { id: 'other_costs', label: 'Other Costs' },
                  ].map(({ id, label }) => (
                    <div key={id}>
                      <Label htmlFor={id}>{label}</Label>
                      <Input
                        id={id}
                        type="number"
                        step="100"
                        min="0"
                        placeholder="0"
                        value={form[id as keyof typeof form]}
                        onChange={(e) => setField(id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || !form.crop}>
              {loading ? <ButtonLoader label="Calculating..." /> : 'Calculate Profit'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="flex items-center gap-2">
          <span className="font-medium">Calculation error:</span> {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && <PageLoader label="Calculating profit..." />}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Demo badge */}
          {result.demo_mode && (
            <Alert variant="warning" className="flex items-center gap-2">
              <Badge variant="warning">Demo data</Badge>
              <span>
                Showing simulated profit calculations. Results are for demonstration purposes only.
              </span>
            </Alert>
          )}

          {/* Key metric cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card className="bg-info/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-info">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </div>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {formatCurrency(result.total_revenue)}
                </p>
              </CardContent>
            </Card>

            {/* Total Cost */}
            <Card className="bg-warning/5">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-warning">
                  <TrendingDown className="h-4 w-4" />
                  Total Cost
                </div>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {formatCurrency(result.total_cost)}
                </p>
              </CardContent>
            </Card>

            {/* Gross Profit */}
            <Card className={result.gross_profit >= 0 ? 'bg-success/5' : 'bg-danger/5'}>
              <CardContent className="pt-5">
                <div className={`flex items-center gap-2 text-sm font-medium ${result.gross_profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  <TrendingUp className="h-4 w-4" />
                  Gross Profit
                </div>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {formatCurrency(result.gross_profit)}
                </p>
              </CardContent>
            </Card>

            {/* Profit per hectare */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                  <Calculator className="h-4 w-4" />
                  Profit / ha
                </div>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {formatCurrency(result.profit_per_ha)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Margin indicator */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Profit Margin</p>
                  <p className={`text-3xl font-bold ${marginColor}`}>
                    {formatNumber(result.margin_pct, 1)}%
                  </p>
                </div>
                <div className="flex-1 ml-8">
                  <Progress
                    value={Math.min(Math.max(result.margin_pct, 0), 100)}
                    indicatorClassName={marginProgressIndicator}
                    className="h-3"
                  />
                  <div className="mt-1 flex justify-between text-xs text-neutral-400">
                    <span>0%</span>
                    <span>Target: 20%+</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost breakdown pie chart + legend */}
          {costBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Breakdown</CardTitle>
                <CardDescription>Distribution of production costs per hectare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center lg:flex-row lg:items-start">
                  <div className="h-64 w-full lg:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {costBreakdown.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={pieColors[index % pieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: colors.white,
                            border: `1px solid ${colors.neutral['200']}`,
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 w-full lg:mt-0 lg:w-1/2 lg:pl-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 text-left">
                          <th className="pb-2 font-medium text-neutral-600">Cost Item</th>
                          <th className="pb-2 text-right font-medium text-neutral-600">Amount</th>
                          <th className="pb-2 text-right font-medium text-neutral-600">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costBreakdown.map((item, index) => {
                          const share = result.total_cost > 0 ? (item.value / result.total_cost) * 100 : 0
                          return (
                            <tr key={item.name} className="border-b border-neutral-100 last:border-0">
                              <td className="py-2 flex items-center gap-2">
                                <span
                                  className="inline-block h-3 w-3 rounded-full"
                                  style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                />
                                <span className="font-medium text-neutral-700">{item.name}</span>
                              </td>
                              <td className="py-2 text-right font-medium text-neutral-900">
                                {formatCurrency(item.value)}
                              </td>
                              <td className="py-2 text-right text-neutral-500">
                                {formatNumber(share, 1)}%
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="font-semibold">
                          <td className="py-2 text-neutral-900">Total Cost</td>
                          <td className="py-2 text-right text-neutral-900">
                            {formatCurrency(result.total_cost)}
                          </td>
                          <td className="py-2 text-right text-neutral-900">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          {result.disclaimer && (
            <Alert variant="info" className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-info" />
              <div>
                <p className="font-medium text-info">Disclaimer</p>
                <p className="mt-1 text-sm">{result.disclaimer}</p>
              </div>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
