import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FarmPlanModal } from '@/components/crop/FarmPlanModal'
import { getCropDetails } from '@/data/cropDetailsData'
import {
  getCropFertilizerPlan,
  type FertilizerProduct,
} from '@/data/fertilizerData'
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
  Lightbulb,
  ArrowRight,
  Sparkles,
  X,
  Compass,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react'

// Extended 5 fertilizers for Nutrient Management matching Screenshot 2 & prompt
const EXTENDED_RECOMMENDED_FERTILIZERS: FertilizerProduct[] = [
  {
    id: 'npk-20-10-20',
    name: 'NPK 20-10-20',
    badgeText: 'Recommended',
    purpose: 'Balanced nutrient application',
    compositionTag: 'NPK: 20-10-20',
    quantity: '300 kg/ha',
    applicationMethod: 'Basal application',
    stage: 'Day 0–15',
    image: '/fertilizers/npk-20-10-20.jpg',
    detailedDescription:
      'Balanced compound fertilizer providing nitrogen, phosphate and potassium in ideal proportions for vigorous early root architecture and initial tillering.',
    nutrientBreakdown: [
      { label: 'Total Nitrogen (N)', value: '20.0%' },
      { label: 'Available Phosphate (P2O5)', value: '10.0%' },
      { label: 'Soluble Potash (K2O)', value: '20.0%' },
      { label: 'Moisture', value: '1.5% max' },
    ],
    safetyNotes: [
      'Incorporate into seedbed before or during sowing',
      'Store in dry covered space protected from moisture',
      'Use protective gloves during broad application',
    ],
  },
  {
    id: 'urea',
    name: 'Urea',
    badgeText: 'Recommended',
    purpose: 'Nitrogen supplement',
    compositionTag: 'N: 46%',
    quantity: '100 kg/ha',
    applicationMethod: 'Top dressing',
    stage: 'Day 30–45',
    image: '/fertilizers/urea.jpg',
    detailedDescription:
      'High-analysis nitrogen fertilizer essential for vegetative canopy development, active chlorophyll synthesis, and rapid leaf expansion.',
    nutrientBreakdown: [
      { label: 'Ammoniacal/Amide Nitrogen', value: '46.0%' },
      { label: 'Biuret', value: '1.0% max' },
      { label: 'Water Solubility', value: '100%' },
    ],
    safetyNotes: [
      'Apply during moist soil conditions before anticipated rainfall or irrigation',
      'Incorporate lightly to avoid surface ammonia volatilization',
    ],
  },
  {
    id: 'mop',
    name: 'MOP / Potassium Chloride',
    badgeText: 'High Priority',
    purpose: 'Potassium supplement',
    compositionTag: 'K: 60%',
    quantity: '150 kg/ha',
    applicationMethod: 'Basal + top dressing',
    stage: 'Day 30–60',
    image: '/fertilizers/mop.jpg',
    detailedDescription:
      'Muriate of Potash provides high-grade potassium crucial for stalk strength, drought resistance, enzyme activation, and superior grain filling.',
    nutrientBreakdown: [
      { label: 'Water Soluble Potash (K2O)', value: '60.0%' },
      { label: 'Sodium (as NaCl)', value: '3.5% max' },
      { label: 'Moisture', value: '0.5%' },
    ],
    safetyNotes: [
      'Split application between basal and top-dressing for maximum nutrient uptake efficiency',
      'Keep sealed to avoid atmospheric moisture absorption',
    ],
  },
  {
    id: 'fym',
    name: 'FYM / Organic Manure',
    badgeText: 'Recommended',
    purpose: 'Soil conditioning and organic matter',
    compositionTag: 'Organic NPK: 1.5%',
    quantity: '5 tonnes/ha',
    applicationMethod: 'Pre-sowing incorporation',
    stage: 'Before sowing',
    image: '/fertilizers/fym.jpg',
    detailedDescription:
      'Well-decomposed farmyard manure incorporated during land preparation to enhance soil structure, organic carbon, microbial life, and water retention.',
    nutrientBreakdown: [
      { label: 'Organic Carbon', value: '16.0% min' },
      { label: 'Total N, P2O5, K2O', value: '1.5% min' },
      { label: 'C:N Ratio', value: '< 20:1' },
    ],
    safetyNotes: [
      'Ensure compost is well-rotted to avoid weed seeds',
      'Incorporate thoroughly with secondary tillage',
    ],
  },
  {
    id: 'zinc',
    name: 'Zinc Sulphate',
    badgeText: 'Micronutrient',
    purpose: 'Micronutrient correction',
    compositionTag: 'Zn: 21% + S: 10%',
    quantity: 'Based on soil recommendation',
    applicationMethod: 'Basal application',
    stage: 'Day 0–15',
    image: '/fertilizers/zinc.jpg',
    detailedDescription:
      'Crystalline zinc sulphate fertilizer corrects common regional soil deficiencies, preventing chlorosis and ensuring robust panicle development.',
    nutrientBreakdown: [
      { label: 'Zinc (as Zn)', value: '21.0% min' },
      { label: 'Sulphur (as S)', value: '10.0% min' },
      { label: 'Lead (as Pb)', value: '0.003% max' },
    ],
    safetyNotes: [
      'Do not mix directly with phosphatic fertilizers in spray tank',
      'Broadcast uniformly at seedbed preparation',
    ],
  },
]

interface TrackingRecord {
  id: string
  fertilizer: string
  quantity: string
  plannedDate: string
  actualDate: string
  status: 'Planned' | 'Applied' | 'Skipped'
}

export interface YieldOptimizationPageProps {
  onBack?: () => void
}

export function YieldOptimizationPage({ onBack }: YieldOptimizationPageProps) {
  const navigate = useNavigate()
  const { currentFarm } = useFarm()

  // Crop context
  const selectedCrop = 'Ragi'
  const cropDetails = useMemo(() => getCropDetails(selectedCrop), [selectedCrop])

  // Modals
  const [isFarmPlanModalOpen, setIsFarmPlanModalOpen] = useState(false)
  const [selectedFertilizerModal, setSelectedFertilizerModal] = useState<FertilizerProduct | null>(null)
  const [isAddTrackingModalOpen, setIsAddTrackingModalOpen] = useState(false)

  // Tracking state
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([
    {
      id: '1',
      fertilizer: 'NPK 20-10-20',
      quantity: '300 kg/ha',
      plannedDate: 'Day 5 (Basal)',
      actualDate: 'Day 5',
      status: 'Applied',
    },
    {
      id: '2',
      fertilizer: 'Urea',
      quantity: '100 kg/ha',
      plannedDate: 'Day 35 (Vegetative)',
      actualDate: '—',
      status: 'Planned',
    },
    {
      id: '3',
      fertilizer: 'MOP / Potassium Chloride',
      quantity: '150 kg/ha',
      plannedDate: 'Day 45 (Grain Formation)',
      actualDate: '—',
      status: 'Planned',
    },
  ])

  // New tracking record form state
  const [newFert, setNewFert] = useState('NPK 20-10-20')
  const [newQty, setNewQty] = useState('100 kg/ha')
  const [newPlannedDate, setNewPlannedDate] = useState('Day 60')
  const [newStatus, setNewStatus] = useState<'Planned' | 'Applied' | 'Skipped'>('Planned')

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/dashboard/yield')
    }
  }

  const farmName = currentFarm?.name || 'Kharif Farm'
  const farmArea = currentFarm?.total_area ? `${currentFarm.total_area} ha` : '3 ha'
  const farmLocation = currentFarm?.district || currentFarm?.village || 'Nellore'

  const handleStatusChange = (id: string, newStatus: 'Planned' | 'Applied' | 'Skipped') => {
    setTrackingRecords((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              status: newStatus,
              actualDate: newStatus === 'Applied' ? 'Today' : '—',
            }
          : rec
      )
    )
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault()
    const newRecord: TrackingRecord = {
      id: String(Date.now()),
      fertilizer: newFert,
      quantity: newQty,
      plannedDate: newPlannedDate,
      actualDate: newStatus === 'Applied' ? 'Today' : '—',
      status: newStatus,
    }
    setTrackingRecords((prev) => [...prev, newRecord])
    setIsAddTrackingModalOpen(false)
  }

  return (
    <div className="relative space-y-6 pb-20">
      {/* ============================================================== */}
      {/* SUBTLE PANORAMIC AGRICULTURAL BACKGROUND BANNER AT TOP         */}
      {/* ============================================================== */}
      <div className="pointer-events-none absolute -top-8 -left-8 -right-8 h-56 overflow-hidden opacity-30 select-none -z-10">
        <img
          src="/agri-bg/bg-01.webp"
          alt=""
          className="h-full w-full object-cover object-top"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/hero-farmer.jpg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8FBF6]/60 to-[#F8FBF6]" />
      </div>

      {/* ============================================================== */}
      {/* 1. TOP HEADER & BREADCRUMB                                     */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-[#123B22]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Yield Optimization</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#17231A] md:text-3xl">
              AI Yield Optimization
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-200">
              Nutrient Management
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium">
            Optimize crop nutrition based on soil conditions, crop requirements and AI yield analysis.
          </p>
        </div>

        {/* Top-Right Badges matching reference */}
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
                      Area: <strong className="text-neutral-900 font-bold">{farmArea}</strong>
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
                      Crop Stage: <strong className="text-neutral-900 font-bold">Vegetative · Day 31–45</strong>
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
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-2 py-0.2 text-[10px] font-bold text-emerald-900">
                  From Crop Recommendation
                </span>
              </div>
              <p className="text-xs text-emerald-900/90 leading-relaxed pt-0.5">
                This nutrient plan is generated from your crop recommendation, soil analysis and AI farm action plan.
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
      {/* 3. NUTRIENT HEALTH OVERVIEW: 4 Compact Metric Cards            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Nitrogen (N) */}
        <Card className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600">Nitrogen (N)</span>
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200/60">
              Low
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-[#17231A]">60</span>
              <span className="ml-1 text-xs text-neutral-500 font-medium">kg/ha</span>
            </div>
            <span className="text-xs font-bold text-rose-600">+144 gap</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>Target: 204 kg/ha</span>
            <span className="text-neutral-400">29% met</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '29%' }} />
          </div>
        </Card>

        {/* Phosphorus (P) */}
        <Card className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600">Phosphorus (P)</span>
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200/60">
              Low
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-[#17231A]">40</span>
              <span className="ml-1 text-xs text-neutral-500 font-medium">kg/ha</span>
            </div>
            <span className="text-xs font-bold text-amber-700">+10 gap</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>Target: 50 kg/ha</span>
            <span className="text-neutral-400">80% met</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
          </div>
        </Card>

        {/* Potassium (K) */}
        <Card className="rounded-2xl border border-rose-200/90 bg-rose-50/20 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700">Potassium (K)</span>
            <span className="inline-flex items-center rounded-md bg-rose-100/80 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 border border-rose-200">
              Deficient
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-rose-950">40</span>
              <span className="ml-1 text-xs text-neutral-500 font-medium">kg/ha</span>
            </div>
            <span className="text-xs font-extrabold text-rose-600">+192 gap</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-600 font-medium">
            <span>Target: 232 kg/ha</span>
            <span className="text-rose-700 font-bold">17% met (Highest)</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: '17%' }} />
          </div>
        </Card>

        {/* Soil pH */}
        <Card className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600">Soil pH</span>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200/60">
              Suitable
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold text-[#17231A]">6.5</span>
              <span className="ml-1 text-xs text-neutral-500 font-medium">pH</span>
            </div>
            <span className="text-xs font-bold text-emerald-700">Optimal</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span>Optimal: 6.0–7.5</span>
            <span className="text-emerald-700 font-semibold">In range</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '65%' }} />
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN SECTION: Left 7 Cols / Right 5 Cols                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ============================================================ */}
        {/* LEFT COLUMN (7 COLS): Nutrient Optimization, Timeline, Tracking*/}
        {/* ============================================================ */}
        <div className="space-y-6 lg:col-span-7">
          {/* Card 1: Nutrient Management Optimization (Donut + Visual Comparison Bars) */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    Nutrient Management Optimization
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    AI analysis of your current soil nutrients compared with crop requirements.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* Left Subcard: Current vs Recommended NPK Ratio Gauge */}
                <div className="md:col-span-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-700">Current NPK Ratio</span>
                    <p className="text-[11px] text-neutral-500">Current: 60 : 40 : 40</p>
                  </div>

                  <div className="py-3 flex flex-col items-center justify-center">
                    {/* Donut gauge */}
                    <div className="relative flex items-center justify-center w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#E2E8F0"
                          strokeWidth="9"
                        />
                        {/* Active stroke for balanced ratio */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#0F766E"
                          strokeWidth="9"
                          strokeDasharray="251.2"
                          strokeDashoffset="60"
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-black text-[#17231A]">4 : 1 : 5</span>
                        <span className="text-[10px] font-semibold text-neutral-500">(N : P : K)</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-neutral-200/80 p-2.5">
                    <span className="text-[11px] font-extrabold text-[#17231A]">
                      Recommended NPK Ratio
                    </span>
                    <p className="text-sm font-extrabold text-emerald-800">4 : 1 : 5</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">
                      Balanced ratio for optimal growth and yield. Target: 204 : 50 : 232 kg/ha
                    </p>
                  </div>
                </div>

                {/* Right Subcard: Horizontal Visual Comparison Bars */}
                <div className="md:col-span-7 rounded-2xl border border-neutral-200/80 bg-white p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-800">
                        Nutrient Status & Requirements
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-500">Current → Target</span>
                    </div>

                    {/* Visual Comparison Horizontal Bars */}
                    <div className="mt-3.5 space-y-3.5">
                      {/* Nitrogen Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-800">Nitrogen (N)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500 font-medium">60 → 204 kg/ha</span>
                            <span className="font-extrabold text-amber-700">+144 kg/ha</span>
                            <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                              Low
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '29%' }} />
                        </div>
                      </div>

                      {/* Phosphorus Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-800">Phosphorus (P)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500 font-medium">40 → 50 kg/ha</span>
                            <span className="font-extrabold text-emerald-700">+10 kg/ha</span>
                            <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                              Low
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '80%' }} />
                        </div>
                      </div>

                      {/* Potassium Bar (HIGHLIGHTED AS LARGEST GAP) */}
                      <div className="space-y-1 rounded-xl bg-rose-50/50 p-2 border border-rose-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-950 flex items-center gap-1.5">
                            Potassium (K)
                            <span className="rounded bg-rose-200/70 px-1.5 py-0.2 text-[9px] font-black text-rose-800 uppercase">
                              Largest Gap
                            </span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 font-medium">40 → 232 kg/ha</span>
                            <span className="font-extrabold text-rose-700">+192 kg/ha</span>
                            <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700 border border-rose-300">
                              Low
                            </span>
                          </div>
                        </div>
                        <div className="relative h-2.5 w-full rounded-full bg-rose-200/60 overflow-hidden mt-1">
                          <div className="h-full bg-rose-600 rounded-full" style={{ width: '17%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Insight Banner */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 flex items-start gap-2.5 text-xs text-neutral-800">
                    <Lightbulb className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-emerald-950">
                        Potassium has the largest nutrient gap (+192 kg/ha).
                      </p>
                      <p className="text-[11px] text-emerald-900/90 mt-0.5">
                        Prioritize potassium application during the recommended crop growth stage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: AI Nutrient Insight Card */}
          <Card className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    AI Nutrient Insight
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    Targeted guidance based on crop phenology and soil deficiency analysis.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3.5 pt-1">
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#17231A]">
                    Potassium is currently the largest nutrient gap.
                  </h4>
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 border border-rose-200">
                    192 kg/ha gap
                  </span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed mt-2 font-medium">
                  Potassium management should be prioritized during the recommended growth stage. Combine balanced NPK application with the recommended potassium source and organic manure.
                </p>
              </div>

              {/* Why this matters callout */}
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-700">
                  Why this matters
                </span>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Improving nutrient balance can support healthier crop development, strengthen stalk architecture against lodging, and provide an optimization opportunity for better yield management.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Recommended Nutrient Application Schedule (Horizontal Timeline) */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    Recommended Nutrient Application Schedule
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    Chronological application timeline matching crop phenological stages.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Step 1: Basal Application */}
                <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Step 1 · Day 0–15
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17231A] mt-1">Basal Application</h5>
                    <p className="text-[11px] text-neutral-600 font-medium">NPK + FYM + Zinc</p>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-1 text-[10px] text-emerald-800 font-semibold">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Incorporate at sowing</span>
                  </div>
                </div>

                {/* Step 2: Vegetative Stage */}
                <div className="relative rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                        Step 2 · Day 30–45
                      </span>
                      <span className="rounded bg-neutral-200/80 px-1.5 py-0.2 text-[9px] font-bold text-neutral-700">
                        Upcoming
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17231A] mt-1">Vegetative Stage</h5>
                    <p className="text-[11px] text-neutral-600 font-medium">Urea</p>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex items-center gap-1 text-[10px] text-neutral-600 font-medium">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>Top dressing</span>
                  </div>
                </div>

                {/* Step 3: Grain Formation */}
                <div className="relative rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                        Step 3 · Day 45–60
                      </span>
                      <span className="rounded bg-neutral-200/80 px-1.5 py-0.2 text-[9px] font-bold text-neutral-700">
                        Upcoming
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17231A] mt-1">Grain Formation</h5>
                    <p className="text-[11px] text-neutral-600 font-medium">Potassium / MOP</p>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex items-center gap-1 text-[10px] text-neutral-600 font-medium">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>Top dressing</span>
                  </div>
                </div>

                {/* Step 4: Later Application */}
                <div className="relative rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                        Step 4 · Day 60+
                      </span>
                      <span className="rounded bg-neutral-200/80 px-1.5 py-0.2 text-[9px] font-bold text-neutral-700">
                        Upcoming
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-[#17231A] mt-1">Later Application</h5>
                    <p className="text-[11px] text-neutral-600 font-medium">As required by condition</p>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex items-center gap-1 text-[10px] text-neutral-600 font-medium">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span>Foliar if needed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: How to Optimize Your Yield (4 Action cards) */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    Optimization Actions
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    Interconnected actions supporting overall crop yield optimization.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Action 1: Fertilizer Management */}
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Sprout className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[#17231A]">Fertilizer Management</h4>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Correct nitrogen and potassium gaps using the recommended fertilizer plan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/fertilizer')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 pt-1"
                  >
                    <span>View Fertilizer Plan</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Action 2: Irrigation Optimization */}
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[#17231A]">Irrigation Optimization</h4>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Maintain adequate moisture during critical crop growth stages.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/irrigation')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 pt-1"
                  >
                    <span>View Irrigation Plan</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Action 3: Soil Health */}
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <FlaskConical className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[#17231A]">Soil Health</h4>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Maintain suitable pH and organic matter for nutrient availability.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/soil')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 pt-1"
                  >
                    <span>View Soil Plan</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Action 4: Weather Monitoring */}
                <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <CloudSun className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[#17231A]">Weather Monitoring</h4>
                    <p className="text-[11px] text-neutral-600 leading-snug">
                      Monitor rainfall and temperature before fertilizer application.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/weather')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 pt-1"
                  >
                    <span>View Weather Insights</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Application Tracking */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-[#17231A]">
                      Application Tracking
                    </CardTitle>
                    <CardDescription className="text-xs text-neutral-500">
                      Log and monitor planned vs applied fertilizer dosages.
                    </CardDescription>
                  </div>
                </div>

                <Button
                  onClick={() => setIsAddTrackingModalOpen(true)}
                  size="sm"
                  className="rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Application Record
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-1">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-left text-[11px] font-semibold uppercase text-neutral-400">
                      <th className="pb-2.5 font-medium">Fertilizer</th>
                      <th className="pb-2.5 font-medium">Quantity</th>
                      <th className="pb-2.5 font-medium">Planned Date</th>
                      <th className="pb-2.5 font-medium">Actual Date</th>
                      <th className="pb-2.5 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {trackingRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 font-bold text-neutral-800">{rec.fertilizer}</td>
                        <td className="py-3 font-semibold text-neutral-600">{rec.quantity}</td>
                        <td className="py-3 text-neutral-600 font-medium">{rec.plannedDate}</td>
                        <td className="py-3 text-neutral-600 font-medium">{rec.actualDate}</td>
                        <td className="py-3 text-right">
                          <select
                            value={rec.status}
                            onChange={(e) =>
                              handleStatusChange(
                                rec.id,
                                e.target.value as 'Planned' | 'Applied' | 'Skipped'
                              )
                            }
                            aria-label={`Status for ${rec.fertilizer}`}
                            className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                              rec.status === 'Applied'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : rec.status === 'Planned'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                            }`}
                          >
                            <option value="Planned">Planned</option>
                            <option value="Applied">Applied</option>
                            <option value="Skipped">Skipped</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN (5 COLS): Recommended Fertilizers & Quick Actions*/}
        {/* ============================================================ */}
        <div className="space-y-6 lg:col-span-5">
          {/* Card 1: Recommended Fertilizers */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    Recommended Fertilizers
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    Selected from your crop recommendation and nutrient analysis.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              {EXTENDED_RECOMMENDED_FERTILIZERS.map((fert) => (
                <div
                  key={fert.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 transition-all hover:border-[#123B22]/40 hover:shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* Fertilizer product thumbnail */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-200 shadow-2xs">
                      <img
                        src={fert.image}
                        alt={fert.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#17231A] sm:text-sm">
                          {fert.name}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                            fert.badgeText === 'High Priority'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : fert.badgeText === 'Micronutrient'
                                ? 'bg-sky-50 border-sky-200 text-sky-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}
                        >
                          {fert.badgeText}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-500 font-medium">
                        {fert.purpose}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                        <span className="font-semibold text-neutral-700">
                          ⚗ {fert.quantity}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-neutral-800">
                          {fert.applicationMethod}
                        </span>
                      </div>

                      <div className="text-[10px] text-neutral-400">
                        <span>Stage: {fert.stage}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Details link */}
                  <button
                    type="button"
                    onClick={() => setSelectedFertilizerModal(fert)}
                    className="self-end sm:self-center shrink-0 inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
                  >
                    <span>View details</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 2: AI Optimization Insights (3 Priority Columns) */}
          <Card className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    AI Optimization Insights
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    Key insights to help you make better decisions and improve your yield.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              {/* High Priority */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3 space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-200">
                  ● High Priority
                </span>
                <h4 className="text-xs font-bold text-[#17231A] pt-1">Potassium Management</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Potassium is the largest nutrient gap (192 kg/ha). Apply MOP / Potassium Chloride as recommended.
                </p>
              </div>

              {/* Medium Priority */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3 space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                  ● Medium Priority
                </span>
                <h4 className="text-xs font-bold text-[#17231A] pt-1">Irrigation Management</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Monitor rainfall and adjust irrigation based on crop stage and weather conditions.
                </p>
              </div>

              {/* Low Priority */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
                  ● Low Priority
                </span>
                <h4 className="text-xs font-bold text-[#17231A] pt-1">Soil pH</h4>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  pH is within the optimal range (6.0 – 7.5). Keep it stable with organic matter.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Quick Actions */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[#17231A]">
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500">
                    Jump to relevant sections for better yield optimization.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/fertilizer')}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-3 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-emerald-700" />
                    <span>Fertilizer Plan</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard/irrigation')}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-3 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-teal-700" />
                    <span>Irrigation Plan</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard/crop')}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-3 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-emerald-700" />
                    <span>Crop Management</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard/weather')}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-3 text-xs font-bold text-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <CloudSun className="h-4 w-4 text-amber-700" />
                    <span>Weather Insights</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. BOTTOM CTA SECTION                                          */}
      {/* ============================================================== */}
      <Card className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Continue to Farm Action Plan
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-[#17231A]">
              Connect this nutrient plan with your comprehensive crop lifecycle
            </h3>
            <p className="text-xs text-neutral-600">
              Review basal soil preparation, weeding schedule, irrigation intervals, and harvest planning.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-xl border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
            >
              Back to Yield Optimization
            </Button>
            <Button
              onClick={() => setIsFarmPlanModalOpen(true)}
              className="rounded-xl bg-[#123B22] text-xs font-bold text-white hover:bg-[#0E2F1B] shadow-2xs"
            >
              <span>View Full Crop Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 6. MODAL: FERTILIZER PRODUCT DETAILS                           */}
      {/* ============================================================== */}
      {selectedFertilizerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSelectedFertilizerModal(null)}
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedFertilizerModal(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 shadow-xs">
                <img
                  src={selectedFertilizerModal.image}
                  alt={selectedFertilizerModal.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    selectedFertilizerModal.badgeText === 'High Priority'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {selectedFertilizerModal.badgeText}
                </span>
                <h3 className="text-lg font-extrabold text-[#17231A]">
                  {selectedFertilizerModal.name}
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  {selectedFertilizerModal.purpose}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-700 border border-neutral-100">
              {selectedFertilizerModal.detailedDescription}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-neutral-200/80 p-2.5">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase">
                  Dosage / Hectare
                </span>
                <p className="font-extrabold text-neutral-900 mt-0.5">
                  {selectedFertilizerModal.quantity}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200/80 p-2.5">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase">
                  Application Timing
                </span>
                <p className="font-extrabold text-neutral-900 mt-0.5">
                  {selectedFertilizerModal.stage}
                </p>
              </div>
            </div>

            {selectedFertilizerModal.nutrientBreakdown && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-neutral-800">Guaranteed Analysis</h4>
                <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100 text-xs">
                  {selectedFertilizerModal.nutrientBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between px-3 py-1.5">
                      <span className="text-neutral-600">{item.label}</span>
                      <span className="font-bold text-neutral-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={() => setSelectedFertilizerModal(null)}
                className="w-full bg-[#123B22] hover:bg-[#0E2F1B] text-white font-bold rounded-xl"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: ADD TRACKING RECORD                                   */}
      {/* ============================================================== */}
      {isAddTrackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsAddTrackingModalOpen(false)}
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Add Application Record</h3>
              <button
                type="button"
                onClick={() => setIsAddTrackingModalOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Fertilizer</label>
                <select
                  value={newFert}
                  onChange={(e) => setNewFert(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                >
                  <option value="NPK 20-10-20">NPK 20-10-20</option>
                  <option value="Urea">Urea</option>
                  <option value="MOP / Potassium Chloride">MOP / Potassium Chloride</option>
                  <option value="FYM / Organic Manure">FYM / Organic Manure</option>
                  <option value="Zinc Sulphate">Zinc Sulphate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Quantity</label>
                <input
                  type="text"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="e.g. 150 kg/ha"
                  className="w-full rounded-xl border border-neutral-300 p-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Planned Date / Stage</label>
                <input
                  type="text"
                  value={newPlannedDate}
                  onChange={(e) => setNewPlannedDate(e.target.value)}
                  placeholder="e.g. Day 45 (Grain Formation)"
                  className="w-full rounded-xl border border-neutral-300 p-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as 'Planned' | 'Applied' | 'Skipped')
                  }
                  className="w-full rounded-xl border border-neutral-300 p-2 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Planned">Planned</option>
                  <option value="Applied">Applied</option>
                  <option value="Skipped">Skipped</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddTrackingModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-[#123B22] text-xs font-bold text-white hover:bg-[#0E2F1B]"
                >
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. FULL FARM PLAN MODAL                                        */}
      {/* ============================================================== */}
      {isFarmPlanModalOpen && (
        <FarmPlanModal
          cropDetails={cropDetails}
          farmName={farmName}
          locationLabel={farmLocation}
          area={3}
          isOpen={isFarmPlanModalOpen}
          onClose={() => setIsFarmPlanModalOpen(false)}
        />
      )}
    </div>
  )
}
