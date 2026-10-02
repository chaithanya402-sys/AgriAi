import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select'
import { FarmPlanModal } from '@/components/crop/FarmPlanModal'
import { getCropDetails } from '@/data/cropDetailsData'
import {
  getCropFertilizerPlan,
  type FertilizerProduct,
  type FertilizerTrackingRecord,
} from '@/data/fertilizerData'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  Sprout,
  Leaf,
  Flower2,
  Wheat,
  Plus,
  Edit2,
  X,
  Sparkles,
  ArrowRight,
  Home,
  Grid,
  MapPin,
  FlaskConical,
  Beaker,
} from 'lucide-react'

export function FertilizerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { farms, selectedFarmId, currentFarm, activeCrop } = useFarm()

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null

  // 1. Resolve selected crop from URL param -> activeCrop -> localStorage -> default ('Ragi')
  const initialCrop = useMemo(() => {
    const urlCrop = searchParams.get('crop')
    if (urlCrop) return urlCrop
    if (activeCrop?.rawCropName) return activeCrop.rawCropName
    const saved = localStorage.getItem('agriai_selected_crop')
    if (saved) return saved
    return 'Ragi'
  }, [searchParams, activeCrop?.rawCropName])

  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop)

  useEffect(() => {
    const param = searchParams.get('crop')
    if (param) {
      if (param !== selectedCrop) {
        setSelectedCrop(param)
      }
    } else if (activeCrop?.rawCropName && activeCrop.rawCropName !== selectedCrop) {
      setSelectedCrop(activeCrop.rawCropName)
    }
  }, [searchParams, activeCrop?.rawCropName, selectedCrop])

  // 2. Compute dynamic plan based on selected crop and farm soil measurements
  const cropDetails = useMemo(() => getCropDetails(selectedCrop), [selectedCrop])

  const soilReadings = useMemo(() => {
    return {
      nitrogen: activeCrop?.nitrogen ?? 60,
      phosphorus: activeCrop?.phosphorus ?? 40,
      potassium: activeCrop?.potassium ?? 40,
      soilPh: activeCrop?.soilPH ?? 6.5,
    }
  }, [activeCrop])

  const plan = useMemo(
    () => getCropFertilizerPlan(selectedCrop, soilReadings),
    [selectedCrop, soilReadings]
  )

  // 3. Modals state
  const [selectedFertilizerModal, setSelectedFertilizerModal] = useState<FertilizerProduct | null>(null)
  const [isFarmPlanModalOpen, setIsFarmPlanModalOpen] = useState(false)
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FertilizerTrackingRecord | null>(null)

  // 4. Tracking Records state
  const [trackingRecords, setTrackingRecords] = useState<FertilizerTrackingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`agriai_fertilizer_records_${selectedCrop}`)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return plan.defaultTrackingRecords
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`agriai_fertilizer_records_${selectedCrop}`)
      if (saved) {
        setTrackingRecords(JSON.parse(saved))
        return
      }
    } catch {
      // ignore
    }
    setTrackingRecords(plan.defaultTrackingRecords)
  }, [selectedCrop, plan.defaultTrackingRecords])

  const saveTrackingRecords = (records: FertilizerTrackingRecord[]) => {
    setTrackingRecords(records)
    try {
      localStorage.setItem(`agriai_fertilizer_records_${selectedCrop}`, JSON.stringify(records))
    } catch {
      // ignore
    }
  }

  const toggleRecordStatus = (id: string) => {
    const updated = trackingRecords.map((r) => {
      if (r.id !== id) return r
      const nextStatus: FertilizerTrackingRecord['status'] =
        r.status === 'Planned' ? 'Applied' : r.status === 'Applied' ? 'Skipped' : 'Planned'
      return {
        ...r,
        status: nextStatus,
        applicationDate:
          nextStatus === 'Applied' && (r.applicationDate === '-' || !r.applicationDate)
            ? 'Apr 12, 2025'
            : r.applicationDate,
      }
    })
    saveTrackingRecords(updated)
  }

  // Form state for Add/Edit Record modal
  const [recordForm, setRecordForm] = useState({
    fertilizer: '',
    quantity: '',
    unit: 'kg/ha',
    applicationDate: 'Apr 12, 2025',
    status: 'Planned' as FertilizerTrackingRecord['status'],
  })

  const openAddRecord = () => {
    setEditingRecord(null)
    setRecordForm({
      fertilizer: plan.recommendedFertilizers[0]?.name || 'NPK 20-10-20',
      quantity: '300',
      unit: 'kg/ha',
      applicationDate: 'Apr 12, 2025',
      status: 'Planned',
    })
    setIsAddRecordModalOpen(true)
  }

  const openEditRecord = (record: FertilizerTrackingRecord) => {
    setEditingRecord(record)
    setRecordForm({
      fertilizer: record.fertilizer,
      quantity: String(record.quantity),
      unit: record.unit || 'kg/ha',
      applicationDate: record.applicationDate,
      status: record.status,
    })
    setIsAddRecordModalOpen(true)
  }

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recordForm.fertilizer.trim() || !recordForm.quantity) return

    if (editingRecord) {
      const updated = trackingRecords.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              fertilizer: recordForm.fertilizer,
              quantity: Number(recordForm.quantity) || 0,
              unit: recordForm.unit,
              applicationDate: recordForm.applicationDate,
              status: recordForm.status,
            }
          : r
      )
      saveTrackingRecords(updated)
    } else {
      const newRec: FertilizerTrackingRecord = {
        id: `rec-${Date.now()}`,
        fertilizer: recordForm.fertilizer,
        quantity: Number(recordForm.quantity) || 0,
        unit: recordForm.unit,
        applicationDate: recordForm.applicationDate,
        status: recordForm.status,
      }
      saveTrackingRecords([...trackingRecords, newRec])
    }
    setIsAddRecordModalOpen(false)
  }

  const handleDeleteRecord = (id: string) => {
    const updated = trackingRecords.filter((r) => r.id !== id)
    saveTrackingRecords(updated)
    setIsAddRecordModalOpen(false)
  }

  const farmDisplayName = activeCrop?.farmName || activeFarm?.name || plan.farmName
  const farmLocation = activeCrop?.location || activeFarm?.district || activeFarm?.village || plan.location
  const farmArea = activeCrop?.area ? `${activeCrop.area} ha` : (activeFarm?.total_area ? `${activeFarm.total_area} ha` : plan.farmArea)
  const currentStage = activeCrop?.cropStage || plan.cropStage

  return (
    <div className="relative space-y-6 pb-16">
      {/* ============================================================== */}
      {/* SUBTLE PANORAMIC AGRICULTURAL BACKGROUND BANNER AT TOP         */}
      {/* ============================================================== */}
      <div className="pointer-events-none absolute -top-8 -left-8 -right-8 h-48 overflow-hidden opacity-30 select-none -z-10">
        <img
          src="/agri-bg/bg-01.webp"
          alt=""
          className="h-full w-full object-cover object-top mask-image-linear-to-b"
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
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/dashboard/crop')}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-[#123B22]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Crop Action Plan</span>
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-[#17231A] md:text-3xl">
            Fertilizer Plan
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 font-medium">
            Generated from your Crop Recommendation and AI Farm Action Plan
          </p>
        </div>

        {/* Top-Right Farm Badge matching screenshot */}
        <div className="flex items-center gap-2 self-start">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-bold text-neutral-800 shadow-2xs">
            <Home className="h-3.5 w-3.5 text-emerald-800" />
            <span>{farmDisplayName}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SELECTED CROP CONTEXT CARD                                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left (Main Context): Crop thumbnail, title, badge, and 4 metadata pills */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs lg:col-span-8 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Real Crop Image */}
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 shadow-2xs">
                <img
                  src={plan.cropImage}
                  alt={plan.cropDisplayName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                  }}
                />
              </div>

              {/* Title & Metadata Pills */}
              <div className="space-y-2.5 flex-1 min-w-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#17231A] tracking-tight truncate">
                    {plan.cropDisplayName}
                  </h2>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      <Sprout className="h-3 w-3 text-emerald-700" />
                      Selected Crop
                    </span>
                  </div>
                </div>

                {/* 4 Metadata Stats in a row matching screenshot */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      Farm: <strong className="text-neutral-900 font-bold">{farmDisplayName}</strong>
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
                      Crop Stage: <strong className="text-neutral-900 font-bold">{currentStage}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: From Crop Recommendation Badge Card with "View in Action Plan →" */}
        <Card className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-emerald-50/40 to-teal-50/20 p-4 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200/80">
              <Leaf className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-emerald-950">
                From Crop Recommendation
              </h3>
              <p className="text-xs text-emerald-900/90 leading-relaxed">
                {plan.aiRecommendationText}
              </p>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => setIsFarmPlanModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-white/90 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-white transition-colors shadow-2xs"
            >
              <span>View in Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
            </button>
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 3. SOIL NUTRIENT STATUS                                        */}
      {/* ============================================================== */}
      <div className="space-y-2.5">
        <div>
          <h3 className="text-sm font-extrabold text-[#17231A]">Soil Nutrient Status</h3>
          <p className="text-xs text-neutral-500 font-medium">
            Current levels vs. recommended levels for your crop
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Nitrogen (N) */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-2xs">
                N
              </div>
              <span className="text-xs font-bold text-neutral-800">Nitrogen (N)</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-lg font-extrabold text-[#17231A]">
                  {plan.soilNutrients.nitrogen.current} kg/ha
                </p>
                <p className="text-[11px] font-semibold text-neutral-400">Current</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-[#17231A]">
                  {plan.soilNutrients.nitrogen.target} kg/ha
                </p>
                <p className="text-[11px] font-semibold text-neutral-400">Target</p>
              </div>
            </div>

            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
                ↓ {plan.soilNutrients.nitrogen.status}
              </span>
            </div>

            {/* Compact bottom progress indicator */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${plan.soilNutrients.nitrogen.progressPercent}%` }}
              />
            </div>
          </Card>

          {/* Phosphorus (P) */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow-2xs">
                P
              </div>
              <span className="text-xs font-bold text-neutral-800">Phosphorus (P)</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-lg font-extrabold text-[#17231A]">
                  {plan.soilNutrients.phosphorus.current} kg/ha
                </p>
                <p className="text-[11px] font-semibold text-neutral-400">Current</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-[#17231A]">
                  {plan.soilNutrients.phosphorus.target} kg/ha
                </p>
                <p className="text-[11px] font-semibold text-neutral-400">Target</p>
              </div>
            </div>

            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
                ↓ {plan.soilNutrients.phosphorus.status}
              </span>
            </div>

            {/* Compact bottom progress indicator */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${plan.soilNutrients.phosphorus.progressPercent}%` }}
              />
            </div>
          </Card>

          {/* Potassium (K) */}
          <Card className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white shadow-2xs">
                K
              </div>
              <span className="text-xs font-bold text-neutral-800">Potassium (K)</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-lg font-extrabold text-[#17231A]">
                  {plan.soilNutrients.potassium.current} kg/ha
                </p>
                <p className="text-[11px] font-semibold text-neutral-400">Current</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-[#17231A]">
                  {plan.soilNutrients.potassium.target} kg/ha
                </p>
                <p className="text-[11px] font-semibold text-neutral-400">Target</p>
              </div>
            </div>

            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
                ↓ {plan.soilNutrients.potassium.status}
              </span>
            </div>

            {/* Compact bottom progress indicator */}
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-purple-600 transition-all duration-500"
              style={{ width: `${plan.soilNutrients.potassium.progressPercent}%` }}
            />
          </Card>

        {/* Soil pH */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs transition-all hover:shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-2xs">
              pH
            </div>
            <span className="text-xs font-bold text-neutral-800">Soil pH</span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-lg font-extrabold text-[#17231A]">
                {plan.soilNutrients.soilPh.current}
              </p>
              <p className="text-[11px] font-semibold text-neutral-400">Current</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold text-[#17231A]">
                {plan.soilNutrients.soilPh.optimalRangeLabel}
              </p>
              <p className="text-[11px] font-semibold text-neutral-400">Optimal Range</p>
            </div>
          </div>

          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              ✓ {plan.soilNutrients.soilPh.status}
            </span>
          </div>

          {/* Compact bottom progress indicator */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-500"
              style={{ width: `${plan.soilNutrients.soilPh.progressPercent}%` }}
            />
          </div>
        </Card>
      </div>
    </div>

    {/* ============================================================== */}
    {/* 4. MAIN TWO-COLUMN SECTION (Left 7 Cols / Right 5 Cols)        */}
    {/* ============================================================== */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* ============================================================ */}
      {/* LEFT COLUMN (7 COLS): AI Recommended Plan, Schedule, Insight */}
      {/* ============================================================ */}
      <div className="space-y-6 lg:col-span-7">
        {/* A. AI Recommended Fertilizer Plan Card */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#17231A]">
                  AI Recommended Fertilizer Plan
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  Based on your crop, soil condition and AI analysis
                </CardDescription>
              </div>
            </div>

            {/* NPK Ratio badge matching screenshot */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950 shadow-2xs">
              <span className="text-neutral-500 mr-1.5 font-medium">NPK Ratio</span>
              <span className="font-extrabold">{plan.npkRatio}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-[11px] font-semibold uppercase text-neutral-400">
                    <th className="pb-2.5 font-medium">Nutrient</th>
                    <th className="pb-2.5 text-center font-medium">Current (kg/ha)</th>
                    <th className="pb-2.5 text-center font-medium">Target (kg/ha)</th>
                    <th className="pb-2.5 text-center font-medium">Gap (kg/ha)</th>
                    <th className="pb-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {/* Nitrogen (N) */}
                  <tr>
                    <td className="py-3.5 pr-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                            N
                          </span>
                          <span className="font-bold text-neutral-900">Nitrogen (N)</span>
                        </div>
                        {/* Horizontal Progress Bar under name */}
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${plan.soilNutrients.nitrogen.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {plan.soilNutrients.nitrogen.current}
                    </td>
                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {plan.soilNutrients.nitrogen.target}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                        +{plan.soilNutrients.nitrogen.gap}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-200/70">
                        {plan.soilNutrients.nitrogen.gapStatusLabel}
                      </span>
                    </td>
                  </tr>

                  {/* Phosphorus (P) */}
                  <tr>
                    <td className="py-3.5 pr-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                            P
                          </span>
                          <span className="font-bold text-neutral-900">Phosphorus (P)</span>
                        </div>
                        {/* Horizontal Progress Bar under name */}
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${plan.soilNutrients.phosphorus.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {plan.soilNutrients.phosphorus.current}
                    </td>
                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {plan.soilNutrients.phosphorus.target}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                        +{plan.soilNutrients.phosphorus.gap}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/70">
                        {plan.soilNutrients.phosphorus.gapStatusLabel}
                      </span>
                    </td>
                  </tr>

                  {/* Potassium (K) */}
                  <tr>
                    <td className="py-3.5 pr-2">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                            K
                          </span>
                          <span className="font-bold text-neutral-900">Potassium (K)</span>
                        </div>
                        {/* Horizontal Progress Bar under name */}
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-purple-600"
                            style={{ width: `${plan.soilNutrients.potassium.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {plan.soilNutrients.potassium.current}
                    </td>
                    <td className="py-3.5 text-center font-bold text-neutral-800">
                      {plan.soilNutrients.potassium.target}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                        +{plan.soilNutrients.potassium.gap}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-200/70">
                        {plan.soilNutrients.potassium.gapStatusLabel}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* B. Application Schedule Timeline Card */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#17231A]">
                  Application Schedule
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  When and how to apply your fertilizers
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              {plan.applicationSchedule.map((stage, idx) => (
                <div key={stage.id} className="flex-1 w-full flex items-center">
                  <div className="flex-1 flex flex-col justify-between rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-3 text-center transition-all hover:bg-white hover:shadow-2xs">
                    {/* Stage Icon */}
                    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-2xs">
                      {stage.iconType === 'basal' && <Sprout className="h-3.5 w-3.5" />}
                      {stage.iconType === 'vegetative' && <Leaf className="h-3.5 w-3.5" />}
                      {stage.iconType === 'flowering' && <Flower2 className="h-3.5 w-3.5" />}
                      {stage.iconType === 'later' && <Wheat className="h-3.5 w-3.5" />}
                    </div>

                    <div className="my-2 space-y-0.5">
                      <p className="text-xs font-extrabold text-[#17231A]">
                        {stage.stageName}
                      </p>
                      <p className="text-[10px] font-semibold text-neutral-500">
                        {stage.dayLabel}
                      </p>
                      <p className="text-xs font-bold text-neutral-800 pt-0.5">
                        {stage.productLabel}
                      </p>
                    </div>

                    <div className="mt-1">
                      {stage.status === 'Recommended' ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✓ Recommended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          ○ Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connector Arrow except after last step */}
                  {idx < plan.applicationSchedule.length - 1 && (
                    <span className="hidden sm:inline-block px-1 text-neutral-300 font-bold">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* C. AI Fertilizer Insight Banner (Dark Green matching screenshot) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0E3820] text-white p-4.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 z-10 max-w-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300 border border-white/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                AI Fertilizer Insight
              </h4>
              <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                Potassium is currently the largest nutrient gap (192 kg/ha).
              </p>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Prioritize potassium application during the recommended growth stage for better yield and disease resistance.
              </p>
            </div>
          </div>

          {/* Right Action button inside dark banner */}
          <div className="shrink-0 z-10">
            <button
              type="button"
              onClick={() => setIsFarmPlanModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors shadow-2xs"
            >
              <span>View Full Crop Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Decorative leaf branch in corner */}
          <div className="pointer-events-none absolute -bottom-4 -right-4 text-emerald-500/20">
            <Leaf className="h-28 w-28 transform rotate-12" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN (5 COLS): Recommended Fertilizers, Tracking    */}
      {/* ============================================================ */}
      <div className="space-y-6 lg:col-span-5">
        {/* A. Recommended Fertilizers Card */}
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
                  From your crop plan and AI analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-1">
            {plan.recommendedFertilizers.map((fert) => (
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
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=300&q=80'
                      }}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#17231A] sm:text-sm">
                        {fert.name}
                      </h4>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                        {fert.badgeText}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 font-medium">
                      {fert.purpose}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-600">
                      <span className="font-semibold text-neutral-700">
                        ⚗ {fert.compositionTag}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-neutral-800">
                        ↑ Qty: {fert.quantity}
                      </span>
                    </div>

                    <div className="text-[10px] text-neutral-400">
                      <span>Application: {fert.applicationMethod}</span> · <span>Stage: {fert.stage}</span>
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

        {/* B. Track Fertilizer Application Card */}
        <Card className="rounded-2xl border border-neutral-200/90 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#17231A]">
                  Track Fertilizer Application
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  Mark application status and keep a record.
                </CardDescription>
              </div>
            </div>

            {/* Add Record button */}
            <button
              type="button"
              onClick={openAddRecord}
              className="inline-flex items-center gap-1 rounded-xl bg-[#0E3820] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#0A2917] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Record</span>
            </button>
          </CardHeader>

          <CardContent className="pt-1">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-[11px] font-semibold uppercase text-neutral-400">
                    <th className="pb-2 font-medium">Fertilizer</th>
                    <th className="pb-2 text-center font-medium">Qty (kg/ha)</th>
                    <th className="pb-2 text-center font-medium">Application Date</th>
                    <th className="pb-2 text-center font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {trackingRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-2.5 font-bold text-neutral-900 pr-2">
                        {rec.fertilizer}
                      </td>
                      <td className="py-2.5 text-center font-semibold text-neutral-700">
                        {rec.quantity}
                      </td>
                      <td className="py-2.5 text-center text-neutral-600 font-medium">
                        {rec.applicationDate}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRecordStatus(rec.id)}
                          title="Click to toggle status"
                          className={cn(
                            'cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all select-none',
                            rec.status === 'Applied'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : rec.status === 'Skipped'
                              ? 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200 hover:bg-sky-200'
                          )}
                        >
                          {rec.status === 'Applied' && '✓ '}
                          {rec.status}
                        </button>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => openEditRecord(rec)}
                          className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                          title="Edit Record"
                        >
                          <Edit2 className="h-3.5 w-3.5 inline mr-1" />
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* ============================================================== */}
    {/* DECORATIVE BRANDING QUOTE ON BOTTOM LEFT                      */}
    {/* ============================================================== */}
    <div className="pt-4 flex items-center gap-3 text-neutral-500 select-none">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-700">
        <Leaf className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-bold text-[#17231A]">
          "Better soil. Healthier crops. A brighter future."
        </p>
        <p className="text-[11px] text-neutral-400">AgriAI Sustainable Nutrient Intelligence</p>
      </div>
    </div>

    {/* ============================================================== */}
    {/* 5. MODAL: FERTILIZER PRODUCT DETAILS                           */}
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
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedFertilizerModal(null)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header with image */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 shadow-xs">
              <img
                src={selectedFertilizerModal.image}
                alt={selectedFertilizerModal.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
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

          {/* Details Description */}
          <div className="rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-700 border border-neutral-100">
            {selectedFertilizerModal.detailedDescription ||
              'High-performance agricultural grade fertilizer optimized for target crop nutrition.'}
          </div>

          {/* Specifications Grid */}
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

          {/* Guaranteed Nutrient Breakdown if available */}
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

          {/* Safety & Application Notes if available */}
          {selectedFertilizerModal.safetyNotes && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-neutral-800">Agronomist Tips</h4>
              <ul className="list-disc pl-4 text-xs text-neutral-600 space-y-1">
                {selectedFertilizerModal.safetyNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={() => setSelectedFertilizerModal(null)}
              className="w-full bg-[#0E3820] hover:bg-[#0A2917] text-white font-bold rounded-xl"
            >
              Close Details
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* ============================================================== */}
    {/* 6. MODAL: ADD / EDIT TRACKING RECORD                           */}
    {/* ============================================================== */}
    {isAddRecordModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsAddRecordModalOpen(false)}
          aria-hidden="true"
        />

        <form
          onSubmit={handleSaveRecord}
          className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-neutral-200 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="text-base font-bold text-[#17231A]">
              {editingRecord ? 'Edit Application Record' : 'Add Fertilizer Application'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddRecordModalOpen(false)}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold">Fertilizer Name</Label>
              <Input
                required
                placeholder="e.g. Urea or NPK 20-10-20"
                value={recordForm.fertilizer}
                onChange={(e) => setRecordForm({ ...recordForm, fertilizer: e.target.value })}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Quantity</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="300"
                  value={recordForm.quantity}
                  onChange={(e) => setRecordForm({ ...recordForm, quantity: e.target.value })}
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Unit</Label>
                <Input
                  value={recordForm.unit}
                  onChange={(e) => setRecordForm({ ...recordForm, unit: e.target.value })}
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Application Date</Label>
                <Input
                  value={recordForm.applicationDate}
                  onChange={(e) =>
                    setRecordForm({ ...recordForm, applicationDate: e.target.value })
                  }
                  placeholder="Apr 12, 2025"
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={recordForm.status}
                  onValueChange={(val: FertilizerTrackingRecord['status']) =>
                    setRecordForm({ ...recordForm, status: val })
                  }
                >
                  <SelectTrigger className="mt-1 rounded-xl text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            {editingRecord ? (
              <button
                type="button"
                onClick={() => handleDeleteRecord(editingRecord.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800"
              >
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRecordModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-[#0E3820] hover:bg-[#0A2917] text-white text-xs font-bold"
              >
                Save Record
              </Button>
            </div>
          </div>
        </form>
      </div>
    )}

    {/* ============================================================== */}
    {/* 7. FULL FARM PLAN MODAL                                        */}
    {/* ============================================================== */}
    {isFarmPlanModalOpen && (
      <FarmPlanModal
        cropDetails={cropDetails}
        farmName={farmDisplayName}
        locationLabel={farmLocation}
        area={activeCrop?.area || Number(activeFarm?.total_area) || 3}
        isOpen={isFarmPlanModalOpen}
        onClose={() => setIsFarmPlanModalOpen(false)}
      />
    )}
  </div>
)
}
