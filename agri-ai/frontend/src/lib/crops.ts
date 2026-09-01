/**
 * Canonical crop list from the real CropYield dataset (agri-ai/datasets).
 * All 15 crops grown across the 36 states/UTs. These names match the dataset
 * exactly and are used across every module selector.
 */
export const CROPS = [
  'Bajra',
  'Barley',
  'Coffee',
  'Cotton',
  'Groundnut',
  'Jute',
  'Maize',
  'Mustard',
  'Paddy',
  'Pulses',
  'Ragi',
  'Soybean',
  'Sugarcane',
  'Tea',
  'Wheat',
] as const

export type Crop = (typeof CROPS)[number]
