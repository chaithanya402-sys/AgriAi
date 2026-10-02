import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Droplets,
  Bug,
  Wheat,
  TrendingUp,
  Download,
  Share2,
  HelpCircle,
  MapPin,
  Maximize2,
  Target,
  FileText,
  AlertCircle,
  Sprout,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Info,
} from 'lucide-react'
import type { CropDetailInfo } from '@/data/cropDetailsData'
import { useFarm } from '@/components/farm/FarmContext'

export interface FarmPlanContentProps {
  cropDetails: CropDetailInfo
  farmName: string
  locationLabel: string
  area: number
  onBack?: () => void
  isModal?: boolean
}

interface ActionTask {
  id: string
  name: string
  spec: string
  description: string
  why: string
}

interface PlanStep {
  id: number
  title: string
  timeframe: string
  stage: string
  icon: any
  summary: string
  insight: string
  recommendedWindow: string
  tasks: ActionTask[]
}

export function FarmPlanContent({
  cropDetails,
  farmName,
  locationLabel,
  area,
  onBack,
  isModal = false,
}: FarmPlanContentProps) {
  const { activateCropPlan, currentFarm } = useFarm()
  const [activeStepId, setActiveStepId] = useState<number>(1)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [activeWhyTaskId, setActiveWhyTaskId] = useState<string | null>(null)
  const [isPlanActivated, setIsPlanActivated] = useState<boolean>(false)
  const [showActivatedToast, setShowActivatedToast] = useState<boolean>(false)

  // 7-step roadmap aligned with agronomic lifecycle
  const steps: PlanStep[] = [
    {
      id: 1,
      title: 'Prepare Soil',
      timeframe: 'Day 1–10',
      stage: 'Pre-sowing',
      icon: Layers,
      summary:
        'Deep summer ploughing to 20–25 cm followed by 2 passes of harrow. Apply organic manure to achieve optimal tilth.',
      insight:
        'Your current priority is soil preparation. Based on your crop, farm area, and soil conditions, complete soil preparation before moving to the sowing stage.',
      recommendedWindow: '1–10 days',
      tasks: [
        {
          id: '1-1',
          name: 'Deep ploughing',
          spec: '20–25 cm',
          description: 'Loosen the soil and improve aeration and root growth.',
          why: 'Deep summer ploughing exposes dormant weed seeds, soil-borne fungi, and pest pupae to direct summer sunlight.',
        },
        {
          id: '1-2',
          name: 'Apply FYM/compost',
          spec: '4–5 t/ha',
          description: `Incorporate 4–5 tonnes of well-decomposed FYM or compost per hectare for ${cropDetails.displayName}.`,
          why: 'Improves soil organic carbon, moisture retention capacity, and stimulates microbial biodiversity in root zone.',
        },
        {
          id: '1-3',
          name: 'Test soil pH',
          spec: `Target ${cropDetails.soilRequirements.phRange}`,
          description: `Test and adjust soil pH to recommended range (${cropDetails.soilRequirements.phRange}).`,
          why: 'Optimal pH ensures maximum bioavailability of nitrogen, phosphorus, and micro-nutrients without aluminum toxicity.',
        },
        {
          id: '1-4',
          name: 'Level the field',
          spec: 'Prevent waterlogging',
          description: 'Prevents water stagnation in low spots and ensures uniform seedbed germination.',
          why: 'Standing water for over 24 hours causes hypoxia and seed rot during early emergence.',
        },
      ],
    },
    {
      id: 2,
      title: 'Seed Treatment',
      timeframe: 'Day 11–12',
      stage: 'Pre-sowing',
      icon: Sparkles,
      summary:
        'Coat certified seeds with biofertilizer and biological seed-dressing 30 minutes before drilling into moist soil.',
      insight:
        'Biofertilizer inoculation provides early nitrogen fixation and phosphorus solubilization, reducing upfront chemical fertilizer cost by up to 25%.',
      recommendedWindow: '11–12 days',
      tasks: [
        {
          id: '2-1',
          name: 'Rhizobium + PSB Inoculation',
          spec: '250 g/10 kg seed',
          description: 'Inoculate seeds with Rhizobium culture and Phosphate Solubilizing Bacteria.',
          why: 'Enables symbiotic biological nitrogen fixation and converts soil-bound phosphorus into plant-absorbable orthophosphate.',
        },
        {
          id: '2-2',
          name: 'Fungicidal Seed Dressing',
          spec: 'Trichoderma @ 5g/kg',
          description: 'Coat seeds with biological Trichoderma viride or approved fungicide.',
          why: 'Protects delicate cotyledons from collar rot, damping-off, and seed-borne fungal infections.',
        },
        {
          id: '2-3',
          name: 'Germination Viability Check',
          spec: '≥70% Certified',
          description: 'Ensure seed lot has tested germination rate exceeding 70% before field sowing.',
          why: 'High-viability seed stands establish uniform canopy and outcompete early weeds naturally.',
        },
      ],
    },
    {
      id: 3,
      title: 'Sowing',
      timeframe: 'Day 13–15',
      stage: 'Sowing Window',
      icon: Calendar,
      summary: `Sow certified seeds at uniform 3–4 cm depth using seed-drill when topsoil has adequate monsoon moisture.`,
      insight:
        `Optimal sowing for ${cropDetails.displayName} occurs during: ${cropDetails.farmingRequirements.sowingPeriod}. Sowing after early monsoon showers ensures robust seedling stand.`,
      recommendedWindow: '13–15 days',
      tasks: [
        {
          id: '3-1',
          name: 'Optimal Sowing Window',
          spec: cropDetails.farmingRequirements.sowingPeriod || 'Timely Kharif',
          description: `Complete sowing within recommended window (${cropDetails.farmingRequirements.sowingPeriod}).`,
          why: 'Early uniform sowing avoids peak stem fly attacks and matches flowering with favorable photoperiods.',
        },
        {
          id: '3-2',
          name: 'Precision Row Spacing',
          spec: '45 cm × 10 cm',
          description: 'Maintain 45 cm between rows and 7–10 cm between plants for ideal canopy expansion.',
          why: 'Optimal plant density prevents intra-crop light competition while ensuring adequate ventilation.',
        },
        {
          id: '3-3',
          name: 'Seeding Depth Control',
          spec: '3–4 cm depth',
          description: 'Place seeds at 3–4 cm into moist soil bed; avoid sowing deeper than 5 cm.',
          why: 'Excess planting depth delays seedling emergence and weakens vigor before first true leaf expansion.',
        },
      ],
    },
    {
      id: 4,
      title: 'Irrigation',
      timeframe: 'Day 16–30',
      stage: 'Vegetative Phase',
      icon: Droplets,
      summary:
        'Manage irrigation schedule across vegetative and flowering stages to eliminate moisture stress.',
      insight:
        `Irrigation system: ${cropDetails.farmingRequirements.irrigationRequirement}. Moisture stress during critical flower bud emergence drops overall yield by up to 40%.`,
      recommendedWindow: '16–30 days',
      tasks: [
        {
          id: '4-1',
          name: 'Moisture Regime Setup',
          spec: cropDetails.farmingRequirements.irrigationRequirement || 'Available',
          description: `Regulate irrigation tailored to ${cropDetails.farmingRequirements.waterSourceSuitability || 'canal/tube-well'}.`,
          why: 'Legumes require consistent root-zone moisture without saturating surface soil.',
        },
        {
          id: '4-2',
          name: 'Critical Flower Initiation Watering',
          spec: 'Day 30–35',
          description: 'Provide critical irrigation when floral buds start forming across branches.',
          why: 'Floral initiation is the most drought-sensitive stage; moisture stress triggers heavy flower abortion.',
        },
        {
          id: '4-3',
          name: 'Drainage Furrow Clearance',
          spec: 'Clear excess runoff',
          description: 'Ensure drainage furrows are unblocked to prevent standing water during rains.',
          why: 'Water stagnation for >24 hours suffocates root nodules and inhibits active nitrogenase enzymes.',
        },
      ],
    },
    {
      id: 5,
      title: 'Fertilization',
      timeframe: 'Day 31–45',
      stage: 'Nutrient Boost',
      icon: Wheat,
      summary:
        'Apply balanced basal and top-dressing nutrients along with secondary micronutrient sprays.',
      insight:
        `Recommended basal dose: ${cropDetails.farmingRequirements.fertilizerRecommendation}. Supplement with zinc and sulphur to maximize bean oil content and protein formation.`,
      recommendedWindow: '31–45 days',
      tasks: [
        {
          id: '5-1',
          name: 'Basal / Top-dress Nutrition',
          spec: cropDetails.farmingRequirements.fertilizerRecommendation || '20:60:40 NPK kg/ha',
          description: `Dose: ${cropDetails.farmingRequirements.fertilizerQuantity || 'Standard NPK recommendation'}.`,
          why: 'Phosphorus in root zone stimulates continuous nodulation and root branching.',
        },
        {
          id: '5-2',
          name: 'Sulphur & Zinc Enrichment',
          spec: 'ZnSO4 @ 25 kg/ha',
          description: 'Incorporate Sulphur and Zinc Sulphate to correct common regional soil deficiencies.',
          why: 'Sulphur directly increases seed oil synthesis and protein content in legume grains.',
        },
        {
          id: '5-3',
          name: 'Inter-cultivation & Weed Removal',
          spec: 'Day 30–35',
          description: 'Perform light mechanical hoeing or hand weeding to keep crop weed-free.',
          why: 'Removing weeds before canopy closure prevents nutrient theft and hosts for insect vectors.',
        },
      ],
    },
    {
      id: 6,
      title: 'Crop Protection',
      timeframe: 'Day 46–70',
      stage: 'Pod Development',
      icon: Bug,
      summary:
        'Monitor weekly for stem flies, rust, and pod borers using IPM traps and targeted bio-pesticides.',
      insight:
        'Deploy yellow sticky and pheromone traps at 4–5 units/ha to detect insect flushes before pest population surpasses economic threshold levels.',
      recommendedWindow: '46–70 days',
      tasks: [
        {
          id: '6-1',
          name: 'IPM Sticky & Pheromone Traps',
          spec: '4–5 traps/ha',
          description: 'Install yellow sticky cards and pheromone traps across the farm perimeter.',
          why: 'Allows immediate detection of whiteflies and stem borers before disease transmission occurs.',
        },
        {
          id: '6-2',
          name: 'Preventive Neem Bio-pesticide',
          spec: '1500 ppm @ 5 ml/L',
          description: 'Apply neem-based azadirachtin formulation preventively during humid spells.',
          why: 'Repels chewing caterpillars and deters pest oviposition without affecting bees or pollinators.',
        },
        {
          id: '6-3',
          name: 'Foliar Disease Scouting',
          spec: 'Weekly inspection',
          description: 'Inspect lower leaf surfaces for early rust pustules, cercospora spots, or yellow mosaic.',
          why: 'Early localized spot treatment prevents rapid spore dispersal across the 20 ha canopy.',
        },
      ],
    },
    {
      id: 7,
      title: 'Harvest',
      timeframe: 'Day 71–100',
      stage: 'Maturity & Storage',
      icon: TrendingUp,
      summary:
        'Harvest when 90% of pods turn golden brown and leaves defoliate. Sun-dry grains to 12–14% safe moisture.',
      insight:
        `Target harvest window: ${cropDetails.farmingRequirements.harvestPeriod}. Early morning harvest prevents shattering loss and preserves grain grade quality.`,
      recommendedWindow: '71–100 days',
      tasks: [
        {
          id: '7-1',
          name: 'Maturity Assessment',
          spec: '90% leaf drop',
          description: 'Initiate harvest when leaves turn yellow and drop, and pods rattle when gently shaken.',
          why: 'Harvesting at exact physiological maturity prevents pod shattering and shrinkage.',
        },
        {
          id: '7-2',
          name: 'Morning Field Harvesting',
          spec: '7:00–10:00 AM',
          description: 'Harvest plants in morning when ambient moisture keeps pod husks pliable.',
          why: 'Reduces mechanical shattering losses by up to 15% compared to hot afternoon cutting.',
        },
        {
          id: '7-3',
          name: 'Tarpaulin Sun-Drying',
          spec: '12–14% moisture',
          description: 'Sun-dry threshed beans on clean tarpaulins for 2–3 days before bagging.',
          why: 'Prevents aflatoxin contamination and ensures produce qualifies for FAQ Grade at APMC mandis.',
        },
      ],
    },
  ]

  const totalTasks = steps.reduce((acc, step) => acc + step.tasks.length, 0)
  const progressPercent = Math.round((completedTaskIds.length / totalTasks) * 100)

  // Steps considered completed if all their tasks are checked
  const completedStepIds = steps
    .filter((step) => step.tasks.every((t) => completedTaskIds.includes(t.id)))
    .map((s) => s.id)

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0]

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  const toggleAllTasksInStep = (step: PlanStep) => {
    const stepTaskIds = step.tasks.map((t) => t.id)
    const allChecked = stepTaskIds.every((id) => completedTaskIds.includes(id))

    if (allChecked) {
      setCompletedTaskIds((prev) => prev.filter((id) => !stepTaskIds.includes(id)))
    } else {
      setCompletedTaskIds((prev) => Array.from(new Set([...prev, ...stepTaskIds])))
    }
  }

  const handleActivatePlan = () => {
    setIsPlanActivated(true)
    setShowActivatedToast(true)
    setTimeout(() => setShowActivatedToast(false), 3500)

    const raw = cropDetails.name
    activateCropPlan({
      cropName: cropDetails.displayName,
      rawCropName: raw,
      farmId: currentFarm?.id || 1,
      farmName: farmName || currentFarm?.name || 'Kharif Farm',
      location: locationLabel || currentFarm?.district || currentFarm?.village || 'Nellore',
      area: area || Number(currentFarm?.total_area) || 4,
      image: cropDetails.image,
      cropStage: 'Vegetative (Day 31–45)',
      season: cropDetails.climateRequirements?.season || 'Kharif Season',
      expectedYield: cropDetails.benchmarkYield,
      riskLevel: cropDetails.riskLevel,
    })
  }

  const formatProfit = (val: number) => {
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`
    }
    if (val >= 100000) {
      return `₹ ${(val / 100000).toFixed(1)}L`
    }
    return `₹ ${val.toLocaleString('en-IN')}`
  }

  return (
    <div className="w-full bg-[#F8FBF6] text-[#17231A] font-sans antialiased">
      {/* ── Top Navigation & Header ───────────────────────── */}
      <div className="border-b border-[#DCE8DE] bg-white/80 backdrop-blur-xs px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#17231A] hover:text-[#16803C] transition-colors px-3 py-1.5 rounded-xl border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Crop Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold text-[#66736A]">
              <Sprout className="h-4 w-4 text-[#16803C]" />
              <span>AgriAI Agronomic Protocol</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#DCE8DE] text-xs font-bold text-[#16803C]">
            <span>🌱</span>
            <span>{cropDetails.displayName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Title Banner Section ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#16803C]">
                AI Farm Action Plan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A] tracking-tight">
                {cropDetails.displayName} Farm
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#66736A]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#16803C]" />
                  <strong className="text-[#17231A]">{locationLabel || farmName || 'Vizianagaram'}</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5 text-[#16803C]" />
                  <span>{area} ha</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#16803C]" />
                  <span>{cropDetails.climateRequirements.season || 'Kharif Season'}</span>
                </span>
              </div>
              <p className="pt-1 text-sm font-medium text-[#17231A] leading-relaxed">
                A 7-step agronomic roadmap from soil preparation to harvest.
              </p>
            </div>

            {/* Thumbnail graphic */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="h-20 w-28 rounded-xl overflow-hidden border border-[#DCE8DE] bg-[#E8F5E9] shadow-2xs relative">
                {cropDetails.image ? (
                  <img
                    src={cropDetails.image}
                    alt={cropDetails.displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-[#E8F5E9]/80 text-[#16803C] text-2xl font-bold">
                  🌱
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 KPI Dashboard Metric Cards ──────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Steps */}
          <div className="bg-white rounded-2xl border border-[#DCE8DE] p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#16803C]">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-[#17231A] leading-none">7</div>
              <div className="text-xs font-bold text-[#17231A] mt-1">Total Steps</div>
              <div className="text-[11px] text-[#66736A] truncate">Agronomic roadmap</div>
            </div>
          </div>

          {/* Card 2: Progress */}
          <div className="bg-white rounded-2xl border border-[#DCE8DE] p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#16803C]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-[#17231A] leading-none">{progressPercent}%</div>
              <div className="text-xs font-bold text-[#17231A] mt-1">Progress</div>
              <div className="text-[11px] text-[#66736A] truncate">
                {completedStepIds.length} of 7 completed
              </div>
            </div>
          </div>

          {/* Card 3: Target Production */}
          <div className="bg-white rounded-2xl border border-[#DCE8DE] p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#16803C]">
              <Wheat className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-[#17231A] leading-none">
                {cropDetails.productionTonnes || Math.round(cropDetails.benchmarkYield * area)} t
              </div>
              <div className="text-xs font-bold text-[#17231A] mt-1">Target Production</div>
              <div className="text-[11px] text-[#66736A] truncate">
                {cropDetails.benchmarkYield} t/ha × {area} ha
              </div>
            </div>
          </div>

          {/* Card 4: Expected Profit */}
          <div className="bg-white rounded-2xl border border-[#DCE8DE] p-4 shadow-xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#16803C]">
              <span className="font-extrabold text-base">₹</span>
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-[#17231A] leading-none">
                {formatProfit(cropDetails.benchmarkProfit)}
              </div>
              <div className="text-xs font-bold text-[#17231A] mt-1">Expected Profit</div>
              <div className="text-[11px] text-[#66736A] truncate">Estimated seasonal return</div>
            </div>
          </div>
        </div>

        {/* ── Main 3-Column Content Layout ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ── Left Column: Farm Roadmap Timeline (Col 3) ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#DCE8DE] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8DE] mb-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#123B22]">
                Farm Roadmap
              </h2>
              <span className="text-[11px] font-semibold text-[#66736A]">
                {completedStepIds.length}/7 Done
              </span>
            </div>

            <div className="relative pl-2 space-y-4">
              {/* Connecting vertical line */}
              <div className="absolute left-[19px] top-3 bottom-4 w-[2px] bg-[#DCE8DE] -z-0" />

              {steps.map((step) => {
                const isActive = step.id === activeStepId
                const isStepCompleted = completedStepIds.includes(step.id)

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepId(step.id)}
                    className={`group relative z-10 w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-[#E8F5E9] ring-1 ring-[#16803C]/40'
                        : 'hover:bg-[#F8FBF6]'
                    }`}
                  >
                    {/* Node circle */}
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isStepCompleted
                          ? 'bg-[#16803C] text-white shadow-2xs'
                          : isActive
                          ? 'bg-[#16803C] text-white ring-4 ring-[#E8F5E9]'
                          : 'border-2 border-[#DCE8DE] bg-white text-[#66736A] group-hover:border-[#16803C]'
                      }`}
                    >
                      {isStepCompleted ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? 'text-[#123B22]' : 'text-[#17231A]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#66736A] block">
                        {step.timeframe}
                      </span>
                    </div>

                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-[#16803C] shrink-0 self-center" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Center Column: Current Active Step Card (Col 6) ─ */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#DCE8DE] shadow-xs overflow-hidden">
              {/* Dark Forest Green Header */}
              <div className="bg-[#123B22] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16803C] text-white">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#E8F5E9]">
                      Step 0{activeStep.id} · {activeStep.title.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-emerald-100">
                  {activeStep.timeframe} · {activeStep.stage}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Step summary description */}
                <p className="text-sm font-medium text-[#17231A] leading-relaxed">
                  {activeStep.summary}
                </p>

                {/* ── AI Farm Insight Callout ─────────────────── */}
                <div className="rounded-xl bg-[#E8F5E9] border border-[#DCE8DE] p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#123B22]">
                    <Sparkles className="h-3.5 w-3.5 text-[#16803C]" />
                    <span>AI Farm Insight</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#17231A]">
                    Your current priority is {activeStep.title.toLowerCase()}.
                  </p>
                  <p className="text-xs text-[#17231A] leading-relaxed">
                    {activeStep.insight}
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-[#16803C]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Recommended window: {activeStep.recommendedWindow}</span>
                  </div>
                </div>

                {/* ── Action Checklist ───────────────────────── */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#123B22]">
                      Action Checklist
                    </h3>
                    <span className="text-xs font-semibold text-[#66736A]">
                      {activeStep.tasks.filter((t) => completedTaskIds.includes(t.id)).length} of{' '}
                      {activeStep.tasks.length} completed
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {activeStep.tasks.map((task) => {
                      const isChecked = completedTaskIds.includes(task.id)
                      const isWhyOpen = activeWhyTaskId === task.id

                      return (
                        <div
                          key={task.id}
                          className={`rounded-xl border p-3.5 transition-all duration-150 ${
                            isChecked
                              ? 'border-[#DCE8DE] bg-[#F8FBF6]/60'
                              : 'border-[#DCE8DE] bg-white hover:border-[#16803C]/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all ${
                                isChecked
                                  ? 'bg-[#16803C] text-white shadow-2xs'
                                  : 'border-2 border-[#66736A]/40 bg-white hover:border-[#16803C]'
                              }`}
                              aria-label={isChecked ? 'Mark not done' : 'Mark done'}
                            >
                              {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>

                            {/* Task details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm font-bold text-[#17231A]">
                                  <span className={isChecked ? 'line-through text-[#66736A]' : ''}>
                                    {task.name}
                                  </span>
                                  {task.spec && (
                                    <span className="ml-1.5 text-xs font-extrabold text-[#16803C]">
                                      — {task.spec}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Why button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveWhyTaskId(isWhyOpen ? null : task.id)
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-[#66736A] hover:text-[#16803C] bg-neutral-100 hover:bg-[#E8F5E9] transition-colors"
                                    title="View agronomic reasoning"
                                  >
                                    <HelpCircle className="h-3 w-3" />
                                    <span>Why?</span>
                                  </button>

                                  {/* Completion badge */}
                                  <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                      isChecked
                                        ? 'bg-[#E8F5E9] text-[#16803C]'
                                        : 'bg-neutral-100 text-[#66736A]'
                                    }`}
                                  >
                                    {isChecked ? 'Completed' : 'Not done'}
                                  </span>
                                </div>
                              </div>

                              <p className="mt-1 text-xs text-[#66736A] leading-relaxed">
                                {task.description}
                              </p>

                              {/* Expandable Why tooltip */}
                              {isWhyOpen && (
                                <div className="mt-2.5 rounded-lg bg-[#FEF6E9] border border-[#E9A23B]/30 p-2.5 text-xs text-[#17231A] animate-in fade-in duration-150 flex items-start gap-2">
                                  <Info className="h-3.5 w-3.5 text-[#E9A23B] shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="text-[#E9A23B] font-bold">Agronomic Rationale: </strong>
                                    <span>{task.why}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Dedicated Fertilizer Management Plan Link for Step 5 */}
                {activeStep.id === 5 && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-[#EAF6EA] to-emerald-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#123B22] text-white flex items-center justify-center shrink-0">
                        <Wheat className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17231A]">
                          Custom Fertilizer Management Plan
                        </p>
                        <p className="text-[11px] text-neutral-600">
                          Detailed NPK requirements, recommended fertilizers, application schedule, and tracking for {cropDetails.displayName}.
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/dashboard/fertilizer?crop=${encodeURIComponent(cropDetails.name)}`}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#123B22] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#0E2F1B] transition-colors shadow-2xs"
                    >
                      <span>Open Fertilizer Plan</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                {/* Step toggle footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#DCE8DE]">
                  <button
                    type="button"
                    onClick={() => toggleAllTasksInStep(activeStep)}
                    className="text-xs font-bold text-[#16803C] hover:text-[#123B22] hover:underline"
                  >
                    {activeStep.tasks.every((t) => completedTaskIds.includes(t.id))
                      ? 'Mark all as incomplete'
                      : '✓ Mark all step tasks as complete'}
                  </button>

                  <div className="flex items-center gap-2">
                    {activeStep.id > 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveStepId(activeStep.id - 1)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-[#17231A]"
                      >
                        Previous Step
                      </button>
                    )}
                    {activeStep.id < 7 && (
                      <button
                        type="button"
                        onClick={() => setActiveStepId(activeStep.id + 1)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#16803C] hover:bg-[#123B22] text-white"
                      >
                        Next Step →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Farm Snapshot & Soil Status (Col 3) */}
          <div className="lg:col-span-3 space-y-4">
            {/* ── Farm Snapshot Card ────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DCE8DE]">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E8F5E9] text-[#16803C]">
                  <Sprout className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#123B22]">
                  Farm Snapshot
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <span className="text-[#66736A] font-medium flex items-center gap-1.5">
                    <span>🌱</span> Crop
                  </span>
                  <span className="font-bold text-[#17231A]">{cropDetails.displayName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <span className="text-[#66736A] font-medium flex items-center gap-1.5">
                    <span>📍</span> Location
                  </span>
                  <span className="font-bold text-[#17231A] truncate max-w-[130px]" title={locationLabel || farmName}>
                    {locationLabel || farmName || 'Vizianagaram, AP'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <span className="text-[#66736A] font-medium flex items-center gap-1.5">
                    <span>📐</span> Farm Size
                  </span>
                  <span className="font-bold text-[#17231A]">{area} hectares</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <span className="text-[#66736A] font-medium flex items-center gap-1.5">
                    <span>🎯</span> Target Yield
                  </span>
                  <span className="font-bold text-[#17231A]">{cropDetails.benchmarkYield} t/ha</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#66736A] font-medium flex items-center gap-1.5">
                    <span>💧</span> Irrigation
                  </span>
                  <span className="font-bold text-[#16803C]">
                    {cropDetails.farmingRequirements.irrigationRequirement ? 'Available' : 'Rainfed'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Soil Status Card ─────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DCE8DE]">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E8F5E9] text-[#16803C]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#123B22]">
                  Soil Status
                </h3>
              </div>

              {/* NPK + pH grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-[#DCE8DE] bg-[#F8FBF6] p-2">
                  <div className="text-[11px] font-bold text-[#66736A]">pH</div>
                  <div className="text-sm font-extrabold text-[#17231A]">6.7</div>
                  <span className="inline-block mt-0.5 text-[9px] font-extrabold text-[#16803C] bg-[#E8F5E9] px-1 py-0.2 rounded">
                    Optimal
                  </span>
                </div>

                <div className="rounded-xl border border-[#DCE8DE] bg-[#F8FBF6] p-2">
                  <div className="text-[11px] font-bold text-[#66736A]">N</div>
                  <div className="text-xs font-bold text-[#17231A]">Med</div>
                  <span className="inline-block mt-0.5 text-[9px] font-extrabold text-[#D97706] bg-[#FEF3C7] px-1 py-0.2 rounded">
                    Medium
                  </span>
                </div>

                <div className="rounded-xl border border-[#DCE8DE] bg-[#F8FBF6] p-2">
                  <div className="text-[11px] font-bold text-[#66736A]">P</div>
                  <div className="text-xs font-bold text-[#17231A]">High</div>
                  <span className="inline-block mt-0.5 text-[9px] font-extrabold text-[#16803C] bg-[#E8F5E9] px-1 py-0.2 rounded">
                    High
                  </span>
                </div>

                <div className="rounded-xl border border-[#DCE8DE] bg-[#F8FBF6] p-2">
                  <div className="text-[11px] font-bold text-[#66736A]">K</div>
                  <div className="text-xs font-bold text-[#17231A]">Med</div>
                  <span className="inline-block mt-0.5 text-[9px] font-extrabold text-[#D97706] bg-[#FEF3C7] px-1 py-0.2 rounded">
                    Medium
                  </span>
                </div>
              </div>

              {/* Soil health bar */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#17231A]">Soil Health</span>
                  <span className="text-[#16803C]">82%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#16803C] transition-all duration-500"
                    style={{ width: '82%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Bottom Action Bar ──────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#DCE8DE] p-4 sm:px-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isPlanActivated ? 'bg-[#16803C] animate-pulse' : 'bg-[#66736A]'
              }`}
            />
            <div>
              <p className="font-bold text-[#17231A]">
                {isPlanActivated ? 'Farm Plan Active' : 'Plan not activated'}
              </p>
              <p className="text-xs text-[#66736A]">Complete actions as you farm</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-xs sm:text-sm font-semibold text-[#17231A] transition-colors shadow-2xs"
            >
              <Download className="h-4 w-4 text-[#16803C]" />
              <span>Save / Print PDF</span>
            </button>

            <button
              type="button"
              onClick={handleActivatePlan}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm ${
                isPlanActivated
                  ? 'bg-[#123B22] hover:bg-[#123B22]/90'
                  : 'bg-[#16803C] hover:bg-[#123B22]'
              }`}
            >
              {isPlanActivated ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>Farm Plan Activated</span>
                </>
              ) : (
                <>
                  <span>Activate Farm Plan</span>
                  <span className="text-base font-bold">→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toast confirmation */}
        {showActivatedToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#123B22] text-white p-4 shadow-xl border border-[#16803C] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Farm Plan Activated!</p>
              <p className="text-xs text-emerald-200">
                Action tasks have been synced to your active farm dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
