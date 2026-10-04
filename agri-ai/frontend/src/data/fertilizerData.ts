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

interface CropFertilizerProfile {
  targetN: number
  targetP: number
  targetK: number
  phMin: number
  phMax: number
  npkRatio: string
  aiExplanation: string
  recommendedFertilizers: FertilizerProduct[]
  applicationSchedule: ScheduleStage[]
  defaultTrackingRecords: FertilizerTrackingRecord[]
  insightGenerator: (gapN: number, gapP: number, gapK: number) => {
    primaryGapNutrient: string
    primaryGapAmount: number
    title: string
    recommendation: string
  }
}

/**
 * Standard agronomic profiles for major agricultural crops in India / Andhra Pradesh
 */
const CROP_PROFILES: Record<string, CropFertilizerProfile> = {
  'pigeon pea': {
    targetN: 25,
    targetP: 50,
    targetK: 25,
    phMin: 6.5,
    phMax: 8.0,
    npkRatio: '1 : 2 : 1',
    aiExplanation:
      'Deep-rooted legume with active atmospheric nitrogen-fixing root nodules. Moderate starter nitrogen and high phosphorus are vital for vigorous early Rhizobium colonization and heavy pod bearing.',
    recommendedFertilizers: [
      {
        id: 'ssp-dap',
        name: 'Single Super Phosphate (SSP) / DAP',
        badgeText: 'High Phosphorus',
        purpose: 'Root nodule initiation & phosphorus supply',
        compositionTag: 'P: 16–46%',
        quantity: '125 kg/ha',
        applicationMethod: 'Basal seedbed placement',
        stage: 'Day 0–15',
        image: '/fertilizers/npk-20-10-20.jpg',
        detailedDescription:
          'Phosphorus is the rate-limiting nutrient for pulse nodulation. Placing SSP or DAP at basal sowing stimulates rapid taproot descent and biological nitrogen fixation.',
        nutrientBreakdown: [
          { label: 'Available Phosphate (P2O5)', value: '16.0% (SSP) / 46.0% (DAP)' },
          { label: 'Calcium & Sulphur', value: '19.0% Ca, 11.0% S (SSP)' },
          { label: 'Total Nitrogen (N)', value: '18.0% (in DAP)' },
        ],
        safetyNotes: [
          'Place 5 cm below seed level to prevent direct contact with germinating radicles',
          'Ensure adequate seedbed moisture before broadcasting or drilling',
        ],
      },
      {
        id: 'urea-pulse',
        name: 'Starter Urea',
        badgeText: 'Starter Dose',
        purpose: 'Pre-nodulation vegetative growth',
        compositionTag: 'N: 46%',
        quantity: '25 kg/ha',
        applicationMethod: 'Side dressing during early weeding',
        stage: 'Day 25–40',
        image: '/fertilizers/urea.jpg',
        detailedDescription:
          'Small starter nitrogen dose supports the young seedling until root nodules fully establish active atmospheric nitrogen fixation at 30–35 days.',
        nutrientBreakdown: [
          { label: 'Ammoniacal/Amide Nitrogen', value: '46.0%' },
          { label: 'Water Solubility', value: '100%' },
        ],
        safetyNotes: ['Avoid heavy nitrogen doses as excessive nitrogen suppresses bacterial nodulation'],
      },
      {
        id: 'mop-pulse',
        name: 'MOP / Potassium Chloride',
        badgeText: 'Drought Defense',
        purpose: 'Stalk strength & pod filling',
        compositionTag: 'K: 60%',
        quantity: '40 kg/ha',
        applicationMethod: 'Split application at flowering',
        stage: 'Day 50–70',
        image: '/fertilizers/mop.jpg',
        detailedDescription:
          'Enhances osmoregulation during dry spells, prevents premature blossom drop, and ensures plump, well-filled grain pods.',
        nutrientBreakdown: [
          { label: 'Soluble Potash (K2O)', value: '60.0%' },
          { label: 'Chloride (Cl)', value: '45.0%' },
        ],
        safetyNotes: ['Incorporate before forecasted irrigation or light rain shower'],
      },
    ],
    applicationSchedule: [
      {
        id: 'stage-1',
        stageName: 'Basal Application',
        dayLabel: 'Day 0–15',
        productLabel: 'SSP / DAP (125 kg/ha) + Rhizobium',
        status: 'Recommended',
        iconType: 'basal',
      },
      {
        id: 'stage-2',
        stageName: 'Vegetative & Branching',
        dayLabel: 'Day 25–40',
        productLabel: 'Starter Urea (25 kg/ha)',
        status: 'Upcoming',
        iconType: 'vegetative',
      },
      {
        id: 'stage-3',
        stageName: 'Flowering & Pod Formation',
        dayLabel: 'Day 50–70',
        productLabel: 'MOP (40 kg/ha) + 00-52-34 Spray',
        status: 'Upcoming',
        iconType: 'flowering',
      },
      {
        id: 'stage-4',
        stageName: 'Pod Filling & Maturation',
        dayLabel: 'Day 75–100',
        productLabel: '1% Potassium Nitrate / Borax Foliar',
        status: 'Optional',
        iconType: 'later',
      },
    ],
    defaultTrackingRecords: [
      {
        id: 'rec-1',
        fertilizer: 'Single Super Phosphate (SSP) / DAP',
        quantity: 125,
        unit: 'kg/ha',
        applicationDate: 'Apr 12, 2025',
        status: 'Applied',
      },
      {
        id: 'rec-2',
        fertilizer: 'Starter Urea',
        quantity: 25,
        unit: 'kg/ha',
        applicationDate: 'Apr 28, 2025',
        status: 'Planned',
      },
      {
        id: 'rec-3',
        fertilizer: 'MOP / Potassium Chloride',
        quantity: 40,
        unit: 'kg/ha',
        applicationDate: 'May 15, 2025',
        status: 'Planned',
      },
    ],
    insightGenerator: (gapN, gapP, gapK) => {
      const maxGap = Math.max(gapN, gapP, gapK)
      if (maxGap === gapP && gapP > 0) {
        return {
          primaryGapNutrient: 'Phosphorus',
          primaryGapAmount: gapP,
          title: `Phosphorus is the primary nutrient gap (${gapP} kg/ha) for Pigeon Pea.`,
          recommendation:
            'Phosphorus is vital for legume nodulation. Apply SSP or DAP at basal sowing to stimulate active Rhizobium colonization.',
        }
      }
      if (maxGap === gapK && gapK > 0) {
        return {
          primaryGapNutrient: 'Potassium',
          primaryGapAmount: gapK,
          title: `Potassium deficit of ${gapK} kg/ha detected for Pigeon Pea.`,
          recommendation:
            'Apply MOP during pre-flowering branching to ensure sturdy pod stalks and drought hardiness.',
        }
      }
      return {
        primaryGapNutrient: 'Phosphorus',
        primaryGapAmount: Math.max(gapP, 10),
        title: 'Nutrient levels are well balanced for pulse cultivation.',
        recommendation:
          'Pigeon Pea fixes atmospheric nitrogen naturally. Prioritize phosphorus and bio-fertilizer seed inoculation.',
      }
    },
  },

  ragi: {
    targetN: 60,
    targetP: 40,
    targetK: 40,
    phMin: 6.0,
    phMax: 7.5,
    npkRatio: '3 : 2 : 2',
    aiExplanation:
      'Nutritious, drought-hardy nutri-cereal. Balanced NPK application enhances vigorous tillering, panicle emergence, and high calcium grain density.',
    recommendedFertilizers: [
      {
        id: 'npk-20-20-0',
        name: 'NPK 20-20-0 / Complex 15-15-15',
        badgeText: 'Recommended',
        purpose: 'Balanced basal establishment',
        compositionTag: 'NPK: 20-20-0',
        quantity: '150 kg/ha',
        applicationMethod: 'Basal placement at transplanting/sowing',
        stage: 'Day 0–15',
        image: '/fertilizers/npk-20-10-20.jpg',
        detailedDescription:
          'Provides early nitrogen and phosphate for deep rooting and strong early tillering in drought-hardy finger millet crops.',
        nutrientBreakdown: [
          { label: 'Total Nitrogen (N)', value: '20.0%' },
          { label: 'Available Phosphate (P2O5)', value: '20.0%' },
          { label: 'Water Solubility', value: '85%' },
        ],
        safetyNotes: ['Incorporate evenly across rows during field preparation'],
      },
      {
        id: 'urea-ragi',
        name: 'Urea Top Dressing',
        badgeText: 'Tillering Boost',
        purpose: 'Active tillering and biomass expansion',
        compositionTag: 'N: 46%',
        quantity: '75 kg/ha',
        applicationMethod: 'Top dressing during weeding',
        stage: 'Day 25–35',
        image: '/fertilizers/urea.jpg',
        detailedDescription:
          'Boosts productive tiller count per hill and enhances chlorophyll density prior to flag leaf emergence.',
        nutrientBreakdown: [
          { label: 'Total Nitrogen', value: '46.0%' },
          { label: 'Biuret', value: '1.0% max' },
        ],
        safetyNotes: ['Broadcast when soil has good moisture after light rain or irrigation'],
      },
      {
        id: 'mop-ragi',
        name: 'MOP / Potassium Chloride',
        badgeText: 'Grain Filling',
        purpose: 'Stalk strength & finger grain filling',
        compositionTag: 'K: 60%',
        quantity: '50 kg/ha',
        applicationMethod: 'Top dressing at panicle emergence',
        stage: 'Day 45–60',
        image: '/fertilizers/mop.jpg',
        detailedDescription:
          'Translocates carbohydrates directly into finger heads, boosting test weight, calcium deposition, and preventing lodging.',
        nutrientBreakdown: [
          { label: 'Water Soluble Potash (K2O)', value: '60.0%' },
          { label: 'Moisture', value: '0.5%' },
        ],
        safetyNotes: ['Apply when foliage is dry to avoid leaf scorching'],
      },
    ],
    applicationSchedule: [
      {
        id: 'stage-1',
        stageName: 'Basal Application',
        dayLabel: 'Day 0–15',
        productLabel: 'NPK 20-20-0 (150 kg/ha)',
        status: 'Recommended',
        iconType: 'basal',
      },
      {
        id: 'stage-2',
        stageName: 'Active Tillering Stage',
        dayLabel: 'Day 25–35',
        productLabel: 'Urea (50 kg/ha)',
        status: 'Upcoming',
        iconType: 'vegetative',
      },
      {
        id: 'stage-3',
        stageName: 'Flowering / Panicle Emergence',
        dayLabel: 'Day 45–60',
        productLabel: 'MOP (50 kg/ha) + Urea (25 kg/ha)',
        status: 'Upcoming',
        iconType: 'flowering',
      },
      {
        id: 'stage-4',
        stageName: 'Grain Hardening Stage',
        dayLabel: 'Day 60+',
        productLabel: '1% Potassium Nitrate Spray',
        status: 'Upcoming',
        iconType: 'later',
      },
    ],
    defaultTrackingRecords: [
      {
        id: 'rec-1',
        fertilizer: 'NPK 20-20-0 / Complex 15-15-15',
        quantity: 150,
        unit: 'kg/ha',
        applicationDate: 'Apr 12, 2025',
        status: 'Applied',
      },
      {
        id: 'rec-2',
        fertilizer: 'Urea Top Dressing',
        quantity: 50,
        unit: 'kg/ha',
        applicationDate: 'Apr 28, 2025',
        status: 'Planned',
      },
      {
        id: 'rec-3',
        fertilizer: 'MOP / Potassium Chloride',
        quantity: 50,
        unit: 'kg/ha',
        applicationDate: 'May 15, 2025',
        status: 'Planned',
      },
    ],
    insightGenerator: (gapN, gapP, gapK) => {
      const maxGap = Math.max(gapN, gapP, gapK)
      if (maxGap === gapN && gapN > 0) {
        return {
          primaryGapNutrient: 'Nitrogen',
          primaryGapAmount: gapN,
          title: `Nitrogen is currently the largest nutrient gap (${gapN} kg/ha) for Ragi.`,
          recommendation:
            'Split nitrogen applications across basal and active tillering stages to optimize finger head development.',
        }
      }
      if (maxGap === gapK && gapK > 0) {
        return {
          primaryGapNutrient: 'Potassium',
          primaryGapAmount: gapK,
          title: `Potassium gap (${gapK} kg/ha) detected for Finger Millet.`,
          recommendation:
            'Prioritize MOP application at panicle emergence to enhance finger grain density and drought tolerance.',
        }
      }
      return {
        primaryGapNutrient: 'Nitrogen',
        primaryGapAmount: Math.max(gapN, 15),
        title: 'Nutrient levels are near optimal for Ragi cultivation.',
        recommendation:
          'Maintain balanced top-dressing during tillering to achieve benchmark yields of 4.5+ t/ha.',
      }
    },
  },

  rice: {
    targetN: 120,
    targetP: 60,
    targetK: 60,
    phMin: 5.5,
    phMax: 7.0,
    npkRatio: '2 : 1 : 1',
    aiExplanation:
      'High-yielding semi-dwarf wetland cereal. Demands substantial split nitrogen top-dressing to support rapid tillering, panicle initiation, and full grain spikelet filling.',
    recommendedFertilizers: [
      {
        id: 'dap-rice',
        name: 'DAP (Di-Ammonium Phosphate 18-46-0)',
        badgeText: 'Basal Foundation',
        purpose: 'Deep root establishment & early tillering',
        compositionTag: 'NPK: 18-46-0',
        quantity: '130 kg/ha',
        applicationMethod: 'Basal incorporation before final puddling',
        stage: 'Day 0–10',
        image: '/fertilizers/npk-20-10-20.jpg',
        detailedDescription:
          'Supplies starter ammoniacal nitrogen and high available phosphate to anchor rice seedlings firmly in puddled soils.',
        nutrientBreakdown: [
          { label: 'Total Nitrogen (N)', value: '18.0%' },
          { label: 'Available Phosphate (P2O5)', value: '46.0%' },
        ],
        safetyNotes: ['Incorporate into puddled mud to prevent surface wash-off'],
      },
      {
        id: 'urea-rice',
        name: 'Urea (Split Doses)',
        badgeText: 'Heavy Demand',
        purpose: 'Active tillering & panicle initiation',
        compositionTag: 'N: 46%',
        quantity: '130 kg/ha (2 splits)',
        applicationMethod: 'Top dressing into saturated soil',
        stage: 'Day 20–45',
        image: '/fertilizers/urea.jpg',
        detailedDescription:
          'Crucial for sustained vegetative tiller development and panicle primordial cell multiplication.',
        nutrientBreakdown: [
          { label: 'Amide Nitrogen', value: '46.0%' },
          { label: 'Water Solubility', value: '100%' },
        ],
        safetyNotes: ['Drain excess standing water before application and reflood after 24–48 hours'],
      },
      {
        id: 'mop-rice',
        name: 'MOP (Muriate of Potash)',
        badgeText: 'Grain Filling',
        purpose: 'Stem strength & spikelet fertility',
        compositionTag: 'K: 60%',
        quantity: '70 kg/ha',
        applicationMethod: 'Split at basal and panicle initiation',
        stage: 'Day 40–55',
        image: '/fertilizers/mop.jpg',
        detailedDescription:
          'Strengthens lower stem internodes to prevent wind lodging and maximizes filled grain percentage.',
        nutrientBreakdown: [
          { label: 'Soluble Potash (K2O)', value: '60.0%' },
          { label: 'Chloride', value: '45.0%' },
        ],
        safetyNotes: ['Ensure potassium is applied before boot leaf swelling stage'],
      },
      {
        id: 'zinc-rice',
        name: 'Zinc Sulphate (ZnSO4 21%)',
        badgeText: 'Micronutrient',
        purpose: 'Khaira disease prevention',
        compositionTag: 'Zn: 21%',
        quantity: '25 kg/ha',
        applicationMethod: 'Basal application',
        stage: 'Day 0–10',
        image: '/fertilizers/urea.jpg',
        detailedDescription:
          'Essential for preventing widespread zinc deficiency (Khaira disease) in irrigated lowland rice soils.',
        nutrientBreakdown: [{ label: 'Zinc (Zn)', value: '21.0%' }, { label: 'Sulphur (S)', value: '10.0%' }],
        safetyNotes: ['Do not mix directly with phosphate fertilizers in the same hopper'],
      },
    ],
    applicationSchedule: [
      {
        id: 'stage-1',
        stageName: 'Basal Application',
        dayLabel: 'Day 0–10',
        productLabel: 'DAP (130 kg/ha) + Zinc Sulphate (25 kg/ha)',
        status: 'Recommended',
        iconType: 'basal',
      },
      {
        id: 'stage-2',
        stageName: 'Active Tillering Stage',
        dayLabel: 'Day 20–30',
        productLabel: 'Urea Top Dressing (65 kg/ha)',
        status: 'Upcoming',
        iconType: 'vegetative',
      },
      {
        id: 'stage-3',
        stageName: 'Panicle Initiation Stage',
        dayLabel: 'Day 40–50',
        productLabel: 'Urea (65 kg/ha) + MOP (40 kg/ha)',
        status: 'Upcoming',
        iconType: 'flowering',
      },
      {
        id: 'stage-4',
        stageName: 'Booting to Heading',
        dayLabel: 'Day 60–75',
        productLabel: 'MOP (30 kg/ha) + 13-0-45 Potash Spray',
        status: 'Upcoming',
        iconType: 'later',
      },
    ],
    defaultTrackingRecords: [
      {
        id: 'rec-1',
        fertilizer: 'DAP (Di-Ammonium Phosphate 18-46-0)',
        quantity: 130,
        unit: 'kg/ha',
        applicationDate: 'Apr 12, 2025',
        status: 'Applied',
      },
      {
        id: 'rec-2',
        fertilizer: 'Urea Top Dressing',
        quantity: 65,
        unit: 'kg/ha',
        applicationDate: 'Apr 28, 2025',
        status: 'Planned',
      },
      {
        id: 'rec-3',
        fertilizer: 'MOP (Muriate of Potash)',
        quantity: 40,
        unit: 'kg/ha',
        applicationDate: 'May 15, 2025',
        status: 'Planned',
      },
    ],
    insightGenerator: (gapN, gapP, gapK) => {
      const maxGap = Math.max(gapN, gapP, gapK)
      if (maxGap === gapN && gapN > 0) {
        return {
          primaryGapNutrient: 'Nitrogen',
          primaryGapAmount: gapN,
          title: `Nitrogen is currently the largest nutrient gap (${gapN} kg/ha) for Rice / Paddy.`,
          recommendation:
            'Rice has a high nitrogen requirement. Apply split urea top-dressings at active tillering and panicle initiation into saturated mud.',
        }
      }
      return {
        primaryGapNutrient: 'Phosphorus',
        primaryGapAmount: Math.max(gapP, 20),
        title: 'Balanced wetland paddy nutrient management required.',
        recommendation:
          'Ensure basal zinc sulphate is incorporated alongside DAP before final puddling to protect against Khaira disease.',
      }
    },
  },
}

/**
 * Resolves or dynamically computes a complete CropFertilizerPlan
 * for ANY crop name and farm soil measurements.
 */
export function getCropFertilizerPlan(
  cropName: string,
  userSoil?: {
    nitrogen?: number
    phosphorus?: number
    potassium?: number
    soilPh?: number
  },
  farmProfile?: {
    farmId?: number | string
    farmName?: string
    location?: string
    area?: number | string
  }
): CropFertilizerPlan {
  const details: CropDetailInfo = getCropDetails(cropName || 'Ragi')
  const cleanName = details.name.toLowerCase()

  // Match predefined crop profile or dynamically generate from agronomic details
  let profile: CropFertilizerProfile
  if (cleanName.includes('pigeon') || cleanName.includes('toor') || cleanName.includes('arhar')) {
    profile = CROP_PROFILES['pigeon pea']
  } else if (cleanName.includes('ragi') || cleanName.includes('millet')) {
    profile = CROP_PROFILES.ragi
  } else if (cleanName.includes('rice') || cleanName.includes('paddy')) {
    profile = CROP_PROFILES.rice
  } else {
    // Dynamic calculation from cropDetails soil requirements
    const soilReq = details.soilRequirements
    const targetN = soilReq
      ? Math.round((soilReq.nitrogenMin + soilReq.nitrogenMax) / 2)
      : 80
    const targetP = soilReq
      ? Math.round((soilReq.phosphorusMin + soilReq.phosphorusMax) / 2)
      : 50
    const targetK = soilReq
      ? Math.round((soilReq.potassiumMin + soilReq.potassiumMax) / 2)
      : 50
    const phMin = soilReq ? soilReq.idealPhMin : 6.0
    const phMax = soilReq ? soilReq.idealPhMax : 7.5

    const nRatio = Math.max(1, Math.round(targetN / 25))
    const pRatio = Math.max(1, Math.round(targetP / 25))
    const kRatio = Math.max(1, Math.round(targetK / 25))
    const npkRatio = `${nRatio} : ${pRatio} : ${kRatio}`

    profile = {
      targetN,
      targetP,
      targetK,
      phMin,
      phMax,
      npkRatio,
      aiExplanation: `${details.displayName} agronomic plan tailored to local soil chemistry and high-efficiency nutrient uptake.`,
      recommendedFertilizers: [
        {
          id: `npk-${details.name.toLowerCase()}`,
          name: `NPK Complex Fertilizer (${npkRatio})`,
          badgeText: 'Recommended',
          purpose: 'Balanced basal application',
          compositionTag: `Target: ${targetN}-${targetP}-${targetK}`,
          quantity: `${Math.round(targetP * 2.5)} kg/ha`,
          applicationMethod: 'Basal application',
          stage: 'Day 0–15',
          image: '/fertilizers/npk-20-10-20.jpg',
          detailedDescription: `Supplies balanced baseline nutrients aligned to ${details.displayName} standard package of practices.`,
          nutrientBreakdown: [
            { label: 'Target Nitrogen (N)', value: `${targetN} kg/ha` },
            { label: 'Target Phosphorus (P)', value: `${targetP} kg/ha` },
            { label: 'Target Potassium (K)', value: `${targetK} kg/ha` },
          ],
        },
        {
          id: `urea-${details.name.toLowerCase()}`,
          name: 'Urea Top Dressing',
          badgeText: 'Vegetative Growth',
          purpose: 'Nitrogen supplement',
          compositionTag: 'N: 46%',
          quantity: `${Math.round(targetN * 0.8)} kg/ha`,
          applicationMethod: 'Top dressing',
          stage: 'Day 25–40',
          image: '/fertilizers/urea.jpg',
          detailedDescription: 'Essential for canopy expansion, leaf area index development, and active photosynthesis.',
        },
        {
          id: `mop-${details.name.toLowerCase()}`,
          name: 'MOP / Potassium Chloride',
          badgeText: 'Maturity & Quality',
          purpose: 'Grain/Fruit development',
          compositionTag: 'K: 60%',
          quantity: `${Math.round(targetK * 1.2)} kg/ha`,
          applicationMethod: 'Top dressing at flowering',
          stage: 'Day 45–65',
          image: '/fertilizers/mop.jpg',
          detailedDescription: 'Enhances drought resistance, stem rigidity, and dry matter accumulation.',
        },
      ],
      applicationSchedule: [
        {
          id: 'stage-1',
          stageName: 'Basal Application',
          dayLabel: 'Day 0–15',
          productLabel: `NPK Complex (${Math.round(targetP * 2.5)} kg/ha)`,
          status: 'Recommended',
          iconType: 'basal',
        },
        {
          id: 'stage-2',
          stageName: 'Vegetative Stage',
          dayLabel: 'Day 25–40',
          productLabel: `Urea (${Math.round(targetN * 0.5)} kg/ha)`,
          status: 'Upcoming',
          iconType: 'vegetative',
        },
        {
          id: 'stage-3',
          stageName: 'Flowering / Reproductive Stage',
          dayLabel: 'Day 45–65',
          productLabel: `MOP (${Math.round(targetK * 0.8)} kg/ha) + Urea (${Math.round(targetN * 0.3)} kg/ha)`,
          status: 'Upcoming',
          iconType: 'flowering',
        },
        {
          id: 'stage-4',
          stageName: 'Maturation Stage',
          dayLabel: 'Day 70+',
          productLabel: 'Micronutrient Foliar Spray',
          status: 'Optional',
          iconType: 'later',
        },
      ],
      defaultTrackingRecords: [
        {
          id: 'rec-1',
          fertilizer: `NPK Complex (${npkRatio})`,
          quantity: Math.round(targetP * 2.5),
          unit: 'kg/ha',
          applicationDate: 'Apr 12, 2025',
          status: 'Applied',
        },
        {
          id: 'rec-2',
          fertilizer: 'Urea Top Dressing',
          quantity: Math.round(targetN * 0.5),
          unit: 'kg/ha',
          applicationDate: 'Apr 28, 2025',
          status: 'Planned',
        },
        {
          id: 'rec-3',
          fertilizer: 'MOP / Potassium Chloride',
          quantity: Math.round(targetK * 0.8),
          unit: 'kg/ha',
          applicationDate: 'May 15, 2025',
          status: 'Planned',
        },
      ],
      insightGenerator: (gapN, gapP, gapK) => {
        const maxGap = Math.max(gapN, gapP, gapK)
        const nutrient = maxGap === gapN ? 'Nitrogen' : maxGap === gapP ? 'Phosphorus' : 'Potassium'
        return {
          primaryGapNutrient: nutrient,
          primaryGapAmount: maxGap,
          title: `${nutrient} is currently the largest nutrient gap (${maxGap} kg/ha) for ${details.displayName}.`,
          recommendation: `Prioritize ${nutrient} supplementation during the recommended crop growth window to reach target yields.`,
        }
      },
    }
  }

  // Soil baseline from inputs or defaults
  const currentN = userSoil?.nitrogen != null ? userSoil.nitrogen : 60
  const currentP = userSoil?.phosphorus != null ? userSoil.phosphorus : 40
  const currentK = userSoil?.potassium != null ? userSoil.potassium : 40
  const currentPh = userSoil?.soilPh != null ? userSoil.soilPh : 6.5

  const targetN = profile.targetN
  const targetP = profile.targetP
  const targetK = profile.targetK
  const phMin = profile.phMin
  const phMax = profile.phMax

  // Compute nutrient gaps
  const gapN = Math.max(0, targetN - currentN)
  const gapP = Math.max(0, targetP - currentP)
  const gapK = Math.max(0, targetK - currentK)

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
    gapStatusLabel: gapN > 30 ? 'High gap' : gapN > 0 ? 'Moderate gap' : 'Optimal',
    progressPercent: Math.min(100, Math.round((currentN / Math.max(targetN, 1)) * 100)),
    colorClass: '#16A34A',
    badgeColorClass:
      statusN === 'Low'
        ? 'bg-rose-50 text-rose-600 border-rose-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  const phosphorusStatus: NutrientStatus = {
    nutrient: 'Phosphorus (P)',
    symbol: 'P',
    current: currentP,
    target: targetP,
    gap: gapP,
    unit: 'kg/ha',
    status: statusP,
    gapStatusLabel: gapP > 20 ? 'High gap' : gapP > 0 ? 'Moderate gap' : 'Optimal',
    progressPercent: Math.min(100, Math.round((currentP / Math.max(targetP, 1)) * 100)),
    colorClass: '#EAB308',
    badgeColorClass:
      statusP === 'Low'
        ? 'bg-rose-50 text-rose-600 border-rose-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  const potassiumStatus: NutrientStatus = {
    nutrient: 'Potassium (K)',
    symbol: 'K',
    current: currentK,
    target: targetK,
    gap: gapK,
    unit: 'kg/ha',
    status: statusK,
    gapStatusLabel: gapK > 20 ? 'High gap' : gapK > 0 ? 'Moderate gap' : 'Optimal',
    progressPercent: Math.min(100, Math.round((currentK / Math.max(targetK, 1)) * 100)),
    colorClass: '#9333EA',
    badgeColorClass:
      statusK === 'Low'
        ? 'bg-rose-50 text-rose-600 border-rose-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  const soilPhStatus: NutrientStatus = {
    nutrient: 'Soil pH',
    symbol: 'pH',
    current: currentPh,
    target: Number(((phMin + phMax) / 2).toFixed(1)),
    gap: 0,
    unit: '',
    status: statusPh,
    optimalRangeLabel: `${phMin.toFixed(1)} – ${phMax.toFixed(1)}`,
    progressPercent: Math.min(100, Math.round((currentPh / 14) * 100)),
    colorClass: '#0D9488',
    badgeColorClass:
      statusPh === 'Suitable'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200',
  }

  // Selected crop image
  let cropImage = details.image || '/crops/ragi.jpg'
  if (details.name.toLowerCase().includes('sugarcane')) {
    cropImage = '/crops/sugarcane.jpg'
  } else if (details.name.toLowerCase().includes('soybean')) {
    cropImage = '/crops/soybean-hero.jpg'
  } else if (details.name.toLowerCase().includes('ragi')) {
    cropImage = '/crops/ragi.jpg'
  }

  const aiInsight = profile.insightGenerator(gapN, gapP, gapK)

  return {
    cropName: details.name,
    cropDisplayName: details.displayName || cropName,
    cropCategory: details.category || 'Cereals',
    cropImage,
    shortAiExplanation: profile.aiExplanation,
    aiRecommendationText:
      `This fertilizer plan is based on your Crop Recommendation for ${details.displayName}, soil chemical testing, and AI farm action plan.`,
    farmName: farmProfile?.farmName || 'Kharif Farm',
    farmArea: farmProfile?.area ? `${farmProfile.area} ha` : '3 ha',
    location: farmProfile?.location || 'Nellore',
    cropStage: 'Vegetative (Day 31–45)',
    soilNutrients: {
      nitrogen: nitrogenStatus,
      phosphorus: phosphorusStatus,
      potassium: potassiumStatus,
      soilPh: soilPhStatus,
    },
    npkRatio: profile.npkRatio,
    recommendedFertilizers: profile.recommendedFertilizers,
    applicationSchedule: profile.applicationSchedule,
    aiInsight,
    defaultTrackingRecords: profile.defaultTrackingRecords,
  }
}
