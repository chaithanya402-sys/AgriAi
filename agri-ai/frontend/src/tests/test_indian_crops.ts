import {
  cropCatalog,
  normalizeCropName,
  isModelSupportedCrop,
  cropImages,
  getAllCatalogCrops,
  INDIAN_CROP_CATEGORIES,
} from '../data/cropCatalog'

const testCrops = [
  { input: 'Rice', expectedId: 'rice' },
  { input: 'Paddy', expectedId: 'rice' },
  { input: 'Wheat', expectedId: 'wheat' },
  { input: 'Maize', expectedId: 'maize' },
  { input: 'Jowar', expectedId: 'sorghum' },
  { input: 'Bajra', expectedId: 'pearl_millet' },
  { input: 'Ragi', expectedId: 'finger_millet' },
  { input: 'Soybean', expectedId: 'soybean' },
  { input: 'Groundnut', expectedId: 'groundnut' },
  { input: 'Mustard', expectedId: 'mustard' },
  { input: 'Cotton', expectedId: 'cotton' },
  { input: 'Jute', expectedId: 'jute' },
  { input: 'Sugarcane', expectedId: 'sugarcane' },
  { input: 'Chickpea', expectedId: 'chickpea' },
  { input: 'Bengal Gram', expectedId: 'chickpea' },
  { input: 'Gram', expectedId: 'chickpea' },
  { input: 'Pigeon Pea', expectedId: 'pigeon_pea' },
  { input: 'Red Gram', expectedId: 'pigeon_pea' },
  { input: 'Arhar', expectedId: 'pigeon_pea' },
  { input: 'Tur', expectedId: 'pigeon_pea' },
  { input: 'Green Gram', expectedId: 'green_gram' },
  { input: 'Moong', expectedId: 'green_gram' },
  { input: 'Black Gram', expectedId: 'black_gram' },
  { input: 'Urad', expectedId: 'black_gram' },
  { input: 'Tomato', expectedId: 'tomato' },
  { input: 'Potato', expectedId: 'potato' },
  { input: 'Onion', expectedId: 'onion' },
  { input: 'Brinjal', expectedId: 'brinjal' },
  { input: 'Eggplant', expectedId: 'brinjal' },
  { input: 'Okra', expectedId: 'okra' },
  { input: 'Lady Finger', expectedId: 'okra' },
  { input: 'Chilli', expectedId: 'chilli' },
  { input: 'Turmeric', expectedId: 'turmeric' },
  { input: 'Ginger', expectedId: 'ginger' },
  { input: 'Mango', expectedId: 'mango' },
  { input: 'Banana', expectedId: 'banana' },
  { input: 'Papaya', expectedId: 'papaya' },
  { input: 'Guava', expectedId: 'guava' },
  { input: 'Grapes', expectedId: 'grapes' },
  { input: 'Pomegranate', expectedId: 'pomegranate' },
  { input: 'Coconut', expectedId: 'coconut' },
  { input: 'Cashew', expectedId: 'cashew' },
  { input: 'Tea', expectedId: 'tea' },
  { input: 'Coffee', expectedId: 'coffee' },
  { input: 'Rubber', expectedId: 'rubber' },
  // Extra Indian crops
  { input: 'Peanut', expectedId: 'groundnut' },
  { input: 'Drumstick', expectedId: 'drumstick' },
  { input: 'Moringa', expectedId: 'drumstick' },
  { input: 'Chikoo', expectedId: 'sapota' },
  { input: 'Sapota', expectedId: 'sapota' },
  { input: 'Amla', expectedId: 'amla' },
  { input: 'Indian Gooseberry', expectedId: 'amla' },
  { input: 'Sweet Orange', expectedId: 'sweet_orange' },
  { input: 'Mosambi', expectedId: 'sweet_orange' },
  { input: 'Tapioca', expectedId: 'tapioca' },
  { input: 'Cassava', expectedId: 'tapioca' },
  { input: 'Colocasia', expectedId: 'colocasia' },
  { input: 'Arbi', expectedId: 'colocasia' },
]

console.log('--- RUNNING INDIAN CROP VALIDATION TESTS ---')
let passed = 0
let failed = 0

for (const tc of testCrops) {
  const resolved = normalizeCropName(tc.input)
  if (resolved !== tc.expectedId) {
    console.error(`FAIL: normalizeCropName("${tc.input}") = "${resolved}", expected "${tc.expectedId}"`)
    failed++
    continue
  }

  const catalogItem = cropCatalog[resolved]
  if (!catalogItem) {
    console.error(`FAIL: cropCatalog has no entry for "${resolved}"`)
    failed++
    continue
  }

  const img = cropImages[resolved]
  if (!img) {
    console.error(`FAIL: cropImages has no entry for "${resolved}"`)
    failed++
    continue
  }

  passed++
}

console.log(`ALIAS RESOLUTION & CATALOG INTEGRITY: ${passed}/${testCrops.length} passed.`)

// Verify Categories
const allCatalogCrops = getAllCatalogCrops()
console.log(`TOTAL CATALOG CROPS AVAILABLE: ${allCatalogCrops.length}`)

const categoriesFound = new Set(allCatalogCrops.map(c => c.category))
console.log(`CATEGORIES COVERED: ${Array.from(categoriesFound).join(', ')}`)

// Check if any crop has missing fields
let missingFieldCount = 0
for (const crop of allCatalogCrops) {
  if (!crop.id || !crop.name || !crop.category || !crop.image || !crop.seasons || !crop.states || !crop.soilTypes) {
    console.error(`Crop ${crop.id} has missing required fields!`)
    missingFieldCount++
  }
}

if (missingFieldCount === 0) {
  console.log('ALL CROPS HAVE COMPLETE REQUIRED METADATA & IMAGES ✓')
} else {
  console.error(`${missingFieldCount} crops have missing fields!`)
}

if (failed === 0 && missingFieldCount === 0) {
  console.log('SUCCESS: ALL INDIAN CROP CATALOG TESTS PASSED!')
} else {
  throw new Error('Test failures detected!')
}
