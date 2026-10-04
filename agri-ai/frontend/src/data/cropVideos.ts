import { normalizeCropName } from './cropCatalog'

export interface CropStageVideoInfo {
  title: string
  youtubeUrl: string
  videoId: string
  duration: string
  description: string
  learnPoints: string[]
  whyExplanation: string
  checklists: Array<{ itemKey: string; name: string; spec?: string }>
}

export type CropActionPlanVideos = {
  prepareSoil: CropStageVideoInfo
  seedTreatment: CropStageVideoInfo
  sowing: CropStageVideoInfo
  irrigation: CropStageVideoInfo
  cropCare: CropStageVideoInfo
  fertilizer: CropStageVideoInfo
  harvest: CropStageVideoInfo
}

export const STAGE_KEYS = [
  'prepareSoil',
  'seedTreatment',
  'sowing',
  'irrigation',
  'cropCare',
  'fertilizer',
  'harvest',
] as const

export type StageKey = (typeof STAGE_KEYS)[number]

export const STEP_NUMBER_TO_STAGE_KEY: Record<number, StageKey> = {
  1: 'prepareSoil',
  2: 'seedTreatment',
  3: 'sowing',
  4: 'irrigation',
  5: 'cropCare',
  6: 'fertilizer',
  7: 'harvest',
}

export const STAGE_TITLES: Record<number, { title: string; stage: string; timeframe: string }> = {
  1: { title: 'Prepare Soil', stage: 'Pre-sowing', timeframe: 'Day 1–10' },
  2: { title: 'Seed Treatment', stage: 'Pre-sowing', timeframe: 'Day 11–14' },
  3: { title: 'Sowing', stage: 'Sowing / Transplanting', timeframe: 'Day 15–25' },
  4: { title: 'Irrigation', stage: 'Vegetative Growth', timeframe: 'Day 26–50' },
  5: { title: 'Crop Care', stage: 'Weeding & IPM', timeframe: 'Day 51–75' },
  6: { title: 'Fertilizer', stage: 'Nutrient Management', timeframe: 'Day 76–95' },
  7: { title: 'Harvest', stage: 'Maturity & Storage', timeframe: 'Day 96–130' },
}

/**
 * Centralized Crop-Video Configuration for AgriAI
 * Mapping canonical crop IDs to verified, crop-specific agricultural tutorials.
 */
export const cropVideos: Record<string, Partial<CropActionPlanVideos>> = {
  // 1. JUTE
  jute: {
    prepareSoil: {
      title: 'Jute Land Preparation & Fine Tilth Seedbed Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=4S7T7vs4K-8',
      videoId: '4S7T7vs4K-8',
      duration: '8:15',
      description:
        'Deep ploughing followed by 3–4 cross harrowings to achieve an extremely fine, pulverized tilth. Jute seeds are minute (2–3 g/1000 seeds) and require loose, weed-free, well-drained alluvial soil to ensure rapid radicle emergence.',
      learnPoints: [
        'Fine pulverization for small jute seedbed',
        'Cross ploughing and clod crushing',
        'Incorporation of 5–8 t/ha well-rotted FYM',
        'Constructing field drainage channels against water stagnation',
      ],
      whyExplanation:
        'Because jute seeds are tiny, unpulverized clods or poor drainage inhibit emergence and cause fatal seedling rot before taproots anchor.',
      checklists: [
        { itemKey: '1-1', name: 'Plough field 3-4 times to achieve fine pulverized tilth', spec: '15-20 cm depth' },
        { itemKey: '1-2', name: 'Incorporate 5-8 t/ha well-decomposed FYM or compost', spec: '5-8 t/ha' },
        { itemKey: '1-3', name: 'Level field and create peripheral drainage furrows', spec: '30 cm depth' },
      ],
    },
    seedTreatment: {
      title: 'Jute Seed Fungicide Dressing & Pre-Sowing Inoculation',
      youtubeUrl: 'https://www.youtube.com/watch?v=uCDb55tSK9c',
      videoId: 'uCDb55tSK9c',
      duration: '5:40',
      description:
        'Coat certified jute seeds (JRO 524 / JRO 204) with Carbendazim 50% WP (2 g/kg seed) or Trichoderma viride (10 g/kg). Pre-treat seeds 24 hours prior to sowing and dry under shade.',
      learnPoints: [
        'Certified high-yielding Olitorius / Capsularis seed selection',
        'Fungicide slurry coating against damping-off & seedling blight',
        'Shade drying protocol before seed drill loading',
        'Germination viability test (>85% target)',
      ],
      whyExplanation:
        'Jute seedlings are highly susceptible to Rhizoctonia root rot and collar rot during the first 15 days; chemical seed dressing safeguards the tender stand.',
      checklists: [
        { itemKey: '2-1', name: 'Inspect certified jute seeds for >85% germination', spec: '>85% viability' },
        { itemKey: '2-2', name: 'Treat seeds with Carbendazim @ 2 g/kg or Trichoderma @ 10 g/kg', spec: '2 g/kg seed' },
        { itemKey: '2-3', name: 'Shade dry coated seeds for 30 minutes before sowing', spec: '30 mins' },
      ],
    },
    sowing: {
      title: 'Jute Line Sowing with Multi-Row Seed Drill & Spacing',
      youtubeUrl: 'https://www.youtube.com/watch?v=MMj2_WvsvJY',
      videoId: 'MMj2_WvsvJY',
      duration: '6:20',
      description:
        'Sow jute in lines using a multi-row seed drill at 25–30 cm row-to-row and 5–7 cm plant-to-plant spacing at a shallow depth of 1.5–2.0 cm into moist soil. Line sowing reduces seed rate from 7 kg to 4–5 kg/ha and simplifies wheel hoe weeding.',
      learnPoints: [
        'Line sowing advantages over traditional broadcasting',
        'Maintaining 25–30 cm row spacing and 5–7 cm plant spacing',
        'Shallow seed placement (1.5–2 cm) in moist soil',
        'Seed drill calibration for 4–5 kg/ha seed rate',
      ],
      whyExplanation:
        'Line sowing enables mechanical wheel-hoeing, reduces weeding labor by 70%, and ensures uniform plant stems without excessive branching for superior fiber quality.',
      checklists: [
        { itemKey: '3-1', name: 'Calibrate seed drill for 4-5 kg/ha seed rate', spec: '4-5 kg/ha' },
        { itemKey: '3-2', name: 'Maintain 25-30 cm row spacing and 5-7 cm plant spacing', spec: '25x5 cm' },
        { itemKey: '3-3', name: 'Sow shallow at 1.5-2 cm depth into moist seedbed', spec: '1.5-2 cm depth' },
      ],
    },
    irrigation: {
      title: 'Jute Moisture Regulation & Waterlogging Drainage',
      youtubeUrl: 'https://www.youtube.com/watch?v=P-PrAS--qGA',
      videoId: 'P-PrAS--qGA',
      duration: '6:10',
      description:
        'Jute requires warm, humid weather and moist soil during establishment. Provide light protective irrigation if pre-monsoon showers fail. Ensure absolute field drainage because water stagnation during the first 45 days stunts stem elongation.',
      learnPoints: [
        'Critical pre-sowing and early vegetative moisture requirements',
        'Furrow irrigation techniques without flooding plant crowns',
        'Rapid drainage furrow maintenance during sudden rains',
        'Tosa jute (C. olitorius) sensitivity to standing water',
      ],
      whyExplanation:
        'While mature white jute tolerates seasonal inundation, young jute plants choke and die under standing water due to soil hypoxia.',
      checklists: [
        { itemKey: '4-1', name: 'Provide light protective irrigation after line sowing if soil is dry', spec: 'Light irrigation' },
        { itemKey: '4-2', name: 'Clear drainage channels to eliminate any water stagnation', spec: 'Zero standing water' },
        { itemKey: '4-3', name: 'Maintain root zone moisture at 50-60% field capacity', spec: '50-60% FC' },
      ],
    },
    cropCare: {
      title: 'Jute Weeding, Thinning & Semilooper / Yellow Mite IPM',
      youtubeUrl: 'https://www.youtube.com/watch?v=uCDb55tSK9c',
      videoId: 'uCDb55tSK9c',
      duration: '7:30',
      description:
        'Conduct first thinning and wheel hoe weeding at 15–20 DAS, followed by final thinning at 30–35 DAS to leave one vigorous seedling every 5–7 cm. Monitor weekly for jute semilooper and yellow mite; apply neem oil (3 ml/L) or profenophos if threshold is breached.',
      learnPoints: [
        'Two-stage thinning protocol at 15 and 30 DAS',
        'Inter-row wheel hoeing for soil aeration and weed destruction',
        'Jute semilooper (Anomis sabulifera) defoliation management',
        'Yellow mite curl symptom identification and bio-pesticide control',
      ],
      whyExplanation:
        'Thinning prevents overcrowding and stem spindliness, ensuring each plant develops thick, continuous bast fiber bundles without breakage.',
      checklists: [
        { itemKey: '5-1', name: 'Conduct first weeding and thinning at 15-20 DAS', spec: '15-20 DAS' },
        { itemKey: '5-2', name: 'Complete final thinning at 30-35 DAS leaving 5-7 cm plant spacing', spec: '5-7 cm stand' },
        { itemKey: '5-3', name: 'Scout for semilooper caterpillars and spray neem bio-pesticide', spec: '3 ml/L' },
      ],
    },
    fertilizer: {
      title: 'Jute Nutrient Management & Split Nitrogen Top-Dressing',
      youtubeUrl: 'https://www.youtube.com/watch?v=4S7T7vs4K-8',
      videoId: '4S7T7vs4K-8',
      duration: '5:50',
      description:
        'Apply balanced fertilizer N:P:K @ 60:30:30 kg/ha. Apply all phosphorus, potash, and 50% nitrogen as basal dose at final ploughing. Top-dress remaining nitrogen in two equal splits at 20–25 DAS (after first weeding) and 40–45 DAS.',
      learnPoints: [
        'Recommended NPK 60:30:30 kg/ha schedule for high fiber yield',
        'Basal placement of single superphosphate and muriate of potash',
        'Split top-dressing of urea after hand weeding',
        'Foliar spray of 1% urea during peak elongation phase',
      ],
      whyExplanation:
        'Nitrogen drives rapid vegetative stem elongation and cell wall thickening in phloem fibers; split application prevents leaching in rainy alluvial belts.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal fertilizer: 50% N + full P2O5 and K2O', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Top-dress first split of urea (25% N) at 20-25 DAS after weeding', spec: '20-25 DAS' },
        { itemKey: '6-3', name: 'Top-dress second split of urea (25% N) at 40-45 DAS', spec: '40-45 DAS' },
      ],
    },
    harvest: {
      title: 'Jute Harvesting at Small Pod Stage & Scientific Retting',
      youtubeUrl: 'https://www.youtube.com/watch?v=P-PrAS--qGA',
      videoId: 'P-PrAS--qGA',
      duration: '9:15',
      description:
        'Harvest jute at 120–135 DAS when 50% of plants show small pod formation. Cut stems close to ground level, bundle into 15–20 cm diameter sheaves, leave in field for 2–3 days for leaf shedding, and submerge in slow-moving clean water for microbial retting (12–15 days).',
      learnPoints: [
        'Harvest timing at 50% small pod initiation stage',
        'Stem cutting at ground level for maximum fiber length',
        'Defoliation protocol before water submergence',
        'Scientific microbial retting and fiber extraction techniques',
      ],
      whyExplanation:
        'Harvesting at small pod stage balances maximum fiber yield with peak tensile strength; delayed harvest results in coarse, brittle, low-grade fiber.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest crop at 50% small pod initiation stage (120-135 DAS)', spec: 'Ground level cut' },
        { itemKey: '7-2', name: 'Stack bundles vertically in field for 2-3 days for natural leaf shed', spec: '2-3 days defoliation' },
        { itemKey: '7-3', name: 'Submerge sheaves in clean slow-moving water for 12-15 days retting', spec: 'Retting tank' },
        { itemKey: '7-4', name: 'Strip, wash in fresh water and sun-dry fiber on bamboo racks', spec: 'Sun dry 14% moisture' },
      ],
    },
  },

  // 2. SOYBEAN
  soybean: {
    prepareSoil: {
      title: 'Soybean Field Bed Preparation & Broad-Bed Furrow (BBF) Technique',
      youtubeUrl: 'https://www.youtube.com/watch?v=xO7VzG90Y1E',
      videoId: 'xO7VzG90Y1E',
      duration: '7:45',
      description:
        'Deep summer ploughing to 20–25 cm followed by two passes of duckfoot cultivator or rotavator to create a loose, friable seedbed. Form Broad Bed and Furrows (BBF) with 1.2 m wide beds and 30 cm furrows to facilitate drainage and in-situ moisture conservation.',
      learnPoints: [
        'Broad Bed Furrow (BBF) setup for deep black soils',
        'Clod pulverization and organic matter incorporation',
        'Ensuring drainage during erratic monsoon deluges',
        'Optimal soil pH balancing (6.0–7.5)',
      ],
      whyExplanation:
        'Soybean roots cannot tolerate water stagnation for over 24 hours; BBF raises the root zone above furrow water levels while retaining subsoil moisture.',
      checklists: [
        { itemKey: '1-1', name: 'Deep summer ploughing to 20-25 cm depth', spec: '20-25 cm' },
        { itemKey: '1-2', name: 'Incorporate 5-6 t/ha well-rotted FYM or compost', spec: '5-6 t/ha' },
        { itemKey: '1-3', name: 'Form Broad Bed and Furrows (BBF: 1.2 m beds, 30 cm furrows)', spec: 'BBF layout' },
      ],
    },
    seedTreatment: {
      title: 'Soybean Seed Inoculation with Bradyrhizobium & Trichoderma',
      youtubeUrl: 'https://www.youtube.com/watch?v=S0jeDW5P6Rs',
      videoId: 'S0jeDW5P6Rs',
      duration: '5:15',
      description:
        'Treat certified soybean seed (JS 335 / JS 9560 / NRC 37) with Thiram + Carbendazim (2:1 @ 3 g/kg), followed by Bradyrhizobium japonicum (5 g/kg) and PSB (5 g/kg) culture using jaggery solution. Always dry in shade before sowing.',
      learnPoints: [
        'Step-wise fungicide, bio-agent, and bacterial culture sequence (FIR method)',
        'Bradyrhizobium japonicum nodulation inoculation',
        'Protecting delicate seed coats against mechanical cracking',
        'Shade drying protocol to maintain bacterial viability',
      ],
      whyExplanation:
        'Bradyrhizobium inoculation ensures early nodule establishment, fixing up to 100 kg atmospheric N/ha and protecting seedlings from charcoal rot.',
      checklists: [
        { itemKey: '2-1', name: 'Coat seed with Thiram + Carbendazim (3 g/kg seed)', spec: '3 g/kg' },
        { itemKey: '2-2', name: 'Inoculate with Bradyrhizobium japonicum & PSB using jaggery slurry', spec: '5 g/kg each' },
        { itemKey: '2-3', name: 'Shade dry seeds for 45 minutes; sow within 6 hours', spec: 'Shade dry' },
      ],
    },
    sowing: {
      title: 'Soybean Sowing with Seed-cum-Fertilizer Drill & Precision Spacing',
      youtubeUrl: 'https://www.youtube.com/watch?v=3grAhD5cdy8',
      videoId: '3grAhD5cdy8',
      duration: '6:20',
      description:
        'Sow soybean when 75–100 mm monsoon rainfall has occurred. Use a seed-cum-fertilizer drill to sow at 45 cm row spacing and 5–7 cm plant spacing at 3–4 cm depth with a seed rate of 65–70 kg/ha.',
      learnPoints: [
        'Optimal monsoon onset timing (75-100 mm rainfall threshold)',
        'Row spacing (45 cm) and seed placement depth (3-4 cm)',
        'Calibrating seed rate (65-70 kg/ha for 400,000 plants/ha)',
        'Simultaneous basal fertilizer placement 5 cm below seed',
      ],
      whyExplanation:
        'Deep sowing (>5 cm) results in poor coleoptile emergence and patchy plant stand; shallow placement into moist soil ensures >90% emergence.',
      checklists: [
        { itemKey: '3-1', name: 'Verify minimum 75 mm soil soaking rain before sowing', spec: '75-100 mm rain' },
        { itemKey: '3-2', name: 'Maintain 45 cm row-to-row spacing and 5-7 cm seed spacing', spec: '45x5 cm' },
        { itemKey: '3-3', name: 'Place seeds at 3-4 cm depth with seed drill', spec: '3-4 cm depth' },
      ],
    },
    irrigation: {
      title: 'Critical Irrigation Stages for Soybean (Flowering & Pod Fill)',
      youtubeUrl: 'https://www.youtube.com/watch?v=0OOis84vqE0',
      videoId: '0OOis84vqE0',
      duration: '5:40',
      description:
        'Soybean is primarily rainfed, but dry spells during flowering (35–45 DAS) and pod filling (60–75 DAS) severely drop yields. Provide sprinkler or furrow protective irrigation during dry spells while avoiding water stagnation.',
      learnPoints: [
        'Critical moisture stress stages (flower initiation and pod filling)',
        'Sprinkler irrigation benefits for uniform moisture without crusted soil',
        'Drainage management during heavy torrential monsoon storms',
        'Soil moisture monitoring at 15–30 cm root zone',
      ],
      whyExplanation:
        'Moisture stress at flowering triggers massive flower abortion, while water deficits during pod filling cause shriveled seeds with low oil percentage.',
      checklists: [
        { itemKey: '4-1', name: 'Scout soil moisture at flower initiation (35-40 DAS)', spec: 'Critical Stage 1' },
        { itemKey: '4-2', name: 'Apply protective sprinkler irrigation during dry spells (>15 dry days)', spec: 'Protective water' },
        { itemKey: '4-3', name: 'Provide irrigation during pod development (60-70 DAS)', spec: 'Critical Stage 2' },
      ],
    },
    cropCare: {
      title: 'Soybean Weed Management & Girdle Beetle IPM Control',
      youtubeUrl: 'https://www.youtube.com/watch?v=Camm_UhKa9s',
      videoId: 'Camm_UhKa9s',
      duration: '7:10',
      description:
        'Maintain weed-free condition for first 40 days using pre-emergence herbicide (Diclosulam 84% WDG @ 30 g/ha) or post-emergence (Imazethapyr 10% SL @ 1 L/ha at 15–20 DAS). Install yellow sticky traps and spray Chlorantraniliprole against girdle beetle and semilooper.',
      learnPoints: [
        'Critical weed competition period (15–40 DAS)',
        'Pre-emergence and early post-emergence weed control',
        'Girdle beetle (Oberopsis brevis) ring-cut symptom identification',
        'Pheromone traps and bio-pesticide neem spray schedule',
      ],
      whyExplanation:
        'Weed infestation during the first 30 days can reduce soybean seed yield by 40–50%; early weed suppression ensures complete canopy closure.',
      checklists: [
        { itemKey: '5-1', name: 'Apply early post-emergence herbicide at 15-20 DAS or hand weed', spec: '15-20 DAS' },
        { itemKey: '5-2', name: 'Install 5 pheromone traps/ha for Spodoptera & girdle beetle', spec: '5 traps/ha' },
        { itemKey: '5-3', name: 'Scout for stem girdling and clip infested petioles', spec: 'Weekly survey' },
      ],
    },
    fertilizer: {
      title: 'Soybean Balanced Fertilizer & Sulphur Nutrition Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=GnPgmusLkB0',
      videoId: 'GnPgmusLkB0',
      duration: '6:35',
      description:
        'Apply N:P:K:S @ 20:60:40:20 kg/ha as full basal dose at the time of sowing. Incorporate gypsum or elemental sulphur to boost seed oil synthesis and protein content. Apply zinc sulphate @ 25 kg/ha if soil is deficient.',
      learnPoints: [
        'Basal NPK dose (starter N + high P2O5 for root nodules)',
        'Crucial role of Sulphur (20 kg/ha) in boosting oil and methionine',
        'Zinc sulphate application in black cotton soils',
        'Foliar spray of 19:19:19 or 00:52:34 at pod initiation',
      ],
      whyExplanation:
        'As a legume, soybean fixes its own nitrogen after 20 days; phosphorus drives continuous nodulation, while sulphur increases seed oil synthesis.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal NPK 20:60:40 kg/ha using DAP and MOP', spec: 'Basal placement' },
        { itemKey: '6-2', name: 'Incorporate Sulphur / Gypsum @ 20-25 kg/ha', spec: '20 kg S/ha' },
        { itemKey: '6-3', name: 'Apply 1% 00:52:34 foliar spray at pod initiation', spec: 'Foliar spray' },
      ],
    },
    harvest: {
      title: 'Soybean Harvesting at 14% Moisture & Threshing Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=g6J0n6g083Q',
      videoId: 'g6J0n6g083Q',
      duration: '6:50',
      description:
        'Harvest soybean when 95% of leaves have turned yellow, fallen, and pods have turned brown with a moisture content of 14–15%. Thresh at low cylinder speed (350–400 rpm) to avoid split grains and loss of seed germination.',
      learnPoints: [
        'Recognizing physiological maturity (leaves dropped, golden-brown pods)',
        'Harvest timing during early morning to avoid pod shattering',
        'Combine harvester / thresher cylinder speed adjustment (350-400 rpm)',
        'Safe seed storage moisture threshold (10-12%)',
      ],
      whyExplanation:
        'Delayed harvesting under hot midday sun causes severe pod shattering and grain scattering in the field, losing up to 25% of the total harvest.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest crop when 95% leaves shed and pods turn brown', spec: '14-15% moisture' },
        { itemKey: '7-2', name: 'Harvest during morning hours to avoid pod shattering', spec: 'Morning harvest' },
        { itemKey: '7-3', name: 'Thresh at 350-400 rpm cylinder speed to prevent seed crack', spec: '350-400 rpm' },
        { itemKey: '7-4', name: 'Sun-dry grains to 10-12% moisture before bagging', spec: '10-12% storage' },
      ],
    },
  },

  // 3. RICE / PADDY
  rice: {
    prepareSoil: {
      title: 'Land Preparation & Field Puddling for Rice Cultivation',
      youtubeUrl: 'https://www.youtube.com/watch?v=7FCLbDgLDqE',
      videoId: '7FCLbDgLDqE',
      duration: '6:45',
      description:
        'Plough the field twice to incorporate crop residue, flood with 5-10 cm standing water, and puddle the soil to form an impermeable hard pan that prevents deep percolation water loss.',
      learnPoints: [
        'Primary and secondary tillage',
        'Field puddling depth and water conservation',
        'Strengthening bunds to prevent water leaks',
        'Laser land leveling for uniform seedling depth',
      ],
      whyExplanation:
        'Puddling destroys soil macropores to create an impermeable hard pan, conserving flooded irrigation water and suppressing terrestrial weed emergence.',
      checklists: [
        { itemKey: '1-1', name: 'Primary ploughing to 15-20 cm depth', spec: '15-20 cm' },
        { itemKey: '1-2', name: 'Flood field with 5-7 cm water and puddle', spec: '5-7 cm water' },
        { itemKey: '1-3', name: 'Level puddled soil with wooden plank', spec: 'Perfect leveling' },
        { itemKey: '1-4', name: 'Apply FYM / Green manure @ 8-10 t/ha', spec: '8-10 t/ha' },
      ],
    },
    seedTreatment: {
      title: 'Paddy Seed Soaking, Incubation & Biological Seed Treatment',
      youtubeUrl: 'https://www.youtube.com/watch?v=ju2w2zd4Was',
      videoId: 'ju2w2zd4Was',
      duration: '5:20',
      description:
        'Dip certified seeds in 10% brine solution to discard chaffy seeds. Treat dense seeds with Carbendazim (2g/kg) and Pseudomonas fluorescens (10g/kg), soak for 24h, and incubate in moist gunny bags for uniform sprouting.',
      learnPoints: [
        'Salt water flotation test to discard non-viable seeds',
        'Fungicide and bio-agent coating technique',
        '24-hour soaking & warm incubation in gunny bags',
        'Radicle sprout emergence before nursery bed sowing',
      ],
      whyExplanation:
        'Brine flotation eliminates empty and fungal-infected seeds; bio-fungicide treatment protects tender emerging radicles against Bakanae, blast, and collar rot.',
      checklists: [
        { itemKey: '2-1', name: 'Float seeds in 10% brine; remove light floating seeds', spec: '10% brine solution' },
        { itemKey: '2-2', name: 'Coat viable seeds with Carbendazim / Trichoderma', spec: '2 g/kg seed' },
        { itemKey: '2-3', name: 'Soak seeds in clean water for 24 hours', spec: '24 hrs soaking' },
        { itemKey: '2-4', name: 'Incubate in moist gunny bag for 24-36 hrs until sprouted', spec: 'Radicle emergence' },
      ],
    },
    sowing: {
      title: 'System of Rice Intensification (SRI) & Precision Transplanting',
      youtubeUrl: 'https://www.youtube.com/watch?v=TkHgAkJhtqw',
      videoId: 'TkHgAkJhtqw',
      duration: '8:30',
      description:
        'Transplant 14-18 day old young seedlings at 1-2 seedlings per hill using 25 x 25 cm square geometry to encourage maximum tillering and root development.',
      learnPoints: [
        'Optimal seedling age (14-18 days)',
        'Single seedling per hill without root trauma',
        'Square planting geometry (25x25 cm)',
        'Shallow transplanting depth (2 cm)',
      ],
      whyExplanation:
        'Young single seedlings planted at wider spacing avoid root trauma, allowing each hill to develop 30-50 vigorous, productive tillers with large panicles.',
      checklists: [
        { itemKey: '3-1', name: 'Lift seedlings carefully with root soil intact', spec: '14-18 day nursery' },
        { itemKey: '3-2', name: 'Transplant 1-2 seedlings per hill', spec: '1-2 seedlings/hill' },
        { itemKey: '3-3', name: 'Maintain 25 cm x 25 cm grid spacing', spec: '25 x 25 cm' },
        { itemKey: '3-4', name: 'Plant shallow at 2 cm depth in moist puddle', spec: '2 cm depth' },
      ],
    },
    irrigation: {
      title: 'Alternate Wetting and Drying (AWD) Water Management in Rice',
      youtubeUrl: 'https://www.youtube.com/watch?v=tfKWKfagfFs',
      videoId: 'tfKWKfagfFs',
      duration: '7:15',
      description:
        'Implement Alternate Wetting and Drying (AWD) using a field water tube. Allow standing water to drop 15 cm below soil surface before re-flooding to save 30% water and promote deep roots.',
      learnPoints: [
        'Perforated field water tube installation',
        'AWD wetting and drying cycles',
        'Maintaining 5 cm standing water during panicle flowering',
        'Preventing excessive drainage crack formation',
      ],
      whyExplanation:
        'AWD introduces oxygen into the rhizosphere between waterings, eliminating toxic root sulfides, reducing water consumption by 30%, and stimulating deeper root anchorage.',
      checklists: [
        { itemKey: '4-1', name: 'Install perforated AWD field water pipe', spec: '15 cm depth' },
        { itemKey: '4-2', name: 'Re-irrigate when water drops 15 cm below soil surface', spec: 'AWD cycle' },
        { itemKey: '4-3', name: 'Maintain 5 cm standing water during flowering stage', spec: '5 cm continuous' },
      ],
    },
    cropCare: {
      title: 'Paddy Stem Borer, Leaf Folder & Blast IPM Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=Yj1-g5nUsxI',
      videoId: 'Yj1-g5nUsxI',
      duration: '8:50',
      description:
        'Monitor the field weekly for dead hearts (stem borer) and leaf folder damage. Use pheromone traps (5/ha) and apply targeted bio-pesticides or recommended IPM sprays if pest thresholds are crossed.',
      learnPoints: [
        'Dead heart and white head identification',
        'Pheromone trap installation and lure replacement',
        'Mechanical cono-weeding between rows',
        'Preventative biocontrol against sheath blight and blast',
      ],
      whyExplanation:
        'Timely IPM intervention during tillering prevents stem borer larvae from boring into the culm and causing irreversible dead hearts and empty white ears.',
      checklists: [
        { itemKey: '5-1', name: 'Install 5 yellow stem borer pheromone traps per hectare', spec: '5 traps/ha' },
        { itemKey: '5-2', name: 'Run cono-weeder at 15 and 30 DAT to incorporate weeds', spec: 'Twice at 15 & 30 DAT' },
        { itemKey: '5-3', name: 'Scout field for spindle-shaped blast lesions on leaves', spec: 'Weekly scouting' },
      ],
    },
    fertilizer: {
      title: 'Rice Nutrient Management, NPK & Zinc Application',
      youtubeUrl: 'https://www.youtube.com/watch?v=X96-339891k',
      videoId: 'X96-339891k',
      duration: '7:40',
      description:
        'Apply recommended NPK @ 120:60:40 kg/ha with Zinc Sulphate (25 kg/ha). Apply all P and K as basal dressing, and split Nitrogen into three doses: 50% basal, 25% active tillering, and 25% panicle initiation.',
      learnPoints: [
        'Basal NPK placement before final puddling',
        'Zinc Sulphate soil application to prevent Khaira disease',
        'Split Urea application at active tillering & panicle initiation',
        'Using Leaf Color Chart (LCC) to optimize nitrogen dose',
      ],
      whyExplanation:
        'Applying nitrogen in synchronized splits matches crop nutrient demand and prevents massive nitrogen leaching in saturated paddy mud.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal fertilizer: 50% N + full P2O5 and K2O', spec: 'Basal placement' },
        { itemKey: '6-2', name: 'Broadcast 25 kg/ha Zinc Sulphate (do not mix with DAP)', spec: '25 kg/ha ZnSO4' },
        { itemKey: '6-3', name: 'Top-dress 25% Nitrogen at active tillering (20-25 DAT)', spec: 'Tillering split' },
        { itemKey: '6-4', name: 'Top-dress final 25% Nitrogen at panicle initiation', spec: 'Panicle split' },
      ],
    },
    harvest: {
      title: 'Paddy Harvesting, Mechanical Threshing & Safe Grain Drying',
      youtubeUrl: 'https://www.youtube.com/watch?v=b36h2E16Y7Q',
      videoId: 'b36h2E16Y7Q',
      duration: '8:10',
      description:
        'Drain field water 10-14 days before harvesting. Harvest when 85-90% of grains in the panicle turn golden yellow and grain moisture drops to 20-22%. Sun dry threshed grains to 13-14% moisture before bagging.',
      learnPoints: [
        'Drainage scheduling before harvest',
        'Maturity indices identification (85-90% golden grains)',
        'Combine harvester operation and field drying',
        'Safe moisture threshold (13-14%) to prevent fungal grain discolouration',
      ],
      whyExplanation:
        'Harvesting at the golden-yellow stage minimizes grain shattering losses in the field while preventing milling cracks caused by over-drying on the stalk.',
      checklists: [
        { itemKey: '7-1', name: 'Drain standing field water 10 days before harvest', spec: 'Field drying' },
        { itemKey: '7-2', name: 'Harvest when 85-90% of panicles turn golden yellow', spec: '20-22% moisture' },
        { itemKey: '7-3', name: 'Thresh and clean grains to eliminate chaff and dockage', spec: 'Clean winnowing' },
        { itemKey: '7-4', name: 'Sun dry grains on tarpaulin to 13-14% moisture', spec: '13-14% target' },
      ],
    },
  },

  // 4. MAIZE / CORN
  maize: {
    prepareSoil: {
      title: 'Maize Land Preparation & Ridge-and-Furrow Layout',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJECXvIv4D0',
      videoId: 'kJECXvIv4D0',
      duration: '7:10',
      description:
        'Deep summer ploughing to 20-25 cm depth followed by disc harrowing to pulverize clods. Form ridges and furrows at 60 cm spacing to ensure drainage and prevent waterlogging.',
      learnPoints: [
        'Deep tillage for deep taproot growth',
        'Ridge and furrow creation (60 cm spacing)',
        'Incorporating organic farmyard manure (10 t/ha)',
        'Soil moisture check for seed placement',
      ],
      whyExplanation:
        'Maize is highly sensitive to waterlogging; ridge sowing lifts the seed crown 15 cm above furrow level, ensuring adequate aeration even during heavy downpours.',
      checklists: [
        { itemKey: '1-1', name: 'Deep ploughing to 20-25 cm depth', spec: '20-25 cm' },
        { itemKey: '1-2', name: 'Apply 10-12 t/ha well decomposed FYM', spec: '10-12 t/ha' },
        { itemKey: '1-3', name: 'Form ridges and furrows at 60 cm spacing', spec: '60 cm spacing' },
      ],
    },
    seedTreatment: {
      title: 'Maize Seed Treatment with Fungicide and Insecticide',
      youtubeUrl: 'https://www.youtube.com/watch?v=8c_ofaaAFeg',
      videoId: '8c_ofaaAFeg',
      duration: '5:45',
      description:
        'Treat certified hybrid maize seeds with Thiram or Captan (2.5 g/kg) and Imidacloprid (4 ml/kg) to guard against seed rot, shoot fly, and early soil insects.',
      learnPoints: [
        'Fungicidal seed dressing dosage',
        'Systemic insecticide treatment against shoot fly',
        'Drying treated seeds in shaded area',
        'Pre-sowing germination check (>85%)',
      ],
      whyExplanation:
        'Early seedling mortality from damping off or shoot fly cannot be compensated in maize because individual plants do not produce productive tillers.',
      checklists: [
        { itemKey: '2-1', name: 'Coat seeds with Thiram / Captan (2.5 g/kg)', spec: '2.5 g/kg' },
        { itemKey: '2-2', name: 'Treat with Imidacloprid 70 WS (4 ml/kg)', spec: '4 ml/kg' },
        { itemKey: '2-3', name: 'Shade dry for 30 minutes before dibbling', spec: '30 mins' },
      ],
    },
    sowing: {
      title: 'Precision Maize Sowing, Plant Geometry & Spacing',
      youtubeUrl: 'https://www.youtube.com/watch?v=CfiMY6VDpEY',
      videoId: 'CfiMY6VDpEY',
      duration: '6:30',
      description:
        'Dibble one seed per hill on the side of the ridge at 60 cm row-to-row and 20 cm plant-to-plant spacing at 4-5 cm depth into moist soil.',
      learnPoints: [
        'Recommended geometry (60 cm x 20 cm)',
        'Sowing on side of ridge to prevent seed submergence',
        'Depth control (4-5 cm) for firm seed-soil contact',
        'Target plant population (66,000 plants/ha)',
      ],
      whyExplanation:
        'Dibbling on the ridge shoulder avoids water pooling around seeds during emergence while ensuring roots quickly reach subsoil moisture.',
      checklists: [
        { itemKey: '3-1', name: 'Dibble 1 seed per hill at 60 cm x 20 cm spacing', spec: '60x20 cm' },
        { itemKey: '3-2', name: 'Ensure seed is placed at 4-5 cm depth in moist soil', spec: '4-5 cm depth' },
        { itemKey: '3-3', name: 'Gap fill within 7 days of emergence', spec: 'Stand check' },
      ],
    },
    irrigation: {
      title: 'Maize Critical Stage Irrigation & Furrow Drainage',
      youtubeUrl: 'https://www.youtube.com/watch?v=8_b1p5xX0gI',
      videoId: '8_b1p5xX0gI',
      duration: '6:55',
      description:
        'Provide irrigation at critical phases: knee-high stage (30 DAS), tasseling (45-50 DAS), and grain-filling (65-75 DAS). Irrigate along furrows and drain excess water rapidly.',
      learnPoints: [
        'Identification of tasseling and silking stages',
        'Furrow irrigation method to save 30% water',
        'Immediate drainage protocol after excessive rain',
        'Soil moisture monitoring in root zone',
      ],
      whyExplanation:
        'Moisture stress during tasseling and silking inhibits pollination, leading to barren cobs with severe yield loss of up to 50%.',
      checklists: [
        { itemKey: '4-1', name: 'Irrigate at knee-high stage (30-35 DAS)', spec: 'Knee-high' },
        { itemKey: '4-2', name: 'Ensure moisture availability at tasseling (45-50 DAS)', spec: 'Tasseling' },
        { itemKey: '4-3', name: 'Maintain furrow irrigation during grain filling', spec: 'Grain fill' },
      ],
    },
    cropCare: {
      title: 'Fall Armyworm (FAW) Identification & Bio-control in Maize',
      youtubeUrl: 'https://www.youtube.com/watch?v=T97T1v37rV0',
      videoId: 'T97T1v37rV0',
      duration: '8:15',
      description:
        'Scout weekly for Fall Armyworm (FAW) whorl feeding symptoms. Install 5 pheromone traps/ha, release Trichogramma egg parasitoids, and apply neem oil or recommended bio-pesticide into the whorl.',
      learnPoints: [
        'FAW four inverted spots and Y-mark identification',
        'Whorl application of neem bio-pesticide',
        'Installing pheromone traps (5/ha)',
        'Conserving natural predators like earwigs and birds',
      ],
      whyExplanation:
        'Early detection of FAW at egg or first-instar stage allows biological control before caterpillars bore deep into the protective leaf whorl.',
      checklists: [
        { itemKey: '5-1', name: 'Install 5 FAW pheromone traps per hectare', spec: '5 traps/ha' },
        { itemKey: '5-2', name: 'Scout whorls weekly for pin-holes and fresh frass', spec: 'Weekly check' },
        { itemKey: '5-3', name: 'Apply Neem Formulation (1500 ppm @ 5ml/L) in central whorl', spec: 'Whorl application' },
      ],
    },
    fertilizer: {
      title: 'Maize Fertilizer Scheduling & Split Urea Application',
      youtubeUrl: 'https://www.youtube.com/watch?v=4Wf0R8h8U1k',
      videoId: '4Wf0R8h8U1k',
      duration: '7:20',
      description:
        'Apply N:P:K @ 120:60:50 kg/ha. Apply all phosphorus, potassium, and 25% nitrogen at sowing. Top-dress 50% nitrogen at knee-high stage and 25% at tasseling stage.',
      learnPoints: [
        'Basal NPK placement 5 cm away from seeds',
        'Knee-high stage top dressing with earthing up',
        'Tasseling nitrogen split for kernel weight',
        'Zinc Sulphate soil application to prevent white bud',
      ],
      whyExplanation:
        'Split application aligns with the rapid nutrient uptake curve of maize, preventing nitrogen volatilization and maximizing cob kernel size.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal NPK (25% N + full P and K)', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Top-dress 50% Urea at knee-high stage (30 DAS) followed by earthing up', spec: 'Knee-high split' },
        { itemKey: '6-3', name: 'Top-dress remaining 25% Urea at tasseling stage (50 DAS)', spec: 'Tasseling split' },
      ],
    },
    harvest: {
      title: 'Maize Cob Maturity Indices, Harvesting & Shelling',
      youtubeUrl: 'https://www.youtube.com/watch?v=E3zT2k50M1g',
      videoId: 'E3zT2k50M1g',
      duration: '6:40',
      description:
        'Harvest when cob sheath turns completely straw-yellow and grain develops a black layer at the base (20% moisture). De-husk, dry cobs in the sun, and shell kernels for storage.',
      learnPoints: [
        'Black layer maturity index identification',
        'Dry straw sheath verification',
        'Sun drying cobs to 12% moisture',
        'Mechanical cob shelling without grain breakage',
      ],
      whyExplanation:
        'Harvesting at black layer formation ensures maximum dry matter accumulation in the grain and prevents mold development during storage.',
      checklists: [
        { itemKey: '7-1', name: 'Check black layer at base of maize kernel', spec: 'Black layer index' },
        { itemKey: '7-2', name: 'Harvest cobs when outer husks are dry and papery', spec: 'Maturity' },
        { itemKey: '7-3', name: 'Sun dry de-husked cobs on clean concrete floor for 3-4 days', spec: 'Sun drying' },
        { itemKey: '7-4', name: 'Shell kernels and verify storage moisture is under 12%', spec: '12% target' },
      ],
    },
  },

  // 5. WHEAT
  wheat: {
    prepareSoil: {
      title: 'Wheat Seedbed Preparation & Zero-Tillage Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=tbfzH8wa6rY',
      videoId: 'tbfzH8wa6rY',
      duration: '7:30',
      description:
        'Prepare a fine, compact seedbed with 1 deep ploughing followed by 2 cross harrowings and planking. In rice-wheat cropping systems, use a Happy Seeder or Zero Till Drill directly in retained paddy stubble to conserve moisture and advance sowing by 10 days.',
      learnPoints: [
        'Zero-till / Happy Seeder advantages in paddy residue',
        'Cross ploughing and firm planking for seed-soil contact',
        'Conserving residual soil moisture from Kharif harvest',
        'Pre-sowing irrigation (Paleva) scheduling',
      ],
      whyExplanation:
        'Compact pulverized soil provides firm seed-soil contact for wheat coleoptiles while avoiding excessive moisture evaporation in dry winter air.',
      checklists: [
        { itemKey: '1-1', name: 'Perform pre-sowing irrigation (Paleva) to ensure moist seedbed', spec: 'Paleva watering' },
        { itemKey: '1-2', name: 'Plough twice followed by planking to create firm compact tilth', spec: 'Firm seedbed' },
        { itemKey: '1-3', name: 'Incorporate 8-10 t/ha FYM or compost during final tillage', spec: '8-10 t/ha' },
      ],
    },
    seedTreatment: {
      title: 'Wheat Seed Treatment against Loose Smut & Termites',
      youtubeUrl: 'https://www.youtube.com/watch?v=S0jeDW5P6Rs',
      videoId: 'S0jeDW5P6Rs',
      duration: '5:20',
      description:
        'Treat certified wheat seed with Carboxin / Tebuconazole (1.5 g/kg seed) to prevent seed-borne loose smut, followed by Chlorpyrifos or Thiamethoxam (3 g/kg) against subterranean termites. Inoculate with Azotobacter and PSB culture.',
      learnPoints: [
        'Systemic fungicide seed dressing against loose smut and flag smut',
        'Termite protection coating in light soils',
        'Bio-fertilizer Azotobacter seed inoculation',
        'Germination percentage check (>85%)',
      ],
      whyExplanation:
        'Loose smut fungi reside internally within the embryo; systemic seed treatment is the only effective measure to prevent infected earheads.',
      checklists: [
        { itemKey: '2-1', name: 'Treat seeds with Carboxin 75 WP @ 1.5 g/kg seed', spec: '1.5 g/kg' },
        { itemKey: '2-2', name: 'Coat with Thiamethoxam 30 FS @ 3 ml/kg against termites', spec: '3 ml/kg' },
        { itemKey: '2-3', name: 'Inoculate with Azotobacter & PSB slurry; shade dry before drilling', spec: 'Bio-slurry' },
      ],
    },
    sowing: {
      title: 'Wheat Sowing with Zero-Till / Happy Seeder Drill & Spacing',
      youtubeUrl: 'https://www.youtube.com/watch?v=3grAhD5cdy8',
      videoId: '3grAhD5cdy8',
      duration: '8:15',
      description:
        'Sow wheat during optimal window (November 1–15 for timely sown, November 15–30 for late sown). Use a seed drill to sow at 20–22.5 cm row spacing and 4–5 cm depth at a seed rate of 100 kg/ha (125 kg/ha for late sowing).',
      learnPoints: [
        'Optimal sowing calendar window (early to mid-November)',
        'Calibrating seed drill for 100 kg/ha seed rate',
        'Row spacing (20-22.5 cm) and shallow placement (4-5 cm)',
        'Avoiding deep sowing which delays crown root emergence',
      ],
      whyExplanation:
        'Every week of delay in sowing beyond November 15 reduces wheat yield by 150 kg/ha due to terminal heat stress during grain filling in March.',
      checklists: [
        { itemKey: '3-1', name: 'Sow between Nov 1 - 20 for maximum yield potential', spec: 'Optimal window' },
        { itemKey: '3-2', name: 'Maintain 20-22.5 cm row spacing and 4-5 cm sowing depth', spec: '20x5 cm' },
        { itemKey: '3-3', name: 'Calibrate seed drill for 100 kg/ha certified seed rate', spec: '100 kg/ha' },
      ],
    },
    irrigation: {
      title: 'Wheat Crown Root Initiation (CRI) Critical Irrigation Scheduling',
      youtubeUrl: 'https://www.youtube.com/watch?v=0OOis84vqE0',
      videoId: '0OOis84vqE0',
      duration: '6:40',
      description:
        'The most critical irrigation for wheat is Crown Root Initiation (CRI) at 20–25 DAS. Provide subsequent irrigations at tillering (40–45 DAS), late jointing (60–65 DAS), flowering (80–85 DAS), and milk/dough stage (100–105 DAS).',
      learnPoints: [
        'Identification of Crown Root Initiation (CRI at 21 DAS)',
        'The 5 critical moisture stages of wheat',
        'Avoiding irrigation during high wind to prevent lodging',
        'Border strip and sprinkler irrigation management',
      ],
      whyExplanation:
        'Skipping CRI irrigation inhibits crown root development and tiller formation, causing an irreversible yield reduction of up to 40%.',
      checklists: [
        { itemKey: '4-1', name: 'Apply first and most critical irrigation at CRI stage (20-25 DAS)', spec: 'CRI Stage (mandatory)' },
        { itemKey: '4-2', name: 'Apply second irrigation at late tillering (40-45 DAS)', spec: 'Tillering stage' },
        { itemKey: '4-3', name: 'Apply irrigations at jointing (65 DAS) and flowering (85 DAS)', spec: 'Booting/Flowering' },
      ],
    },
    cropCare: {
      title: 'Yellow Rust & Broadleaf Weed Integrated Management in Wheat',
      youtubeUrl: 'https://www.youtube.com/watch?v=Camm_UhKa9s',
      videoId: 'Camm_UhKa9s',
      duration: '7:25',
      description:
        'Control Phalaris minor (gulli danda) and broadleaf weeds at 30–35 DAS using recommended herbicides. Scout weekly in winter for yellow/stripe rust pustules on upper leaves; spray Propiconazole 25% EC (1 ml/L) immediately if symptoms appear.',
      learnPoints: [
        'Distinguishing Phalaris minor from wheat seedlings',
        'Post-emergence herbicide spraying technique at 30-35 DAS',
        'Yellow rust (Puccinia striiformis) yellow stripe scouting',
        'Timely triazole fungicide spraying protocol',
      ],
      whyExplanation:
        'Yellow rust spores spread rapidly in cool humid winter winds; a single timely spray saves the flag leaf, which provides 70% of photosynthates to grains.',
      checklists: [
        { itemKey: '5-1', name: 'Apply post-emergence weed control at 30-35 DAS after first irrigation', spec: '30-35 DAS' },
        { itemKey: '5-2', name: 'Scout northern/western fields weekly for yellow rust patches', spec: 'Weekly check' },
        { itemKey: '5-3', name: 'Spray Propiconazole @ 1 ml/L upon first detection of stripe rust', spec: '1 ml/L' },
      ],
    },
    fertilizer: {
      title: 'Wheat Fertilizer Scheduling & Split Urea Application',
      youtubeUrl: 'https://www.youtube.com/watch?v=GnPgmusLkB0',
      videoId: 'GnPgmusLkB0',
      duration: '6:10',
      description:
        'Apply N:P:K @ 120:60:40 kg/ha. Apply all phosphorus, potash, and 50% nitrogen as basal dose at sowing. Top-dress 25% nitrogen at first irrigation (CRI stage) and remaining 25% at second irrigation (jointing stage).',
      learnPoints: [
        'Basal NPK placement with seed drill',
        'First nitrogen top-dressing at CRI stage just prior to irrigation',
        'Second top-dressing at jointing stage',
        'Zinc Sulphate (25 kg/ha) application for wheat vigor',
      ],
      whyExplanation:
        'Split nitrogen application prevents leaching during heavy winter irrigations and supplies nitrogen when tiller and earhead initiation are underway.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal fertilizer: 50% N + full P2O5 and K2O at sowing', spec: 'Basal drill' },
        { itemKey: '6-2', name: 'Top-dress first split of Urea (25% N) before CRI irrigation', spec: 'CRI split' },
        { itemKey: '6-3', name: 'Top-dress second split of Urea (25% N) before jointing irrigation', spec: 'Jointing split' },
      ],
    },
    harvest: {
      title: 'Wheat Combine Harvesting & Safe Moisture Storage',
      youtubeUrl: 'https://www.youtube.com/watch?v=g6J0n6g083Q',
      videoId: 'g6J0n6g083Q',
      duration: '7:05',
      description:
        'Harvest wheat when grains turn hard and cannot be dented with a thumbnail, straw turns dry golden-yellow, and grain moisture drops below 14%. Harvest with combine harvester, clean grains, and store at 10–12% moisture.',
      learnPoints: [
        'Thumbnail hardness test for physiological maturity',
        'Combine harvester setting to minimize grain damage',
        'Paddy straw / wheat bhusa management',
        'Safe storage protocols against Khapra beetle and grain weevils',
      ],
      whyExplanation:
        'Harvesting at <14% grain moisture avoids fungal contamination while preventing shattering and lodging caused by sudden western disturbance thunderstorms.',
      checklists: [
        { itemKey: '7-1', name: 'Verify thumbnail test: grain is flinty hard and golden yellow', spec: '<14% moisture' },
        { itemKey: '7-2', name: 'Harvest using combine harvester during dry sunny weather', spec: 'Clean harvest' },
        { itemKey: '7-3', name: 'Sun-dry grains on tarpaulin to 10-12% storage moisture', spec: '10-12% moisture' },
      ],
    },
  },

  // 6. COTTON
  cotton: {
    prepareSoil: {
      title: 'Cotton Deep Tillage & Ridge-Bed Layout in Black Soil',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJECXvIv4D0',
      videoId: 'kJECXvIv4D0',
      duration: '7:20',
      description:
        'Deep summer ploughing to 25–30 cm in deep black cotton (Vertisol) soils to break the hard subsoil layer. Harrow twice, apply 10 t/ha FYM, and construct broad ridges and furrows at 90–120 cm spacing.',
      learnPoints: ['Deep subsoiling in black soils', 'Ridge-and-furrow layout (90-120 cm spacing)', 'Incorporating FYM & gypsum', 'Moisture conservation'],
      whyExplanation: 'Cotton possesses a deep taproot; subsoiling allows roots to penetrate 1.5–2 meters into the subsoil to access moisture during dry spells.',
      checklists: [
        { itemKey: '1-1', name: 'Deep ploughing to 25-30 cm depth in black soils', spec: '25-30 cm' },
        { itemKey: '1-2', name: 'Incorporate 10-12 t/ha well decomposed FYM', spec: '10-12 t/ha' },
        { itemKey: '1-3', name: 'Form ridges and furrows at 90-120 cm spacing', spec: 'Ridge layout' },
      ],
    },
    seedTreatment: {
      title: 'Cotton Delinting & Bio-Agent Seed Inoculation',
      youtubeUrl: 'https://www.youtube.com/watch?v=8c_ofaaAFeg',
      videoId: '8c_ofaaAFeg',
      duration: '5:50',
      description:
        'Treat certified hybrid Bt cotton seeds with Imidacloprid 70 WS (5 g/kg) and Pseudomonas fluorescens (10 g/kg). Dry under shade for 30 minutes before planting.',
      learnPoints: ['Delinted seed quality check', 'Systemic insecticide coating against sucking pests', 'Trichoderma & Azotobacter slurry', 'Shade drying'],
      whyExplanation: 'Chemical seed dressing shields tender cotton seedlings from jassids, thrips, and aphids during the critical first 30 days after emergence.',
      checklists: [
        { itemKey: '2-1', name: 'Inspect certified hybrid seed germination (>75%)', spec: '>75% viability' },
        { itemKey: '2-2', name: 'Treat seeds with Imidacloprid @ 5 g/kg against sucking pests', spec: '5 g/kg' },
        { itemKey: '2-3', name: 'Coat with Trichoderma @ 10 g/kg; shade dry 30 mins', spec: '10 g/kg' },
      ],
    },
    sowing: {
      title: 'Cotton Dibbling & High-Density Spacing System',
      youtubeUrl: 'https://www.youtube.com/watch?v=CfiMY6VDpEY',
      videoId: 'CfiMY6VDpEY',
      duration: '6:45',
      description:
        'Dibble 1–2 seeds per hill at 90 cm row spacing and 45–60 cm plant spacing at 3–4 cm depth on the ridge shoulders into moist soil after 50 mm monsoon soaking rain.',
      learnPoints: ['Dibbling on ridge shoulders', 'Row spacing (90x45 cm or 90x60 cm)', 'Depth control (3-4 cm)', 'Gap filling within 7 days'],
      whyExplanation: 'Ridge planting keeps seed collars elevated above waterlogged furrows during sudden early monsoon showers.',
      checklists: [
        { itemKey: '3-1', name: 'Dibble 1 seed per hill at 90 cm x 60 cm spacing', spec: '90x60 cm' },
        { itemKey: '3-2', name: 'Place seeds at 3-4 cm depth into moist ridge soil', spec: '3-4 cm depth' },
        { itemKey: '3-3', name: 'Perform gap filling within 7 days of emergence', spec: 'Stand check' },
      ],
    },
    irrigation: {
      title: 'Cotton Drip Irrigation Scheduling & Moisture Balancing',
      youtubeUrl: 'https://www.youtube.com/watch?v=8_b1p5xX0gI',
      videoId: '8_b1p5xX0gI',
      duration: '7:10',
      description:
        'Irrigate at critical stages: squaring (45 DAS), peak flowering (70 DAS), and boll development (90–110 DAS). Drip irrigation saves 40% water and prevents boll shedding.',
      learnPoints: ['Critical squaring and flowering moisture windows', 'Drip fertigation scheduling', 'Drainage management against root rot', 'Avoiding water stress during boll filling'],
      whyExplanation: 'Moisture stress during flowering and boll formation causes massive boll drop and premature senescence, slashing yields by half.',
      checklists: [
        { itemKey: '4-1', name: 'Irrigate at squaring stage (45 DAS)', spec: 'Squaring' },
        { itemKey: '4-2', name: 'Maintain adequate moisture during flowering (70-80 DAS)', spec: 'Flowering' },
        { itemKey: '4-3', name: 'Provide irrigation during boll development (90-110 DAS)', spec: 'Boll fill' },
      ],
    },
    cropCare: {
      title: 'Pink Bollworm & Sucking Pest IPM in Bt Cotton',
      youtubeUrl: 'https://www.youtube.com/watch?v=T97T1v37rV0',
      videoId: 'T97T1v37rV0',
      duration: '8:40',
      description:
        'Install 5 pheromone traps/ha for pink bollworm at 45 DAS. Inspect flowers for rosette blooms. Spray neem oil (1500 ppm) or targeted insecticides if ETL is crossed.',
      learnPoints: ['Pink bollworm rosette flower identification', 'Pheromone trap installation and lure change', 'Yellow sticky cards for whitefly', 'IPM threshold monitoring'],
      whyExplanation: 'Pink bollworm larvae enter tender young bolls within hours of hatching; preventative pheromone monitoring is crucial before internal burrowing occurs.',
      checklists: [
        { itemKey: '5-1', name: 'Install 5 pink bollworm pheromone traps per hectare at 45 DAS', spec: '5 traps/ha' },
        { itemKey: '5-2', name: 'Scout weekly for rosette flowers and destroy infested bolls', spec: 'Rosette check' },
        { itemKey: '5-3', name: 'Spray Neem oil 1500 ppm @ 5 ml/L for sucking pest suppression', spec: '5 ml/L' },
      ],
    },
    fertilizer: {
      title: 'Cotton Nutrient Scheduling & Magnesium / Boron Foliar Spray',
      youtubeUrl: 'https://www.youtube.com/watch?v=4Wf0R8h8U1k',
      videoId: '4Wf0R8h8U1k',
      duration: '6:30',
      description:
        'Apply N:P:K @ 120:60:60 kg/ha in 3 split doses. Spray 1% Magnesium Sulphate (MgSO4) + 0.1% Boron at peak flowering and boll formation to prevent leaf reddening.',
      learnPoints: ['Basal P & K application', 'Split nitrogen top dressing at 30, 60, and 90 DAS', 'Magnesium sulphate foliar spray against reddening', 'Boron application for boll retention'],
      whyExplanation: 'Magnesium deficiency causes severe leaf reddening and premature leaf drop in Bt cotton; foliar MgSO4 keeps leaves photosynthesizing through late boll filling.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal NPK (25% N + full P2O5 and 50% K2O)', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Top-dress 50% N + 50% K2O at squaring stage (45 DAS)', spec: 'Squaring split' },
        { itemKey: '6-3', name: 'Foliar spray 1% MgSO4 + 0.1% Boron at peak flowering', spec: 'Foliar spray' },
      ],
    },
    harvest: {
      title: 'Cotton Clean Picking, Moisture Control & Storage',
      youtubeUrl: 'https://www.youtube.com/watch?v=E3zT2k50M1g',
      videoId: 'E3zT2k50M1g',
      duration: '6:15',
      description:
        'Pick cotton in 3–4 pickings as bolls burst fully open. Pick in dry sunny weather after morning dew has evaporated. Store in dry, clean bags to prevent contamination and yellowing.',
      learnPoints: ['Picking fully opened bolls only', 'Avoiding dry bract and leaf trash contamination', 'Picking after dew evaporation', 'Safe storage moisture (<8%)'],
      whyExplanation: 'Trash-free, moisture-free picked cotton fetches premium price at market; damp cotton heats up and develops yellowish mold discoloration.',
      checklists: [
        { itemKey: '7-1', name: 'Pick cotton after 10 AM once morning dew has evaporated', spec: 'Dry picking' },
        { itemKey: '7-2', name: 'Separate stained or pest-damaged cotton from clean white lint', spec: 'Grade sorting' },
        { itemKey: '7-3', name: 'Sun-dry picked seed cotton on clean tarpaulin to <8% moisture', spec: '<8% moisture' },
      ],
    },
  },

  // 8. MUSTARD
  mustard: {
    prepareSoil: {
      title: 'Mustard Seedbed Preparation & Soil Moisture Conservation',
      youtubeUrl: 'https://www.youtube.com/watch?v=tbfzH8wa6rY',
      videoId: 'tbfzH8wa6rY',
      duration: '6:40',
      description: 'Plough field to fine tilth with 2-3 harrowings and planking to conserve conserved moisture.',
      learnPoints: ['Fine seedbed for small seeds', 'Moisture conservation planking', '8 t/ha FYM incorporation', 'Drainage furrow creation'],
      whyExplanation: 'Conserving soil moisture during October is vital for mustard germination in dry post-monsoon soil.',
      checklists: [
        { itemKey: '1-1', name: 'Plough twice followed by firm planking for fine tilth', spec: 'Fine tilth' },
        { itemKey: '1-2', name: 'Incorporate 8-10 t/ha well-rotted FYM', spec: '8-10 t/ha' },
        { itemKey: '1-3', name: 'Form peripheral irrigation and drainage channels', spec: 'Channel layout' },
      ],
    },
    seedTreatment: {
      title: 'Mustard Seed Treatment with Metalaxyl against White Rust',
      youtubeUrl: 'https://www.youtube.com/watch?v=S0jeDW5P6Rs',
      videoId: 'S0jeDW5P6Rs',
      duration: '5:10',
      description: 'Treat certified mustard seed with Metalaxyl (Apron 35 SD @ 6 g/kg) to protect against early white rust and downy mildew.',
      learnPoints: ['Metalaxyl fungicide coating', 'Trichoderma bio-dressing', 'Shade drying seeds', 'Seed viability check'],
      whyExplanation: 'Seed treatment prevents early fungal blight and damping-off during cool October nights.',
      checklists: [
        { itemKey: '2-1', name: 'Coat seeds with Metalaxyl @ 6 g/kg seed', spec: '6 g/kg' },
        { itemKey: '2-2', name: 'Mix with Azotobacter bio-fertilizer slurry', spec: 'Bio-slurry' },
        { itemKey: '2-3', name: 'Shade dry for 30 minutes before drilling', spec: '30 mins' },
      ],
    },
    sowing: {
      title: 'Line Sowing & Thinning of Mustard Crop',
      youtubeUrl: 'https://www.youtube.com/watch?v=3grAhD5cdy8',
      videoId: '3grAhD5cdy8',
      duration: '6:05',
      description: 'Sow mustard in rows at 30 cm spacing and 10-12 cm plant spacing at shallow depth of 2-3 cm into moist soil.',
      learnPoints: ['Row spacing (30x10 cm)', 'Shallow sowing depth (2-3 cm)', 'Calibrating seed rate (3.5-4 kg/ha)', 'Thinning at 15-20 DAS'],
      whyExplanation: 'Shallow sowing ensures quick cotyledon emergence; timely thinning prevents mutual shading and aphid buildup.',
      checklists: [
        { itemKey: '3-1', name: 'Sow at 30 cm row-to-row spacing at 2-3 cm depth', spec: '30x10 cm' },
        { itemKey: '3-2', name: 'Calibrate seed rate to 3.5-4 kg/ha', spec: '3.5-4 kg/ha' },
        { itemKey: '3-3', name: 'Thin plants to 10-12 cm spacing at 15-20 DAS', spec: 'Thinning' },
      ],
    },
    irrigation: {
      title: 'Mustard Irrigation at Rosette and Siliqua Development',
      youtubeUrl: 'https://www.youtube.com/watch?v=0OOis84vqE0',
      videoId: '0OOis84vqE0',
      duration: '5:50',
      description: 'Provide first irrigation at rosette stage (28-35 DAS) and second irrigation at siliqua / pod filling stage (65-70 DAS).',
      learnPoints: ['Critical rosette and siliqua stages', 'Light furrow irrigation', 'Avoiding waterlogging', 'Moisture check in root zone'],
      whyExplanation: 'Moisture stress at pod filling reduces seed weight and oil content per siliqua.',
      checklists: [
        { itemKey: '4-1', name: 'Apply first irrigation at rosette stage (28-35 DAS)', spec: 'Rosette stage' },
        { itemKey: '4-2', name: 'Apply second irrigation at pod development (65-70 DAS)', spec: 'Pod fill' },
      ],
    },
    cropCare: {
      title: 'Mustard Aphid & White Rust Integrated Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=Camm_UhKa9s',
      videoId: 'Camm_UhKa9s',
      duration: '7:15',
      description: 'Install yellow sticky traps for aphids. Scout floral buds; spray Dimethoate 30 EC (1.5 ml/L) or neem oil if aphid colonies appear.',
      learnPoints: ['Aphid colony identification on floral twigs', 'Yellow sticky trap installation', 'White rust staghead symptom check', 'Timely bio-pesticide spray'],
      whyExplanation: 'Mustard aphids multiply explosively in cloudy winter weather, sucking sap and drying up flowering branches.',
      checklists: [
        { itemKey: '5-1', name: 'Install 10 yellow sticky traps/ha at flowering initiation', spec: '10 traps/ha' },
        { itemKey: '5-2', name: 'Scout weekly for aphid colonies on central flowering shoots', spec: 'Weekly check' },
        { itemKey: '5-3', name: 'Spray neem oil or recommended insecticide if ETL is exceeded', spec: 'IPM spray' },
      ],
    },
    fertilizer: {
      title: 'Sulphur & Urea Fertilizer Mixing Guide for Mustard',
      youtubeUrl: 'https://www.youtube.com/watch?v=GnPgmusLkB0',
      videoId: 'GnPgmusLkB0',
      duration: '6:30',
      description: 'Apply N:P:K:S @ 80:40:40:30 kg/ha. Apply all P, K, Sulphur and 50% N as basal. Top-dress 50% N at first irrigation.',
      learnPoints: ['Crucial role of Sulphur (30 kg/ha) in oil synthesis', 'Basal NPK placement', 'Top-dressing urea at first watering', 'Zinc sulphate application'],
      whyExplanation: 'Sulphur directly increases mustard glucosinolates and seed oil recovery by 3-5%.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal NPK (50% N + full P and K)', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Apply 30-40 kg Sulphur (Bentonite / Gypsum) per hectare', spec: '30 kg S/ha' },
        { itemKey: '6-3', name: 'Top-dress 50% Urea before first irrigation at 30 DAS', spec: 'Top dressing' },
      ],
    },
    harvest: {
      title: 'Mustard Crop Harvesting & Threshing Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=g6J0n6g083Q',
      videoId: 'g6J0n6g083Q',
      duration: '6:45',
      description: 'Harvest when 75% of siliquae turn golden yellow. Harvest during early morning hours to avoid shattering losses.',
      learnPoints: ['75% siliqua yellowing index', 'Morning harvest to avoid shattering', 'Sun drying sheaves in field', 'Threshing and storage at 8% moisture'],
      whyExplanation: 'Over-mature mustard pods shatter easily under warm midday sun, scattering valuable seeds onto the soil.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest crop when 75% pods turn yellow and seeds darken', spec: '75% yellow' },
        { itemKey: '7-2', name: 'Harvest in early morning to prevent pod shattering', spec: 'Morning harvest' },
        { itemKey: '7-3', name: 'Sun dry bundles for 4-5 days before threshing', spec: 'Sun drying' },
        { itemKey: '7-4', name: 'Clean seeds and store at <8% moisture in dry bags', spec: '<8% moisture' },
      ],
    },
  },

  // 9. PIGEON PEA (RED GRAM)
  pigeon_pea: {
    prepareSoil: {
      title: 'Red Gram Ploughing & Deep Tillage Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=bkp-HxBokGo',
      videoId: 'bkp-HxBokGo',
      duration: '6:40',
      description: 'Deep ploughing to 25 cm followed by 2 harrowings. Form ridges and furrows at 90-120 cm spacing.',
      learnPoints: ['Deep subsoiling for taproot', 'Ridge and furrow formation', 'FYM incorporation (6-8 t/ha)', 'Drainage provision'],
      whyExplanation: 'Deep taproots anchor pigeon pea against drought, while ridges safeguard against collar rot.',
      checklists: [
        { itemKey: '1-1', name: 'Deep ploughing to 25 cm depth in red/black soils', spec: '25 cm' },
        { itemKey: '1-2', name: 'Incorporate 6-8 t/ha well decomposed organic manure', spec: '6-8 t/ha' },
        { itemKey: '1-3', name: 'Form ridges and furrows at 90-120 cm spacing', spec: 'Ridge spacing' },
      ],
    },
    seedTreatment: {
      title: 'Pigeon Pea Seed Treatment with Rhizobium & Trichoderma',
      youtubeUrl: 'https://www.youtube.com/watch?v=S0jeDW5P6Rs',
      videoId: 'S0jeDW5P6Rs',
      duration: '5:15',
      description: 'Treat certified seeds with Trichoderma (5 g/kg) against Fusarium wilt, followed by Rhizobium culture (10 g/kg).',
      learnPoints: ['Wilt-resistant certified seeds', 'Trichoderma coating against wilt', 'Rhizobium nodulation slurry', 'Shade drying before dibbling'],
      whyExplanation: 'Fusarium wilt is soil-borne; Trichoderma coats the rhizosphere to suppress pathogenic hyphae.',
      checklists: [
        { itemKey: '2-1', name: 'Treat seeds with Trichoderma viride @ 5 g/kg seed', spec: '5 g/kg' },
        { itemKey: '2-2', name: 'Inoculate with Rhizobium culture using jaggery water', spec: 'Bio-slurry' },
        { itemKey: '2-3', name: 'Shade dry treated seeds for 30 minutes before planting', spec: '30 mins' },
      ],
    },
    sowing: {
      title: 'Pigeon Pea Sowing & Spacing Method',
      youtubeUrl: 'https://www.youtube.com/watch?v=fv5xIjOZHd8',
      videoId: 'fv5xIjOZHd8',
      duration: '6:25',
      description: 'Dibble seeds at 90-120 cm row spacing and 20-30 cm plant spacing at 4-5 cm depth into moist soil.',
      learnPoints: ['Optimal plant geometry (90x20 cm or 120x30 cm)', 'Sowing depth (4-5 cm)', 'Intercropping compatibility with soybean/cotton', 'Seed rate (12-15 kg/ha)'],
      whyExplanation: 'Adequate spacing allows pigeon pea to branch profusely into heavy flower-bearing canopies.',
      checklists: [
        { itemKey: '3-1', name: 'Sow at 90-120 cm row spacing and 20 cm plant spacing', spec: '90x20 cm' },
        { itemKey: '3-2', name: 'Ensure seed placement at 4-5 cm depth in moist soil', spec: '4-5 cm depth' },
        { itemKey: '3-3', name: 'Gap fill within 10 days of emergence', spec: 'Stand check' },
      ],
    },
    irrigation: {
      title: 'Pigeon Pea Crop Care & Protective Watering',
      youtubeUrl: 'https://www.youtube.com/watch?v=rPfSf50bQtw',
      videoId: 'rPfSf50bQtw',
      duration: '5:35',
      description: 'Provide protective irrigation at critical flower bud initiation (70-80 DAS) and pod development (100-110 DAS).',
      learnPoints: ['Drought tolerance mechanisms', 'Critical flowering irrigation', 'Pod filling water supply', 'Drainage during heavy rain'],
      whyExplanation: 'Protective irrigation at flowering stops massive flower shedding during dry autumn periods.',
      checklists: [
        { itemKey: '4-1', name: 'Provide protective irrigation at flowering stage (75 DAS)', spec: 'Flowering' },
        { itemKey: '4-2', name: 'Irrigate during pod filling if dry spell exceeds 15 days', spec: 'Pod fill' },
      ],
    },
    cropCare: {
      title: 'Important Insect Pests of Pigeon Pea & Pod Borer Control',
      youtubeUrl: 'https://www.youtube.com/watch?v=M8JlsPAGyrI',
      videoId: 'M8JlsPAGyrI',
      duration: '7:50',
      description: 'Monitor weekly for Helicoverpa pod borer and pod fly. Install 5 pheromone traps/ha; spray neem oil or Chlorantraniliprole at early flowering.',
      learnPoints: ['Helicoverpa armigera pod borer identification', 'Pod fly (Melanagromyza) damage signs', 'Pheromone trap installation', 'Nipping / topping technique at 45 DAS'],
      whyExplanation: 'Pod borer caterpillars chew directly into developing pods, causing total grain destruction if not intercepted at flowering.',
      checklists: [
        { itemKey: '5-1', name: 'Perform terminal topping/nipping at 45-50 DAS to induce branching', spec: 'Topping' },
        { itemKey: '5-2', name: 'Install 5 Helicoverpa pheromone traps/ha at flower initiation', spec: '5 traps/ha' },
        { itemKey: '5-3', name: 'Spray bio-pesticide or recommended IPM insecticide at 50% bloom', spec: 'IPM spray' },
      ],
    },
    fertilizer: {
      title: 'Spraying Fertilizers on Red Gram / Pigeon Pea',
      youtubeUrl: 'https://www.youtube.com/watch?v=OiMp2xfyDAo',
      videoId: 'OiMp2xfyDAo',
      duration: '6:15',
      description: 'Apply basal N:P:K:S @ 20:50:20:20 kg/ha. Foliar spray 2% DAP or 1% Pulse Wonder at 50% flowering to prevent flower drop.',
      learnPoints: ['Basal phosphorus placement for root nodulation', 'Sulphur application for protein synthesis', 'Foliar 2% DAP spray at flowering', 'Micronutrient zinc feeding'],
      whyExplanation: 'Foliar DAP supplies quick nitrogen and phosphorus directly to developing blossoms, cutting flower shedding by 25%.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal NPK 20:50:20 kg/ha with 20 kg Sulphur', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Foliar spray 2% DAP at flower initiation (70-75 DAS)', spec: 'Foliar spray 1' },
        { itemKey: '6-3', name: 'Repeat foliar spray 15 days later during pod setting', spec: 'Foliar spray 2' },
      ],
    },
    harvest: {
      title: 'Harvesting of Dried Pigeon Pea Beans',
      youtubeUrl: 'https://www.youtube.com/watch?v=MR1eZ-tx5Rs',
      videoId: 'MR1eZ-tx5Rs',
      duration: '6:10',
      description: 'Harvest when 80-85% of pods turn brown and dry. Cut plants at ground level, dry sheaves in the sun for 4-5 days, and thresh.',
      learnPoints: ['Pod maturity indices (80-85% brown pods)', 'Cutting with sickle at ground level', 'Field drying and threshing', 'Storage care against pulse beetle'],
      whyExplanation: 'Harvesting at proper dryness prevents grain mold and allows clean mechanical or manual threshing.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest when 80-85% pods turn dark brown and dry', spec: 'Maturity index' },
        { itemKey: '7-2', name: 'Cut plants with sickle and sun-dry in bundles for 4-5 days', spec: 'Sun dry' },
        { itemKey: '7-3', name: 'Thresh and winnow seeds to remove pod trash', spec: 'Clean grains' },
        { itemKey: '7-4', name: 'Dry seeds to 9-10% moisture before bagging', spec: '9-10% moisture' },
      ],
    },
  },

  // 10. TURMERIC
  turmeric: {
    prepareSoil: {
      title: 'Turmeric Raised Bed Land Preparation & Soil Tilth',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '7:40',
      description: 'Plough the field 4-5 times to achieve a friable, crumbly tilth. Construct raised beds (1 m wide, 15-20 cm high) with 40 cm drainage channels.',
      learnPoints: ['Raised bed formation for rhizome expansion', 'Incorporating 20-25 t/ha FYM', 'Soil solarization for nematode control', 'Ensuring excellent drainage'],
      whyExplanation: 'Turmeric rhizomes expand underground and rot under waterlogging; raised beds provide aeration and drainage.',
      checklists: [
        { itemKey: '1-1', name: 'Plough field 4 times to create fine crumbly tilth', spec: '25 cm depth' },
        { itemKey: '1-2', name: 'Incorporate 20-25 t/ha well decomposed FYM or compost', spec: '20-25 t/ha' },
        { itemKey: '1-3', name: 'Form raised beds (1 m wide, 20 cm high) with drainage channels', spec: 'Raised beds' },
      ],
    },
    seedTreatment: {
      title: 'Turmeric Mother Rhizome Selection & Fungicide Dip',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '6:15',
      description: 'Select healthy, disease-free mother or finger rhizomes (30-40 g). Dip in Mancozeb (3 g/L) + Quinalphos (2 ml/L) for 30 minutes to protect against rhizome rot.',
      learnPoints: ['Mother vs finger rhizome selection', 'Fungicide dip against Pythium soft rot', 'Bio-agent Trichoderma inoculation', 'Shade drying before planting'],
      whyExplanation: 'Rhizome dip eliminates latent Pythium and scale insect infestations carried on planting seed material.',
      checklists: [
        { itemKey: '2-1', name: 'Select plump certified mother rhizomes (35-40 g)', spec: 'Rhizome grade' },
        { itemKey: '2-2', name: 'Dip rhizomes in Mancozeb @ 3 g/L for 30 minutes', spec: '30 mins dip' },
        { itemKey: '2-3', name: 'Inoculate with Trichoderma viride slurry and shade dry', spec: 'Bio-slurry' },
      ],
    },
    sowing: {
      title: 'Turmeric Rhizome Planting & Ridge Spacing',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '6:30',
      description: 'Plant treated rhizomes at 30 cm row spacing and 20 cm plant spacing at 5-7 cm depth on raised beds with a seed rate of 2.0-2.5 t/ha.',
      learnPoints: ['Planting depth (5-7 cm) on raised beds', 'Geometry (30x20 cm spacing)', 'Bud orientation upward', 'Seed rate calculation (2-2.5 t/ha)'],
      whyExplanation: 'Planting at 5 cm depth prevents sun-scalding of newly emerging shoots while ensuring rapid root anchorage.',
      checklists: [
        { itemKey: '3-1', name: 'Plant rhizomes at 30 cm x 20 cm spacing with eye buds upward', spec: '30x20 cm' },
        { itemKey: '3-2', name: 'Cover rhizomes with 5-7 cm friable soil', spec: '5-7 cm depth' },
        { itemKey: '3-3', name: 'Apply green leaf mulch immediately after planting', spec: 'Green mulch' },
      ],
    },
    irrigation: {
      title: 'Turmeric Green Leaf Mulching & Moisture Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '6:50',
      description: 'Mulch heavily with green leaves (15 t/ha at planting, 7.5 t/ha at 45 and 90 DAS). Maintain moist soil with weekly drip or furrow irrigation.',
      learnPoints: ['Green leaf mulching for moisture conservation', 'Weed suppression through thick mulch', 'Drip fertigation scheduling', 'Drainage during monsoons'],
      whyExplanation: 'Heavy organic mulching cools soil temperature, conserves moisture, and adds immense humus as leaves decompose.',
      checklists: [
        { itemKey: '4-1', name: 'Apply first green leaf mulch @ 15 t/ha immediately after planting', spec: '15 t/ha mulch' },
        { itemKey: '4-2', name: 'Provide light irrigation every 7-10 days depending on rainfall', spec: 'Weekly water' },
        { itemKey: '4-3', name: 'Repeat second mulching @ 7.5 t/ha at 45-50 DAS after weeding', spec: 'Second mulch' },
      ],
    },
    cropCare: {
      title: 'Turmeric Leaf Spot & Shoot Borer IPM Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '7:20',
      description: 'Scout for shoot borer (Conogethes punctiferalis) frass on pseudostems and Colletotrichum leaf spot. Spray neem formulation or Mancozeb (2 g/L).',
      learnPoints: ['Shoot borer bore-hole identification', 'Leaf spot / leaf blotch symptoms', 'Pruning infected lower leaves', 'Bio-fungicide soil drenching against soft rot'],
      whyExplanation: 'Shoot borer caterpillars bore into pseudostems and sever vascular bundles, causing yellowing and dead hearts.',
      checklists: [
        { itemKey: '5-1', name: 'Weed and earth up soil around plants at 45 and 90 DAS', spec: 'Earthing up' },
        { itemKey: '5-2', name: 'Scout weekly for shoot borer bore-holes on pseudostems', spec: 'Weekly check' },
        { itemKey: '5-3', name: 'Spray Mancozeb @ 2 g/L upon detecting leaf spot lesions', spec: '2 g/L spray' },
      ],
    },
    fertilizer: {
      title: 'Turmeric Nutrient Strategy & Potassium Top-Dressing',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '6:15',
      description: 'Apply N:P:K @ 150:60:150 kg/ha. Apply all P basal, and split Nitrogen and Potash into 3 equal splits at 30, 60, and 90 DAS along with earthing up.',
      learnPoints: ['High potassium requirement for rhizome starch and curcumin', 'Split application of nitrogen and potash', 'Earthing up during fertilizer application', 'Foliar micronutrient spray'],
      whyExplanation: 'Potassium drives photosynthate translocation from leaves down into expanding underground rhizomes.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal fertilizer: full P2O5 + 30% N and K2O', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Top-dress first split of N & K at 30-40 DAS followed by earthing up', spec: 'Split 1' },
        { itemKey: '6-3', name: 'Top-dress second split of N & K at 60-70 DAS', spec: 'Split 2' },
      ],
    },
    harvest: {
      title: 'Turmeric Rhizome Harvesting & Boiling / Curing Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=cuTxs6genK8',
      videoId: 'cuTxs6genK8',
      duration: '7:55',
      description: 'Harvest at 7-9 months when leaves turn completely yellow and dry. Dig out clumps carefully, wash rhizomes, boil in water for 45 minutes, and sun-dry.',
      learnPoints: ['Leaf drying maturity index (7-9 months)', 'Careful clump digging without cutting fingers', 'Cleaning and washing rhizomes', 'Boiling and sun-drying curing protocol'],
      whyExplanation: 'Boiling gelatinizes rhizome starch and distributes curcumin uniformly, ensuring a deep yellow color and flinty market texture.',
      checklists: [
        { itemKey: '7-1', name: 'Stop irrigation 15 days before harvest when foliage turns yellow-brown', spec: 'Withhold water' },
        { itemKey: '7-2', name: 'Dig clumps with spade carefully to avoid bruising rhizomes', spec: 'Careful digging' },
        { itemKey: '7-3', name: 'Separate mother rhizomes from fingers and wash in water', spec: 'Cleaning' },
        { itemKey: '7-4', name: 'Boil rhizomes for 45-60 mins until soft and sun dry for 10-15 days', spec: 'Curing' },
      ],
    },
  },

  // 11. GINGER
  ginger: {
    prepareSoil: {
      title: 'Ginger Raised Bed Preparation & Organic Manure',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '7:30',
      description: 'Plough field to fine tilth and create 15-20 cm high raised beds with 40-50 cm inter-bed furrows to prevent water stagnation.',
      learnPoints: ['Raised bed formation in ginger', 'Incorporating 25-30 t/ha FYM', 'Solarization for soft rot prevention', 'Ensuring slope drainage'],
      whyExplanation: 'Ginger is extremely sensitive to soft rot (Pythium) caused by standing water in poorly drained soils.',
      checklists: [
        { itemKey: '1-1', name: 'Plough land 4-5 times to achieve fine pulverized tilth', spec: 'Fine tilth' },
        { itemKey: '1-2', name: 'Apply 25-30 t/ha well decomposed FYM or compost', spec: '25 t/ha' },
        { itemKey: '1-3', name: 'Construct raised beds (1 m width, 20 cm height)', spec: 'Raised beds' },
      ],
    },
    seedTreatment: {
      title: 'Ginger Seed Rhizome Treatment against Soft Rot',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '6:10',
      description: 'Dip seed rhizomes in Mancozeb (3 g/L) + Streptocycline (0.5 g/L) for 30 minutes to protect against bacterial wilt and soft rot.',
      learnPoints: ['Selecting healthy seed rhizomes (25-30 g)', 'Fungicide and bactericide dipping', 'Trichoderma inoculation', 'Shade drying'],
      whyExplanation: 'Soft rot is carried in latent form in seed bits; chemical dipping prevents fatal seedling collapse in the field.',
      checklists: [
        { itemKey: '2-1', name: 'Select plump seed rhizomes (25-30 g) with active buds', spec: 'Seed grade' },
        { itemKey: '2-2', name: 'Dip rhizomes in Mancozeb @ 3 g/L for 30 minutes', spec: '30 mins dip' },
        { itemKey: '2-3', name: 'Inoculate with Trichoderma viride culture; shade dry before planting', spec: 'Bio-slurry' },
      ],
    },
    sowing: {
      title: 'Ginger Planting & Spacing Method',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '6:20',
      description: 'Plant rhizomes at 25-30 cm row spacing and 20 cm plant spacing at 4-5 cm depth with eye buds facing upward.',
      learnPoints: ['Planting geometry (25x20 cm)', 'Placement depth (4-5 cm)', 'Seed rate (1.5-1.8 t/ha)', 'Immediate green leaf mulching'],
      whyExplanation: 'Correct spacing allows free clump expansion and ensures adequate soil coverage during subsequent earthing up.',
      checklists: [
        { itemKey: '3-1', name: 'Plant rhizomes at 25x20 cm spacing on raised beds', spec: '25x20 cm' },
        { itemKey: '3-2', name: 'Cover rhizomes with 4-5 cm fine friable soil', spec: '4-5 cm depth' },
        { itemKey: '3-3', name: 'Apply thick green leaf mulch immediately after planting', spec: 'Green mulch' },
      ],
    },
    irrigation: {
      title: 'Ginger Drip Irrigation & Mulching Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '6:40',
      description: 'Apply green leaf mulch (12 t/ha at planting, 5 t/ha at 45 and 90 DAS). Maintain moist soil through drip irrigation without sogginess.',
      learnPoints: ['Mulching rounds (3 stages)', 'Drip irrigation scheduling', 'Drainage furrow maintenance', 'Soil temperature regulation'],
      whyExplanation: 'Mulching protects tender sprouting buds from scorching sun and keeps soil moist and porous for rhizome development.',
      checklists: [
        { itemKey: '4-1', name: 'Apply first green leaf mulch @ 12 t/ha at planting', spec: '12 t/ha' },
        { itemKey: '4-2', name: 'Irrigate at 4-7 day intervals depending on rainfall', spec: 'Regular water' },
        { itemKey: '4-3', name: 'Repeat second mulching @ 5 t/ha at 45 DAS after weeding', spec: 'Second mulch' },
      ],
    },
    cropCare: {
      title: 'Ginger Soft Rot & Shoot Borer IPM Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '7:15',
      description: 'Drench soil with Metalaxyl-Mancozeb (2 g/L) upon first signs of collar rot. Spray neem formulation against shoot borer.',
      learnPoints: ['Early yellowing symptoms of soft rot', 'Soil drenching protocol around affected clumps', 'Shoot borer bore-hole monitoring', 'Earthing up with organic manure'],
      whyExplanation: 'Soft rot spreads rapidly through soil water; immediate clump drenching creates a chemical barrier against infection spread.',
      checklists: [
        { itemKey: '5-1', name: 'Perform weeding and earthing up at 45 and 90 DAS', spec: 'Earthing up' },
        { itemKey: '5-2', name: 'Scout weekly for yellowing pseudostems and soft rot symptoms', spec: 'Weekly check' },
        { itemKey: '5-3', name: 'Drench affected clumps and surrounding beds with Metalaxyl @ 2 g/L', spec: 'Soil drench' },
      ],
    },
    fertilizer: {
      title: 'Ginger Fertigation & Organic Nutrition',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '6:10',
      description: 'Apply N:P:K @ 100:50:100 kg/ha. Apply all P basal, and split Nitrogen and Potash into 3 equal doses at 40, 80, and 120 DAS.',
      learnPoints: ['Split nitrogen and potash application', 'Micronutrient zinc and boron feeding', 'Earthing up during top-dressing', 'Organic vermicompost incorporation'],
      whyExplanation: 'Split nutrient feeding sustains steady rhizome enlargement throughout the 8-month growing cycle.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal fertilizer: full P2O5 + 30% N and K2O', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Top-dress first split of N & K at 40-45 DAS with earthing up', spec: 'Split 1' },
        { itemKey: '6-3', name: 'Top-dress second split of N & K at 80-90 DAS', spec: 'Split 2' },
      ],
    },
    harvest: {
      title: 'Ginger Harvesting & Post-Harvest Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=1wf34X8L4P4',
      videoId: '1wf34X8L4P4',
      duration: '7:20',
      description: 'Harvest ginger at 8 months when leaves turn completely yellow and dry. Carefully lift clumps, shake off soil, and wash rhizomes.',
      learnPoints: ['Maturity index (leaves yellowed and withered)', 'Careful clump lifting without breakage', 'Washing and shade curing', 'Storage in sand pits for seed'],
      whyExplanation: 'Harvesting at full maturity ensures maximum dry weight, oleoresin content, and fiber quality.',
      checklists: [
        { itemKey: '7-1', name: 'Withhold irrigation 15 days before harvest when foliage withers', spec: 'Stop water' },
        { itemKey: '7-2', name: 'Lift clumps carefully with garden fork to avoid damaging fingers', spec: 'Lifting' },
        { itemKey: '7-3', name: 'Wash rhizomes thoroughly in clean water and dry under shade', spec: 'Washing' },
      ],
    },
  },

  // 12. TOMATO
  tomato: {
    prepareSoil: {
      title: 'Tomato Farming | Land Preparation Step by Step',
      youtubeUrl: 'https://www.youtube.com/watch?v=Rk_qYV5lZ7k',
      videoId: 'Rk_qYV5lZ7k',
      duration: '7:15',
      description: 'Plough field to fine tilth, apply 20 t/ha FYM, and construct raised beds (90 cm wide) with silver-black plastic mulch and drip laterals.',
      learnPoints: ['Raised bed formation for tomato', 'Silver-black plastic mulching benefits', 'Drip lateral installation under mulch', 'Soil solarization for wilt control'],
      whyExplanation: 'Mulched raised beds prevent soil-borne fruit rot, suppress weeds 100%, and conserve root-zone moisture.',
      checklists: [
        { itemKey: '1-1', name: 'Plough land 3 times and pulverize clods thoroughly', spec: '20 cm depth' },
        { itemKey: '1-2', name: 'Apply 20 t/ha well decomposed FYM or compost', spec: '20 t/ha' },
        { itemKey: '1-3', name: 'Form raised beds (90 cm wide) and lay drip line + plastic mulch', spec: 'Mulch layout' },
      ],
    },
    seedTreatment: {
      title: 'Tomato Pro-tray Seedling Raising & Seed Treatment',
      youtubeUrl: 'https://www.youtube.com/watch?v=F3S6eN3VvW8',
      videoId: 'F3S6eN3VvW8',
      duration: '6:10',
      description: 'Raise hybrid tomato seeds in 98-cell pro-trays using sterilized coco-peat. Treat seeds with Trichoderma (5 g/kg) and imidacloprid to prevent damping-off.',
      learnPoints: ['Pro-tray nursery raising in shade net', 'Coco-peat sterilization', 'Seedling drenching with bio-fungicide', 'Hardening seedlings before transplanting'],
      whyExplanation: 'Pro-tray nursery produces vigorous root balls without root breakage, giving 99% transplanting survival.',
      checklists: [
        { itemKey: '2-1', name: 'Sow certified hybrid seeds in 98-cell pro-trays in coco-peat', spec: 'Pro-trays' },
        { itemKey: '2-2', name: 'Drench seedlings with Trichoderma @ 5 g/L at 10 days', spec: 'Drenching' },
        { itemKey: '2-3', name: 'Harden 25-day-old seedlings by withholding water for 2 days', spec: 'Hardening' },
      ],
    },
    sowing: {
      title: 'Tomato Transplanting & Bed Spacing Method',
      youtubeUrl: 'https://www.youtube.com/watch?v=1F_4lXGz65k',
      videoId: '1F_4lXGz65k',
      duration: '6:45',
      description: 'Transplant 25-day-old seedlings at 60 cm row-to-row and 45 cm plant-to-plant spacing in zig-zag pattern on mulched beds during evening hours.',
      learnPoints: ['Zig-zag planting geometry on mulch', 'Planting in evening hours to reduce heat stress', 'Root ball placement depth', 'Immediate drip watering after planting'],
      whyExplanation: 'Evening transplanting prevents transplant shock and sun-wilting of tender seedlings.',
      checklists: [
        { itemKey: '3-1', name: 'Punch holes in mulch at 60 cm x 45 cm zig-zag spacing', spec: '60x45 cm' },
        { itemKey: '3-2', name: 'Transplant sturdy 25-day-old seedlings during evening', spec: 'Evening planting' },
        { itemKey: '3-3', name: 'Provide immediate drip irrigation with starter booster', spec: 'Starter water' },
      ],
    },
    irrigation: {
      title: 'Tomato Drip Irrigation & Fertigation Scheduling',
      youtubeUrl: 'https://www.youtube.com/watch?v=F3S6eN3VvW8',
      videoId: 'F3S6eN3VvW8',
      duration: '6:30',
      description: 'Supply daily or alternate day drip irrigation based on crop stage. Avoid moisture fluctuations to prevent blossom end rot and fruit cracking.',
      learnPoints: ['Drip irrigation scheduling based on ET', 'Preventing soil moisture fluctuations', 'Calcium availability relation to water stress', 'Blossom end rot prevention'],
      whyExplanation: 'Irregular watering induces calcium deficiency in fruit tips, causing sunken black blossom end rot.',
      checklists: [
        { itemKey: '4-1', name: 'Operate drip irrigation daily for 45-60 minutes', spec: 'Daily drip' },
        { itemKey: '4-2', name: 'Maintain uniform root-zone moisture during flowering & fruit set', spec: 'Moisture balance' },
      ],
    },
    cropCare: {
      title: 'Tomato Staking, Blight & Fruit Borer IPM',
      youtubeUrl: 'https://www.youtube.com/watch?v=1F_4lXGz65k',
      videoId: '1F_4lXGz65k',
      duration: '7:40',
      description: 'Erect bamboo trellises and stake indeterminate plants at 25-30 DAT. Install pheromone traps for Helicoverpa and Tuta absoluta; spray neem oil weekly.',
      learnPoints: ['Bamboo and GI wire trellising / staking', 'Pruning side suckers for single/double stem training', 'Tuta absoluta and fruit borer pheromone traps', 'Early and late blight preventative fungicide sprays'],
      whyExplanation: 'Staking keeps foliage and fruit elevated off the ground, reducing fungal rot by 80% and simplifying harvesting.',
      checklists: [
        { itemKey: '5-1', name: 'Erect bamboo stakes and string trellises at 25-30 DAT', spec: 'Trellis staking' },
        { itemKey: '5-2', name: 'Install 5 pheromone traps/ha for fruit borer & Tuta absoluta', spec: '5 traps/ha' },
        { itemKey: '5-3', name: 'Prune ground sucker shoots and spray Mancozeb @ 2 g/L for blight', spec: 'Pruning & spray' },
      ],
    },
    fertilizer: {
      title: 'Tomato Fertigation Schedule & Calcium Feeding',
      youtubeUrl: 'https://www.youtube.com/watch?v=1F_4lXGz65k',
      videoId: '1F_4lXGz65k',
      duration: '6:50',
      description: 'Apply water-soluble fertilizers (19:19:19, 12:61:00, 0:0:50) through drip weekly. Spray Calcium Nitrate (5 g/L) + Boron (1 g/L) at fruit development.',
      learnPoints: ['Stage-wise fertigation schedule through venturi', 'Calcium Nitrate foliar spray against blossom end rot', 'Potassium sulphate feeding for fruit firmness and color', 'Micronutrient balancing'],
      whyExplanation: 'Soluble potassium and calcium improve fruit shelf life, skin firmness, and sugar-acid balance.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal NPK 50:50:50 kg/ha before bed mulching', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Fertigate weekly with water soluble 19:19:19 and 00:52:34', spec: 'Weekly drip' },
        { itemKey: '6-3', name: 'Spray Calcium Nitrate @ 5 g/L + Boron @ 1 g/L at fruit enlargement', spec: 'Foliar spray' },
      ],
    },
    harvest: {
      title: 'Tomato Harvesting at Color Break Stage & Grading',
      youtubeUrl: 'https://www.youtube.com/watch?v=F3S6eN3VvW8',
      videoId: 'F3S6eN3VvW8',
      duration: '6:40',
      description: 'Harvest tomatoes at the "breaker" stage (slight pink color at blossom end) for distant markets, or at pink-red stage for local sale. Harvest in plastic crates.',
      learnPoints: ['Harvesting at breaker/turning stage for transit', 'Harvesting with calyx intact', 'Handling in plastic crates without pressure bruising', 'Grading by size and color'],
      whyExplanation: 'Tomatoes picked at breaker stage ripen naturally during transport with zero transit rot.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest fruits at breaker/turning stage during cool morning hours', spec: 'Breaker stage' },
        { itemKey: '7-2', name: 'Pick with pedicel intact and place in ventilated plastic crates', spec: 'Plastic crates' },
        { itemKey: '7-3', name: 'Grade fruits by size, remove blemished/damaged tomatoes', spec: 'Grading' },
      ],
    },
  },

  // 13. ONION
  onion: {
    prepareSoil: {
      title: 'Onion Land Preparation and Bed Creation',
      youtubeUrl: 'https://www.youtube.com/watch?v=F3z7i7yv7Zg',
      videoId: 'F3z7i7yv7Zg',
      duration: '6:50',
      description: 'Plough field to fine tilth and create 1.2 m wide flat beds or broad bed furrows (BBF) with shallow irrigation channels.',
      learnPoints: ['Fine pulverization for shallow onion root system', 'Broad bed furrow (BBF) layout for drainage', 'Applying 20 t/ha FYM', 'Soil pH 6.0-7.5 target'],
      whyExplanation: 'Onion roots are shallow and fragile; well-pulverized beds allow roots to absorb water and nutrients without compaction.',
      checklists: [
        { itemKey: '1-1', name: 'Plough field 3 times and harrow to achieve fine level seedbed', spec: 'Fine tilth' },
        { itemKey: '1-2', name: 'Incorporate 20 t/ha well decomposed FYM', spec: '20 t/ha' },
        { itemKey: '1-3', name: 'Form flat beds (1.2 m wide) or BBF with drainage channels', spec: 'Bed layout' },
      ],
    },
    seedTreatment: {
      title: 'Onion Nursery Setup & Seedling Treatment',
      youtubeUrl: 'https://www.youtube.com/watch?v=Yf1g-bXgqgQ',
      videoId: 'Yf1g-bXgqgQ',
      duration: '6:15',
      description: 'Raise seedlings on raised nursery beds. Treat 45-day-old seedling roots by dipping in Carbendazim (1 g/L) + Imidacloprid (1 ml/L) for 15 minutes before transplanting.',
      learnPoints: ['Raised nursery bed sowing', 'Optimal seedling age (45-50 days)', 'Root dipping against damping off and thrips', 'Clipping tall top foliage'],
      whyExplanation: 'Root dip protects tender seedlings against early thrips infestation and basal rot.',
      checklists: [
        { itemKey: '2-1', name: 'Select healthy 45-50 day old seedlings with pencil-thickness stems', spec: 'Seedling grade' },
        { itemKey: '2-2', name: 'Dip seedling roots in Carbendazim (1 g/L) + Imidacloprid (1 ml/L)', spec: '15 mins dip' },
        { itemKey: '2-3', name: 'Clip top 1/3 foliage before transplanting to reduce transpiration', spec: 'Top clipping' },
      ],
    },
    sowing: {
      title: 'Onion Transplanting & Row Spacing Guide',
      youtubeUrl: 'https://www.youtube.com/watch?v=kYJ-n-k4H3s',
      videoId: 'kYJ-n-k4H3s',
      duration: '7:10',
      description: 'Transplant seedlings at 15 cm row spacing and 10 cm plant spacing at shallow depth of 2-3 cm into moist beds during evening hours.',
      learnPoints: ['Spacing (15x10 cm)', 'Shallow planting depth (2-3 cm)', 'Evening transplanting for survival', 'Target population (650,000/ha)'],
      whyExplanation: 'Deep planting (>3 cm) leads to elongated, bottle-shaped bulbs, while shallow planting yields round, marketable bulbs.',
      checklists: [
        { itemKey: '3-1', name: 'Transplant at 15 cm x 10 cm spacing in moist soil beds', spec: '15x10 cm' },
        { itemKey: '3-2', name: 'Ensure shallow planting at 2-3 cm depth (do not bury bulb collar)', spec: '2-3 cm depth' },
        { itemKey: '3-3', name: 'Provide immediate light irrigation after transplanting', spec: 'Post-planting water' },
      ],
    },
    irrigation: {
      title: 'Onion Irrigation & Water Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=kYJ-n-k4H3s',
      videoId: 'kYJ-n-k4H3s',
      duration: '6:30',
      description: 'Provide frequent light irrigations at 5-7 day intervals. Cease irrigation 10-15 days before harvesting to mature the bulbs and prevent storage rot.',
      learnPoints: ['Frequent shallow irrigations for shallow roots', 'Critical bulb enlargement moisture phase', 'Withholding water 10-15 days before harvest', 'Preventing bulb splitting'],
      whyExplanation: 'Withholding water before harvest induces the outer scales to dry into a protective parchment skin that resists rot.',
      checklists: [
        { itemKey: '4-1', name: 'Irrigate at 5-7 day intervals depending on temperature', spec: 'Light irrigation' },
        { itemKey: '4-2', name: 'Maintain adequate moisture during bulb enlargement (60-80 DAT)', spec: 'Bulb enlargement' },
        { itemKey: '4-3', name: 'Stop irrigation 10-15 days before harvest when neck fall begins', spec: 'Withhold water' },
      ],
    },
    cropCare: {
      title: 'Onion Thrips & Purple Blotch IPM Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=kYJ-n-k4H3s',
      videoId: 'kYJ-n-k4H3s',
      duration: '7:20',
      description: 'Scout weekly for silver streaks in leaf sheaths (Thrips tabaci) and purple blotch lesions. Spray Fipronil (1.5 ml/L) or Mancozeb (2.5 g/L) with sticking agent.',
      learnPoints: ['Thrips silvering symptom scouting', 'Purple blotch (Alternaria porri) identification', 'Adding sticker/spreader to spray solution on waxy leaves', 'Blue sticky traps installation'],
      whyExplanation: 'Onion leaves have a waxy cuticle; adding a non-ionic spreader ensures fungicide drops adhere instead of rolling off.',
      checklists: [
        { itemKey: '5-1', name: 'Install 10 blue sticky traps/ha for thrips monitoring', spec: '10 traps/ha' },
        { itemKey: '5-2', name: 'Scout leaf sheaths weekly for thrips nymphs and silver blotches', spec: 'Weekly check' },
        { itemKey: '5-3', name: 'Spray Mancozeb @ 2.5 g/L + sticker @ 0.5 ml/L for purple blotch', spec: 'Foliar spray' },
      ],
    },
    fertilizer: {
      title: 'Onion Fertilizer & Sulphur Application Guide',
      youtubeUrl: 'https://www.youtube.com/watch?v=kYJ-n-k4H3s',
      videoId: 'kYJ-n-k4H3s',
      duration: '6:40',
      description: 'Apply N:P:K:S @ 100:50:50:30 kg/ha. Apply all P, K, Sulphur and 50% N as basal. Top-dress 50% N in two splits at 30 and 45 DAT.',
      learnPoints: ['Sulphur importance for bulb pungency and storage shelf life', 'Basal NPK placement', 'Split nitrogen before bulb enlargement starts', 'Avoiding late nitrogen which causes thick necks'],
      whyExplanation: 'Excess nitrogen applied late causes thick-necked onions that fail to cure and rot quickly in storage.',
      checklists: [
        { itemKey: '6-1', name: 'Apply basal fertilizer: full P2O5 and K2O + 50% N + 30 kg S/ha', spec: 'Basal dose' },
        { itemKey: '6-2', name: 'Top-dress first split of Nitrogen (25%) at 30 DAT after weeding', spec: '30 DAT split' },
        { itemKey: '6-3', name: 'Top-dress final Nitrogen (25%) at 45 DAT (do not apply N after 50 DAT)', spec: '45 DAT split' },
      ],
    },
    harvest: {
      title: 'Onion Harvesting, Neck Fall & Curing Guide',
      youtubeUrl: 'https://www.youtube.com/watch?v=kYJ-n-k4H3s',
      videoId: 'kYJ-n-k4H3s',
      duration: '7:15',
      description: 'Harvest when 50% of tops have fallen over naturally (neck fall). Pull bulbs carefully, leave in field under foliage cover for 3-5 days for curing, and trim tops.',
      learnPoints: ['50% natural neck fall maturity index', 'Field curing under leaf cover', 'Shade curing for 10-15 days to develop skin color', 'Trimming neck leaving 2.5 cm stalk'],
      whyExplanation: 'Proper field and shade curing dries the neck completely, sealing the bulb against storage rot bacteria.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest crop when 50% plants exhibit natural neck fall', spec: '50% neck fall' },
        { itemKey: '7-2', name: 'Windrow bulbs in field for 3-5 days with foliage covering bulbs', spec: 'Field curing' },
        { itemKey: '7-3', name: 'Shade cure on wooden racks for 10-12 days to develop papery scales', spec: 'Shade curing' },
        { itemKey: '7-4', name: 'Trim tops leaving 2.5 cm neck before sorting and bagging', spec: '2.5 cm neck' },
      ],
    },
  },

  // 14. BANANA
  banana: {
    prepareSoil: {
      title: 'Banana Cultivation - Land Preparation & Pit Digging',
      youtubeUrl: 'https://www.youtube.com/watch?v=UayouU0rLII',
      videoId: 'UayouU0rLII',
      duration: '7:20',
      description: 'Plough field to 30 cm depth. Dig pits of 60x60x60 cm at 1.8x1.8 m spacing. Fill pits with topsoil mixed with 10 kg FYM and 250 g neem cake.',
      learnPoints: ['Deep tillage and pit digging (60x60x60 cm)', 'Pit mixture (topsoil + FYM + neem cake + phosphate)', 'High density spacing layout (1.8x1.8 m)', 'Windbreak planting'],
      whyExplanation: 'Spacious, well-fertilized pits allow the massive corm and feeder roots of banana to proliferate quickly.',
      checklists: [
        { itemKey: '1-1', name: 'Plough land deeply and harrow to fine tilth', spec: '30 cm' },
        { itemKey: '1-2', name: 'Dig planting pits of 60 cm x 60 cm x 60 cm at 1.8 m x 1.8 m spacing', spec: '60x60 cm pits' },
        { itemKey: '1-3', name: 'Fill pits with topsoil + 10 kg decomposed FYM + 250 g neem cake', spec: 'Pit mixture' },
      ],
    },
    seedTreatment: {
      title: 'Banana Sucker Selection, Paring & Pralinage',
      youtubeUrl: 'https://www.youtube.com/watch?v=LanXVBw7E8g',
      videoId: 'LanXVBw7E8g',
      duration: '6:15',
      description: 'Select sword suckers weighing 1.5-2.0 kg. Pare roots and decayed tissue. Perform pralinage by dipping corm in cow dung slurry + Carbofuran + Carbendazim.',
      learnPoints: ['Sword sucker selection vs water suckers', 'Paring roots and outer corm tissue', 'Pralinage technique in mud-chemical slurry', 'Shade drying before planting'],
      whyExplanation: 'Paring and pralinage eliminate banana corm weevil grubs and burrowing nematodes before planting.',
      checklists: [
        { itemKey: '2-1', name: 'Select vigorous sword suckers (1.5-2 kg) with narrow leaves', spec: 'Sword suckers' },
        { itemKey: '2-2', name: 'Pare all old roots and trim outer necrotic corm tissue with knife', spec: 'Paring' },
        { itemKey: '2-3', name: 'Dip corm in clay slurry + Carbendazim @ 2 g/L for 15 minutes', spec: 'Pralinage' },
      ],
    },
    sowing: {
      title: 'Banana Planting & Pit Placement Method',
      youtubeUrl: 'https://www.youtube.com/watch?v=UayouU0rLII',
      videoId: 'UayouU0rLII',
      duration: '6:40',
      description: 'Place suckers vertically in the center of the pit, press soil firmly around corm to avoid air pockets, and provide immediate copious irrigation.',
      learnPoints: ['Vertical placement of corm in pit center', 'Firm compaction around corm to eliminate air pockets', 'Immediate copius basin watering', 'Drip line connection'],
      whyExplanation: 'Firm soil contact around the corm prevents root drying and wind toppling of the newly establishing shoot.',
      checklists: [
        { itemKey: '3-1', name: 'Plant suckers vertically in pit center at corm collar level', spec: 'Vertical plant' },
        { itemKey: '3-2', name: 'Firmly press soil around corm to eliminate air pockets', spec: 'Firm soil' },
        { itemKey: '3-3', name: 'Provide immediate basin irrigation after planting', spec: 'Copious water' },
      ],
    },
    irrigation: {
      title: 'Banana Drip Irrigation & Water Scheduling',
      youtubeUrl: 'https://www.youtube.com/watch?v=LanXVBw7E8g',
      videoId: 'LanXVBw7E8g',
      duration: '6:50',
      description: 'Banana requires 15-20 liters of water per plant per day via drip irrigation. Increase to 25-30 L/plant/day during hot summer and bunch emergence.',
      learnPoints: ['Drip irrigation scheduling (15-25 L/plant/day)', 'Daily or alternate day delivery', 'Drainage during monsoon to prevent root suffocation', 'Mulching around pseudo-stem basin'],
      whyExplanation: 'Banana foliage transpires massive volumes of water; even mild moisture deficits reduce bunch weight and hand counts.',
      checklists: [
        { itemKey: '4-1', name: 'Operate drip irrigation to supply 15-20 L water/plant/day', spec: '15-20 L/day' },
        { itemKey: '4-2', name: 'Increase water supply to 25-30 L/plant/day during flowering and shooting', spec: 'Shooting stage' },
      ],
    },
    cropCare: {
      title: 'Banana Desuckering, Weevil & Sigatoka IPM',
      youtubeUrl: 'https://www.youtube.com/watch?v=LanXVBw7E8g',
      videoId: 'LanXVBw7E8g',
      duration: '7:30',
      description: 'Remove side suckers (desuckering) every month until bunch shooting. Scout for Sigatoka leaf spots; spray Propiconazole (1 ml/L) with mineral oil.',
      learnPoints: ['Monthly desuckering to direct energy to main stem', 'Earthing up to anchor pseudostem', 'Sigatoka leaf spot management', 'Propping bunches with bamboo poles'],
      whyExplanation: 'Desuckering eliminates competing vegetative sinks, funneling all sap into the emerging giant bunch.',
      checklists: [
        { itemKey: '5-1', name: 'Perform regular desuckering by cutting side shoots at ground level', spec: 'Monthly desuckering' },
        { itemKey: '5-2', name: 'Earth up soil around pseudo-stem base at 3 and 5 months', spec: 'Earthing up' },
        { itemKey: '5-3', name: 'Prop heavy emerging bunches using bamboo poles to prevent toppling', spec: 'Bamboo propping' },
      ],
    },
    fertilizer: {
      title: 'Banana Basal & Monthly Fertigation Schedule',
      youtubeUrl: 'https://www.youtube.com/watch?v=UayouU0rLII',
      videoId: 'UayouU0rLII',
      duration: '6:35',
      description: 'Apply 200 g N, 60 g P2O5, and 300 g K2O per plant across the crop cycle in split monthly doses through drip fertigation.',
      learnPoints: ['High potassium requirement for bunch filling', 'Monthly split fertigation schedule', 'Micronutrient foliar spray (Banana Special)', 'Applying neem cake for root health'],
      whyExplanation: 'Heavy potassium nutrition fills every finger to maximum girth and prevents bunch drop during shooting.',
      checklists: [
        { itemKey: '6-1', name: 'Apply monthly split fertigation of Urea and Muriate of Potash', spec: 'Monthly split' },
        { itemKey: '6-2', name: 'Spray micronutrient Banana Special @ 5 g/L at 5th and 7th month', spec: 'Foliar spray' },
      ],
    },
    harvest: {
      title: 'Banana Bunch Harvesting & Handling Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=LanXVBw7E8g',
      videoId: 'LanXVBw7E8g',
      duration: '7:10',
      description: 'Harvest bunches at 75-80% maturity when angles of fingers become rounded. Cut bunch leaving 30 cm stalk for handling, de-hand, and wash in water.',
      learnPoints: ['Fingers angle roundness maturity index', 'Bunch cutting leaving 30 cm handle', 'De-handing and washing sap in water', 'Packing in cushioned corrugated cartons'],
      whyExplanation: 'Harvesting at 75% maturity allows safe distant transit without premature ripening or pressure bruising.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest bunch when finger ridges turn rounded and dull green', spec: '75-80% maturity' },
        { itemKey: '7-2', name: 'Cut bunch leaving 30 cm peduncle handle for carrying', spec: '30 cm stalk' },
        { itemKey: '7-3', name: 'De-hand with curved knife and wash in water to remove latex sap', spec: 'De-handing' },
      ],
    },
  },

  // 15. MANGO
  mango: {
    prepareSoil: {
      title: 'Mango Orchard Site Selection & Pitting Layout',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '7:40',
      description: 'Dig 1x1x1 m pits at 10x10 m spacing (or 5x5 m for high density). Fill pits with topsoil + 25 kg FYM + 2 kg SSP + 100 g chlorpyrifos dust.',
      learnPoints: ['Orchard layout and square system spacing', 'Pit excavation (1x1x1 m) in summer', 'Pit refilling with organic manure and bone meal', 'Windbreak planting'],
      whyExplanation: 'Large deep pits provide a loose fertile pocket for grafted taproots to establish deep into the soil.',
      checklists: [
        { itemKey: '1-1', name: 'Dig 1 m x 1 m x 1 m pits during summer and expose to sunlight', spec: '1x1x1 m pits' },
        { itemKey: '1-2', name: 'Fill pits with topsoil + 25 kg decomposed FYM + 2 kg SSP', spec: 'Pit mixture' },
        { itemKey: '1-3', name: 'Mark planting geometry at 10 m x 10 m (or 5 m x 5 m HDP)', spec: 'Orchard layout' },
      ],
    },
    seedTreatment: {
      title: 'Mango Graft Selection & Root Inoculation',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '6:15',
      description: 'Select genuine epicotyl / veneer grafts from certified nurseries. Drench graft polybag with Carbendazim (1 g/L) before planting.',
      learnPoints: ['Certified graft union inspection', 'Dipping graft polybag in fungicide', 'Removing polythene strip from graft union', 'Verifying scion-rootstock health'],
      whyExplanation: 'Removing the nursery polythene tie prevents constriction and breakage of the growing graft union.',
      checklists: [
        { itemKey: '2-1', name: 'Select 1-year-old certified grafts with strong union', spec: 'Certified graft' },
        { itemKey: '2-2', name: 'Drench polybag soil with Carbendazim @ 1 g/L against root rot', spec: 'Fungicide dip' },
        { itemKey: '2-3', name: 'Carefully remove nursery polythene wrap without disturbing root ball', spec: 'Remove tie' },
      ],
    },
    sowing: {
      title: 'Mango Precision Planting & Basin Spacing',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '6:30',
      description: 'Plant graft in pit center keeping the graft union 15 cm above ground level. Stake with bamboo pole and provide basin irrigation.',
      learnPoints: ['Graft union height (15 cm above soil)', 'Staking with bamboo to prevent wind shaking', 'Basin creation around tree', 'Removing rootstock water sprouts'],
      whyExplanation: 'Keeping the graft union above soil prevents soil-borne fungal pathogens from invading the graft seam.',
      checklists: [
        { itemKey: '3-1', name: 'Plant graft in pit center keeping union 15 cm above ground', spec: 'Union 15 cm above' },
        { itemKey: '3-2', name: 'Stake graft firmly with bamboo stick against wind shaking', spec: 'Bamboo stake' },
        { itemKey: '3-3', name: 'Form circular basin and irrigate immediately', spec: 'Basin water' },
      ],
    },
    irrigation: {
      title: 'Mango Drip Irrigation & Water Stress Management',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '6:45',
      description: 'Irrigate young trees weekly. Withhold water for mature trees during Oct-Nov to induce flowering, then resume irrigation after fruit set.',
      learnPoints: ['Withholding water in autumn to induce flower bud differentiation', 'Regular drip watering from pea-size to harvest', 'Ring basin irrigation method', 'Preventing fruit drop'],
      whyExplanation: 'Autumn moisture stress halts vegetative flushing and triggers floral initiation in mango shoots.',
      checklists: [
        { itemKey: '4-1', name: 'Withhold irrigation during Oct-Nov to encourage flower bud formation', spec: 'Autumn stress' },
        { itemKey: '4-2', name: 'Resume regular irrigation after fruit set reaches pea-size', spec: 'Fruit enlargement' },
      ],
    },
    cropCare: {
      title: 'Mango Pruning, Hopper & Anthracnose IPM',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '7:50',
      description: 'Prune deadwood after harvest. Spray Imidacloprid (0.3 ml/L) at panicle emergence for mango hopper, and Mancozeb for anthracnose.',
      learnPoints: ['Canopy pruning after harvest', 'Mango hopper (Amritodus atkinsoni) spray schedule', 'Anthracnose flower blight control', 'Fruit fly methyl eugenol trap installation'],
      whyExplanation: 'Mango hopper nymphs suck sap from tender blossoms, turning flowers black and causing 100% fruit loss.',
      checklists: [
        { itemKey: '5-1', name: 'Prune criss-cross branches and deadwood after annual harvest', spec: 'Canopy pruning' },
        { itemKey: '5-2', name: 'Spray Imidacloprid @ 0.3 ml/L at early panicle emergence for hoppers', spec: 'Hopper spray' },
        { itemKey: '5-3', name: 'Install 5 Methyl Eugenol traps/ha for fruit fly monitoring', spec: 'Fruit fly traps' },
      ],
    },
    fertilizer: {
      title: 'Mango Post-Harvest & Pre-Flowering Nutrition',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '6:20',
      description: 'Apply 1000 g N, 500 g P2O5, and 1000 g K2O per mature tree annually in two split doses (July-August post-harvest, and at fruit set).',
      learnPoints: ['Post-harvest NPK and FYM trench application', 'Micro-nutrient spray of Zinc and Boron at flowering', 'Paclobutrazol application in non-bearing trees', 'Trench placement around dripline'],
      whyExplanation: 'Post-harvest feeding replenishes depleted food reserves and prepares mature shoots for next year’s bloom.',
      checklists: [
        { itemKey: '6-1', name: 'Apply 50 kg FYM + 50% NPK in circular trench around dripline in August', spec: 'Post-harvest trench' },
        { itemKey: '6-2', name: 'Apply remaining 50% NPK at marble-size fruit stage', spec: 'Fruit set split' },
        { itemKey: '6-3', name: 'Foliar spray 0.2% Borax at panicle emergence to enhance fruit set', spec: 'Borax spray' },
      ],
    },
    harvest: {
      title: 'Mango Harvesting, De-sapping & Ripening Care',
      youtubeUrl: 'https://www.youtube.com/watch?v=vYsQ9zSWC5c',
      videoId: 'vYsQ9zSWC5c',
      duration: '7:15',
      description: 'Harvest mangoes at physiological maturity when shoulder rises above stem attachment and specific gravity reaches 1.01-1.02. Harvest with 1 cm pedicel to prevent sap burn.',
      learnPoints: ['Shoulder rising and tapka (natural fall) maturity indices', 'Harvesting with pole clipper leaving 1 cm stalk', 'De-sapping on inverted racks to prevent skin burn', 'Hot water treatment against fruit fly (48°C for 60 mins)'],
      whyExplanation: 'Harvesting with 1 cm stalk prevents milky latex sap from squirting onto the fruit skin, avoiding sap burn blackening.',
      checklists: [
        { itemKey: '7-1', name: 'Harvest fruits when shoulders rise and skin color lightens', spec: 'Maturity index' },
        { itemKey: '7-2', name: 'Harvest using mango harvester pole with net, leaving 1 cm stalk', spec: '1 cm stalk' },
        { itemKey: '7-3', name: 'De-sap fruits on holding racks with stems facing downwards', spec: 'De-sapping' },
        { itemKey: '7-4', name: 'Grade fruits by weight and pack in ventilated corrugated boxes', spec: 'Grading' },
      ],
    },
  },
}

/**
 * Normalizes input name and returns stage video details, or tailored crop-specific fallback.
 * CRITICAL RULE: NEVER substitutes another crop's video!
 */
export function getCropVideoConfig(cropNameOrId: string, stepNumber: number = 1): CropStageVideoInfo {
  const canonicalId = normalizeCropName(cropNameOrId)
  const stageKey: StageKey = STEP_NUMBER_TO_STAGE_KEY[stepNumber] || 'prepareSoil'
  const stageMeta = STAGE_TITLES[stepNumber] || STAGE_TITLES[1]

  const cleanCropDisplayName =
    cropNameOrId && !cropNameOrId.includes('/')
      ? cropNameOrId.charAt(0).toUpperCase() + cropNameOrId.slice(1)
      : cropNameOrId?.split('/')[0]?.trim() || 'Crop'

  const cropGroup = cropVideos[canonicalId]
  if (cropGroup && cropGroup[stageKey]) {
    const video = cropGroup[stageKey]!
    return {
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      videoId: video.videoId,
      duration: video.duration || '7:00',
      description: video.description,
      learnPoints: video.learnPoints || [],
      whyExplanation: video.whyExplanation || '',
      checklists: video.checklists || [],
    }
  }

  // Fallback: Crop-specific information without verified video (NO OTHER CROP VIDEO EVER!)
  return generateCropSpecificFallback(cleanCropDisplayName, stepNumber, stageMeta)
}

function generateCropSpecificFallback(
  crop: string,
  stepNumber: number,
  meta: { title: string; stage: string; timeframe: string }
): CropStageVideoInfo {
  const stageTitles: Record<number, string> = {
    1: `${crop} Land Preparation & Soil Tilth Management`,
    2: `${crop} Certified Seed Treatment & Inoculation`,
    3: `${crop} Precision Sowing, Geometry & Spacing`,
    4: `${crop} Water Management & Critical Irrigation`,
    5: `${crop} Integrated Pest, Disease & Weed Care`,
    6: `${crop} Nutrient Strategy & Fertilizer Scheduling`,
    7: `${crop} Harvesting, Post-Harvest Curing & Storage`,
  }

  const stageDescriptions: Record<number, string> = {
    1: `Plough the soil to 20 cm depth, incorporate well-decomposed organic manure, and prepare an optimal seedbed tailored for ${crop}.`,
    2: `Treat ${crop} planting material with recommended biological agents or fungicides to guard against soil-borne damping-off.`,
    3: `Sow or transplant ${crop} at optimal geometry and recommended depth into moist soil to establish a uniform plant population.`,
    4: `Supply irrigation at critical moisture-sensitive stages of ${crop} while maintaining clear drainage to prevent root hypoxia.`,
    5: `Monitor ${crop} weekly for major regional insect pests and foliar diseases using integrated pest management (IPM).`,
    6: `Apply balanced primary NPK and essential secondary micronutrients in split doses to match peak nutrient uptake of ${crop}.`,
    7: `Harvest ${crop} at peak maturity indices, dry carefully, and store under controlled moisture to preserve market grade.`,
  }

  const stageLearnPoints: Record<number, string[]> = {
    1: [
      `Primary tillage depth for ${crop} root zone`,
      'Organic matter and FYM incorporation',
      'Field leveling and drainage furrow construction',
      'Optimal soil pH and moisture balance',
    ],
    2: [
      `Certified ${crop} seed/planting material inspection`,
      'Biological fungicide seed coating protocol',
      'Bio-fertilizer inoculation for root health',
      'Shade drying before sowing',
    ],
    3: [
      `Optimal row and plant spacing for ${crop}`,
      'Precision sowing depth into moist soil',
      'Target plant population per hectare',
      'Timely gap filling and thinning',
    ],
    4: [
      `Critical moisture stress periods for ${crop}`,
      'Efficient furrow or drip irrigation delivery',
      'Rapid drainage management during heavy rains',
      'Root zone moisture monitoring',
    ],
    5: [
      `Key insect pests and symptoms affecting ${crop}`,
      'Pheromone and sticky trap monitoring',
      'Bio-pesticide and neem spray application',
      'Weed management before canopy closure',
    ],
    6: [
      `Basal NPK application for ${crop}`,
      'Split nitrogen top-dressing schedule',
      'Micronutrient and secondary nutrient spray',
      'Maximizing fertilizer use efficiency',
    ],
    7: [
      `Recognizing maturity indicators for ${crop}`,
      'Optimal harvest timing during dry weather',
      'Post-harvest cleaning, drying and sorting',
      'Safe storage moisture threshold',
    ],
  }

  const stageWhy: Record<number, string> = {
    1: `Proper tilth and clod pulverization support rapid root anchorage and prevent water stagnation for ${crop}.`,
    2: `Seed treatment shields emerging ${crop} seedlings from soil-borne fungi during the vulnerable first 15 days.`,
    3: `Accurate spacing ensures even sunlight interception and root distribution without overcrowding.`,
    4: `Preventing water stress during flowering and fruit/seed formation preserves high yield potential in ${crop}.`,
    5: `Early IPM scouting controls pest flushes before populations exceed economic threshold levels in ${crop}.`,
    6: `Synchronizing fertilizer top-dressing with ${crop} vegetative and reproductive peaks maximizes nutrient uptake.`,
    7: `Timely harvesting prevents field shattering, lodging, and storage spoilage for ${crop}.`,
  }

  const stageChecklists: Record<number, Array<{ itemKey: string; name: string; spec?: string }>> = {
    1: [
      { itemKey: '1-1', name: `Plough field thoroughly for ${crop}`, spec: '20 cm depth' },
      { itemKey: '1-2', name: 'Incorporate 8-10 t/ha decomposed FYM / compost', spec: '8-10 t/ha' },
      { itemKey: '1-3', name: 'Level field and create drainage channels', spec: 'Drainage check' },
    ],
    2: [
      { itemKey: '2-1', name: `Inspect certified ${crop} seeds for high viability`, spec: '>80% germination' },
      { itemKey: '2-2', name: `Coat seeds with recommended bio-agent / fungicide`, spec: 'Seed dressing' },
      { itemKey: '2-3', name: 'Dry treated seeds under shade before sowing', spec: 'Shade dry' },
    ],
    3: [
      { itemKey: '3-1', name: `Sow ${crop} at recommended row and plant spacing`, spec: 'Row spacing' },
      { itemKey: '3-2', name: 'Plant at optimal depth in moist soil', spec: 'Moist seedbed' },
      { itemKey: '3-3', name: 'Perform gap filling within 10 days of emergence', spec: 'Stand check' },
    ],
    4: [
      { itemKey: '4-1', name: `Monitor soil moisture at critical growth stages of ${crop}`, spec: 'Root zone check' },
      { itemKey: '4-2', name: 'Provide timely irrigation during dry weather', spec: 'Scheduled water' },
      { itemKey: '4-3', name: 'Clear drainage channels after heavy downpours', spec: 'Zero stagnation' },
    ],
    5: [
      { itemKey: '5-1', name: `Perform weeding and hoeing for ${crop}`, spec: 'Weed-free' },
      { itemKey: '5-2', name: 'Install traps and scout weekly for pest symptoms', spec: 'Weekly survey' },
      { itemKey: '5-3', name: 'Apply recommended bio-pesticide if threshold is crossed', spec: 'IPM spray' },
    ],
    6: [
      { itemKey: '6-1', name: `Apply basal fertilizer dose for ${crop}`, spec: 'Basal placement' },
      { itemKey: '6-2', name: 'Top-dress split nitrogen at active vegetative growth', spec: 'Top dressing' },
      { itemKey: '6-3', name: 'Apply micronutrient foliar spray if deficiency appears', spec: 'Foliar nutrition' },
    ],
    7: [
      { itemKey: '7-1', name: `Harvest ${crop} at physiological maturity`, spec: 'Maturity index' },
      { itemKey: '7-2', name: 'Thresh, clean, and grade produce', spec: 'Grade sorting' },
      { itemKey: '7-3', name: 'Dry produce to safe storage moisture before bagging', spec: 'Safe storage' },
    ],
  }

  return {
    title: stageTitles[stepNumber] || `${crop} Stage ${stepNumber} Management`,
    youtubeUrl: '',
    videoId: '', // Explicitly empty so UI renders the verified fallback card, NEVER Maize!
    duration: '6:30',
    description: stageDescriptions[stepNumber] || `Follow recommended agronomic practices for ${crop}.`,
    learnPoints: stageLearnPoints[stepNumber] || [`Best management practices for ${crop}`],
    whyExplanation: stageWhy[stepNumber] || `Essential agronomic step for successful ${crop} harvest.`,
    checklists: stageChecklists[stepNumber] || [
      { itemKey: `${stepNumber}-1`, name: `Complete stage ${stepNumber} tasks for ${crop}`, spec: 'Standard practice' },
    ],
  }
}
