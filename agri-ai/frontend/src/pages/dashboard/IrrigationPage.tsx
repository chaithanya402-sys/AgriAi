import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { FarmPlanModal } from '@/components/crop/FarmPlanModal'
import { getCropDetails } from '@/data/cropDetailsData'
import {
  Droplets,
  Sprout,
  ArrowLeftRight,
  Home,
  Grid,
  MapPin,
  Check,
  Calendar,
  CloudRain,
  Sun,
  Thermometer,
  Cloud,
  Brain,
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

// Crop specific irrigation defaults
interface CropIrrigationProfile {
  targetMoisture: number
  moistureThreshold: number
  typicalStage: string
}

const CROP_PROFILES: Record<string, CropIrrigationProfile> = {
  Ragi: { targetMoisture: 42, moistureThreshold: 35, typicalStage: 'Vegetative · Day 31–45' },
  'Finger Millet': { targetMoisture: 42, moistureThreshold: 35, typicalStage: 'Vegetative · Day 31–45' },
  Soybean: { targetMoisture: 45, moistureThreshold: 38, typicalStage: 'Vegetative · Day 25–40' },
  Rice: { targetMoisture: 68, moistureThreshold: 55, typicalStage: 'Tillering · Day 20–40' },
  Wheat: { targetMoisture: 48, moistureThreshold: 40, typicalStage: 'Vegetative · Day 25–45' },
  Sugarcane: { targetMoisture: 58, moistureThreshold: 48, typicalStage: 'Tillering · Day 45–90' },
  Maize: { targetMoisture: 52, moistureThreshold: 42, typicalStage: 'Vegetative · Day 30–50' },
  Cotton: { targetMoisture: 44, moistureThreshold: 36, typicalStage: 'Squaring · Day 35–55' },
}

export function IrrigationPage() {
  const navigate = useNavigate()
  const { currentFarm, activeCrop } = useFarm()

  // 1. Resolve Active Crop details with screenshot-accurate fallbacks
  const rawCropName = activeCrop?.rawCropName || 'Ragi'
  const cropDetails = useMemo(() => getCropDetails(rawCropName), [rawCropName])
  const cropDisplayName = activeCrop?.cropName || cropDetails.displayName || 'Ragi / Finger Millet'
  const cropImage = activeCrop?.image || cropDetails.image || '/crops/ragi.jpg'

  const farmName = activeCrop?.farmName || currentFarm?.name || 'chaitu'
  const farmArea = activeCrop?.area ? `${activeCrop.area} ha` : (currentFarm?.total_area ? `${currentFarm.total_area} ha` : '6 ha')
  const farmLocation = activeCrop?.location || currentFarm?.district || currentFarm?.village || 'Vizianagaram'

  const profile = CROP_PROFILES[rawCropName] || {
    targetMoisture: 42,
    moistureThreshold: 35,
    typicalStage: 'Vegetative · Day 31–45',
  }

  const cropStage = activeCrop?.cropStage || profile.typicalStage

  // 2. Telemetry and field conditions
  const [soilMoisture, setSoilMoisture] = useState<number>(45)
  const targetMoisture = profile.targetMoisture
  const temperature = activeCrop?.temperature ? `${activeCrop.temperature}°C` : '27.8°C'
  const rainfallForecastMm = activeCrop?.rainfall ? activeCrop.rainfall : 46
  const rainfallForecast = `${rainfallForecastMm} mm`
  const rainExpected = rainfallForecastMm >= 10

  // 3. Status and dynamic water calculation
  const isMoistureOptimal = soilMoisture >= targetMoisture
  const moistureDeficit = Math.max(0, targetMoisture - soilMoisture)

  // Irrigation calculation: if moisture is above or near target and rain is expected, 0 mm
  const waterAmountMm = useMemo(() => {
    if (isMoistureOptimal || (soilMoisture >= profile.moistureThreshold && rainExpected)) {
      return 0
    }
    const rawDeficitMm = Math.round(moistureDeficit * 1.5 - (rainfallForecastMm * 0.3))
    return Math.max(0, rawDeficitMm)
  }, [isMoistureOptimal, soilMoisture, profile.moistureThreshold, rainExpected, moistureDeficit, rainfallForecastMm])

  // 4. Modals and completion state
  const [isFarmPlanModalOpen, setIsFarmPlanModalOpen] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  return (
    <div className="space-y-6 pb-20">
      {/* ============================================================== */}
      {/* 1. TOP HEADER                                                  */}
      {/* ============================================================== */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#123B22] shadow-2xs border border-[#C8E6C9]/60">
          <Droplets className="h-5 w-5 fill-[#123B22]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17231A]">
            Irrigation Optimization
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Personalized water recommendations based on your active crop, soil moisture, crop stage and weather.
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ACTIVE CROP CARD                                            */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
            <Sprout className="h-4 w-4 text-emerald-700" />
            <span>Active Crop</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/crops')}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#123B22] hover:text-[#0E2F1B] transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            <span>Change crop</span>
          </button>
        </div>

        <div className="pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Thumbnail & Name & Pill */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-emerald-100 shadow-2xs">
              <img
                src={cropImage}
                alt={cropDisplayName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-[#17231A]">{cropDisplayName}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 text-[11px] font-bold text-[#123B22]">
                  Active Crop <Check className="h-3 w-3 stroke-[3]" />
                </span>
              </div>
            </div>
          </div>

          {/* Right: 4 Metadata items in single row with vertical dividers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-0 lg:flex lg:items-center text-xs text-neutral-600 font-medium lg:divide-x lg:divide-neutral-200">
            <div className="flex items-center gap-2 lg:px-6 lg:first:pl-0">
              <Home className="h-4 w-4 text-[#123B22] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block leading-tight">Farm</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmName}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:px-6">
              <Grid className="h-4 w-4 text-[#123B22] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block leading-tight">Area</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmArea}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:px-6">
              <MapPin className="h-4 w-4 text-[#123B22] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block leading-tight">Location</span>
                <strong className="text-neutral-900 font-bold text-xs">{farmLocation}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:px-6">
              <Sprout className="h-4 w-4 text-[#123B22] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block leading-tight">Stage</span>
                <strong className="text-neutral-900 font-bold text-xs">{cropStage}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. ROW 2: FIELD CONDITIONS & WEATHER OUTLOOK (2 COLS)           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: FIELD CONDITIONS */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase mb-4">
            <Sprout className="h-4 w-4 text-emerald-700" />
            <span>Field Conditions</span>
          </div>

          <div className="grid grid-cols-3 gap-3 divide-x divide-neutral-100 items-center">
            {/* Soil Moisture */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Droplets className="h-5 w-5 fill-sky-600" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 font-medium block">Soil moisture</span>
                <span className="text-xl sm:text-2xl font-black text-[#17231A]">{soilMoisture}%</span>
              </div>
            </div>

            {/* Target */}
            <div className="flex items-center gap-3 pl-3 sm:pl-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 font-medium block">Target</span>
                <span className="text-xl sm:text-2xl font-black text-[#17231A]">{targetMoisture}%</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col items-start justify-center pl-3 sm:pl-5">
              <span className="text-[11px] text-neutral-500 font-medium block mb-1">Status</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] px-2.5 py-0.5 text-xs font-bold text-[#123B22]">
                Optimal <Check className="h-3 w-3 stroke-[3]" />
              </span>
            </div>
          </div>
        </div>

        {/* Right: WEATHER & WATER OUTLOOK */}
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase mb-4">
            <Sun className="h-4 w-4 text-emerald-700" />
            <span>Weather & Water Outlook</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6 divide-x divide-neutral-100">
              {/* Temperature */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Thermometer className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 font-medium block">Temperature</span>
                  <span className="text-lg sm:text-xl font-bold text-[#17231A]">{temperature}</span>
                </div>
              </div>

              {/* Rainfall Forecast */}
              <div className="flex items-center gap-2.5 pl-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <CloudRain className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 font-medium block">Rainfall forecast</span>
                  <span className="text-lg sm:text-xl font-bold text-[#17231A]">{rainfallForecast}</span>
                </div>
              </div>
            </div>

            {/* Rain Expected Callout Box */}
            <div className="rounded-xl border border-[#D0EBD5] bg-[#F4FBF5] px-3 py-2 flex items-center gap-2.5 shrink-0">
              <Cloud className="h-5 w-5 text-emerald-800 shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#123B22] block leading-tight">Rain expected →</span>
                <span className="text-[11px] text-[#2E5B3D] block font-medium">irrigation requirement reduced.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TODAY'S IRRIGATION RECOMMENDATION CARD                       */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-[#BDE6C7] bg-[#F0FAF2] p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
            <Droplets className="h-4 w-4 fill-[#123B22]" />
            <span>Today's Irrigation Recommendation</span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-[#B8DFC2] px-3 py-0.5 text-xs font-bold text-[#123B22] shadow-2xs">
            <Check className="h-3.5 w-3.5 stroke-[3]" /> Optimal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Big Hero 0 mm */}
          <div className="md:col-span-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-[#123B22] tracking-tight">
                {waterAmountMm} mm
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-neutral-700 mt-1">
              {waterAmountMm === 0 ? 'No irrigation needed' : 'Apply water in early morning'}
            </p>
          </div>

          {/* Middle: Checkmark criteria list */}
          <div className="md:col-span-5 space-y-1.5 border-t md:border-t-0 md:border-l border-[#CDEBD3] pt-3 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123B22]">
              <Check className="h-4 w-4 text-emerald-700 stroke-[3]" />
              <span>Soil moisture is sufficient</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123B22]">
              <Check className="h-4 w-4 text-emerald-700 stroke-[3]" />
              <span>Rainfall forecast considered</span>
            </div>
          </div>

          {/* Right: Next Check pill */}
          <div className="md:col-span-3 flex md:justify-end">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 border border-[#CDEBD3] px-3.5 py-2 text-xs font-bold text-[#123B22] shadow-2xs">
              <Calendar className="h-4 w-4 text-emerald-800" />
              <span>Next check: 2 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. AI IRRIGATION INSIGHT CARD                                   */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase mb-3">
          <Sprout className="h-4 w-4 text-emerald-700" />
          <span>AI Irrigation Insight</span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#123B22] border border-[#C8E6C9]/80">
            <Brain className="h-5 w-5" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium pt-1">
            Soil moisture is above the target level for {rawCropName} during the vegetative stage. No irrigation is
            recommended today. {rainfallForecast} rainfall is expected, so additional irrigation may be unnecessary.
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. APPLICATION SCHEDULE (HORIZONTAL STEPPER)                   */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider text-[#123B22] uppercase">
            <Calendar className="h-4 w-4 text-emerald-700" />
            <span>Application Schedule</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCompleted(!isCompleted)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
              isCompleted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-800" />
            <span>{isCompleted ? 'Completed ✓' : 'Mark as completed'}</span>
          </button>
        </div>

        {/* 4 Connected Timeline Steps */}
        <div className="relative">
          {/* Background horizontal connecting line */}
          <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-neutral-200 -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {/* Step 1: Today */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#123B22] text-white shadow-2xs">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <span className="font-extrabold text-[#17231A] text-sm">Today</span>
              </div>
              <div className="pl-10 space-y-0.5">
                <p className="text-xs font-bold text-neutral-800">No irrigation</p>
                <p className="text-[11px] text-neutral-500 font-medium">Soil moisture sufficient</p>
              </div>
            </div>

            {/* Step 2: Day 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-xs font-bold text-neutral-600 shadow-2xs">
                  2
                </div>
                <span className="font-extrabold text-[#17231A] text-sm">Day 2</span>
              </div>
              <div className="pl-10 space-y-0.5">
                <p className="text-xs font-bold text-neutral-800">Monitor</p>
                <p className="text-[11px] text-neutral-500 font-medium">Recheck soil moisture</p>
              </div>
            </div>

            {/* Step 3: Day 4 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-xs font-bold text-neutral-600 shadow-2xs">
                  4
                </div>
                <span className="font-extrabold text-[#17231A] text-sm">Day 4</span>
              </div>
              <div className="pl-10 space-y-0.5">
                <p className="text-xs font-bold text-neutral-800">Review</p>
                <p className="text-[11px] text-neutral-500 font-medium">Check weather forecast</p>
              </div>
            </div>

            {/* Step 4: Day 6 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-xs font-bold text-neutral-600 shadow-2xs">
                  6
                </div>
                <span className="font-extrabold text-[#17231A] text-sm">Day 6</span>
              </div>
              <div className="pl-10 space-y-0.5">
                <p className="text-xs font-bold text-neutral-800">Potential irrigation</p>
                <p className="text-[11px] text-neutral-500 font-medium">Depends on rainfall and soil moisture</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. PART OF YOUR [CROP] FARM ACTION PLAN BANNER                 */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-[#D5EBD9] bg-gradient-to-r from-[#F0FAF2] via-[#F4FCF6] to-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#123B22] border border-[#C8E6C9]/80 shadow-2xs">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-[#123B22]">
              Part of your {rawCropName} Farm Action Plan
            </h4>
            <p className="text-xs text-neutral-600 font-medium">
              Irrigation is one step in your complete crop management plan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFarmPlanModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123B22] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#0E2F1B] transition-colors shadow-2xs shrink-0"
        >
          <span>View Full Crop Action Plan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* 8. FULL FARM PLAN MODAL                                        */}
      {/* ============================================================== */}
      {isFarmPlanModalOpen && (
        <FarmPlanModal
          cropDetails={cropDetails}
          farmName={farmName}
          locationLabel={farmLocation}
          area={activeCrop?.area || Number(currentFarm?.total_area) || 6}
          isOpen={isFarmPlanModalOpen}
          onClose={() => setIsFarmPlanModalOpen(false)}
        />
      )}
    </div>
  )
}
