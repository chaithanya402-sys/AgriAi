import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { yieldApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { useAgriculturalLocation } from '@/hooks/useAgriculturalLocation'
import { agriculturalDataService } from '@/services/agriculturalDataService'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
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
import { CROPS as CROPS_LIST } from '@/lib/crops'
import type { YieldPredictionResult } from '@/types'
import { FarmPlanModal } from '@/components/crop/FarmPlanModal'
import { getCropDetails } from '@/data/cropDetailsData'
import { YieldOptimizationPage } from './YieldOptimizationPage'
import {
  ArrowLeft,
  Calendar,
  Home,
  Grid,
  MapPin,
  Sprout,
  Leaf,
  Droplets,
  CloudSun,
  FlaskConical,
  ArrowRight,
  Info,
  Sparkles,
  Link as LinkIcon,
  BarChart3,
  Target,
  Wheat,
} from 'lucide-react'

const CROPS = [...CROPS_LIST]

// Preset factor influence list matching Screenshot 1
const DEFAULT_FEATURE_IMPORTANCE = [
  { label: 'District Average', importance: 0.32 },
  { label: 'Nitrogen (N)', importance: 0.27 },
  { label: 'Soil pH', importance: 0.18 },
  { label: 'Rainfall', importance: 0.14 },
  { label: 'Temperature & Humidity', importance: 0.06 },
  { label: 'Phosphorus (P)', importance: 0.03 },
  { label: 'Potassium (K)', importance: 0.02 },
]

export function YieldPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, loading: farmsLoading } = useFarm()
  const { data: result, loading, error, run } = useAsync<YieldPredictionResult>()

  // Subview toggle: 'prediction' vs 'optimize'
  const isOptimizeView = searchParams.get('view') === 'optimize'

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null
  const farmName = activeFarm?.name || 'Kharif Farm'
  const farmArea = activeFarm?.total_area ? String(activeFarm.total_area) : '3'
  const farmLocation = activeFarm?.district || activeFarm?.village || 'Nellore'

  // Crop context
  const selectedCrop = 'Ragi'
  const cropDetails = useMemo(() => getCropDetails(selectedCrop), [selectedCrop])
  const [isFarmPlanModalOpen, setIsFarmPlanModalOpen] = useState(false)

  // Prediction Form populated with realistic agronomic numbers from Screenshot 1
  const [form, setForm] = useState({
    farm_id: '',
    crop: 'Ragi / Finger Millet',
    area: '3',
    nitrogen: '179.1',
    phosphorus: '58.4',
    potassium: '236.1',
    temperature: '27.8',
    humidity: '64.9',
    ph: '7.25',
    rainfall: '1376.9',
  })

  const [districtCrops, setDistrictCrops] = useState<string[]>([])
  const [noDataError, setNoDataError] = useState<string | null>(null)

  // Use active farm location
  const loc = useAgriculturalLocation(activeFarm?.id)

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
      if (loc.state && loc.district && form.crop) {
        const cropName = form.crop.includes('/') ? form.crop.split('/')[0].trim() : form.crop
        const res = await agriculturalDataService.getYieldData(
          loc.state,
          loc.district,
          cropName,
          Number(form.area) || currentFarm?.total_area || 3
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
        area: Number(form.area) || currentFarm?.total_area || 3,
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

  // If in 'optimize' view, render the detail page directly
  if (isOptimizeView) {
    return (
      <YieldOptimizationPage
        onBack={() => {
          setSearchParams({})
        }}
      />
    )
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

  const predictedYieldValue = result?.predicted_yield ? formatNumber(result.predicted_yield) : '4.0'
  const predictedTotal = (Number(predictedYieldValue) * (Number(form.area) || 3)).toFixed(1)
  const confidenceValue = result?.confidence ? Math.round(result.confidence * 100) : 86
  const featureList = result?.feature_importance?.length
    ? result.feature_importance
    : DEFAULT_FEATURE_IMPORTANCE

  return (
    <div className="space-y-6 pb-16">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-[#123B22]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-[#17231A] md:text-3xl">
            Yield Prediction & Optimization
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-neutral-600 font-medium">
            AI-powered crop yield analysis with smart recommendations to improve your production.
          </p>
        </div>

        {/* Top-Right Badges matching Screenshot 1 */}
        <div className="flex items-center gap-2 self-start">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-bold text-neutral-800 shadow-2xs">
            <Home className="h-3.5 w-3.5 text-emerald-800" />
            <span>{farmName}</span>
          </div>

          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-emerald-700" />
            <span>
              Last analysis: <strong>Today</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CROP CONTEXT CARD                                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Crop thumbnail, title, badge, and 4 metadata pills */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-8 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 shadow-2xs">
                <img
                  src="/crops/ragi.jpg"
                  alt="Ragi / Finger Millet"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                  }}
                />
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#17231A] tracking-tight truncate">
                    Ragi / Finger Millet
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 shrink-0">
                    Selected Crop
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-neutral-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      Farm: <strong className="text-neutral-900 font-bold">{farmName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Grid className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      Area: <strong className="text-neutral-900 font-bold">{farmArea} ha</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      Location: <strong className="text-neutral-900 font-bold">{farmLocation}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-emerald-700" />
                    <span>
                      Crop Stage: <strong className="text-neutral-900 font-bold">Vegetative (Day 31–45)</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: From Crop Recommendation context card */}
        <Card className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-emerald-50/40 to-teal-50/20 p-4 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200/80">
              <Leaf className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-emerald-950">
                From Crop Recommendation
              </h3>
              <p className="text-xs text-emerald-900/90 leading-relaxed pt-0.5">
                This prediction is based on your crop recommendation, soil analysis and AI farm action plan.
              </p>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => setIsFarmPlanModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/95 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-900 hover:bg-white transition-colors shadow-2xs"
            >
              <span>View in Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
            </button>
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 3. MIDDLE ROW: 3 BALANCED CARDS (Form: 5, Yield: 3, Influence: 4) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Card 1: Prediction Parameters Form (5 Columns out of 12) */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#17231A]">
                  Yield Prediction Parameters
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  Enter soil, weather and crop conditions to estimate expected yield.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Row 1: Crop, Farm, Area */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">Crop</Label>
                  <Select
                    value={form.crop}
                    onValueChange={(v) => handleChange('crop', v)}
                  >
                    <SelectTrigger className="h-8.5 text-xs font-bold bg-neutral-50/60 border-neutral-200">
                      <SelectValue placeholder="Crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ragi / Finger Millet">Ragi / Finger Millet</SelectItem>
                      <SelectItem value="Rice">Rice / Paddy</SelectItem>
                      <SelectItem value="Maize">Maize</SelectItem>
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">Farm</Label>
                  <Select
                    value={selectedFarmId?.toString() || activeFarm?.id?.toString() || '1'}
                    onValueChange={(v) => {
                      setSelectedFarmId(Number(v))
                      handleChange('farm_id', v)
                    }}
                  >
                    <SelectTrigger className="h-8.5 text-xs font-bold bg-neutral-50/60 border-neutral-200">
                      <SelectValue placeholder="Farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">Area (ha)</Label>
                  <Input
                    className="h-8.5 text-xs font-bold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: N, P, K */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">N (mg/kg)</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.nitrogen}
                    onChange={(e) => handleChange('nitrogen', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">P (mg/kg)</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.phosphorus}
                    onChange={(e) => handleChange('phosphorus', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">K (mg/kg)</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.potassium}
                    onChange={(e) => handleChange('potassium', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 3: Temp, Humidity, pH */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">Temp (°C)</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">Humidity (%)</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.humidity}
                    onChange={(e) => handleChange('humidity', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">pH</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.01"
                    value={form.ph}
                    onChange={(e) => handleChange('ph', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Rainfall and Predict Yield Button */}
              <div className="grid grid-cols-3 gap-2 text-xs items-end pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-neutral-600">Rainfall (mm)</Label>
                  <Input
                    className="h-8.5 text-xs font-semibold bg-neutral-50/60 border-neutral-200"
                    type="number"
                    step="0.1"
                    value={form.rainfall}
                    onChange={(e) => handleChange('rainfall', e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-8.5 w-full rounded-xl bg-[#123B22] text-xs font-bold text-white hover:bg-[#0E2F1B] px-4 shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Sprout className="h-3.5 w-3.5" />
                    <span>{loading ? <ButtonLoader label="Predicting..." /> : 'Predict Yield'}</span>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card 2: Predicted Yield (3 Columns out of 12) */}
        <Card className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-3 flex flex-col justify-between">
          <CardHeader className="pb-2 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Sprout className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm font-bold text-[#17231A]">
                  Predicted Yield
                </CardTitle>
              </div>
              <Info className="h-4 w-4 text-neutral-400" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1 z-10">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-[#17231A] tracking-tight">
                  {predictedYieldValue}
                </span>
                <span className="text-sm font-bold text-neutral-500">tonnes/ha</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Expected production for {form.area || '3'} hectares
              </p>
              <p className="text-sm font-extrabold text-emerald-800 mt-0.5">
                ≈ {predictedTotal} tonnes total
              </p>
            </div>

            {/* Circular Confidence Badge */}
            <div className="flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-xs border border-neutral-200/80 p-3 shadow-2xs">
              <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#0F766E"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - confidenceValue / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-[#17231A]">
                  {confidenceValue}%
                </span>
              </div>

              <div>
                <span className="text-xs font-extrabold text-[#17231A]">Confidence</span>
                <p className="text-[10px] text-neutral-500 font-medium leading-tight">
                  High confidence prediction
                </p>
              </div>
            </div>
          </CardContent>

          {/* Panoramic crop landscape illustration at bottom */}
          <div className="relative h-20 w-full overflow-hidden mt-1 pointer-events-none">
            <img
              src="/agri-bg/bg-01.webp"
              alt=""
              className="h-full w-full object-cover object-bottom"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = '/hero-farmer.jpg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white" />
          </div>
        </Card>

        {/* Card 3: What Influenced Your Prediction? (4 Columns out of 12) */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-4 flex flex-col justify-between">
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-[#17231A]">
                  What Influenced Your Prediction?
                </CardTitle>
                <CardDescription className="text-[11px] text-neutral-500 leading-tight">
                  These factors had the greatest influence on the current yield prediction.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 pt-1 pb-4">
            <div className="space-y-2.5">
              {featureList.map((item, idx) => {
                const widthPercent = Math.min(100, Math.round(item.importance * 260))
                return (
                  <div key={idx} className="flex items-center justify-between gap-2.5 text-xs">
                    <span className="text-[11px] font-semibold text-neutral-700 truncate w-36 shrink-0">
                      {item.label}
                    </span>
                    <div className="relative h-2.5 flex-1 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-800 w-9 text-right shrink-0">
                      {item.importance.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 4. AI YIELD OPTIMIZATION SECTION (4 Cards in a row)            */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
        <CardHeader className="pb-3 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#17231A]">
                  AI Yield Optimization
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  Here are the key areas to improve your crop management and optimize production.
                </CardDescription>
              </div>
            </div>

            <span className="self-start sm:self-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
              ↗ Potential improvement: 15–25%
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Nutrient Management (HIGH PRIORITY) -> OPENS OPTIMIZE PAGE */}
            <div className="group rounded-2xl border border-emerald-200/90 bg-emerald-50/20 p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500 hover:shadow-xs transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-200">
                    High Priority
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#17231A]">Nutrient Management</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Nitrogen is the largest factor influencing your yield. Maintain recommended N levels.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSearchParams({ view: 'optimize' })}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:text-emerald-950 pt-1 cursor-pointer"
              >
                <span>View Fertilizer Plan</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-emerald-700" />
              </button>
            </div>

            {/* Card 2: Irrigation Optimization */}
            <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-4 flex flex-col justify-between space-y-3 hover:border-teal-400 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                    Medium Priority
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#17231A]">Irrigation Optimization</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Monitor rainfall and adjust irrigation based on crop stage to avoid water stress.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/dashboard/irrigation')}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 pt-1"
              >
                <span>View Irrigation Plan</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
              </button>
            </div>

            {/* Card 3: Soil pH Management */}
            <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-4 flex flex-col justify-between space-y-3 hover:border-emerald-400 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                    Low Priority
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#17231A]">Soil pH Management</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  pH is within the optimal range (6.0 – 7.5). Keep it stable with organic matter.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/dashboard/soil')}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 pt-1"
              >
                <span>View Soil Plan</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
              </button>
            </div>

            {/* Card 4: Weather Awareness */}
            <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-4 flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <CloudSun className="h-4 w-4" />
                  </div>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                    Medium Priority
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#17231A]">Weather Awareness</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  High humidity and rainfall can increase disease risk. Monitor weather updates regularly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/dashboard/weather')}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 pt-1"
              >
                <span>View Weather Insights</span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 5. BOTTOM SECTION: AI Fertilizer Insight & Quick Actions       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Left (8 Cols): AI Fertilizer Insight */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-8 flex flex-col justify-between">
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Leaf className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-[#17231A]">
                AI Fertilizer Insight
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-bold text-[#17231A]">
                  Potassium is currently the largest nutrient gap (192 kg/ha).
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                  Prioritize potassium application during the recommended growth stage for better yield and disease resistance.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Target className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-extrabold text-emerald-950">
                    Key Recommendation
                  </span>
                  <p className="text-xs text-emerald-900/90 font-medium">
                    Focus on potassium (K) application along with balanced NPK and organic manure.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsFarmPlanModalOpen(true)}
                className="shrink-0 rounded-xl bg-[#123B22] text-xs font-bold text-white hover:bg-[#0E2F1B] shadow-2xs"
              >
                <span>View Full Crop Action Plan</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right (4 Cols): Quick Actions */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-4 flex flex-col justify-between">
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <LinkIcon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-[#17231A]">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-[11px] text-neutral-500">
                  Access detailed plans for better yield optimization.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-1 pb-5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSearchParams({ view: 'optimize' })}
                className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-2.5 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs text-left"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FlaskConical className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">Fertilizer Plan</span>
                </div>
                <ArrowRight className="h-3 w-3 text-neutral-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/irrigation')}
                className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-2.5 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs text-left"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Droplets className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                  <span className="truncate">Irrigation Plan</span>
                </div>
                <ArrowRight className="h-3 w-3 text-neutral-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/crop')}
                className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-2.5 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs text-left"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Sprout className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">Crop Management</span>
                </div>
                <ArrowRight className="h-3 w-3 text-neutral-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/weather')}
                className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-2.5 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs text-left"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <CloudSun className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span className="truncate">Weather Insights</span>
                </div>
                <ArrowRight className="h-3 w-3 text-neutral-400 shrink-0" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Farm Plan Modal */}
      {isFarmPlanModalOpen && (
        <FarmPlanModal
          cropDetails={cropDetails}
          farmName={farmName}
          locationLabel={farmLocation}
          area={Number(farmArea) || 3}
          isOpen={isFarmPlanModalOpen}
          onClose={() => setIsFarmPlanModalOpen(false)}
        />
      )}
    </div>
  )
}
