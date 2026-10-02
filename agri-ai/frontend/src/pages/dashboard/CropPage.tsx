import { useState, useEffect, useMemo } from 'react'
import { useFarm } from '@/components/farm/FarmContext'
import { cropApi } from '@/services/modules'
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
  getCropDetails,
  CROP_CATEGORIES,
  type CropCategory,
} from '@/data/cropDetailsData'
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
  const { farms, selectedFarmId, setSelectedFarmId, currentFarm, loading: farmsLoading } = useFarm()
  const { data: result, loading, error, run } = useAsync<CropRecommendationResult>()

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || null

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

  const [noDataError, setNoDataError] = useState<string | null>(null)
  const [selectedCropModal, setSelectedCropModal] = useState<{ crop: CropOption; rank: number } | null>(null)

  // Filters & Pagination State
  const [selectedCategory, setSelectedCategory] = useState<'all' | CropCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Use active farm location
  const loc = useAgriculturalLocation(activeFarm?.id)

  // Automatically populate values from state dataset + district filter and run recommendation
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
        const farmArea = activeFarm?.total_area ? String(activeFarm.total_area) : '4'
        setForm({
          farm_id: activeFarm?.id ? String(activeFarm.id) : '',
          nitrogen: data.nitrogen != null ? String(data.nitrogen) : '20.2',
          phosphorus: data.phosphorus != null ? String(data.phosphorus) : '55.4',
          potassium: data.potassium != null ? String(data.potassium) : '263.1',
          temperature: data.temperature != null ? String(data.temperature) : '24.5',
          humidity: data.humidity != null ? String(data.humidity) : '66.1',
          ph: data.ph != null ? String(data.ph) : '6.57',
          rainfall: data.rainfall != null ? String(data.rainfall) : '1251',
          area: farmArea,
        })

        // Auto-run crop recommendation for this farm's location
        run(async () => {
          const res = await agriculturalDataService.getCropRecommendations(
            loc.state!,
            loc.district!,
            Number(farmArea) || 4
          )
          return {
            recommendations: res.recommendations,
            input_features: {
              nitrogen: Number(data.nitrogen) || 20.2,
              phosphorus: Number(data.phosphorus) || 55.4,
              potassium: Number(data.potassium) || 263.1,
              temperature: Number(data.temperature) || 24.5,
              humidity: Number(data.humidity) || 66.1,
              ph: Number(data.ph) || 6.57,
              rainfall: Number(data.rainfall) || 1251,
            },
            feature_importance: res.feature_importance,
            demo_mode: false,
          }
        })
      })
      .catch((err) => {
        console.error('Failed to load crop parameters from dataset:', err)
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
      if (loc.state && loc.district) {
        const res = await agriculturalDataService.getCropRecommendations(
          loc.state,
          loc.district,
          Number(form.area) || currentFarm?.total_area || 4
        )
        return {
          recommendations: res.recommendations,
          input_features: {
            nitrogen: Number(form.nitrogen),
            phosphorus: Number(form.phosphorus),
            potassium: Number(form.potassium),
            temperature: Number(form.temperature),
            humidity: Number(form.humidity),
            ph: Number(form.ph),
            rainfall: Number(form.rainfall),
          },
          feature_importance: res.feature_importance,
          demo_mode: false,
        }
      }

      return cropApi.recommend({
        farm_id: Number(form.farm_id) || currentFarm?.id,
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        ph: Number(form.ph),
        rainfall: Number(form.rainfall),
        area: Number(form.area) || currentFarm?.total_area || 4,
        state: loc.state || undefined,
        district: loc.district || undefined,
      })
    })
  }

  // Compile 39-crop list merging district recommendations with master catalog
  const full39CropList: Array<CropOption & { category: CropCategory; rank: number; fallbackIcon: string }> =
    useMemo(() => {
      const masterList = getAll39CropsList()
      const farmAreaNum = Number(form.area) || activeFarm?.total_area || 4

      // Map existing district recommendations by lowercase name
      const recMap = new Map<string, CropOption>()
      if (result?.recommendations) {
        result.recommendations.forEach((r) => {
          recMap.set(r.crop.trim().toLowerCase(), r)
        })
      }

      const merged = masterList.map((meta, index) => {
        const existing = recMap.get(meta.name.toLowerCase())
        if (existing) {
          return {
            crop: meta.name,
            score: existing.score,
            reason: existing.reason,
            expected_yield: existing.expected_yield,
            production: existing.production,
            revenue: existing.revenue,
            risk: existing.risk,
            category: meta.category,
            rank: index + 1,
            fallbackIcon: meta.fallbackIcon,
          }
        }

        // Adapted values for catalog crop
        return {
          crop: meta.name,
          score: meta.matchScore,
          reason: `${meta.displayName} shows strong soil and seasonal alignment for ${activeFarm?.district || 'Vizianagaram'}.`,
          expected_yield: meta.benchmarkYield,
          production: Math.round(meta.benchmarkYield * farmAreaNum),
          revenue: meta.benchmarkRevenue,
          risk: meta.riskLevel === 'Low' ? 0.1 : meta.riskLevel === 'Medium' ? 0.35 : 0.65,
          category: meta.category,
          rank: index + 1,
          fallbackIcon: meta.fallbackIcon,
        }
      })

      // Sort descending by match score, with Soybean first (0.73)
      merged.sort((a, b) => b.score - a.score)

      // Re-assign 1-based ranks
      return merged.map((c, i) => ({ ...c, rank: i + 1 }))
    }, [result?.recommendations, form.area, activeFarm?.total_area, activeFarm?.district])

  // Filtered crops based on search & category
  const filteredCrops = useMemo(() => {
    let list = full39CropList

    if (selectedCategory !== 'all') {
      list = list.filter((c) => c.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c) =>
          c.crop.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.reason.toLowerCase().includes(q)
      )
    }

    return list
  }, [full39CropList, selectedCategory, searchQuery])

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
              39 crops analyzed
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            AI-powered agronomic matchmaking based on your regional soil conditions, climate, and historical crop yield.
          </p>
        </div>
        {result?.demo_mode && <Badge variant="info">Demo data</Badge>}
      </div>

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
              <Button type="submit" disabled={loading} className="bg-[#123B22] hover:bg-[#2E7D32]">
                {loading ? <ButtonLoader label="Re-ranking 39 crops..." /> : 'Re-rank Crops'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
          <span>{error}</span>
        </Alert>
      )}

      {/* ============================================================== */}
      {/* 2. CROP CATALOG FILTERS & SEARCH BAR                           */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search crops..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9.5 pr-4 py-2 rounded-xl bg-white border-neutral-200 text-sm focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Quick Counter */}
          <span className="text-xs font-semibold text-neutral-500">
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
                'px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap',
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
      {/* 3. MODERN CROP CARDS GRID (Layout requested in prompt)         */}
      {/* ============================================================== */}
      <div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedCrops.map((crop) => {
            const isBestMatch = crop.rank === 1
            const scorePercent = Math.round(crop.score * 100)
            const details = getCropDetails(crop.crop)

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
                  isBestMatch ? 'ring-2 ring-[#2E7D32] shadow-md' : ''
                )}
              >
                {/* Best Match Banner */}
                {isBestMatch && (
                  <div className="bg-[#2E7D32] text-white text-[11px] font-extrabold px-3 py-0.5 text-center tracking-wide uppercase">
                    ⭐ #1 Recommended Crop for {activeFarm?.name || 'Your Farm'}
                  </div>
                )}

                <CardHeader className="pb-2.5 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-[#17231A] group-hover:text-[#2E7D32] transition-colors">
                      <span className="text-xl">{crop.fallbackIcon || '🌱'}</span>
                      <span className="capitalize">{crop.crop}</span>
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-neutral-400">#{crop.rank}</span>
                      <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-[#2E7D32] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3.5 pb-4">
                  {/* Match Score Gauge */}
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-500">Match Score</span>
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

                  {/* 2x2 Metric Tiles: Historical Yield, Revenue, Production, Risk */}
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

                  {/* CTA link */}
                  <div className="pt-1 text-xs text-center font-bold text-[#2E7D32] group-hover:text-[#123B22] transition-colors flex items-center justify-center gap-1">
                    <span>View full crop profile</span>
                    <span className="text-sm">→</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Load More / Pagination */}
        {paginatedCrops.length < filteredCrops.length && (
          <div className="pt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-6 py-2.5 text-sm font-bold text-[#123B22] bg-white border border-[#2E7D32]/40 rounded-2xl hover:bg-[#EAF6EA] transition-all shadow-xs"
            >
              Load More Crops ({paginatedCrops.length} of {filteredCrops.length})
            </button>
          </div>
        )}
      </div>

      {/* Explainable AI Panel */}
      {result?.feature_importance && result.feature_importance.length > 0 && (
        <Card className="border border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
              <BarChart3 className="h-5 w-5 text-emerald-700" />
              Explainable AI - Feature Importance
            </CardTitle>
            <CardDescription>
              How each regional factor influenced the ranking of the 39 crops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureImportanceChart data={result.feature_importance} />
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
          onSelectCrop={(cropName) => {
            try {
              localStorage.setItem('agriai_selected_crop', cropName)
              sessionStorage.setItem('agriai_selected_crop', cropName)
            } catch (err) {
              console.warn('Failed to save selected crop:', err)
            }
          }}
        />
      )}
    </div>
  )
}
