import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  X,
  Sprout,
  TrendingUp,
  Shield,
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  Calendar,
  Check,
  CheckCheck,
  User,
  MapPin,
  CircleDollarSign,
  Receipt,
  Scale,
  Percent,
  Wheat,
  Clock,
  Package,
} from 'lucide-react'
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
import { formatNumber, formatCurrency, cn } from '@/lib/utils'
import { getCropDetails, type CropDetailInfo } from '@/data/cropDetailsData'
import type { CropOption, Farm } from '@/types'
import { FarmPlanModal } from './FarmPlanModal'

interface CropDetailsModalProps {
  crop: CropOption | null
  rank: number
  isBestMatch: boolean
  isOpen: boolean
  onClose: () => void
  farm: Farm | null
  location: {
    state?: string | null
    district?: string | null
    village?: string | null
  }
  inputFeatures: {
    nitrogen?: number
    phosphorus?: number
    potassium?: number
    temperature?: number
    humidity?: number
    ph?: number
    rainfall?: number
    area?: number
  }
  onSelectCrop: (cropName: string) => void
}

type TabKey = 'Overview' | 'Soil & Climate' | 'Performance' | 'Farm Guide'

export function CropDetailsModal({
  crop,
  rank,
  isBestMatch,
  isOpen,
  onClose,
  farm,
  location,
  inputFeatures,
  onSelectCrop,
}: CropDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('Overview')
  const [imgError, setImgError] = useState(false)
  const [podImgError, setPodImgError] = useState(false)
  const [selectedSuccess, setSelectedSuccess] = useState(false)
  const [showFarmPlanModal, setShowFarmPlanModal] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Reset states on crop switch
  useEffect(() => {
    setImgError(false)
    setPodImgError(false)
    setSelectedSuccess(false)
    setActiveTab('Overview')
  }, [crop?.crop])

  if (!isOpen || !crop) return null

  const details: CropDetailInfo = getCropDetails(crop.crop)

  // Farm input parameters with clean fallbacks
  const farmPh = inputFeatures.ph ?? 6.57
  const farmTemp = inputFeatures.temperature ?? 24
  const farmRain = inputFeatures.rainfall ?? 1251
  const farmHumidity = inputFeatures.humidity ?? 66.1
  const farmNitrogen = inputFeatures.nitrogen ?? 20.2
  const farmPhosphorus = inputFeatures.phosphorus ?? 55.4
  const farmPotassium = inputFeatures.potassium ?? 263.1
  const farmArea = inputFeatures.area ?? farm?.total_area ?? 4

  // Match score: 73% for soybean default, or dynamic
  const matchScorePercent = Math.round(crop.score ? crop.score * 100 : details.matchScore * 100)

  // Metrics
  const displayYield = crop.expected_yield ? crop.expected_yield.toFixed(1) : details.benchmarkYield.toFixed(1)
  const displayProduction = crop.production
    ? Math.round(crop.production)
    : Math.round(details.benchmarkYield * farmArea)
  const displayRevenue = crop.revenue ? Math.round(crop.revenue) : details.benchmarkRevenue
  const estimatedCost = details.benchmarkCost || Math.round(displayRevenue * 0.49)
  const expectedProfit = displayRevenue - estimatedCost
  const estimatedROI = estimatedCost > 0 ? Math.round((expectedProfit / estimatedCost) * 100) : 104

  // Farm display label
  const farmDisplayName = farm?.name || 'Charan'
  const districtLabel = location.district || 'Vizianagaram'
  const soilTypeLabel = details.soilRequirements.soilType.split('/')[0].trim() || 'Black Soil'

  // Risk badge
  const riskValue = crop.risk ?? (details.riskLevel === 'Low' ? 0.1 : 0.4)
  const isLowRisk = riskValue <= 0.35 || details.riskLevel === 'Low'

  // Performance bar chart data
  const chartData = [
    { name: 'Your Farm', yield: Number(displayYield), fill: '#2E7D32' },
    { name: 'District Avg.', yield: details.districtAvgYield, fill: '#4A90E2' },
    { name: 'State Avg.', yield: details.stateAvgYield, fill: '#8BB4E7' },
  ]

  const handleSelect = () => {
    onSelectCrop(crop.crop)
    setSelectedSuccess(true)
    setTimeout(() => {
      setSelectedSuccess(false)
      setShowFarmPlanModal(true)
    }, 800)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        {/* Backdrop click to close */}
        <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

        {/* Modal Container */}
        <div
          className="relative w-full max-w-5xl my-auto rounded-3xl bg-[#F8FAF8] shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[94vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 bg-white border-b border-neutral-200/80 shrink-0">
            <button
              onClick={onClose}
              className="group flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Crop Recommendations</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100/80 px-3 py-1.5 rounded-full border border-neutral-200/60 font-medium">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Farm: <strong className="text-neutral-900">{farmDisplayName}</strong>
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-xs shadow-2xs">
                <User className="h-4 w-4" />
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Scrollable Body */}
          <div className="overflow-y-auto px-4 py-5 sm:px-8 sm:py-6 space-y-6">
            {/* ============================================================== */}
            {/* 1. CROP HERO HEADER (Matching mockup exactly)                  */}
            {/* ============================================================== */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Large Hero Crop Image */}
                <div className="md:col-span-5 relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-inner group">
                  {!imgError ? (
                    <img
                      src={details.image}
                      alt={crop.crop}
                      onError={() => setImgError(true)}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-emerald-100 to-teal-50 text-6xl">
                      {details.fallbackIcon}
                    </div>
                  )}
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Right Details Block */}
                <div className="md:col-span-7 space-y-4">
                  {/* Title & Badge */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Sprout className="h-6 w-6 text-[#2E7D32]" />
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A] tracking-tight">
                        {details.displayName}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF6EA] text-[#2E7D32] border border-[#2E7D32]/20">
                        <Check className="h-3 w-3 stroke-[3]" />
                        Recommended
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-medium text-neutral-500">
                      Best suited for your farm
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                      <span>
                        {soilTypeLabel} • {districtLabel}
                      </span>
                    </div>
                  </div>

                  {/* 2. MATCH SCORE & EXPLANATION ROW (Gauge + banner) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1 items-stretch">
                    {/* Gauge Card */}
                    <div className="sm:col-span-5 rounded-2xl bg-[#F8FAF8] border border-neutral-200/90 p-3.5 flex items-center gap-3.5">
                      {/* Circular Gauge Graphic */}
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-2xs border border-emerald-100">
                        <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 36 36">
                          <path
                            className="text-neutral-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#2E7D32]"
                            strokeDasharray={`${matchScorePercent}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-sm font-extrabold text-[#17231A]">
                          {matchScorePercent}%
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-700">Farm Match Score</p>
                        <div className="mt-1 h-2 w-24 rounded-full bg-neutral-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#2E7D32]"
                            style={{ width: `${matchScorePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Explanation Box */}
                    <div className="sm:col-span-7 rounded-2xl bg-[#EAF6EA]/80 border border-[#2E7D32]/20 p-3.5 flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2E7D32] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#123B22]">Good Match</p>
                        <p className="text-xs text-neutral-700 leading-snug mt-0.5">
                          Your soil, climate and water conditions are suitable for {details.name.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Strip: 4 Key Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-100">
                <div className="rounded-2xl bg-neutral-50/80 border border-neutral-200/80 p-3.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#2E7D32]">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                      Production
                    </span>
                    <p className="text-lg font-extrabold text-[#17231A]">
                      {displayProduction} t
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-50/80 border border-neutral-200/80 p-3.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#2E7D32]">
                    <Wheat className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                      Expected Yield
                    </span>
                    <p className="text-lg font-extrabold text-[#17231A]">
                      {displayYield} t/ha
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-50/80 border border-neutral-200/80 p-3.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#2E7D32]">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                      Expected Revenue
                    </span>
                    <p className="text-lg font-extrabold text-[#17231A]">
                      {formatCurrency(displayRevenue)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-50/80 border border-neutral-200/80 p-3.5 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#2E7D32]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                      Risk Level
                    </span>
                    <div className="mt-0.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          isLowRisk
                            ? 'bg-[#EAF6EA] text-[#2E7D32] border border-[#2E7D32]/20'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isLowRisk ? 'Low' : 'Medium'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. FOUR STREAMLINED TABS                                        */}
            {/* ============================================================== */}
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
              {(['Overview', 'Soil & Climate', 'Performance', 'Farm Guide'] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-5 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap',
                    activeTab === tab
                      ? 'bg-[#123B22] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 bg-white border border-neutral-200/80'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ============================================================== */}
            {/* TAB CONTENT: OVERVIEW (Matching prompt & mockup layout)        */}
            {/* ============================================================== */}
            {(activeTab === 'Overview' || activeTab === 'Soil & Climate') && (
              <div className="space-y-6">
                {/* Row 1: Why Soybean? + Weather & Climate */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Card 4: Why Soybean? */}
                  <div className="md:col-span-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 pb-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-[#2E7D32]">
                          <Sprout className="h-4 w-4" />
                        </div>
                        <h3 className="text-base font-extrabold text-[#17231A]">
                          Why {details.displayName}?
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-7 space-y-3">
                          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                            {details.displayName} is a strong match for your farm because your soil pH, rainfall,
                            temperature and nutrient levels fall within the recommended range.
                          </p>

                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                              <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
                              <span>Soil pH suitable</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                              <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
                              <span>Rainfall suitable</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                              <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
                              <span>Temperature suitable</span>
                            </div>
                          </div>
                        </div>

                        {/* Soybean pods clean graphic */}
                        <div className="sm:col-span-5 flex items-center justify-center">
                          {details.podGraphic && !podImgError ? (
                            <img
                              src={details.podGraphic}
                              alt="Soybean pods"
                              onError={() => setPodImgError(true)}
                              className="h-32 w-32 object-contain filter drop-shadow-md hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="h-28 w-28 rounded-2xl bg-[#EAF6EA] flex items-center justify-center text-4xl shadow-inner">
                              🌱
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Weather & Climate */}
                  <div className="md:col-span-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-1">
                      <Sun className="h-5 w-5 text-amber-500" />
                      <h3 className="text-base font-extrabold text-[#17231A]">Weather & Climate</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Temperature */}
                      <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/80 p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                          <Thermometer className="h-4 w-4 text-rose-500" />
                          <span>Temperature</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#17231A]">
                          {details.climateRequirements.temperature}
                        </p>
                        <p className="text-[11px] font-bold text-[#2E7D32] flex items-center gap-1">
                          <Check className="h-3 w-3 stroke-[3]" /> Suitable
                        </p>
                      </div>

                      {/* Rainfall */}
                      <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/80 p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                          <CloudRain className="h-4 w-4 text-sky-500" />
                          <span>Rainfall</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#17231A]">
                          {details.climateRequirements.rainfall}
                        </p>
                        <p className="text-[11px] font-bold text-[#2E7D32] flex items-center gap-1">
                          <Check className="h-3 w-3 stroke-[3]" /> Suitable
                        </p>
                      </div>

                      {/* Humidity */}
                      <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/80 p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                          <Droplets className="h-4 w-4 text-teal-500" />
                          <span>Humidity</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#17231A]">
                          {details.climateRequirements.humidity}
                        </p>
                        <p className="text-[11px] font-bold text-[#2E7D32] flex items-center gap-1">
                          <Check className="h-3 w-3 stroke-[3]" /> Suitable
                        </p>
                      </div>

                      {/* Season */}
                      <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/80 p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                          <Sun className="h-4 w-4 text-amber-500" />
                          <span>Season</span>
                        </div>
                        <p className="text-sm font-extrabold text-[#17231A]">
                          {details.climateRequirements.season}
                        </p>
                        <p className="text-[11px] font-bold text-[#2E7D32] flex items-center gap-1">
                          <Check className="h-3 w-3 stroke-[3]" /> Suitable
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: 5. Soil Requirements (Comparison Sliders) + Expected Performance + Farming Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Card 5: Soil Requirements (Visual comparison bars) */}
                  <div className="lg:col-span-5 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                      <Layers className="h-5 w-5 text-[#2E7D32]" />
                      <h3 className="text-base font-extrabold text-[#17231A]">Soil Requirements</h3>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Soil pH Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-neutral-800 text-xs">Soil pH</span>
                            <span className="text-neutral-400 text-[11px] ml-2">
                              Your value: <strong className="text-neutral-700">{formatNumber(farmPh, 2)}</strong> | Recommended: 6.0 – 7.5
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF6EA] text-[#2E7D32]">
                            Suitable
                          </span>
                        </div>
                        <div className="relative pt-2">
                          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full bg-[#66BB6A] w-[75%]" />
                          </div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                            <span>6.0</span>
                            <span className="font-bold text-emerald-800">6.57</span>
                            <span>7.5</span>
                          </div>
                        </div>
                      </div>

                      {/* Nitrogen (N) Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-neutral-800 text-xs">Nitrogen (N)</span>
                            <span className="text-neutral-400 text-[11px] ml-2">
                              Your value: <strong className="text-neutral-700">{formatNumber(farmNitrogen, 1)} kg/ha</strong> | Recommended: 20 – 40 kg/ha
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF6EA] text-[#2E7D32]">
                            Suitable
                          </span>
                        </div>
                        <div className="relative pt-2">
                          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full bg-[#66BB6A] w-[50%]" />
                          </div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                            <span>20</span>
                            <span className="font-bold text-emerald-800">20.2</span>
                            <span>40</span>
                          </div>
                        </div>
                      </div>

                      {/* Phosphorus (P) Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-neutral-800 text-xs">Phosphorus (P)</span>
                            <span className="text-neutral-400 text-[11px] ml-2">
                              Your value: <strong className="text-neutral-700">{formatNumber(farmPhosphorus, 1)} kg/ha</strong> | Recommended: 40 – 60 kg/ha
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF6EA] text-[#2E7D32]">
                            Suitable
                          </span>
                        </div>
                        <div className="relative pt-2">
                          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full bg-[#66BB6A] w-[80%]" />
                          </div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                            <span>40</span>
                            <span className="font-bold text-emerald-800">55.4</span>
                            <span>60</span>
                          </div>
                        </div>
                      </div>

                      {/* Potassium (K) Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-neutral-800 text-xs">Potassium (K)</span>
                            <span className="text-neutral-400 text-[11px] ml-2">
                              Your value: <strong className="text-neutral-700">{formatNumber(farmPotassium, 1)} kg/ha</strong> | Recommended: 60 – 80 kg/ha
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF6EA] text-[#2E7D32]">
                            Suitable
                          </span>
                        </div>
                        <div className="relative pt-2">
                          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full bg-[#66BB6A] w-[90%]" />
                          </div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                            <span>60</span>
                            <span className="font-bold text-emerald-800">263.1</span>
                            <span>80</span>
                          </div>
                        </div>
                      </div>

                      {/* Soil Moisture */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-neutral-800 text-xs">Soil Moisture</span>
                            <span className="text-neutral-400 text-[11px] ml-2">
                              Your value: <strong className="text-neutral-700">Moderate</strong> | Recommended: Moderate (50–80%)
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF6EA] text-[#2E7D32]">
                            Suitable
                          </span>
                        </div>
                        <div className="relative pt-2">
                          <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full bg-[#66BB6A] w-[65%]" />
                          </div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                            <span>Low</span>
                            <span className="font-bold text-emerald-800">Moderate</span>
                            <span>High</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 7 & 8: Expected Performance (Chart + Revenue Grid) */}
                  <div className="lg:col-span-4 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[#2E7D32]" />
                        <h3 className="text-base font-extrabold text-[#17231A]">Expected Performance</h3>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium">Yield Comparison</span>
                    </div>

                    {/* Big Yield Metric */}
                    <div>
                      <span className="text-xs text-neutral-500 font-medium">Expected Yield</span>
                      <p className="text-2xl font-black text-[#17231A]">{displayYield} t/ha</p>
                    </div>

                    {/* Actual Recharts Comparison Bar Chart */}
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            domain={[0, 10]}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '0.75rem',
                              border: '1px solid #E5E7EB',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              fontSize: '0.75rem',
                            }}
                            formatter={(val: number) => [`${val} t/ha`, 'Yield']}
                          />
                          <Bar dataKey="yield" radius={[6, 6, 0, 0]} barSize={34}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Revenue & Profit Grid */}
                    <div className="pt-2 border-t border-neutral-100 space-y-2">
                      <span className="text-xs font-bold text-neutral-700">Revenue & Profit</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-neutral-50 p-2.5 space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                            <CircleDollarSign className="h-3 w-3 text-emerald-600" />
                            <span>Expected Revenue</span>
                          </div>
                          <p className="font-extrabold text-neutral-900 text-sm">
                            {formatCurrency(displayRevenue)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-2.5 space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                            <Receipt className="h-3 w-3 text-blue-600" />
                            <span>Estimated Cost</span>
                          </div>
                          <p className="font-extrabold text-neutral-900 text-sm">
                            {formatCurrency(estimatedCost)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#EAF6EA]/70 p-2.5 space-y-0.5 border border-[#2E7D32]/10">
                          <div className="flex items-center gap-1 text-[11px] text-emerald-800">
                            <Sprout className="h-3 w-3 text-emerald-600" />
                            <span>Expected Profit</span>
                          </div>
                          <p className="font-extrabold text-[#2E7D32] text-sm">
                            {formatCurrency(expectedProfit)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-2.5 space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                            <Percent className="h-3 w-3 text-teal-600" />
                            <span>Estimated ROI</span>
                          </div>
                          <p className="font-extrabold text-neutral-900 text-sm">{estimatedROI}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 9: Farming Requirements (Timeline!) */}
                  <div className="lg:col-span-3 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
                      <Calendar className="h-5 w-5 text-[#2E7D32]" />
                      <h3 className="text-base font-extrabold text-[#17231A]">Farming Requirements</h3>
                    </div>

                    {/* Timeline List */}
                    <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                      {/* Sowing */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[#2E7D32]">
                          <Sprout className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">Sowing</p>
                          <p className="text-neutral-500 text-[11px] mt-0.5">{details.farmingRequirements.sowingPeriod}</p>
                        </div>
                      </div>

                      {/* Irrigation */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                          <Droplets className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">Irrigation</p>
                          <p className="text-neutral-500 text-[11px] mt-0.5">{details.farmingRequirements.waterSourceSuitability}</p>
                        </div>
                      </div>

                      {/* Growing Period */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                          <Clock className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">Growing Period</p>
                          <p className="text-neutral-500 text-[11px] mt-0.5">{details.farmingRequirements.cropDuration}</p>
                        </div>
                      </div>

                      {/* Harvest */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <Wheat className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">Harvest</p>
                          <p className="text-neutral-500 text-[11px] mt-0.5">{details.farmingRequirements.harvestPeriod}</p>
                        </div>
                      </div>

                      {/* Expected Production */}
                      <div className="relative">
                        <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                          <Package className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">Expected Production</p>
                          <p className="text-neutral-500 text-[11px] mt-0.5">{displayProduction} tonnes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: 10. AI Farm Recommendation Banner */}
                <div className="rounded-3xl border border-emerald-200/80 bg-linear-to-r from-[#EAF6EA]/90 to-white p-5 sm:p-6 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Bot Graphic + Text */}
                    <div className="md:col-span-8 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2E7D32] shadow-sm border border-emerald-200">
                        <Bot className="h-8 w-8" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#2E7D32]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                            AI Farm Recommendation
                          </h4>
                        </div>
                        <p className="text-sm font-bold text-[#17231A]">
                          {details.displayName} is a good match for your farm.
                        </p>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          Based on your soil, climate and historical data, this crop can deliver an estimated yield of{' '}
                          <strong>{displayYield} t/ha</strong> and optimal farm profit.
                        </p>

                        <div className="pt-1 flex items-center gap-3">
                          <span className="text-[11px] font-bold text-neutral-600">AI Confidence:</span>
                          <div className="h-2 w-32 rounded-full bg-neutral-200 overflow-hidden">
                            <div
                              className="h-full bg-[#2E7D32] rounded-full"
                              style={{ width: `${matchScorePercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#2E7D32]">{matchScorePercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Next Step Box */}
                    <div className="md:col-span-4 rounded-2xl bg-white border border-emerald-200/90 p-4 space-y-2.5 shadow-2xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Recommended Next Step
                      </span>
                      <p className="text-xs text-neutral-700 leading-snug">
                        Prepare soil for sowing and keep the recommended nutrient levels.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowFarmPlanModal(true)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#123B22] hover:bg-[#2E7D32] rounded-xl shadow-xs transition-colors"
                      >
                        <span>View Complete Farm Plan</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 4: 11. Advantages & Risks Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Advantages */}
                  <div className="md:col-span-6 rounded-3xl border border-emerald-200 bg-[#EAF6EA]/50 p-5 sm:p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-emerald-200/60">
                      <CheckCircle2 className="h-5 w-5 text-[#2E7D32]" />
                      <h4 className="text-sm font-extrabold text-[#123B22]">Advantages</h4>
                    </div>

                    <ul className="space-y-2 text-xs text-neutral-800">
                      {details.advantages.map((adv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#2E7D32] shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Things to Watch (Risks) */}
                  <div className="md:col-span-6 rounded-3xl border border-amber-200 bg-[#FFFDF5] p-5 sm:p-6 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-amber-200/60">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <h4 className="text-sm font-extrabold text-amber-900">Things to Watch</h4>
                    </div>

                    <ul className="space-y-2 text-xs text-neutral-800">
                      {details.considerations.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PERFORMANCE (When Performance Tab is Active) */}
            {activeTab === 'Performance' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
                  <h3 className="text-lg font-bold text-[#17231A]">Detailed Yield & Economic Projections</h3>
                  <p className="text-xs text-neutral-600">
                    Calculated using multi-year regional crop cutting experiments (CCE) in {districtLabel}.
                  </p>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <Tooltip
                          formatter={(val: number) => [`${val} tonnes per hectare`, 'Yield']}
                          contentStyle={{ borderRadius: '0.75rem' }}
                        />
                        <Bar dataKey="yield" radius={[8, 8, 0, 0]} barSize={45}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <span className="text-xs text-neutral-500 font-medium">Estimated Gross Revenue</span>
                    <p className="text-xl font-bold text-neutral-900 mt-1">{formatCurrency(displayRevenue)}</p>
                    <span className="text-[11px] text-neutral-400">Based on prevailing APMC mandi spot prices</span>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                    <span className="text-xs text-neutral-500 font-medium">Estimated Cultivation Cost</span>
                    <p className="text-xl font-bold text-neutral-900 mt-1">{formatCurrency(estimatedCost)}</p>
                    <span className="text-[11px] text-neutral-400">Seeds, tillage, fertilizer, water, labor</span>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-[#EAF6EA]/60 p-4">
                    <span className="text-xs text-emerald-800 font-bold">Net Farm Profit</span>
                    <p className="text-xl font-black text-[#2E7D32] mt-1">{formatCurrency(expectedProfit)}</p>
                    <span className="text-[11px] text-emerald-700">Projected Return on Investment: {estimatedROI}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FARM GUIDE (When Farm Guide Tab is Active) */}
            {activeTab === 'Farm Guide' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#17231A]">7-Step Agronomic Farm Guide</h3>
                      <p className="text-xs text-neutral-600">
                        Field management roadmap customized for {details.displayName} in {districtLabel}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFarmPlanModal(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#123B22] rounded-xl hover:bg-[#2E7D32]"
                    >
                      Open Full Interactive Roadmap
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="rounded-xl bg-neutral-50 p-3.5 space-y-1">
                      <span className="font-bold text-neutral-900">Key Cultural Practices:</span>
                      <p className="text-neutral-600">{details.farmingRequirements.keyPractices}</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 p-3.5 space-y-1">
                      <span className="font-bold text-neutral-900">Fertilizer Specification:</span>
                      <p className="text-neutral-600">{details.farmingRequirements.fertilizerRecommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 12. BOTTOM ACTION BUTTONS                                      */}
          {/* ============================================================== */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 py-4 bg-white border-t border-neutral-200/80 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Recommendations</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowFarmPlanModal(true)}
                className="flex-1 sm:flex-initial px-5 py-2.5 text-xs sm:text-sm font-bold text-[#123B22] bg-[#EAF6EA] border border-[#2E7D32]/30 rounded-xl hover:bg-[#EAF6EA]/80 transition-colors shadow-2xs"
              >
                View Complete Farm Plan
              </button>

              <button
                type="button"
                onClick={handleSelect}
                className={cn(
                  'flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-sm transition-all',
                  selectedSuccess
                    ? 'bg-emerald-800 scale-95'
                    : 'bg-[#2E7D32] hover:bg-[#123B22] hover:shadow-md'
                )}
              >
                {selectedSuccess ? (
                  <>
                    <CheckCheck className="h-4 w-4 animate-bounce" />
                    Selected for {farmDisplayName}!
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    Select This Crop
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete 7-step Farm Plan Modal */}
      <FarmPlanModal
        cropDetails={details}
        farmName={farmDisplayName}
        locationLabel={districtLabel}
        area={farmArea}
        isOpen={showFarmPlanModal}
        onClose={() => setShowFarmPlanModal(false)}
      />
    </>
  )
}
