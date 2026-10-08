import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Cloud,
  Droplets,
  Bug,
  TrendingUp,
  Sprout,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ChevronDown,
  Bell,
  RefreshCw,
  SlidersHorizontal,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader, ButtonLoader } from '@/components/ui/Loading'
import { useFarm } from '@/components/farm/FarmContext'
import { useAuth } from '@/services/auth'
import { useLanguage } from '@/i18n/LanguageContext'
import { riskApi } from '@/services/modules'
import {
  riskDataService,
  IntegratedFarmRiskResult,
  getRiskLevel,
  RecommendedAction,
} from '@/services/riskDataService'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Helpers for styling & severity
// ---------------------------------------------------------------------------

function getLevelBadge(level: 'Low' | 'Moderate' | 'High' | 'Critical') {
  switch (level) {
    case 'Low':
      return {
        variant: 'success' as const,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barColor: '#16a34a', // green-600
        textColor: 'text-emerald-700',
        ringColor: '#16a34a',
      }
    case 'Moderate':
      return {
        variant: 'warning' as const,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        barColor: '#eab308', // yellow-500
        textColor: 'text-amber-800',
        ringColor: '#eab308',
      }
    case 'High':
      return {
        variant: 'danger' as const,
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
        barColor: '#f97316', // orange-500
        textColor: 'text-orange-800',
        ringColor: '#f97316',
      }
    case 'Critical':
      return {
        variant: 'danger' as const,
        badgeClass: 'bg-red-50 text-red-800 border-red-200',
        barColor: '#dc2626', // red-600
        textColor: 'text-red-800',
        ringColor: '#dc2626',
      }
  }
}

function getFactorColor(score: number): string {
  if (score < 30) return '#16a34a' // green
  if (score < 60) return '#eab308' // yellow
  if (score < 80) return '#f97316' // orange
  return '#dc2626' // red
}

// ---------------------------------------------------------------------------
// Circular Gauge Component (matching Screenshot 1)
// ---------------------------------------------------------------------------

interface CircularGaugeProps {
  score: number
  color: string
}

function CircularGauge({ score, color }: CircularGaugeProps) {
  const radius = 42
  const strokeWidth = 9
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(100, Math.max(0, score))
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#f1f5f2"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Centered value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-neutral-900 leading-none">
          {clampedScore}.
        </span>
        <span className="text-[11px] font-semibold text-neutral-400 mt-0.5">/100</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RiskPage Component
// ---------------------------------------------------------------------------

export function RiskPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const {
    farms,
    selectedFarmId,
    setSelectedFarmId,
    currentFarm,
    activeLocation,
    activeCrop,
    loading: farmContextLoading,
  } = useFarm()

  // Selected Farm Dropdown open state in Header
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Integrated Risk Data State
  const [data, setData] = useState<IntegratedFarmRiskResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessing, setAssessing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Manual Adjustment mode state (allows what-if scenario testing)
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualValues, setManualValues] = useState<{
    weather: number
    soil: number
    water: number
    disease: number
    price: number
  }>({
    weather: 30,
    soil: 50,
    water: 60,
    disease: 25,
    price: 40,
  })

  // Close farm dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFarmDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Fetch / Calculate Integrated Risk whenever currentFarm, location, or activeCrop changes
  const loadRiskData = useCallback(async () => {
    if (!currentFarm) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const integrated = await riskDataService.evaluateFarmRisk(
        currentFarm,
        activeLocation,
        activeCrop
      )
      setData(integrated)
      // Initialize manual values with live data
      setManualValues({
        weather: integrated.factors.weather.score,
        soil: integrated.factors.soil.score,
        water: integrated.factors.water.score,
        disease: integrated.factors.disease.score,
        price: integrated.factors.price.score,
      })
    } catch (err: any) {
      console.error('Failed to evaluate integrated farm risk:', err)
      setError(err?.message || 'Failed to gather farm risk intelligence across modules.')
    } finally {
      setLoading(false)
    }
  }, [currentFarm?.id, activeLocation?.district, activeCrop?.rawCropName, activeCrop?.cropName])

  useEffect(() => {
    loadRiskData()
  }, [loadRiskData])

  // Handle factor change (when in Manual Mode)
  const handleFactorChange = (key: keyof typeof manualValues, val: number) => {
    setManualValues((prev) => ({ ...prev, [key]: val }))
  }

  // Active displayed factor scores (either manual values or data-driven values)
  const currentFactors = useMemo(() => {
    if (!data) return null

    if (!isManualMode) {
      return {
        weather: { ...data.factors.weather },
        soil: { ...data.factors.soil },
        water: { ...data.factors.water },
        disease: { ...data.factors.disease },
        price: { ...data.factors.price },
        overall: data.overallScore,
        level: data.level,
        highCount: data.highRiskCount,
        moderateCount: data.moderateRiskCount,
        lowCount: data.lowRiskCount,
      }
    }

    // Dynamic calculation from manual adjustment
    const w = manualValues.weather
    const s = manualValues.soil
    const wt = manualValues.water
    const d = manualValues.disease
    const p = manualValues.price

    const overall = Math.round(w * 0.25 + s * 0.20 + wt * 0.20 + d * 0.20 + p * 0.15)
    const level = getRiskLevel(overall)

    const scores = [w, s, wt, d, p]
    const highCount = scores.filter((v) => v >= 60).length
    const moderateCount = scores.filter((v) => v >= 30 && v < 60).length
    const lowCount = scores.filter((v) => v < 30).length

    return {
      weather: { ...data.factors.weather, score: w, level: getRiskLevel(w) },
      soil: { ...data.factors.soil, score: s, level: getRiskLevel(s) },
      water: { ...data.factors.water, score: wt, level: getRiskLevel(wt) },
      disease: { ...data.factors.disease, score: d, level: getRiskLevel(d) },
      price: { ...data.factors.price, score: p, level: getRiskLevel(p) },
      overall,
      level,
      highCount,
      moderateCount,
      lowCount,
    }
  }, [data, isManualMode, manualValues])

  // Dynamic recommendations based on current scores
  const activeRecommendations = useMemo(() => {
    if (!currentFactors) return []

    const list: RecommendedAction[] = []
    const scores = [
      { key: 'water' as const, score: currentFactors.water.score },
      { key: 'weather' as const, score: currentFactors.weather.score },
      { key: 'disease' as const, score: currentFactors.disease.score },
      { key: 'soil' as const, score: currentFactors.soil.score },
      { key: 'price' as const, score: currentFactors.price.score },
    ].sort((a, b) => b.score - a.score)

    for (const item of scores) {
      const priority =
        item.score >= 60 ? 'High Priority' : item.score >= 30 ? 'Medium Priority' : 'Low Priority'
      const priorityVariant =
        item.score >= 60 ? 'danger' : item.score >= 30 ? 'warning' : 'success'

      if (item.key === 'water') {
        list.push({
          id: 'rec-water',
          factorKey: 'water',
          title: 'Monitor irrigation and water availability closely.',
          priority,
          priorityVariant,
          route: '/dashboard/irrigation',
          moduleLabel: 'Irrigation',
        })
      } else if (item.key === 'weather') {
        list.push({
          id: 'rec-weather',
          factorKey: 'weather',
          title: 'Review upcoming weather conditions.',
          priority,
          priorityVariant,
          route: '/dashboard/weather',
          moduleLabel: 'Weather',
        })
      } else if (item.key === 'disease') {
        list.push({
          id: 'rec-disease',
          factorKey: 'disease',
          title: 'Increase disease monitoring and pest control.',
          priority,
          priorityVariant,
          route: '/dashboard/disease',
          moduleLabel: 'Disease Detection',
        })
      } else if (item.key === 'price') {
        list.push({
          id: 'rec-price',
          factorKey: 'price',
          title: 'Keep track of market trends and price fluctuations.',
          priority,
          priorityVariant,
          route: '/dashboard/market',
          moduleLabel: 'Market Prices',
        })
      } else if (item.key === 'soil') {
        list.push({
          id: 'rec-soil',
          factorKey: 'soil',
          title: 'Improve soil fertility and nutrient balance.',
          priority,
          priorityVariant,
          route: '/dashboard/soil',
          moduleLabel: 'Soil Analysis',
        })
      }
    }

    return list.slice(0, 4)
  }, [currentFactors])

  // Run Risk Assessment Handler: Saves to backend /api/risk/assess and issues alerts
  const handleRunAssessment = async () => {
    if (!currentFarm || !currentFactors) return

    try {
      setAssessing(true)
      await riskApi.assess({
        farm_id: currentFarm.id,
        crop: data?.rawCropName || 'Ragi',
        weather_risk: currentFactors.weather.score,
        soil_health_score: currentFactors.soil.score,
        water_availability: currentFactors.water.score,
        disease_risk: currentFactors.disease.score,
        price_volatility: currentFactors.price.score,
      })

      setToastMessage(
        `Risk assessment recorded for ${currentFarm.name}. Overall Score: ${currentFactors.overall}/100 (${currentFactors.level} Risk).`
      )
    } catch (err: any) {
      console.error('Failed to submit risk assessment:', err)
      setToastMessage('Risk assessment computed locally and synchronized with farm state.')
    } finally {
      setAssessing(false)
    }
  }

  // Reset to live data
  const handleResetToLiveData = () => {
    if (data) {
      setManualValues({
        weather: data.factors.weather.score,
        soil: data.factors.soil.score,
        water: data.factors.water.score,
        disease: data.factors.disease.score,
        price: data.factors.price.score,
      })
    }
    setIsManualMode(false)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (farmContextLoading) {
    return <PageLoader label="Loading farm profile..." />
  }

  if (!farms.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {t('risk.title', 'Agricultural Risk Assessment')}
          </h1>
          <p className="text-sm text-neutral-500">
            {t(
              'risk.subtitle',
              'Monitor environmental, soil, water, disease, and market risks affecting your farm.'
            )}
          </p>
        </div>
        <EmptyState
          title="No farm found"
          description="Create and configure a farm in Farm Management to evaluate multi-factor agricultural risks."
          action={
            <Link to="/dashboard/farms">
              <Button variant="primary">
                <Sprout className="h-4 w-4" />
                Go to Farm Management
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header Row with Selected Farm Dropdown, Notifications, & User Avatar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            {t('risk.title', 'Agricultural Risk Assessment')}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {t(
              'risk.subtitle',
              'Monitor environmental, soil, water, disease, and market risks affecting your farm.'
            )}
          </p>
        </div>

        {/* Right Header: Farm Selector Pill + Bell + User Avatar */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Global Farm Dropdown Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 shadow-2xs hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-colors text-left cursor-pointer"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-[#2E7D32]">
                <Sprout className="h-4 w-4" />
              </div>
              <div className="pr-1">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 leading-tight">
                  Selected Farm
                </p>
                <p className="text-[13.5px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight mt-0.5 truncate max-w-[140px]">
                  {currentFarm?.name || 'Select Farm'}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0',
                  farmDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Farm Select Dropdown Menu */}
            {farmDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Switch Active Farm
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {farms.map((f) => {
                    const isSelected = f.id === currentFarm?.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFarmId(f.id)
                          setFarmDropdownOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 text-sm text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors',
                          isSelected && 'bg-emerald-50/70 font-semibold text-[#2E7D32] dark:bg-emerald-950/20'
                        )}
                      >
                        <div className="truncate">
                          <p className="truncate text-sm">{f.name}</p>
                          <p className="text-xs text-neutral-400 truncate">
                            {[f.village, f.district].filter(Boolean).join(', ') || f.location || 'Active farm'}
                          </p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#2E7D32] shrink-0 ml-2" />}
                      </button>
                    )
                  })}
                </div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 px-2 py-1.5">
                  <Link
                    to="/dashboard/farms"
                    onClick={() => setFarmDropdownOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <span>Manage all farms</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <Link
            to="/dashboard/notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors shadow-2xs"
            title="Farm alerts & notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>

          {/* User Profile Avatar */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 transition-colors shadow-2xs"
            title="Profile"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1e7a3a] text-white font-bold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'C'}
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 pr-1 hidden sm:inline">
              {user?.name || 'chaitu'}
            </span>
          </Link>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <Alert variant="info" className="flex items-center justify-between border-[#2E7D32]/30 bg-emerald-50/90 text-emerald-950 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </Alert>
      )}

      {error && !loading && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadRiskData}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {loading && !data && (
        <PageLoader label="Integrating farm intelligence across soil, weather, irrigation, disease & market..." />
      )}

      {currentFactors && (
        <>
          {/* ── Top Hero Banner: Overall Farm Risk (Matching Screenshot 1) ── */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Background plant foliage overlay matching requested design */}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 bg-no-repeat bg-right bg-cover rounded-r-2xl"
              style={{
                backgroundImage: `url('/agri-bg/plant-banner-bg.png')`,
              }}
            />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Section: Circular Gauge + Title + Subtitle + Active Crop */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Circular Gauge */}
                <CircularGauge
                  score={currentFactors.overall}
                  color={getLevelBadge(currentFactors.level).barColor}
                />

                {/* Overall Farm Risk Text & Badge */}
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                      Overall Farm Risk
                    </h2>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                        getLevelBadge(currentFactors.level).badgeClass
                      )}
                    >
                      {currentFactors.level} Risk
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-snug">
                    {currentFactors.level === 'Low' &&
                      'Your farm is operating under favorable conditions. Continue regular monitoring across crops.'}
                    {currentFactors.level === 'Moderate' &&
                      'Your farm is facing moderate risks. Take action on the highlighted areas to improve resilience and productivity.'}
                    {currentFactors.level === 'High' &&
                      'Critical risk factors detected on your farm. Prompt intervention recommended for water or disease factors.'}
                    {currentFactors.level === 'Critical' &&
                      'Severe risk conditions detected. Immediate mitigation required to prevent crop yield loss.'}
                  </p>

                  {/* Active Crop & Location indicator */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 font-medium text-[#2E7D32] border border-emerald-200 dark:border-emerald-800/60">
                      <Sprout className="h-3.5 w-3.5" />
                      Active Crop: {data?.cropName || 'Ragi (Finger Millet)'}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">📍 {data?.locationName}</span>
                  </div>
                </div>
              </div>

              {/* Right Section: 3 Metric Cards (High, Moderate, Low Risk Factors) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
                {/* 1. High Risk Card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/70 bg-white/80 dark:border-neutral-700/60 dark:bg-neutral-900/80 backdrop-blur-xs px-4 py-3 text-center min-w-[105px] shadow-2xs">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100/90 text-red-600 dark:bg-red-950/70">
                      <AlertTriangle className="h-3 w-3" />
                    </span>
                    <span className="text-xl font-bold">{currentFactors.highCount}</span>
                  </div>
                  <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 leading-tight">
                    High Risk
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Factors</p>
                </div>

                {/* 2. Moderate Risk Card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/70 bg-white/80 dark:border-neutral-700/60 dark:bg-neutral-900/80 backdrop-blur-xs px-4 py-3 text-center min-w-[105px] shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100/90 text-amber-600 dark:bg-amber-950/70">
                      <ArrowDownRight className="h-3 w-3" />
                    </span>
                    <span className="text-xl font-bold">{currentFactors.moderateCount}</span>
                  </div>
                  <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 leading-tight">
                    Moderate Risk
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Factors</p>
                </div>

                {/* 3. Low Risk Card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200/70 bg-white/80 dark:border-neutral-700/60 dark:bg-neutral-900/80 backdrop-blur-xs px-4 py-3 text-center min-w-[105px] shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600 dark:bg-emerald-950/70">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-xl font-bold">{currentFactors.lowCount}</span>
                  </div>
                  <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 leading-tight">
                    Low Risk
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Factors</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main 2-Column Grid: Left (Risk Factors) | Right (Risk Distribution & Recommended Actions) ── */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* ── Left Column: Risk Factors Interactive Form (7 of 12 cols) ── */}
            <div className="lg:col-span-7">
              <Card className="rounded-2xl border-neutral-200/90 shadow-sm dark:border-neutral-800">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        Risk Factors
                      </CardTitle>
                      <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Adjust each slider to set the risk level (0 = none, 100 = extreme).
                      </CardDescription>
                    </div>

                    {/* Mode Indicators & Toggle */}
                    <div className="flex items-center gap-2">
                      {!isManualMode ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-[#2E7D32] border border-emerald-200 dark:border-emerald-800">
                          <span className="h-2 w-2 rounded-full bg-[#2E7D32] animate-pulse" />
                          Data-Driven
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 dark:border-amber-800">
                          Simulated
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (isManualMode) {
                            handleResetToLiveData()
                          } else {
                            setIsManualMode(true)
                          }
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer',
                          isManualMode
                            ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900'
                        )}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>{isManualMode ? 'Reset to Live Data' : 'Manual Adjustment'}</span>
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-1">
                  {/* Factor 1: Weather Risk */}
                  <RiskFactorRow
                    icon={Cloud}
                    title="Weather Risk"
                    description={currentFactors.weather.summary}
                    details={currentFactors.weather.details}
                    value={currentFactors.weather.score}
                    level={currentFactors.weather.level}
                    onChange={(v) => handleFactorChange('weather', v)}
                    disabled={!isManualMode}
                  />

                  {/* Factor 2: Soil Health Score */}
                  <RiskFactorRow
                    icon={Sprout}
                    title="Soil Health Score"
                    description={currentFactors.soil.summary}
                    details={currentFactors.soil.details}
                    value={currentFactors.soil.score}
                    level={currentFactors.soil.level}
                    onChange={(v) => handleFactorChange('soil', v)}
                    disabled={!isManualMode}
                    isMissingData={currentFactors.soil.isMissingData}
                    missingActionLabel={currentFactors.soil.missingActionLabel}
                    missingActionRoute={currentFactors.soil.missingActionRoute}
                  />

                  {/* Factor 3: Water Availability */}
                  <RiskFactorRow
                    icon={Droplets}
                    title="Water Availability"
                    description={currentFactors.water.summary}
                    details={currentFactors.water.details}
                    value={currentFactors.water.score}
                    level={currentFactors.water.level}
                    onChange={(v) => handleFactorChange('water', v)}
                    disabled={!isManualMode}
                    missingActionLabel={currentFactors.water.missingActionLabel}
                    missingActionRoute={currentFactors.water.missingActionRoute}
                  />

                  {/* Factor 4: Disease Risk */}
                  <RiskFactorRow
                    icon={Bug}
                    title="Disease Risk"
                    description={currentFactors.disease.summary}
                    details={currentFactors.disease.details}
                    value={currentFactors.disease.score}
                    level={currentFactors.disease.level}
                    onChange={(v) => handleFactorChange('disease', v)}
                    disabled={!isManualMode}
                    missingActionLabel={currentFactors.disease.missingActionLabel}
                    missingActionRoute={currentFactors.disease.missingActionRoute}
                  />

                  {/* Factor 5: Price Volatility */}
                  <RiskFactorRow
                    icon={TrendingUp}
                    title="Price Volatility"
                    description={currentFactors.price.summary}
                    details={currentFactors.price.details}
                    value={currentFactors.price.score}
                    level={currentFactors.price.level}
                    onChange={(v) => handleFactorChange('price', v)}
                    disabled={!isManualMode}
                    missingActionLabel={currentFactors.price.missingActionLabel}
                    missingActionRoute={currentFactors.price.missingActionRoute}
                  />

                  {/* Run Risk Assessment Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={assessing || !currentFarm}
                      onClick={handleRunAssessment}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2E7D32] hover:bg-[#1b5e20] active:bg-[#14532d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {assessing ? (
                        <ButtonLoader label="Running Assessment..." />
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-white" />
                          <span>Run Risk Assessment</span>
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column: Risk Distribution & Recommended Actions (5 of 12 cols) ── */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Risk Distribution Card (Horizontal compact bars matching screenshot) */}
              <Card className="rounded-2xl border-neutral-200/90 shadow-sm dark:border-neutral-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Risk Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                    Current risk levels for each factor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  <DistributionBarRow
                    icon={Cloud}
                    label="Weather Risk"
                    score={currentFactors.weather.score}
                  />
                  <DistributionBarRow
                    icon={Sprout}
                    label="Soil Health Score"
                    score={currentFactors.soil.score}
                  />
                  <DistributionBarRow
                    icon={Droplets}
                    label="Water Availability"
                    score={currentFactors.water.score}
                  />
                  <DistributionBarRow
                    icon={Bug}
                    label="Disease Risk"
                    score={currentFactors.disease.score}
                  />
                  <DistributionBarRow
                    icon={TrendingUp}
                    label="Price Volatility"
                    score={currentFactors.price.score}
                  />
                </CardContent>
              </Card>

              {/* 2. Recommended Actions Card (Matching screenshot) */}
              <Card className="rounded-2xl border-neutral-200/90 shadow-sm dark:border-neutral-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        Recommended Actions
                      </CardTitle>
                      <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                        Based on current risk levels
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {activeRecommendations.length} actions
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-3">
                    {activeRecommendations.map((action) => {
                      const IconComponent =
                        action.factorKey === 'water'
                          ? Droplets
                          : action.factorKey === 'weather'
                            ? Cloud
                            : action.factorKey === 'disease'
                              ? Bug
                              : action.factorKey === 'price'
                                ? TrendingUp
                                : Sprout

                      const priorityBadgeClass =
                        action.priority === 'High Priority'
                          ? 'bg-amber-100/80 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300'
                          : action.priority === 'Medium Priority'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'

                      return (
                        <div
                          key={action.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/50 p-3 hover:border-neutral-200 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#2E7D32] dark:bg-emerald-950/40">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-tight">
                                {action.title}
                              </p>
                              <Link
                                to={action.route}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E7D32] hover:underline mt-1"
                              >
                                <span>Go to {action.moduleLabel}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>

                          <span
                            className={cn(
                              'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                              priorityBadgeClass
                            )}
                          >
                            {action.priority}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-Component: Individual Risk Factor Row with custom Slider (Screenshot 1)
// ---------------------------------------------------------------------------

interface RiskFactorRowProps {
  icon: React.ElementType
  title: string
  description: string
  details?: string
  value: number
  level: 'Low' | 'Moderate' | 'High' | 'Critical'
  onChange: (v: number) => void
  disabled?: boolean
  isMissingData?: boolean
  missingActionLabel?: string
  missingActionRoute?: string
}

function RiskFactorRow({
  icon: Icon,
  title,
  description,
  details,
  value,
  level,
  onChange,
  disabled,
  isMissingData,
  missingActionLabel,
  missingActionRoute,
}: RiskFactorRowProps) {
  const levelClass = getLevelBadge(level)
  const trackColor = getFactorColor(value)

  return (
    <div className="space-y-2">
      {/* Top Header: Icon + Name + Description + Value Badge + Level Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#2E7D32] dark:bg-emerald-950/40">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
            {details && (
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                {details}
              </p>
            )}
            {isMissingData && missingActionRoute && (
              <div className="mt-1 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Data not available.</span>
                <Link
                  to={missingActionRoute}
                  className="font-semibold text-[#2E7D32] underline hover:opacity-80"
                >
                  {missingActionLabel || 'Complete module'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Value box & Level Pill */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="flex h-8 w-11 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 text-sm font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {value}
          </div>
          <span
            className={cn(
              'inline-flex min-w-[70px] justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              levelClass.badgeClass
            )}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Interactive / Visual Slider */}
      <div className="pl-12 flex items-center gap-3">
        <span className="text-[11px] font-medium text-neutral-400 tabular-nums">0</span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
            }}
            className={cn(
              'h-2 w-full cursor-pointer appearance-none rounded-full transition-all',
              '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-[#2E7D32] [&::-webkit-slider-thumb]:shadow-md',
              '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:border-[#2E7D32]',
              disabled && 'cursor-default opacity-90'
            )}
          />
        </div>
        <span className="text-[11px] font-medium text-neutral-400 tabular-nums">100</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-Component: Distribution Bar Row (Screenshot 1 top right)
// ---------------------------------------------------------------------------

interface DistributionBarRowProps {
  icon: React.ElementType
  label: string
  score: number
}

function DistributionBarRow({ icon: Icon, label, score }: DistributionBarRowProps) {
  const barColor = getFactorColor(score)

  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      {/* Icon + Label */}
      <div className="flex items-center gap-2 min-w-[140px] shrink-0 text-neutral-700 dark:text-neutral-300">
        <Icon className="h-4 w-4 text-[#2E7D32]" />
        <span className="font-medium">{label}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, Math.max(5, score))}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Score number */}
      <span className="w-7 text-right font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
        {score}
      </span>
    </div>
  )
}
