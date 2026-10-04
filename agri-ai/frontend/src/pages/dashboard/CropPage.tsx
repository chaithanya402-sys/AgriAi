import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarm } from '@/components/farm/FarmContext'
import { cropApi, soilApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { useAgriculturalLocation } from '@/hooks/useAgriculturalLocation'
import { agriculturalDataService } from '@/services/agriculturalDataService'
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
import { formatNumber, formatCurrency, cn } from '@/lib/utils'
import type { CropOption, CropRecommendationResult } from '@/types'
import { CropDetailsModal } from '@/components/crop/CropDetailsModal'
import {
  getAll39CropsList,
  getAllCatalogCropsList,
  getCropDetails,
  CROP_CATEGORIES,
  type CropCategory,
} from '@/data/cropDetailsData'
import {
  normalizeCropName,
  isModelSupportedCrop,
  cropCatalog,
  cropImages,
} from '@/data/cropCatalog'
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
import {
  Sprout,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Shield,
  ChevronRight,
  Search,
  CheckCircle2,
  Wheat,
  SlidersHorizontal,
  ChevronLeft,
  LayoutGrid,
  List,
} from 'lucide-react'

import { chartColors } from '@/lib/theme'
const CHART_COLORS = chartColors

function FeatureImportanceChart({
  data,
}: {
  data: { label: string; importance: number }[]
}) {
  const sorted = [...data].sort((a, b) => b.importance - a.importance)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.neutralGrid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: chartColors.neutralText }} />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fontSize: 12, fill: chartColors.neutralText }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.white,
            border: `1px solid ${chartColors.neutralGrid}`,
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
        />
        <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
          {sorted.map((_, index) => (
            <Cell
              key={index}
              fill={index === 0 ? CHART_COLORS.deep : index === 1 ? CHART_COLORS.fresh : CHART_COLORS.freshLight}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CropPage() {
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, loading: farmsLoading, activateCropPlan, activeCrop } = useFarm()
  const { data: asyncResult, loading, error, run } = useAsync<CropRecommendationResult>()

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null
  const navigate = useNavigate()
  const [activationToast, setActivationToast] = useState<string | null>(null)

  const [form, setForm] = useState({
    farm_id: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    area: '',
  })

  // Action-driven states: Form input vs Executed result separation
  const [hasExecuted, setHasExecuted] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [executedResult, setExecutedResult] = useState<CropRecommendationResult | null>(null)
  const [submittedFingerprint, setSubmittedFingerprint] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [noDataError, setNoDataError] = useState<string | null>(null)
  const [selectedCropModal, setSelectedCropModal] = useState<{ crop: CropOption; rank: number } | null>(null)

  // Filters & Pagination State
  const [selectedCategory, setSelectedCategory] = useState<'all' | CropCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const pageSize = 12

  // Use active farm location
  const loc = useAgriculturalLocation(activeFarm?.id)

  const getInputFingerprint = (f: typeof form, farmId: string | number | undefined) => {
    return `${farmId}_${f.nitrogen}_${f.phosphorus}_${f.potassium}_${f.temperature}_${f.humidity}_${f.ph}_${f.rainfall}_${f.area}`
  }

  // Populate form values from farm soil + climate dataset WITHOUT automatically executing recommendations
  useEffect(() => {
    if (!activeFarm?.id) return

    const farmId = activeFarm.id
    console.log("FARM CHANGED:", farmId)
    console.log("FARM LOCATION:", loc.district || activeFarm.district || activeFarm.location || '')

    let isMounted = true
    setNoDataError(null)
    setValidationError(null)
    // Clear previous recommendations immediately on farm change
    setExecutedResult(null)
    setHasExecuted(false)
    setIsDirty(false)
    setSubmittedFingerprint(null)

    setFormLoading(true)
    Promise.all([
      loc.state && loc.district ? agriculturalDataService.getCropData(loc.state, loc.district).catch(() => null) : Promise.resolve(null),
      soilApi.getFarmSoil(farmId).catch(() => null),
    ]).then(([cropClimate, farmSoil]) => {
      if (!isMounted) return
      setFormLoading(false)

      if ((!cropClimate || !cropClimate.found) && (!farmSoil || !farmSoil.found)) {
        setNoDataError('No location-specific data available for this farm.')
      }

      const nitrogen = (farmSoil?.found && farmSoil.nitrogen != null)
        ? farmSoil.nitrogen
        : (cropClimate?.nitrogen != null ? cropClimate.nitrogen : 120.0)
      const phosphorus = (farmSoil?.found && farmSoil.phosphorus != null)
        ? farmSoil.phosphorus
        : (cropClimate?.phosphorus != null ? cropClimate.phosphorus : 40.0)
      const potassium = (farmSoil?.found && farmSoil.potassium != null)
        ? farmSoil.potassium
        : (cropClimate?.potassium != null ? cropClimate.potassium : 40.0)
      const ph = (farmSoil?.found && farmSoil.ph != null)
        ? farmSoil.ph
        : (cropClimate?.ph != null ? cropClimate.ph : 6.5)
      const temperature = cropClimate?.temperature != null ? cropClimate.temperature : 26.5
      const humidity = cropClimate?.humidity != null ? cropClimate.humidity : 65.0
      const rainfall = cropClimate?.rainfall != null ? cropClimate.rainfall : 1100.0
      const farmArea = activeFarm?.total_area ? String(activeFarm.total_area) : '4'

      setForm({
        farm_id: String(farmId),
        nitrogen: String(nitrogen),
        phosphorus: String(phosphorus),
        potassium: String(potassium),
        temperature: String(temperature),
        humidity: String(humidity),
        ph: String(ph),
        rainfall: String(rainfall),
        area: farmArea,
      })
    }).catch(() => {
      if (!isMounted) return
      setFormLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [loc.state, loc.district, loc.error, loc.loading, activeFarm?.id])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (hasExecuted || submittedFingerprint) {
        if (getInputFingerprint(next, activeFarm?.id) !== submittedFingerprint) {
          setIsDirty(true)
          setHasExecuted(false)
          setExecutedResult(null)
        }
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    const n = Number(form.nitrogen)
    const p = Number(form.phosphorus)
    const k = Number(form.potassium)
    const t = Number(form.temperature)
    const h = Number(form.humidity)
    const phVal = Number(form.ph)
    const r = Number(form.rainfall)
    const areaVal = Number(form.area) || activeFarm?.total_area || 4

    if ([n, p, k, t, h, phVal, r].some((v) => isNaN(v) || v < 0)) {
      setValidationError('Please enter valid non-negative numbers for all parameters.')
      return
    }
    if (phVal < 0 || phVal > 14) {
      setValidationError('Soil pH must be between 0 and 14.')
      return
    }

    const currentFingerprint = getInputFingerprint(form, activeFarm?.id)

    const res = await run(async () => {
      if (loc.state && loc.district) {
        const recs = await agriculturalDataService.getCropRecommendations(
          loc.state,
          loc.district,
          areaVal
        )
        return {
          recommendations: recs.recommendations,
          input_features: {
            nitrogen: n,
            phosphorus: p,
            potassium: k,
            temperature: t,
            humidity: h,
            ph: phVal,
            rainfall: r,
          },
          feature_importance: recs.feature_importance,
          demo_mode: false,
        }
      }

      return cropApi.recommend({
        farm_id: Number(form.farm_id) || activeFarm?.id,
        nitrogen: n,
        phosphorus: p,
        potassium: k,
        temperature: t,
        humidity: h,
        ph: phVal,
        rainfall: r,
        area: areaVal,
        state: loc.state || undefined,
        district: loc.district || undefined,
      })
    })

    if (res) {
      setExecutedResult(res)
      setHasExecuted(true)
      setIsDirty(false)
      setSubmittedFingerprint(currentFingerprint)
    }
  }

  // Compile comprehensive Indian crop catalog merging ML recommendations with master catalog
  const fullCropList: Array<
    CropOption & {
      category: CropCategory
      rank: number
      fallbackIcon: string
      image: string
      isModelRanked: boolean
      isModelSupported: boolean
      isEvaluated: boolean
    }
  > = useMemo(() => {
    const masterList = getAllCatalogCropsList()
    const farmAreaNum = Number(form.area) || activeFarm?.total_area || 4
    const isEvaluated = Boolean(hasExecuted && executedResult && !isDirty)

    // Map existing district recommendations by lowercase and canonical name
    const recMap = new Map<string, CropOption>()
    if (isEvaluated && executedResult?.recommendations) {
      executedResult.recommendations.forEach((r) => {
        recMap.set(r.crop.trim().toLowerCase(), r)
        recMap.set(normalizeCropName(r.crop), r)
      })
    }

    const merged = masterList.map((meta, index) => {
      const canonicalId = normalizeCropName(meta.name)
      const existing = isEvaluated ? (recMap.get(meta.name.toLowerCase()) || recMap.get(canonicalId)) : undefined
      const isMlRanked = Boolean(existing)
      const isSupported = isModelSupportedCrop(canonicalId)
      const canonicalImg = meta.image || cropImages[canonicalId] || '/crops/ragi.jpg'

      if (existing) {
        return {
          crop: meta.displayName || meta.name,
          score: existing.score,
          reason: existing.reason,
          expected_yield: existing.expected_yield,
          production: existing.production,
          revenue: existing.revenue,
          risk: existing.risk,
          category: meta.category,
          rank: index + 1,
          fallbackIcon: meta.fallbackIcon,
          image: canonicalImg,
          isModelRanked: true,
          isModelSupported: true,
          isEvaluated: true,
        }
      }

      // Values for catalog crop
      return {
        crop: meta.displayName || meta.name,
        score: meta.matchScore || 0.75,
        reason: `${meta.displayName} shows strong soil and seasonal alignment for Indian agriculture.`,
        expected_yield: meta.benchmarkYield,
        production: Math.round(meta.benchmarkYield * farmAreaNum),
        revenue: meta.benchmarkRevenue,
        risk: meta.riskLevel === 'Low' ? 0.1 : meta.riskLevel === 'Medium' ? 0.35 : 0.65,
        category: meta.category,
        rank: index + 1,
        fallbackIcon: meta.fallbackIcon,
        image: canonicalImg,
        isModelRanked: false,
        isModelSupported: isSupported,
        isEvaluated: false,
      }
    })

    // If evaluated with ML recommendation results, sort descending by match score
    if (isEvaluated) {
      merged.sort((a, b) => b.score - a.score)
    }

    // Re-assign 1-based ranks
    return merged.map((c, i) => ({ ...c, rank: i + 1 }))
  }, [hasExecuted, executedResult, isDirty, form.area, activeFarm?.total_area, activeFarm?.district])

  // Filtered crops based on search & category
  const filteredCrops = useMemo(() => {
    let list = fullCropList

    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((c) => {
        const canonicalId = normalizeCropName(c.crop)
        const catalogItem = cropCatalog[canonicalId]
        const aliasMatch = catalogItem?.aliases?.some((a) => a.toLowerCase().includes(q))
        const subCatMatch = catalogItem?.subCategory?.toLowerCase().includes(q)
        return (
          c.crop.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.reason.toLowerCase().includes(q) ||
          aliasMatch ||
          subCatMatch
        )
      })
    }

    return list
  }, [fullCropList, selectedCategory, searchQuery])

  // Paginated crops
  const totalPages = Math.ceil(filteredCrops.length / pageSize) || 1
  const paginatedCrops = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCrops.slice(0, start + pageSize)
  }, [filteredCrops, currentPage, pageSize])

  if (farmsLoading) return <PageLoader />

  if (!farms.length) {
    return (
      <EmptyState
        title="No farms found"
        description="Create a farm first to get crop recommendations."
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
      {/* Header: Title & Subtitle with 39 crops badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A] tracking-tight">
              Crop Recommendations
            </h1>
            <span className="px-3 py-1 text-xs font-bold bg-[#EAF6EA] text-[#2E7D32] rounded-full border border-[#2E7D32]/20">
              {fullCropList.length > 0 ? `${fullCropList.length} crops analyzed` : 'Indian Crop Catalog'}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            AI-powered agronomic matchmaking based on your regional soil conditions, climate, and historical crop yield.
          </p>
        </div>
        {executedResult?.demo_mode && <Badge variant="info">Demo data</Badge>}
      </div>

      {/* Activation confirmation toast banner */}
      {activationToast && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-100/90 p-4 text-xs font-bold text-emerald-950 flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">{activationToast}</p>
            <p className="text-xs text-emerald-800 font-medium">
              Action Plan has been synchronized for your active farm.
            </p>
          </div>
        </div>
      )}

      {/* Input Parameters Form (Collapsible/Card) */}
      <Card className="border border-neutral-200/90 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <Sprout className="h-5 w-5 text-[#2E7D32]" />
            Farm Soil & Climate Parameters
          </CardTitle>
          <CardDescription>
            Auto-populated from {loc.district ? `${loc.district}, ${loc.state}` : 'your farm location'}. You can adjust any parameter to simulate crop results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Farm Selection</Label>
                <Select
                  value={selectedFarmId?.toString() || activeFarm?.id?.toString() || ''}
                  onValueChange={(v) => {
                    const id = Number(v)
                    setSelectedFarmId(id)
                    setExecutedResult(null)
                    setHasExecuted(false)
                    setIsDirty(false)
                    setSubmittedFingerprint(null)
                    setValidationError(null)
                    handleChange('farm_id', v)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id.toString()}>
                        {farm.name}
                        {farm.district && farm.state ? ` (${farm.district}, ${farm.state})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Nitrogen (N) kg/ha</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 20.2"
                  value={form.nitrogen}
                  onChange={(e) => handleChange('nitrogen', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Phosphorus (P) kg/ha</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 55.4"
                  value={form.phosphorus}
                  onChange={(e) => handleChange('phosphorus', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Potassium (K) kg/ha</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 263.1"
                  value={form.potassium}
                  onChange={(e) => handleChange('potassium', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 24.5"
                  value={form.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Humidity (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 66.1"
                  value={form.humidity}
                  onChange={(e) => handleChange('humidity', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Soil pH</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6.57"
                  value={form.ph}
                  onChange={(e) => handleChange('ph', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Rainfall (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1251"
                  value={form.rainfall}
                  onChange={(e) => handleChange('rainfall', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={loading || formLoading} className="bg-[#123B22] hover:bg-[#2E7D32]">
                {loading ? (
                  <ButtonLoader label="Analyzing crop suitability..." />
                ) : hasExecuted && !isDirty ? (
                  'Re-rank Crops'
                ) : (
                  'Recommend & Rank Crops'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stale Parameters Alert */}
      {isDirty && (
        <Alert variant="warning" className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <span>Parameters changed. Click &quot;Re-rank Crops&quot; to evaluate new suitability scores.</span>
        </Alert>
      )}

      {/* Validation Error */}
      {validationError && (
        <Alert variant="danger">
          <AlertTriangle className="h-4 w-4" />
          <span>{validationError}</span>
        </Alert>
      )}

      {/* No Data / Location Alert */}
      {noDataError && !error && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <span>{noDataError}</span>
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertTriangle className="h-4 w-4" />
          <span>{error || 'Unable to generate crop recommendations. Please check the parameters and try again.'}</span>
        </Alert>
      )}

      {/* ============================================================== */}
      {/* 2. CROP CATALOG CONTROLS, SEARCH, AND VIEW TOGGLE               */}
      {/* ============================================================== */}
      <div className="space-y-4">
        {/* Status / Mode Announcement Banner */}
        {hasExecuted && executedResult && !isDirty ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span className="font-bold">
                AI Matchmaking Active for {activeFarm?.name || 'Selected Farm'}: Showing {filteredCrops.length} ranked crops based on soil &amp; climate parameters.
              </span>
            </div>
            <span className="text-emerald-700 font-semibold shrink-0">
              Sorted by Suitability Score (High → Low)
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-neutral-50 border border-neutral-200/90 rounded-2xl text-xs text-neutral-700 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-[#2E7D32] shrink-0" />
              <span className="font-bold">
                Indian Crop Catalog ({fullCropList.length} crops): Browsing all supported crops across India.
              </span>
            </div>
            <span className="text-neutral-500 shrink-0">
              Click <strong>&quot;Recommend &amp; Rank Crops&quot;</strong> above to calculate AI suitability for your farm.
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search 130+ crops..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9.5 pr-4 py-2 rounded-xl bg-white border-neutral-200 text-sm focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-[#123B22] text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List View"
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-[#123B22] text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>

          {/* Quick Counter */}
          <span className="text-xs font-semibold text-neutral-500 shrink-0">
            Showing {paginatedCrops.length} of {filteredCrops.length} crops
          </span>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.key)
                setCurrentPage(1)
              }}
              className={cn(
                'px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer',
                selectedCategory === cat.key
                  ? 'bg-[#123B22] text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/90 hover:bg-neutral-50'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CROP LIST (LIST TABLE OR CARDS GRID)                         */}
      {/* ============================================================== */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider border-b border-neutral-200">
              <tr>
                <th className="py-3.5 px-4">Crop</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Season &amp; Duration</th>
                <th className="py-3.5 px-3">Water &amp; Soil</th>
                <th className="py-3.5 px-3">Expected Yield</th>
                <th className="py-3.5 px-3">
                  {hasExecuted && executedResult && !isDirty ? 'AI Match' : 'Suitability'}
                </th>
                <th className="py-3.5 px-3">Risk</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {paginatedCrops.map((crop) => {
                const isEvaluated = hasExecuted && executedResult && !isDirty
                const isBestMatch = isEvaluated && crop.rank === 1
                const scorePercent = Math.round(crop.score * 100)
                const details = getCropDetails(crop.crop)
                const catalogItem = cropCatalog[normalizeCropName(crop.crop)]
                const cleanCrop = crop.crop.toLowerCase().trim()
                const isActive =
                  Boolean(activeCrop) &&
                  (activeCrop?.rawCropName?.toLowerCase() === cleanCrop ||
                    activeCrop?.cropName?.toLowerCase().includes(cleanCrop) ||
                    cleanCrop.includes(activeCrop?.rawCropName?.toLowerCase() || '___'))

                return (
                  <tr
                    key={crop.crop}
                    onClick={() => setSelectedCropModal({ crop, rank: crop.rank })}
                    className={cn(
                      'group hover:bg-emerald-50/40 transition-colors cursor-pointer',
                      isActive ? 'bg-emerald-50/20' : ''
                    )}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-neutral-200 shadow-2xs bg-emerald-50">
                          <img
                            src={crop.image}
                            alt={crop.crop}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[#17231A] group-hover:text-[#2E7D32] transition-colors truncate">
                              {crop.crop}
                            </span>
                            {isBestMatch && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                                #1 Best
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-700 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          {catalogItem?.aliases?.[0] && (
                            <span className="text-[11px] text-neutral-400 block truncate">
                              {catalogItem.aliases[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                        {crop.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-xs">
                        <span className="font-semibold text-neutral-800 block">
                          {details.climateRequirements?.season || 'Kharif / Rabi'}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {details.farmingRequirements?.cropDuration || '90–120 days'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-xs">
                        <span className="font-semibold text-neutral-800 block">
                          {details.climateRequirements?.waterRequirement || 'Medium (500–700 mm)'}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {details.soilRequirements?.soilType || 'Loam / Clay Loam'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-xs">
                        <span className="font-extrabold text-[#17231A] block">
                          {crop.expected_yield} t/ha
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {formatCurrency(crop.revenue)}/ha
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isEvaluated ? (
                        <div className="min-w-[90px]">
                          <div className="flex items-center justify-between text-xs font-extrabold mb-1">
                            <span className={scorePercent >= 70 ? 'text-[#2E7D32]' : scorePercent >= 60 ? 'text-emerald-600' : 'text-amber-600'}>
                              {scorePercent}%
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">#{crop.rank}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                scorePercent >= 70 ? 'bg-[#2E7D32]' : scorePercent >= 60 ? 'bg-emerald-500' : 'bg-amber-500'
                              )}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-200">
                          Catalog
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full inline-block',
                          crop.risk <= 0.3
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : crop.risk <= 0.6
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        )}
                      >
                        {crop.risk <= 0.3 ? 'Low' : crop.risk <= 0.6 ? 'Medium' : 'High'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedCropModal({ crop, rank: crop.rank })}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-neutral-600 hover:text-[#2E7D32] hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivateCrop(crop.crop)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF6EA] hover:bg-[#123B22] text-[#2E7D32] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Sprout className="h-3 w-3" />
                            <span>Activate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCrops.map((crop) => {
              const isEvaluated = hasExecuted && executedResult && !isDirty
              const isBestMatch = isEvaluated && crop.rank === 1
              const scorePercent = Math.round(crop.score * 100)
              const details = getCropDetails(crop.crop)
              const cleanCrop = crop.crop.toLowerCase().trim()
              const isActive =
                Boolean(activeCrop) &&
                (activeCrop?.rawCropName?.toLowerCase() === cleanCrop ||
                  activeCrop?.cropName?.toLowerCase().includes(cleanCrop) ||
                  cleanCrop.includes(activeCrop?.rawCropName?.toLowerCase() || '___'))

              return (
                <Card
                  key={crop.crop}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCropModal({ crop, rank: crop.rank })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedCropModal({ crop, rank: crop.rank })
                    }
                  }}
                  className={cn(
                    'group cursor-pointer rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-[#2E7D32]/50 select-none bg-white border border-neutral-200 relative overflow-hidden',
                    isActive
                      ? 'ring-2 ring-emerald-600 bg-emerald-50/15 shadow-md'
                      : isBestMatch
                      ? 'ring-2 ring-[#2E7D32] shadow-md'
                      : ''
                  )}
                >
                  {/* Active Crop Banner or Best Match Banner */}
                  {isActive ? (
                    <div className="bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-0.5 text-center tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Active Crop for {activeFarm?.name || 'Your Farm'}</span>
                    </div>
                  ) : isBestMatch ? (
                    <div className="bg-[#2E7D32] text-white text-[11px] font-extrabold px-3 py-0.5 text-center tracking-wide uppercase">
                      ⭐ #1 Recommended Crop for {activeFarm?.name || 'Your Farm'}
                    </div>
                  ) : null}

                  <CardHeader className="pb-2.5 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-neutral-200 shadow-2xs bg-emerald-50">
                          <img
                            src={crop.image}
                            alt={crop.crop}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg font-extrabold text-[#17231A] group-hover:text-[#2E7D32] transition-colors truncate">
                            {crop.crop}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-semibold text-neutral-400">
                              {crop.category}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span
                              className={cn(
                                'text-[10px] font-bold px-1.5 py-0.2 rounded-md',
                                crop.isModelRanked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-100 text-neutral-600'
                              )}
                            >
                              {crop.isModelRanked ? 'ML Ranked' : 'Catalog Crop'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-neutral-400">#{crop.rank}</span>
                        <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-[#2E7D32] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3.5 pb-4">
                    {/* Match Score Gauge or Catalog Suitability */}
                    {isEvaluated ? (
                      <div>
                        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                          <span className="text-neutral-500">AI Match Score</span>
                          <span className="font-extrabold text-[#17231A]">{scorePercent}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              scorePercent >= 70
                                ? 'bg-[#2E7D32]'
                                : scorePercent >= 60
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            )}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs bg-neutral-50/80 border border-neutral-100 rounded-xl px-3 py-2">
                        <span className="text-neutral-500 font-medium">AI Suitability</span>
                        <span className="font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-md border border-neutral-200/80 text-[11px]">
                          Click Recommend to Rank
                        </span>
                      </div>
                    )}

                    {/* 2x2 Metric Tiles */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="rounded-xl bg-neutral-50/80 p-2.5 text-center group-hover:bg-[#EAF6EA]/40 transition-colors border border-neutral-100">
                        <p className="text-[11px] text-neutral-500">Expected Yield</p>
                        <p className="text-sm font-extrabold text-[#17231A] mt-0.5">
                          {formatNumber(crop.expected_yield)} t/ha
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50/80 p-2.5 text-center group-hover:bg-[#EAF6EA]/40 transition-colors border border-neutral-100">
                        <p className="text-[11px] text-neutral-500">Revenue</p>
                        <p className="text-sm font-extrabold text-[#17231A] mt-0.5">
                          {formatCurrency(crop.revenue)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50/80 p-2.5 text-center group-hover:bg-[#EAF6EA]/40 transition-colors border border-neutral-100">
                        <p className="text-[11px] text-neutral-500">Production</p>
                        <p className="text-sm font-extrabold text-[#17231A] mt-0.5">
                          {formatNumber(crop.production)} t
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50/80 p-2.5 text-center group-hover:bg-[#EAF6EA]/40 transition-colors border border-neutral-100">
                        <p className="text-[11px] text-neutral-500">Risk</p>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Shield className="h-3 w-3 text-[#2E7D32]" />
                          <span
                            className={`text-sm font-extrabold ${
                              crop.risk <= 0.3
                                ? 'text-[#2E7D32]'
                                : crop.risk <= 0.6
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {crop.risk <= 0.3 ? 'Low' : crop.risk <= 0.6 ? 'Medium' : 'High'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA link and Quick Activate Crop Button */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/dashboard/crop/${normalizeCropName(crop.crop)}`)
                        }}
                        className="text-xs font-bold text-neutral-500 hover:text-[#2E7D32] transition-colors cursor-pointer"
                      >
                        View full profile →
                      </button>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivateCrop(crop.crop)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active Crop</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivateCrop(crop.crop)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF6EA] hover:bg-[#123B22] text-[#2E7D32] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Sprout className="h-3.5 w-3.5" />
                          <span>Activate Crop</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Load More / Pagination */}
      {paginatedCrops.length < filteredCrops.length && (
        <div className="pt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-6 py-2.5 text-sm font-bold text-[#123B22] bg-white border border-[#2E7D32]/40 rounded-2xl hover:bg-[#EAF6EA] transition-all shadow-xs cursor-pointer"
          >
            Load More Crops ({paginatedCrops.length} of {filteredCrops.length})
          </button>
        </div>
      )}

      {/* Explainable AI Panel */}
      {hasExecuted && executedResult && !isDirty && executedResult?.feature_importance && executedResult.feature_importance.length > 0 && (
        <Card className="border border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
              <BarChart3 className="h-5 w-5 text-emerald-700" />
              Explainable AI - Feature Importance
            </CardTitle>
            <CardDescription>
              How each regional factor influenced the ranking of the crops for {activeFarm?.name || 'your farm'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureImportanceChart data={executedResult.feature_importance} />
          </CardContent>
        </Card>
      )}

      {/* Redesigned Crop Details Modal */}
      {selectedCropModal && (
        <CropDetailsModal
          crop={selectedCropModal.crop}
          rank={selectedCropModal.rank}
          isBestMatch={selectedCropModal.rank === 1}
          isOpen={Boolean(selectedCropModal)}
          onClose={() => setSelectedCropModal(null)}
          farm={activeFarm}
          location={{
            state: loc.state,
            district: loc.district,
            village: activeFarm?.village,
          }}
          inputFeatures={{
            nitrogen: Number(form.nitrogen) || 20.2,
            phosphorus: Number(form.phosphorus) || 55.4,
            potassium: Number(form.potassium) || 263.1,
            temperature: Number(form.temperature) || 24.5,
            humidity: Number(form.humidity) || 66.1,
            ph: Number(form.ph) || 6.57,
            rainfall: Number(form.rainfall) || 1251,
            area: Number(form.area) || 4,
          }}
          onSelectCrop={(cropName) => handleActivateCrop(cropName)}
        />
      )}
    </div>
  )

  function handleActivateCrop(cropName: string) {
    const raw = cropName.includes('/') ? cropName.split('/')[0].trim() : cropName
    const details = getCropDetails(raw)
    const matchingCrop = fullCropList.find(
      (c) => c.crop.trim().toLowerCase() === cropName.trim().toLowerCase()
    )

    const activated = activateCropPlan({
      cropName: details.displayName || cropName,
      rawCropName: raw,
      cropCategory: details.category || 'Cereals',
      farmId: activeFarm?.id || 1,
      farmName: activeFarm?.name || 'Kharif Farm',
      location: loc.district || activeFarm?.district || activeFarm?.village || 'Nellore',
      state: loc.state || activeFarm?.state || undefined,
      district: loc.district || activeFarm?.district || undefined,
      area: Number(form.area) || activeFarm?.total_area || 4,
      nitrogen: Number(form.nitrogen) || 60,
      phosphorus: Number(form.phosphorus) || 40,
      potassium: Number(form.potassium) || 40,
      soilPH: Number(form.ph) || 6.5,
      temperature: Number(form.temperature) || 24.5,
      humidity: Number(form.humidity) || 66.1,
      rainfall: Number(form.rainfall) || 1251,
      cropStage: 'Vegetative (Day 31–45)',
      season: details.climateRequirements?.season || 'Kharif Season',
      recommendationScore: matchingCrop?.score || details.matchScore,
      expectedYield: matchingCrop?.expected_yield || details.benchmarkYield,
      riskLevel: matchingCrop?.risk && matchingCrop.risk <= 0.35 ? 'Low' : details.riskLevel,
      image: details.image,
    })

    setActivationToast(`✓ ${activated.cropName} — Active Crop`)
    setTimeout(() => {
      setActivationToast(null)
    }, 4000)
  }
}
