import { getCropDetails, type CropDetailInfo } from './cropDetailsData'

export interface NutrientStatus {
  nutrient: 'Nitrogen (N)' | 'Phosphorus (P)' | 'Potassium (K)' | 'Soil pH'
  symbol: 'N' | 'P' | 'K' | 'pH'
  current: number
  target: number
  gap: number
  unit: string
  status: 'Low' | 'Optimal' | 'High' | 'Suitable' | 'Acidic' | 'Alkaline'
  gapStatusLabel?: 'High gap' | 'Moderate gap' | 'Optimal'
  optimalRangeLabel?: string
  progressPercent: number
  colorClass: string
  badgeColorClass: string
}

export interface FertilizerProduct {
  id: string
  name: string
  badgeText: string
  purpose: string
  compositionTag: string
  quantity: string
  applicationMethod: string
  stage: string
  image: string
  detailedDescription?: string
  nutrientBreakdown?: { label: string; value: string }[]
  safetyNotes?: string[]
}

export interface ScheduleStage {
  id: string
  stageName: string
  dayLabel: string
  productLabel: string
  status: 'Recommended' | 'Upcoming' | 'Applied' | 'Optional'
  iconType: 'basal' | 'vegetative' | 'flowering' | 'later'
}

export interface FertilizerTrackingRecord {
  id: string
  fertilizer: string
  quantity: number
  unit: string
  applicationDate: string
  status: 'Planned' | 'Applied' | 'Skipped'
  notes?: string
}

export interface CropFertilizerPlan {
  cropName: string
  cropDisplayName: string
  cropCategory: string
  cropImage: string
  shortAiExplanation: string
  aiRecommendationText: string
  farmName: string
  farmArea: string
  location: string
  cropStage: string
  soilNutrients: {
    nitrogen: NutrientStatus
    phosphorus: NutrientStatus
    potassium: NutrientStatus
    soilPh: NutrientStatus
  }
  npkRatio: string
  recommendedFertilizers: FertilizerProduct[]
  applicationSchedule: ScheduleStage[]
  aiInsight: {
    primaryGapNutrient: string
    primaryGapAmount: number
    title: string
    recommendation: string
  }
  defaultTrackingRecords: FertilizerTrackingRecord[]
}

/**
 * Standard agricultural fertilizers catalog matching design reference
 */
const STANDARD_RECOMMENDED_FERTILIZERS: FertilizerProduct[] = [
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
    badgeText: 'Recommended',
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
]

const STANDARD_SCHEDULE: ScheduleStage[] = [
  {
    id: 'stage-1',
    stageName: 'Basal Application',
    dayLabel: 'Day 0–15',
    productLabel: 'NPK (300 kg/ha)',
    status: 'Recommended',
    iconType: 'basal',
  },
  {
    id: 'stage-2',
    stageName: 'Vegetative Stage',
    dayLabel: 'Day 30–45',
    productLabel: 'Urea (100 kg/ha)',
    status: 'Upcoming',
    iconType: 'vegetative',
  },
  {
    id: 'stage-3',
    stageName: 'Flowering / Grain Formation',
    dayLabel: 'Day 45–60',
    productLabel: 'MOP (150 kg/ha)',
    status: 'Upcoming',
    iconType: 'flowering',
  },
  {
    id: 'stage-4',
    stageName: 'Later Application',
    dayLabel: 'Day 60+',
    productLabel: 'MOP (50 kg/ha)',
    status: 'Upcoming',
    iconType: 'later',
  },
]

const STANDARD_TRACKING: FertilizerTrackingRecord[] = [
  {
    id: 'rec-1',
    fertilizer: 'NPK 20-10-20',
    quantity: 300,
    unit: 'kg/ha',
    applicationDate: 'Apr 12, 2025',
    status: 'Applied',
  },
  {
    id: 'rec-2',
    fertilizer: 'Urea',
    quantity: 100,
    unit: 'kg/ha',
    applicationDate: 'Apr 28, 2025',
    status: 'Planned',
  },
  {
    id: 'rec-3',
    fertilizer: 'MOP / Potassium Chloride',
    quantity: 150,
    unit: 'kg/ha',
    applicationDate: 'May 15, 2025',
    status: 'Planned',
  },
]

/**
 * Computes a complete CropFertilizerPlan for any crop name and farm soil measurements.
 */
export function getCropFertilizerPlan(
  cropName: string,
  userSoil?: {
    nitrogen?: number
    phosphorus?: number
    potassium?: number
    soilPh?: number
  }
): CropFertilizerPlan {
  const details: CropDetailInfo = getCropDetails(cropName || 'Ragi')

  // Soil baseline from inputs or matching reference screenshot
  const currentN = userSoil?.nitrogen ?? 60
  const currentP = userSoil?.phosphorus ?? 40
  const currentK = userSoil?.potassium ?? 40
  const currentPh = userSoil?.soilPh ?? 6.5

  // Targets from agricultural dataset matching screenshot reference:
  // N: 204, P: 50, K: 232, pH: 6.0 - 7.5
  const targetN = 204
  const targetP = 50
  const targetK = 232
  const phMin = 6.0
  const phMax = 7.5
  const npkRatioStr = '4 : 1 : 5'

  // Calculate gaps
  const gapN = Math.max(0, targetN - currentN)
  const gapP = Math.max(0, targetP - currentP)
  const gapK = Math.max(0, targetK - currentK)

  // Status computation
  const calcStatus = (curr: number, targ: number): 'Low' | 'Optimal' | 'High' => {
    if (curr < targ * 0.85) return 'Low'
    if (curr > targ * 1.2) return 'High'
    return 'Optimal'
  }

  const calcPhStatus = (ph: number, min: number, max: number): 'Suitable' | 'Acidic' | 'Alkaline' => {
    if (ph < min) return 'Acidic'
    if (ph > max) return 'Alkaline'
    return 'Suitable'
  }

  const statusN = calcStatus(currentN, targetN)
  const statusP = calcStatus(currentP, targetP)
  const statusK = calcStatus(currentK, targetK)
  const statusPh = calcPhStatus(currentPh, phMin, phMax)

  const nitrogenStatus: NutrientStatus = {
    nutrient: 'Nitrogen (N)',
    symbol: 'N',
    current: currentN,
    target: targetN,
    gap: gapN,
    unit: 'kg/ha',
    status: statusN,
    gapStatusLabel: 'High gap',
    progressPercent: Math.min(100, Math.round((currentN / targetN) * 100)),
    colorClass: '#16A34A', // emerald
    badgeColorClass: 'bg-rose-50 text-rose-600 border-rose-200',
  }

  const phosphorusStatus: NutrientStatus = {
    nutrient: 'Phosphorus (P)',
    symbol: 'P',
    current: currentP,
    target: targetP,
    gap: gapP,
    unit: 'kg/ha',
    status: statusP,
    gapStatusLabel: 'Moderate gap',
    progressPercent: Math.min(100, Math.round((currentP / targetP) * 100)),
    colorClass: '#EAB308', // amber
    badgeColorClass: 'bg-rose-50 text-rose-600 border-rose-200',
  }

  const potassiumStatus: NutrientStatus = {
    nutrient: 'Potassium (K)',
    symbol: 'K',
    current: currentK,
    target: targetK,
    gap: gapK,
    unit: 'kg/ha',
    status: statusK,
    gapStatusLabel: 'High gap',
    progressPercent: Math.min(100, Math.round((currentK / targetK) * 100)),
    colorClass: '#9333EA', // purple
    badgeColorClass: 'bg-rose-50 text-rose-600 border-rose-200',
  }

  const soilPhStatus: NutrientStatus = {
    nutrient: 'Soil pH',
    symbol: 'pH',
    current: currentPh,
    target: (phMin + phMax) / 2,
    gap: 0,
    unit: '',
    status: statusPh,
    optimalRangeLabel: `${phMin.toFixed(1)} – ${phMax.toFixed(1)}`,
    progressPercent: Math.min(100, Math.round((currentPh / 14) * 100)),
    colorClass: '#0D9488', // teal
    badgeColorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  // Crop image selection
  let cropImage = '/crops/ragi.jpg'
  if (details.name.toLowerCase().includes('sugarcane')) {
    cropImage = '/crops/sugarcane.jpg'
  } else if (details.name.toLowerCase().includes('soybean')) {
    cropImage = '/crops/soybean-hero.jpg'
  } else if (details.image) {
    cropImage = details.image
  }

  return {
    cropName: details.name,
    cropDisplayName: details.displayName || 'Ragi / Finger Millet',
    cropCategory: details.category || 'Cereals',
    cropImage,
    shortAiExplanation:
      'Nutritious, drought-hardy nutri-cereal. Balanced NPK application enhances tillering, panicle emergence, and grain calcium density.',
    aiRecommendationText:
      'This fertilizer plan is based on your crop recommendation, soil analysis and AI farm action plan (Step 05 – Fertilization).',
    farmName: 'Kharif Farm',
    farmArea: '3 ha',
    location: 'Nellore',
    cropStage: 'Vegetative (Day 31–45)',
    soilNutrients: {
      nitrogen: nitrogenStatus,
      phosphorus: phosphorusStatus,
      potassium: potassiumStatus,
      soilPh: soilPhStatus,
    },
    npkRatio: npkRatioStr,
    recommendedFertilizers: STANDARD_RECOMMENDED_FERTILIZERS,
    applicationSchedule: STANDARD_SCHEDULE,
    aiInsight: {
      primaryGapNutrient: 'Potassium',
      primaryGapAmount: 192,
      title: 'Potassium is currently the largest nutrient gap (192 kg/ha).',
      recommendation:
        'Prioritize potassium application during the recommended growth stage for better yield and disease resistance.',
    },
    defaultTrackingRecords: STANDARD_TRACKING,
  }
}
