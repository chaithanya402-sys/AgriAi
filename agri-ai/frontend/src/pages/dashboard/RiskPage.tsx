import { useState, useCallback, useMemo } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Cloud,
  Droplets,
  Bug,
  TrendingUp,
  Sprout,
  Lightbulb,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Progress } from '@/components/ui/Progress'
import { Alert } from '@/components/ui/Alert'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { useAsync } from '@/hooks/useAsync'
import { useFarm } from '@/components/farm/FarmContext'
import { riskApi } from '@/services/modules'
import { cn, formatNumber } from '@/lib/utils'
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RiskBreakdown {
  weather: number
  soil: number
  water: number
  disease: number
  price: number
}

interface RiskResult {
  overall_risk: number
  level: string
  breakdown: RiskBreakdown
  top_risks: string[]
  recommendations: string[]
  demo_mode: boolean
}

// ---------------------------------------------------------------------------
// Risk factor metadata
// ---------------------------------------------------------------------------

interface RiskField {
  key: keyof RiskBreakdown
  label: string
  icon: React.ElementType
}

const RISK_FIELDS: RiskField[] = [
  { key: 'weather', label: 'Weather Risk', icon: Cloud },
  { key: 'soil', label: 'Soil Health Score', icon: Sprout },
  { key: 'water', label: 'Water Availability', icon: Droplets },
  { key: 'disease', label: 'Disease Risk', icon: Bug },
  { key: 'price', label: 'Price Volatility', icon: TrendingUp },
]

// ---------------------------------------------------------------------------
// Severity level mapping (semantic tokens)
// ---------------------------------------------------------------------------

function levelVariant(
  level: string,
): 'success' | 'info' | 'warning' | 'danger' {
  switch (level.toLowerCase()) {
    case 'low':
      return 'success'
    case 'moderate':
      return 'info'
    case 'high':
      return 'warning'
    case 'critical':
      return 'danger'
    default:
      return 'info'
  }
}

function levelBadgeClass(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical':
      return 'border-danger/40 bg-danger/15 text-danger font-bold'
    case 'high':
      return 'border-warning/40 bg-warning/15 text-warning'
    default:
      return ''
  }
}

// ---------------------------------------------------------------------------
// Chart colour mapping (semantic tokens via theme, converted to hex for Recharts)
// ---------------------------------------------------------------------------

function riskBarColor(value: number): string {
  // Map numeric risk to semantic colour
  if (value >= 70) return '#b3402e' // danger
  if (value >= 40) return '#b07a2b' // warning
  return '#1e7a3a'                  // success
}

function overallRiskColor(value: number): string {
  if (value >= 70) return '#b3402e'
  if (value >= 40) return '#b07a2b'
  return '#1e7a3a'
}

// ---------------------------------------------------------------------------
// Custom Recharts tooltip
// ---------------------------------------------------------------------------

function RiskTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 shadow-card">
      <p className="text-xs font-medium text-neutral-700">{label}</p>
      <p className="text-sm font-semibold text-neutral-900">
        {payload[0].value.toFixed(1)} / 100
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Slider input component
// ---------------------------------------------------------------------------

interface SliderInputProps {
  label: string
  icon: React.ElementType
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

function SliderInput({ label, icon: Icon, value, onChange, disabled }: SliderInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-neutral-500" />
          {label}
        </Label>
        <span className="text-sm font-semibold text-neutral-900 tabular-nums">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'h-2 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow-card',
            '[&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-brand-hover',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand',
            disabled && 'opacity-50',
          )}
        />
        <Input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => {
            const v = Math.min(100, Math.max(0, Number(e.target.value) || 0))
            onChange(v)
          }}
          disabled={disabled}
          className="w-16 text-center tabular-nums"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RiskPage
// ---------------------------------------------------------------------------

export function RiskPage() {
  const { farms, currentFarm } = useFarm()
  const { data: result, loading, error, run } = useAsync<RiskResult>()

  // Form state
  const [form, setForm] = useState<RiskBreakdown>({
    weather: 30,
    soil: 50,
    water: 60,
    disease: 25,
    price: 40,
  })

  const setField = useCallback((key: keyof RiskBreakdown, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Submit
  const onSubmit = useCallback(async () => {
    if (!currentFarm) return
    await run(() =>
      riskApi.assess({
        farm_id: currentFarm.id,
        weather_risk: form.weather,
        soil_health_score: form.soil,
        water_availability: form.water,
        disease_risk: form.disease,
        price_volatility: form.price,
      }) as Promise<RiskResult>,
    )
  }, [currentFarm, form, run])

  // --- Chart data ---
  const breakdownData = useMemo(() => {
    if (!result?.breakdown) return []
    return RISK_FIELDS.map((f) => ({
      name: f.label.replace(' Risk', '').replace(' Score', '').replace(' Availability', '').replace(' Volatility', ''),
      value: result.breakdown[f.key],
      fullName: f.label,
    }))
  }, [result?.breakdown])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Risk Assessment</h1>
        <p className="text-sm text-neutral-500">
          Evaluate farm risk across weather, soil, water, disease, and market factors.
        </p>
      </div>

      {/* Input form */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factors</CardTitle>
          <CardDescription>
            Adjust each slider to set the risk level (0 = none, 100 = extreme).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {RISK_FIELDS.map((field) => (
              <SliderInput
                key={field.key}
                label={field.label}
                icon={field.icon}
                value={form[field.key]}
                onChange={(v) => setField(field.key, v)}
                disabled={loading}
              />
            ))}

            <div className="pt-2">
              <Button
                variant="primary"
                disabled={!currentFarm || loading}
                onClick={onSubmit}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <ButtonLoader label="Assessing..." />
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Assess Risk
                  </>
                )}
              </Button>
            </div>

            {!currentFarm && farms.length === 0 && (
              <p className="text-xs text-neutral-400">
                No farms found. Please add a farm first.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <PageLoader label="Calculating risk assessment..." />}

      {/* Error */}
      {error && !loading && <Alert variant="danger">{error}</Alert>}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Overall risk + level */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Hero figure */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Overall Risk Score</p>
                    <p
                      className="mt-1 text-5xl font-bold"
                      style={{ color: overallRiskColor(result.overall_risk) }}
                    >
                      {formatNumber(result.overall_risk, 0)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">out of 100</p>
                  </div>
                  {result.demo_mode && (
                    <Badge variant="warning">Demo data</Badge>
                  )}
                </div>
                <Progress
                  value={result.overall_risk}
                  indicatorClassName={cn(
                    result.overall_risk >= 70
                      ? 'bg-danger'
                      : result.overall_risk >= 40
                        ? 'bg-warning'
                        : 'bg-success',
                  )}
                  className="mt-4"
                />
              </CardContent>
            </Card>

            {/* Severity level */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm text-neutral-500">Severity Level</p>
                  <Badge
                    variant={levelVariant(result.level)}
                    className={cn(
                      'mt-3 px-5 py-1.5 text-base',
                      levelBadgeClass(result.level),
                    )}
                  >
                    {result.level}
                  </Badge>
                  <p className="mt-3 max-w-xs text-xs text-neutral-400">
                    {result.level.toLowerCase() === 'low' && 'Minimal risk. Continue monitoring.'}
                    {result.level.toLowerCase() === 'moderate' && 'Some factors need attention.'}
                    {result.level.toLowerCase() === 'high' && 'Immediate action recommended.'}
                    {result.level.toLowerCase() === 'critical' && 'Urgent intervention required.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown bar chart */}
          {breakdownData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Breakdown</CardTitle>
                <CardDescription>
                  Individual scores for each risk factor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={breakdownData}
                      margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8e1"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#33453e' }}
                        axisLine={{ stroke: '#e2e8e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#64756d' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<RiskTooltip />}
                        cursor={{ fill: 'rgba(46,168,72,0.06)' }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        barSize={36}
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={riskBarColor(entry.value)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-success" />
                    Low (0-39)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warning" />
                    Moderate (40-69)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-danger" />
                    High (70-100)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top risks */}
          {result.top_risks.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <CardTitle>Top Risks</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.top_risks.map((risk, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/15 text-xs font-semibold text-warning">
                        {i + 1}
                      </span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-info" />
                  <CardTitle>Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md bg-info/5 px-3 py-2 text-sm text-neutral-700"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-info/15 text-xs font-semibold text-info">
                        {i + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
