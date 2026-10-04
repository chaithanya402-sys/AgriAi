import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  cropCatalog,
  normalizeCropName,
  isModelSupportedCrop,
  cropImages,
  CatalogCropItem,
} from '@/data/cropCatalog'
import { useFarm } from '@/components/farm/FarmContext'
import {
  Sprout,
  ArrowLeft,
  CheckCircle2,
  Thermometer,
  Layers,
  Calendar,
  MapPin,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export function CropDetailPage() {
  const { cropId } = useParams<{ cropId: string }>()
  const navigate = useNavigate()
  const { farms, selectedFarmId, currentFarm, activeCrop, activateCropPlan } = useFarm()
  const [activationToast, setActivationToast] = useState<string | null>(null)

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || currentFarm || farms[0] || null

  const canonicalId = normalizeCropName(cropId || 'rice')
  const crop: CatalogCropItem = cropCatalog[canonicalId] || cropCatalog['rice']
  const isTrained = isModelSupportedCrop(canonicalId)
  const heroImage = crop.image || cropImages[canonicalId] || '/crops/ragi.jpg'

  const isActive =
    activeCrop &&
    (activeCrop.cropId === canonicalId ||
      normalizeCropName(activeCrop.cropName) === canonicalId ||
      normalizeCropName(activeCrop.rawCropName) === canonicalId)

  const handleActivate = () => {
    activateCropPlan({
      cropId: canonicalId,
      cropName: crop.displayName || crop.name,
      rawCropName: crop.name,
      cropCategory: crop.category,
      farmId: activeFarm?.id || 1,
      farmName: activeFarm?.name || 'Active Farm',
      location: activeFarm?.district || activeFarm?.village || 'Farm Field',
      state: activeFarm?.state || undefined,
      district: activeFarm?.district || undefined,
      area: activeFarm?.total_area || 4,
      nitrogen: 60,
      phosphorus: 40,
      potassium: 40,
      soilPH: 6.5,
      temperature: 26,
      humidity: 65,
      rainfall: 1000,
      cropStage: 'Vegetative (Day 31–45)',
      season: crop.seasons[0] || 'Kharif Season',
      recommendationScore: crop.matchScore,
      expectedYield: crop.benchmarkYield,
      riskLevel: crop.riskLevel,
      image: heroImage,
    })

    setActivationToast(`✓ ${crop.name} is now your active crop!`)
    setTimeout(() => {
      setActivationToast(null)
    }, 4000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-4 px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-neutral-200 shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/crop"
            className="text-xs font-bold text-[#123B22] bg-[#E8F5E9] hover:bg-[#C8E6C9] px-3 py-1.5 rounded-xl border border-[#C8E6C9] transition-colors"
          >
            All Crops Catalog
          </Link>
          <Link
            to="/dashboard/yield"
            className="text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 transition-colors"
          >
            Yield Predictor
          </Link>
        </div>
      </div>

      {/* Activation Toast Banner */}
      {activationToast && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-100 p-4 text-xs font-bold text-emerald-950 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{activationToast} Farm action plan and analytics are now synchronized.</span>
          </div>
          <Link
            to="/dashboard/action-plan"
            className="text-xs font-extrabold text-emerald-900 hover:underline"
          >
            View Action Plan →
          </Link>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Real Agricultural Photograph */}
          <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] bg-neutral-100">
            <img
              src={heroImage}
              alt={crop.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
              <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                {crop.category} • {crop.subCategory || 'Field Crop'}
              </span>
              {isActive && (
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active Crop
                </span>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8F5E9] text-[#123B22] border border-[#C8E6C9]">
                  {crop.category}
                </span>
                {isTrained ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    ML Prediction Trained
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                    Indian Catalog Crop
                  </span>
                )}
                <span className="text-xs text-neutral-400 font-semibold">
                  Canonical ID: <code className="text-neutral-700">{crop.id}</code>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#17231A] tracking-tight">
                  {crop.displayName || crop.name}
                </h1>
                {crop.aliases && crop.aliases.length > 1 && (
                  <p className="text-xs text-neutral-500 font-medium mt-1">
                    Known as: <span className="text-neutral-700 font-semibold">{crop.aliases.join(', ')}</span>
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                {crop.description ||
                  `${crop.name} is a high-value agricultural crop cultivated across major Indian states during ${crop.seasons.join(', ')}.`}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 text-center">
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Benchmark Yield</span>
                <strong className="text-sm font-extrabold text-[#17231A]">{crop.benchmarkYield} t/ha</strong>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Crop Duration</span>
                <strong className="text-sm font-extrabold text-[#17231A]">{crop.cropDuration}</strong>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Water Req.</span>
                <strong className="text-sm font-extrabold text-[#17231A]">{crop.waterRequirement}</strong>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Benchmark ROI</span>
                <strong className="text-sm font-extrabold text-emerald-700">+{crop.benchmarkROI}%</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={handleActivate}
                className="bg-[#123B22] hover:bg-[#0E2F1B] text-white font-bold rounded-xl px-5 shadow-xs"
              >
                <Sprout className="h-4 w-4 mr-2" />
                {isActive ? 'Active Crop (Re-sync)' : 'Activate Crop for Farm'}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/yield')}
                className="border-neutral-200 text-neutral-800 font-bold rounded-xl"
              >
                <TrendingUp className="h-4 w-4 mr-2 text-emerald-700" />
                Open in Yield Predictor
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/action-plan')}
                className="border-neutral-200 text-neutral-800 font-bold rounded-xl"
              >
                <Calendar className="h-4 w-4 mr-2 text-emerald-700" />
                View 7-Step Action Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Climate & Season */}
        <Card className="border border-neutral-200/90 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-neutral-900">
              <Thermometer className="h-4 w-4 text-emerald-700" />
              Climate & Growing Season
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-400 font-semibold block">Cultivation Seasons</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {crop.seasons.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-neutral-400 font-semibold block">Optimum Temp</span>
                <strong className="text-neutral-900 font-bold">
                  {crop.temperatureRange}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400 font-semibold block">Rainfall Range</span>
                <strong className="text-neutral-900 font-bold">
                  {crop.rainfallRange}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Soil & Water */}
        <Card className="border border-neutral-200/90 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-neutral-900">
              <Layers className="h-4 w-4 text-emerald-700" />
              Soil & Water Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-neutral-400 font-semibold block">Suitable Soil Types</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {crop.soilTypes.map((st) => (
                  <span key={st} className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 font-bold">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-neutral-400 font-semibold block">Optimum Soil pH</span>
                <strong className="text-neutral-900 font-bold">
                  {crop.phRange}
                </strong>
              </div>
              <div>
                <span className="text-neutral-400 font-semibold block">Water Need</span>
                <strong className="text-neutral-900 font-bold">
                  {crop.waterRequirement}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Major Producing States */}
        <Card className="border border-neutral-200/90 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-neutral-900">
              <MapPin className="h-4 w-4 text-emerald-700" />
              Major Producing Indian States
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {crop.states.map((st) => (
                <span key={st} className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-900 font-bold">
                  {st}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <span className="text-neutral-400 font-semibold block">Common Uses</span>
              <span className="text-neutral-800 font-medium mt-1 block">
                {crop.commonUses}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Economics & Financial Estimates */}
      <Card className="border border-neutral-200/90 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-neutral-900">
            <CircleDollarSign className="h-4 w-4 text-emerald-700" />
            Benchmark Economics & Farm Profit Potential
          </CardTitle>
          <CardDescription className="text-xs">
            Standard agronomic benchmark figures per hectare based on ICAR agricultural surveys in India.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium block">Benchmark Yield</span>
              <strong className="text-base font-extrabold text-[#17231A] mt-1 block">
                {crop.benchmarkYield} t/ha
              </strong>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium block">Est. Revenue</span>
              <strong className="text-base font-extrabold text-emerald-800 mt-1 block">
                ₹{crop.benchmarkRevenue.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium block">Cultivation Cost</span>
              <strong className="text-base font-extrabold text-neutral-700 mt-1 block">
                ₹{crop.benchmarkCost.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="rounded-2xl bg-[#E8F5E9]/50 p-3.5 border border-[#C8E6C9]">
              <span className="text-[11px] text-[#123B22] font-semibold block">Net Profit / ha</span>
              <strong className="text-base font-extrabold text-[#123B22] mt-1 block">
                ₹{crop.benchmarkProfit.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
              <span className="text-[11px] text-neutral-500 font-medium block">Benchmark ROI</span>
              <strong className="text-base font-extrabold text-emerald-700 mt-1 block">
                +{crop.benchmarkROI}%
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
