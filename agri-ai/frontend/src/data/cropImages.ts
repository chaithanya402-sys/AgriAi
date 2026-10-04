/**
 * Central Crop Image Mapping for AgriAI
 * Single Source of Truth for Crop Photographs.
 *
 * All crop images represent actual crops/plants in real agricultural fields.
 * Never uses cooked food, packaged goods, generic graphics, or wrong-crop fallbacks.
 */

export interface CropImageEntry {
  id: string
  name: string
  aliases: string[]
  image: string
}

// 1. Master Crop Image Catalog (Canonical definitions)
export const cropCatalogMap: Record<string, CropImageEntry> = {
  // Cereals & Millets
  rice: {
    id: 'rice',
    name: 'Paddy / Rice',
    aliases: ['paddy', 'rice', 'paddy / rice', 'paddy/rice', 'dhan', 'chawal'],
    image: '/images/crops/rice.webp',
  },
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    aliases: ['wheat', 'gehun', 'gehu'],
    image: '/images/crops/wheat.webp',
  },
  maize: {
    id: 'maize',
    name: 'Maize / Corn',
    aliases: ['maize', 'corn', 'maize / corn', 'maize/corn', 'makka'],
    image: '/images/crops/maize.webp',
  },
  sorghum: {
    id: 'sorghum',
    name: 'Sorghum / Jowar',
    aliases: ['sorghum', 'jowar', 'sorghum / jowar', 'sorghum/jowar', 'chari', 'cholam'],
    image: '/images/crops/sorghum.webp',
  },
  'pearl-millet': {
    id: 'pearl-millet',
    name: 'Bajra / Pearl Millet',
    aliases: ['bajra', 'pearl millet', 'pearl-millet', 'pearl_millet', 'bajra / pearl millet', 'bajra/pearl millet', 'bajri', 'sajje'],
    image: '/images/crops/pearl-millet.webp',
  },
  'finger-millet': {
    id: 'finger-millet',
    name: 'Ragi / Finger Millet',
    aliases: ['ragi', 'finger millet', 'finger-millet', 'finger_millet', 'ragi / finger millet', 'ragi/finger millet', 'mandua'],
    image: '/images/crops/finger-millet.webp',
  },
  barley: {
    id: 'barley',
    name: 'Barley / Jau',
    aliases: ['barley', 'jau', 'barley / jau', 'barley/jau'],
    image: '/images/crops/barley.webp',
  },
  oats: {
    id: 'oats',
    name: 'Oats',
    aliases: ['oats', 'oat'],
    image: '/images/crops/oats.webp',
  },
  'foxtail-millet': {
    id: 'foxtail-millet',
    name: 'Foxtail Millet / Kangni',
    aliases: ['foxtail millet', 'kangni', 'foxtail-millet', 'foxtail_millet', 'foxtail millet / kangni', 'foxtail millet/kangni', 'korra'],
    image: '/images/crops/foxtail-millet.webp',
  },
  'little-millet': {
    id: 'little-millet',
    name: 'Little Millet / Kutki',
    aliases: ['little millet', 'kutki', 'little-millet', 'little_millet', 'little millet / kutki', 'little millet/kutki', 'sama', 'samai'],
    image: '/images/crops/little-millet.webp',
  },
  'kodo-millet': {
    id: 'kodo-millet',
    name: 'Kodo Millet / Kodra',
    aliases: ['kodo millet', 'kodra', 'kodo-millet', 'kodo_millet', 'kodo millet / kodra', 'kodo millet/kodra', 'kodo', 'varagu'],
    image: '/images/crops/kodo-millet.webp',
  },
  'barnyard-millet': {
    id: 'barnyard-millet',
    name: 'Barnyard Millet / Sanwa',
    aliases: ['barnyard millet', 'sanwa', 'barnyard-millet', 'barnyard_millet', 'barnyard millet / sanwa', 'barnyard millet/sanwa', 'sanwan', 'oodalu'],
    image: '/images/crops/barnyard-millet.webp',
  },
  'proso-millet': {
    id: 'proso-millet',
    name: 'Proso Millet / Chena',
    aliases: ['proso millet', 'chena', 'proso-millet', 'proso_millet', 'proso millet / chena', 'proso millet/chena', 'cheena', 'barri'],
    image: '/images/crops/proso-millet.webp',
  },
  'browntop-millet': {
    id: 'browntop-millet',
    name: 'Browntop Millet / Korale',
    aliases: ['browntop millet', 'korale', 'browntop-millet', 'browntop_millet', 'browntop millet / korale', 'browntop millet/korale'],
    image: '/images/crops/browntop-millet.webp',
  },
  amaranth: {
    id: 'amaranth',
    name: 'Amaranth / Rajgira',
    aliases: ['amaranth', 'rajgira', 'amaranth / rajgira', 'amaranth/rajgira', 'ramdana', 'amaranth_grain'],
    image: '/images/crops/amaranth.webp',
  },

  // Pulses
  chickpea: {
    id: 'chickpea',
    name: 'Chickpea / Bengal Gram',
    aliases: ['chickpea', 'bengal gram', 'bengal-gram', 'bengal_gram', 'chickpea / bengal gram', 'chickpea/bengal gram', 'chana', 'gram'],
    image: '/images/crops/chickpea.webp',
  },
  'pigeon-pea': {
    id: 'pigeon-pea',
    name: 'Pigeon Pea / Toor Dal',
    aliases: ['pigeon pea', 'toor dal', 'toor', 'tur', 'pigeon-pea', 'pigeon_pea', 'pigeon pea / toor dal', 'pigeon pea/toor dal', 'red gram', 'arhar'],
    image: '/images/crops/pigeon-pea.webp',
  },
  lentil: {
    id: 'lentil',
    name: 'Lentil / Masoor',
    aliases: ['lentil', 'masoor', 'lentil / masoor', 'lentil/masoor'],
    image: '/images/crops/lentil.webp',
  },
  peas: {
    id: 'peas',
    name: 'Peas / Green Pea',
    aliases: ['peas', 'pea', 'green pea', 'peas / green pea', 'peas/green pea', 'matar'],
    image: '/images/crops/peas.webp',
  },
  'field-pea': {
    id: 'field-pea',
    name: 'Field Pea / Dry Matar',
    aliases: ['field pea', 'dry matar', 'field-pea', 'field_pea', 'field pea / dry matar', 'field pea/dry matar', 'dry pea'],
    image: '/images/crops/field-pea.webp',
  },
  cowpea: {
    id: 'cowpea',
    name: 'Cowpea / Lobia',
    aliases: ['cowpea', 'lobia', 'cowpea / lobia', 'cowpea/lobia', 'chavli', 'cowpea_fodder'],
    image: '/images/crops/cowpea.webp',
  },
  'moth-bean': {
    id: 'moth-bean',
    name: 'Moth Bean / Matki',
    aliases: ['moth bean', 'matki', 'moth-bean', 'moth_bean', 'moth bean / matki', 'moth bean/matki', 'moth'],
    image: '/images/crops/moth-bean.webp',
  },
  'kidney-bean': {
    id: 'kidney-bean',
    name: 'Kidney Bean / Rajma',
    aliases: ['kidney bean', 'rajma', 'kidney-bean', 'kidney_bean', 'kidney bean / rajma', 'kidney bean/rajma'],
    image: '/images/crops/kidney-bean.webp',
  },

  // Oilseeds
  soybean: {
    id: 'soybean',
    name: 'Soybean',
    aliases: ['soybean', 'soya', 'bhat'],
    image: '/images/crops/soybean.webp',
  },
  groundnut: {
    id: 'groundnut',
    name: 'Groundnut / Peanut',
    aliases: ['groundnut', 'peanut', 'groundnut / peanut', 'groundnut/peanut', 'mungfali'],
    image: '/images/crops/groundnut.webp',
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard',
    aliases: ['mustard', 'sarson', 'rapeseed', 'toria', 'rai'],
    image: '/images/crops/mustard.webp',
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    aliases: ['sunflower', 'surajmukhi'],
    image: '/images/crops/sunflower.webp',
  },
  sesame: {
    id: 'sesame',
    name: 'Sesame / Til',
    aliases: ['sesame', 'til', 'sesame / til', 'sesame/til', 'gingelly'],
    image: '/images/crops/sesame.webp',
  },
  castor: {
    id: 'castor',
    name: 'Castor',
    aliases: ['castor', 'arandi'],
    image: '/images/crops/castor.webp',
  },
  safflower: {
    id: 'safflower',
    name: 'Safflower / Kardi',
    aliases: ['safflower', 'kardi', 'safflower / kardi', 'safflower/kardi', 'kusum'],
    image: '/images/crops/safflower.webp',
  },
  linseed: {
    id: 'linseed',
    name: 'Linseed / Flax',
    aliases: ['linseed', 'flax', 'linseed / flax', 'linseed/flax', 'alsi'],
    image: '/images/crops/linseed.webp',
  },

  // Fiber & Commercial
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    aliases: ['cotton', 'kapas'],
    image: '/images/crops/cotton.webp',
  },
  jute: {
    id: 'jute',
    name: 'Jute',
    aliases: ['jute', 'patson', 'mesta'],
    image: '/images/crops/jute.webp',
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    aliases: ['sugarcane', 'ganna'],
    image: '/images/crops/sugarcane.webp',
  },
  tobacco: {
    id: 'tobacco',
    name: 'Tobacco',
    aliases: ['tobacco', 'tambaku'],
    image: '/images/crops/tobacco.webp',
  },
  'natural-rubber': {
    id: 'natural-rubber',
    name: 'Natural Rubber',
    aliases: ['natural rubber', 'rubber', 'natural-rubber', 'natural_rubber'],
    image: '/images/crops/natural-rubber.webp',
  },

  // Vegetables
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    aliases: ['tomato', 'tamatar'],
    image: '/images/crops/tomato.webp',
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    aliases: ['potato', 'aloo'],
    image: '/images/crops/potato.webp',
  },
  onion: {
    id: 'onion',
    name: 'Onion',
    aliases: ['onion', 'pyaz'],
    image: '/images/crops/onion.webp',
  },
  brinjal: {
    id: 'brinjal',
    name: 'Brinjal / Eggplant',
    aliases: ['brinjal', 'eggplant', 'brinjal / eggplant', 'brinjal/eggplant', 'baingan', 'aubergine'],
    image: '/images/crops/brinjal.webp',
  },
  okra: {
    id: 'okra',
    name: 'Okra / Lady Finger',
    aliases: ['okra', 'lady finger', 'lady-finger', 'lady_finger', 'okra / lady finger', 'okra/lady finger', 'bhindi', 'ladies finger', 'ladyfinger'],
    image: '/images/crops/okra.webp',
  },
  chilli: {
    id: 'chilli',
    name: 'Chilli / Red Pepper',
    aliases: ['chilli', 'red pepper', 'red chilli', 'chilli / red pepper', 'chilli/red pepper', 'mirchi', 'green chilli', 'green_chilli', 'red_chilli'],
    image: '/images/crops/chilli.webp',
  },
  turmeric: {
    id: 'turmeric',
    name: 'Turmeric / Haldi',
    aliases: ['turmeric', 'haldi', 'turmeric / haldi', 'turmeric/haldi'],
    image: '/images/crops/turmeric.webp',
  },
  capsicum: {
    id: 'capsicum',
    name: 'Capsicum / Bell Pepper',
    aliases: ['capsicum', 'bell pepper', 'capsicum / bell pepper', 'capsicum/bell pepper', 'shimla mirch'],
    image: '/images/crops/capsicum.webp',
  },
  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    aliases: ['cabbage', 'patta gobhi'],
    image: '/images/crops/cabbage.webp',
  },
  cauliflower: {
    id: 'cauliflower',
    name: 'Cauliflower',
    aliases: ['cauliflower', 'phool gobhi', 'broccoli'],
    image: '/images/crops/cauliflower.webp',
  },
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    aliases: ['carrot', 'gajar'],
    image: '/images/crops/carrot.webp',
  },
  spinach: {
    id: 'spinach',
    name: 'Spinach / Palak',
    aliases: ['spinach', 'palak', 'spinach / palak', 'spinach/palak'],
    image: '/images/crops/spinach.webp',
  },
  moringa: {
    id: 'moringa',
    name: 'Drumstick / Moringa',
    aliases: ['drumstick', 'moringa', 'drumstick / moringa', 'drumstick/moringa', 'sahjan'],
    image: '/images/crops/moringa.webp',
  },
  'bitter-gourd': {
    id: 'bitter-gourd',
    name: 'Bitter Gourd / Karela',
    aliases: ['bitter gourd', 'karela', 'bitter-gourd', 'bitter_gourd', 'bitter gourd / karela', 'bitter gourd/karela'],
    image: '/images/crops/bitter-gourd.webp',
  },
  cassava: {
    id: 'cassava',
    name: 'Tapioca / Cassava',
    aliases: ['tapioca', 'cassava', 'tapioca / cassava', 'tapioca/cassava'],
    image: '/images/crops/cassava.webp',
  },
  colocasia: {
    id: 'colocasia',
    name: 'Colocasia / Arbi',
    aliases: ['colocasia', 'arbi', 'colocasia / arbi', 'colocasia/arbi'],
    image: '/images/crops/colocasia.webp',
  },
  'elephant-foot-yam': {
    id: 'elephant-foot-yam',
    name: 'Elephant Foot Yam / Suran',
    aliases: ['elephant foot yam', 'elephant-foot-yam', 'elephant_foot_yam', 'suran', 'yam', 'elephant foot yam / suran', 'elephant foot yam/suran'],
    image: '/images/crops/elephant-foot-yam.webp',
  },
  garlic: {
    id: 'garlic',
    name: 'Garlic / Lahsun',
    aliases: ['garlic', 'lahsun', 'garlic / lahsun', 'garlic/lahsun'],
    image: '/images/crops/garlic.webp',
  },
  ginger: {
    id: 'ginger',
    name: 'Ginger / Adrak',
    aliases: ['ginger', 'adrak', 'ginger / adrak', 'ginger/adrak'],
    image: '/images/crops/ginger.webp',
  },
  coriander: {
    id: 'coriander',
    name: 'Coriander / Dhaniya',
    aliases: ['coriander', 'dhaniya', 'coriander / dhaniya', 'coriander/dhaniya'],
    image: '/images/crops/coriander.webp',
  },

  // Fruits
  mango: {
    id: 'mango',
    name: 'Mango',
    aliases: ['mango', 'aam'],
    image: '/images/crops/mango.webp',
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    aliases: ['banana', 'kela'],
    image: '/images/crops/banana.webp',
  },
  papaya: {
    id: 'papaya',
    name: 'Papaya',
    aliases: ['papaya', 'papita'],
    image: '/images/crops/papaya.webp',
  },
  guava: {
    id: 'guava',
    name: 'Guava',
    aliases: ['guava', 'amrood'],
    image: '/images/crops/guava.webp',
  },
  pomegranate: {
    id: 'pomegranate',
    name: 'Pomegranate',
    aliases: ['pomegranate', 'anar'],
    image: '/images/crops/pomegranate.webp',
  },
  grapes: {
    id: 'grapes',
    name: 'Grapes',
    aliases: ['grapes', 'grape', 'angoor'],
    image: '/images/crops/grapes.webp',
  },
  'sweet-orange': {
    id: 'sweet-orange',
    name: 'Sweet Orange / Mosambi',
    aliases: ['sweet orange', 'mosambi', 'sweet orange / mosambi', 'sweet orange/mosambi', 'sweet-orange', 'sweet_orange', 'orange', 'mandarin', 'santra'],
    image: '/images/crops/sweet-orange.webp',
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    aliases: ['apple', 'seb'],
    image: '/images/crops/apple.webp',
  },
  sapota: {
    id: 'sapota',
    name: 'Sapota / Chikoo',
    aliases: ['sapota', 'chikoo', 'chiku', 'sapota / chikoo', 'sapota/chikoo'],
    image: '/images/crops/sapota.webp',
  },
  amla: {
    id: 'amla',
    name: 'Amla / Indian Gooseberry',
    aliases: ['amla', 'indian gooseberry', 'amla / indian gooseberry', 'amla/indian gooseberry'],
    image: '/images/crops/amla.webp',
  },
  'custard-apple': {
    id: 'custard-apple',
    name: 'Custard Apple / Sitaphal',
    aliases: ['custard apple', 'sitaphal', 'custard apple / sitaphal', 'custard apple/sitaphal', 'custard-apple', 'custard_apple', 'sharifa'],
    image: '/images/crops/custard-apple.webp',
  },
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    aliases: ['watermelon', 'tarbooz', 'muskmelon'],
    image: '/images/crops/watermelon.webp',
  },
  jackfruit: {
    id: 'jackfruit',
    name: 'Jackfruit',
    aliases: ['jackfruit', 'kathal'],
    image: '/images/crops/jackfruit.webp',
  },
  litchi: {
    id: 'litchi',
    name: 'Litchi',
    aliases: ['litchi', 'lychee'],
    image: '/images/crops/litchi.webp',
  },
  'dragon-fruit': {
    id: 'dragon-fruit',
    name: 'Dragon Fruit / Pitaya',
    aliases: ['dragon fruit', 'pitaya', 'dragon-fruit', 'dragon_fruit', 'dragon fruit / pitaya', 'dragon fruit/pitaya'],
    image: '/images/crops/dragon-fruit.webp',
  },
  pineapple: {
    id: 'pineapple',
    name: 'Pineapple',
    aliases: ['pineapple', 'ananas'],
    image: '/images/crops/pineapple.webp',
  },

  // Plantation & Spices
  tea: {
    id: 'tea',
    name: 'Tea',
    aliases: ['tea', 'chai'],
    image: '/images/crops/tea.webp',
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    aliases: ['coffee', 'kahwa'],
    image: '/images/crops/coffee.webp',
  },
  arecanut: {
    id: 'arecanut',
    name: 'Arecanut / Betel Nut',
    aliases: ['arecanut', 'betel nut', 'arecanut / betel nut', 'arecanut/betel nut', 'supari', 'coconut'],
    image: '/images/crops/arecanut.webp',
  },
  cardamom: {
    id: 'cardamom',
    name: 'Cardamom',
    aliases: ['cardamom', 'elaichi', 'black_pepper', 'black pepper'],
    image: '/images/crops/cardamom.webp',
  },
  cumin: {
    id: 'cumin',
    name: 'Cumin / Jeera',
    aliases: ['cumin', 'jeera', 'cumin / jeera', 'cumin/jeera', 'fennel'],
    image: '/images/crops/cumin.webp',
  },
  cashew: {
    id: 'cashew',
    name: 'Cashew',
    aliases: ['cashew', 'kaju'],
    image: '/images/crops/cashew.webp',
  },

  // Flowers
  marigold: {
    id: 'marigold',
    name: 'Marigold',
    aliases: ['marigold', 'genda'],
    image: '/images/crops/marigold.webp',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    aliases: ['rose', 'gulab'],
    image: '/images/crops/rose.webp',
  },
  jasmine: {
    id: 'jasmine',
    name: 'Jasmine / Mogra',
    aliases: ['jasmine', 'mogra', 'jasmine / mogra', 'jasmine/mogra'],
    image: '/images/crops/jasmine.webp',
  },

  // Medicinal & Aromatic
  ashwagandha: {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    aliases: ['ashwagandha', 'asgandh'],
    image: '/images/crops/ashwagandha.webp',
  },
  'aloe-vera': {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    aliases: ['aloe vera', 'aloe-vera', 'aloe_vera', 'ghritkumari'],
    image: '/images/crops/aloe-vera.webp',
  },
  tulsi: {
    id: 'tulsi',
    name: 'Tulsi / Holy Basil',
    aliases: ['tulsi', 'holy basil', 'tulsi / holy basil', 'tulsi/holy basil'],
    image: '/images/crops/tulsi.webp',
  },
  lemongrass: {
    id: 'lemongrass',
    name: 'Lemongrass',
    aliases: ['lemongrass', 'citronella'],
    image: '/images/crops/lemongrass.webp',
  },

  // Fodder
  'hybrid-napier': {
    id: 'hybrid-napier',
    name: 'Hybrid Napier Grass',
    aliases: ['hybrid napier', 'hybrid napier grass', 'hybrid-napier', 'hybrid_napier', 'napier grass', 'napier_grass', 'napier'],
    image: '/images/crops/hybrid-napier.webp',
  },
  berseem: {
    id: 'berseem',
    name: 'Berseem / Egyptian Clover',
    aliases: ['berseem', 'egyptian clover', 'berseem / egyptian clover', 'berseem/egyptian clover'],
    image: '/images/crops/berseem.webp',
  },
  lucerne: {
    id: 'lucerne',
    name: 'Lucerne / Alfalfa',
    aliases: ['lucerne', 'alfalfa', 'lucerne / alfalfa', 'lucerne/alfalfa'],
    image: '/images/crops/lucerne.webp',
  },
}

// 2. Direct flat dictionary of every key/alias to its real crop photograph
export const cropImages: Record<string, string> = {
  // Direct canonical IDs
  rice: '/images/crops/rice.webp',
  wheat: '/images/crops/wheat.webp',
  maize: '/images/crops/maize.webp',
  sorghum: '/images/crops/sorghum.webp',
  'pearl-millet': '/images/crops/pearl-millet.webp',
  pearl_millet: '/images/crops/pearl-millet.webp',
  'finger-millet': '/images/crops/finger-millet.webp',
  finger_millet: '/images/crops/finger-millet.webp',
  barley: '/images/crops/barley.webp',
  oats: '/images/crops/oats.webp',
  'foxtail-millet': '/images/crops/foxtail-millet.webp',
  foxtail_millet: '/images/crops/foxtail-millet.webp',
  'little-millet': '/images/crops/little-millet.webp',
  little_millet: '/images/crops/little-millet.webp',
  'kodo-millet': '/images/crops/kodo-millet.webp',
  kodo_millet: '/images/crops/kodo-millet.webp',
  'barnyard-millet': '/images/crops/barnyard-millet.webp',
  barnyard_millet: '/images/crops/barnyard-millet.webp',
  'proso-millet': '/images/crops/proso-millet.webp',
  proso_millet: '/images/crops/proso-millet.webp',
  'browntop-millet': '/images/crops/browntop-millet.webp',
  browntop_millet: '/images/crops/browntop-millet.webp',
  buckwheat: '/images/crops/wheat.webp',
  amaranth: '/images/crops/amaranth.webp',
  amaranth_grain: '/images/crops/amaranth.webp',
  amaranth_greens: '/images/crops/spinach.webp',

  // Pulses
  chickpea: '/images/crops/chickpea.webp',
  'pigeon-pea': '/images/crops/pigeon-pea.webp',
  pigeon_pea: '/images/crops/pigeon-pea.webp',
  green_gram: '/images/crops/peas.webp',
  black_gram: '/images/crops/lentil.webp',
  lentil: '/images/crops/lentil.webp',
  peas: '/images/crops/peas.webp',
  'field-pea': '/images/crops/field-pea.webp',
  field_pea: '/images/crops/field-pea.webp',
  cowpea: '/images/crops/cowpea.webp',
  'moth-bean': '/images/crops/moth-bean.webp',
  moth_bean: '/images/crops/moth-bean.webp',
  horse_gram: '/images/crops/lentil.webp',
  french_bean: '/images/crops/peas.webp',
  broad_bean: '/images/crops/peas.webp',
  'kidney-bean': '/images/crops/kidney-bean.webp',
  kidney_bean: '/images/crops/kidney-bean.webp',
  lima_bean: '/images/crops/peas.webp',
  pulses: '/images/crops/lentil.webp',

  // Oilseeds
  groundnut: '/images/crops/groundnut.webp',
  mustard: '/images/crops/mustard.webp',
  rapeseed: '/images/crops/mustard.webp',
  soybean: '/images/crops/soybean.webp',
  sunflower: '/images/crops/sunflower.webp',
  sesame: '/images/crops/sesame.webp',
  castor: '/images/crops/castor.webp',
  safflower: '/images/crops/safflower.webp',
  linseed: '/images/crops/linseed.webp',
  niger_seed: '/images/crops/sesame.webp',
  toria: '/images/crops/mustard.webp',

  // Fiber & Commercial
  cotton: '/images/crops/cotton.webp',
  jute: '/images/crops/jute.webp',
  mesta: '/images/crops/jute.webp',
  sugarcane: '/images/crops/sugarcane.webp',
  tobacco: '/images/crops/tobacco.webp',
  kenaf: '/images/crops/jute.webp',
  sunn_hemp: '/images/crops/jute.webp',
  'natural-rubber': '/images/crops/natural-rubber.webp',
  natural_rubber: '/images/crops/natural-rubber.webp',
  rubber: '/images/crops/natural-rubber.webp',

  // Vegetables
  tomato: '/images/crops/tomato.webp',
  potato: '/images/crops/potato.webp',
  onion: '/images/crops/onion.webp',
  garlic: '/images/crops/garlic.webp',
  ginger: '/images/crops/ginger.webp',
  green_chilli: '/images/crops/chilli.webp',
  capsicum: '/images/crops/capsicum.webp',
  brinjal: '/images/crops/brinjal.webp',
  okra: '/images/crops/okra.webp',
  cabbage: '/images/crops/cabbage.webp',
  cauliflower: '/images/crops/cauliflower.webp',
  broccoli: '/images/crops/cauliflower.webp',
  carrot: '/images/crops/carrot.webp',
  radish: '/images/crops/carrot.webp',
  beetroot: '/images/crops/carrot.webp',
  turnip: '/images/crops/carrot.webp',
  spinach: '/images/crops/spinach.webp',
  drumstick: '/images/crops/moringa.webp',
  moringa: '/images/crops/moringa.webp',
  'bitter-gourd': '/images/crops/bitter-gourd.webp',
  bitter_gourd: '/images/crops/bitter-gourd.webp',
  bottle_gourd: '/images/crops/moringa.webp',
  ridge_gourd: '/images/crops/bitter-gourd.webp',
  sponge_gourd: '/images/crops/bitter-gourd.webp',
  snake_gourd: '/images/crops/moringa.webp',
  ash_gourd: '/images/crops/watermelon.webp',
  pumpkin: '/images/crops/watermelon.webp',
  cucumber: '/images/crops/bitter-gourd.webp',
  cluster_bean: '/images/crops/cowpea.webp',
  sweet_corn: '/images/crops/maize.webp',
  sweet_potato: '/images/crops/potato.webp',
  tapioca: '/images/crops/cassava.webp',
  cassava: '/images/crops/cassava.webp',
  colocasia: '/images/crops/colocasia.webp',
  'elephant-foot-yam': '/images/crops/elephant-foot-yam.webp',
  elephant_foot_yam: '/images/crops/elephant-foot-yam.webp',
  yam: '/images/crops/elephant-foot-yam.webp',

  // Fruits
  mango: '/images/crops/mango.webp',
  banana: '/images/crops/banana.webp',
  papaya: '/images/crops/papaya.webp',
  guava: '/images/crops/guava.webp',
  pomegranate: '/images/crops/pomegranate.webp',
  grapes: '/images/crops/grapes.webp',
  'sweet-orange': '/images/crops/sweet-orange.webp',
  sweet_orange: '/images/crops/sweet-orange.webp',
  orange: '/images/crops/sweet-orange.webp',
  mandarin: '/images/crops/sweet-orange.webp',
  lemon: '/images/crops/sweet-orange.webp',
  lime: '/images/crops/sweet-orange.webp',
  apple: '/images/crops/apple.webp',
  pear: '/images/crops/apple.webp',
  peach: '/images/crops/apple.webp',
  plum: '/images/crops/apple.webp',
  apricot: '/images/crops/apple.webp',
  pineapple: '/images/crops/pineapple.webp',
  watermelon: '/images/crops/watermelon.webp',
  muskmelon: '/images/crops/watermelon.webp',
  jackfruit: '/images/crops/jackfruit.webp',
  sapota: '/images/crops/sapota.webp',
  'custard-apple': '/images/crops/custard-apple.webp',
  custard_apple: '/images/crops/custard-apple.webp',
  amla: '/images/crops/amla.webp',
  ber: '/images/crops/amla.webp',
  litchi: '/images/crops/litchi.webp',
  'dragon-fruit': '/images/crops/dragon-fruit.webp',
  dragon_fruit: '/images/crops/dragon-fruit.webp',
  strawberry: '/images/crops/litchi.webp',
  kiwi: '/images/crops/sapota.webp',
  avocado: '/images/crops/guava.webp',
  fig: '/images/crops/guava.webp',
  coconut: '/images/crops/arecanut.webp',
  arecanut: '/images/crops/arecanut.webp',

  // Spices
  chilli: '/images/crops/chilli.webp',
  black_pepper: '/images/crops/cardamom.webp',
  cardamom: '/images/crops/cardamom.webp',
  turmeric: '/images/crops/turmeric.webp',
  coriander: '/images/crops/coriander.webp',
  cumin: '/images/crops/cumin.webp',
  fennel: '/images/crops/cumin.webp',
  fenugreek: '/images/crops/spinach.webp',
  clove: '/images/crops/cardamom.webp',
  cinnamon: '/images/crops/cardamom.webp',
  nutmeg: '/images/crops/cardamom.webp',
  mace: '/images/crops/cardamom.webp',
  ajwain: '/images/crops/cumin.webp',
  tamarind: '/images/crops/jackfruit.webp',
  saffron: '/images/crops/marigold.webp',
  vanilla: '/images/crops/cardamom.webp',

  // Plantation
  tea: '/images/crops/tea.webp',
  coffee: '/images/crops/coffee.webp',
  cashew: '/images/crops/cashew.webp',
  cocoa: '/images/crops/coffee.webp',
  oil_palm: '/images/crops/arecanut.webp',
  betel_leaf: '/images/crops/cardamom.webp',

  // Flowers / Horticultural
  rose: '/images/crops/rose.webp',
  marigold: '/images/crops/marigold.webp',
  jasmine: '/images/crops/jasmine.webp',
  chrysanthemum: '/images/crops/marigold.webp',
  tuberose: '/images/crops/jasmine.webp',
  gerbera: '/images/crops/marigold.webp',
  gladiolus: '/images/crops/rose.webp',
  lotus: '/images/crops/rose.webp',

  // Medicinal & Aromatic
  ashwagandha: '/images/crops/ashwagandha.webp',
  'aloe-vera': '/images/crops/aloe-vera.webp',
  aloe_vera: '/images/crops/aloe-vera.webp',
  tulsi: '/images/crops/tulsi.webp',
  neem: '/images/crops/ashwagandha.webp',
  lemongrass: '/images/crops/lemongrass.webp',
  citronella: '/images/crops/lemongrass.webp',
  isabgol: '/images/crops/ashwagandha.webp',
  stevia: '/images/crops/tulsi.webp',
  senna: '/images/crops/ashwagandha.webp',
  safed_musli: '/images/crops/ashwagandha.webp',

  // Fodder
  'hybrid-napier': '/images/crops/hybrid-napier.webp',
  hybrid_napier: '/images/crops/hybrid-napier.webp',
  napier_grass: '/images/crops/hybrid-napier.webp',
  berseem: '/images/crops/berseem.webp',
  lucerne: '/images/crops/lucerne.webp',
  fodder_maize: '/images/crops/maize.webp',
  fodder_sorghum: '/images/crops/sorghum.webp',
  cowpea_fodder: '/images/crops/cowpea.webp',
}

// 3. Centralized Crop Normalization for Image Resolution
export function normalizeCropId(name: string | null | undefined): string {
  if (!name) return ''
  const clean = name.toLowerCase().trim()

  // Check direct alias mapping in cropCatalogMap
  for (const entry of Object.values(cropCatalogMap)) {
    if (entry.id === clean || entry.aliases.some((a) => a.toLowerCase() === clean)) {
      return entry.id
    }
  }

  // Key specific substrings
  if (clean.includes('turmeric') || clean.includes('haldi')) return 'turmeric'
  if (clean.includes('paddy') || clean.includes('rice') || clean.includes('dhan')) return 'rice'
  if (clean.includes('wheat') || clean.includes('gehu')) return 'wheat'
  if (clean.includes('maize') || clean.includes('corn') || clean.includes('makka')) return 'maize'
  if (clean.includes('sorghum') || clean.includes('jowar')) return 'sorghum'
  if (clean.includes('bajra') || clean.includes('pearl')) return 'pearl-millet'
  if (clean.includes('ragi') || clean.includes('finger')) return 'finger-millet'
  if (clean.includes('barley') || clean.includes('jau')) return 'barley'
  if (clean.includes('oat')) return 'oats'
  if (clean.includes('cotton') || clean.includes('kapas')) return 'cotton'
  if (clean.includes('jute') || clean.includes('patson')) return 'jute'
  if (clean.includes('sugarcane') || clean.includes('ganna')) return 'sugarcane'
  if (clean.includes('soybean') || clean.includes('soya')) return 'soybean'
  if (clean.includes('groundnut') || clean.includes('peanut')) return 'groundnut'
  if (clean.includes('mustard') || clean.includes('sarson')) return 'mustard'
  if (clean.includes('chickpea') || clean.includes('bengal gram') || clean.includes('chana')) return 'chickpea'
  if (clean.includes('pigeon pea') || clean.includes('toor') || clean.includes('tur') || clean.includes('arhar')) return 'pigeon-pea'
  if (clean.includes('lentil') || clean.includes('masoor')) return 'lentil'
  if (clean.includes('field pea')) return 'field-pea'
  if (clean.includes('pea') || clean.includes('matar')) return 'peas'
  if (clean.includes('tomato') || clean.includes('tamatar')) return 'tomato'
  if (clean.includes('potato') || clean.includes('aloo')) return 'potato'
  if (clean.includes('onion') || clean.includes('pyaz')) return 'onion'
  if (clean.includes('brinjal') || clean.includes('eggplant') || clean.includes('baingan')) return 'brinjal'
  if (clean.includes('okra') || clean.includes('lady finger') || clean.includes('bhindi')) return 'okra'
  if (clean.includes('chilli') || clean.includes('pepper') || clean.includes('mirchi')) return 'chilli'
  if (clean.includes('capsicum') || clean.includes('bell pepper')) return 'capsicum'
  if (clean.includes('cabbage')) return 'cabbage'
  if (clean.includes('cauliflower')) return 'cauliflower'
  if (clean.includes('carrot') || clean.includes('gajar')) return 'carrot'
  if (clean.includes('spinach') || clean.includes('palak')) return 'spinach'
  if (clean.includes('drumstick') || clean.includes('moringa')) return 'moringa'
  if (clean.includes('bitter gourd') || clean.includes('karela')) return 'bitter-gourd'
  if (clean.includes('tapioca') || clean.includes('cassava')) return 'cassava'
  if (clean.includes('colocasia') || clean.includes('arbi')) return 'colocasia'
  if (clean.includes('yam') || clean.includes('suran')) return 'elephant-foot-yam'
  if (clean.includes('ginger') || clean.includes('adrak')) return 'ginger'
  if (clean.includes('coriander') || clean.includes('dhaniya')) return 'coriander'
  if (clean.includes('mango') || clean.includes('aam')) return 'mango'
  if (clean.includes('banana') || clean.includes('kela')) return 'banana'
  if (clean.includes('tea')) return 'tea'
  if (clean.includes('coffee')) return 'coffee'
  if (clean.includes('dragon fruit') || clean.includes('pitaya')) return 'dragon-fruit'
  if (clean.includes('pineapple') || clean.includes('ananas')) return 'pineapple'
  if (clean.includes('arecanut') || clean.includes('betel nut')) return 'arecanut'
  if (clean.includes('cardamom') || clean.includes('elaichi')) return 'cardamom'
  if (clean.includes('cumin') || clean.includes('jeera')) return 'cumin'
  if (clean.includes('cashew') || clean.includes('kaju')) return 'cashew'
  if (clean.includes('marigold') || clean.includes('genda')) return 'marigold'
  if (clean.includes('rose') || clean.includes('gulab')) return 'rose'
  if (clean.includes('jasmine') || clean.includes('mogra')) return 'jasmine'
  if (clean.includes('ashwagandha')) return 'ashwagandha'
  if (clean.includes('aloe')) return 'aloe-vera'
  if (clean.includes('tulsi')) return 'tulsi'
  if (clean.includes('lemongrass')) return 'lemongrass'
  if (clean.includes('napier')) return 'hybrid-napier'
  if (clean.includes('berseem')) return 'berseem'
  if (clean.includes('lucerne') || clean.includes('alfalfa')) return 'lucerne'
  if (clean.includes('papaya')) return 'papaya'
  if (clean.includes('guava')) return 'guava'
  if (clean.includes('pomegranate') || clean.includes('anar')) return 'pomegranate'
  if (clean.includes('grape')) return 'grapes'
  if (clean.includes('orange') || clean.includes('mosambi')) return 'sweet-orange'
  if (clean.includes('apple')) return 'apple'
  if (clean.includes('sapota') || clean.includes('chikoo')) return 'sapota'
  if (clean.includes('amla') || clean.includes('gooseberry')) return 'amla'
  if (clean.includes('custard apple') || clean.includes('sitaphal')) return 'custard-apple'
  if (clean.includes('watermelon') || clean.includes('tarbooz')) return 'watermelon'
  if (clean.includes('jackfruit') || clean.includes('kathal')) return 'jackfruit'
  if (clean.includes('litchi') || clean.includes('lychee')) return 'litchi'
  if (clean.includes('sunflower')) return 'sunflower'
  if (clean.includes('sesame') || clean.includes('til')) return 'sesame'
  if (clean.includes('castor')) return 'castor'
  if (clean.includes('safflower') || clean.includes('kardi')) return 'safflower'
  if (clean.includes('linseed') || clean.includes('flax')) return 'linseed'
  if (clean.includes('tobacco')) return 'tobacco'
  if (clean.includes('garlic') || clean.includes('lahsun')) return 'garlic'
  if (clean.includes('foxtail')) return 'foxtail-millet'
  if (clean.includes('little millet')) return 'little-millet'
  if (clean.includes('kodo')) return 'kodo-millet'
  if (clean.includes('barnyard')) return 'barnyard-millet'
  if (clean.includes('proso')) return 'proso-millet'
  if (clean.includes('browntop')) return 'browntop-millet'
  if (clean.includes('amaranth') || clean.includes('rajgira')) return 'amaranth'
  if (clean.includes('cowpea') || clean.includes('lobia')) return 'cowpea'
  if (clean.includes('moth') || clean.includes('matki')) return 'moth-bean'
  if (clean.includes('rajma') || clean.includes('kidney bean')) return 'kidney-bean'
  if (clean.includes('rubber')) return 'natural-rubber'

  return clean.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/**
 * 4. Master Image Lookup Function
 * Returns the exact real crop photograph URL, or null if genuinely unavailable.
 * Never returns a wrong-crop fallback.
 */
export function getCropImage(nameOrId: string | null | undefined): string | null {
  if (!nameOrId) return null
  const raw = nameOrId.trim()
  if (!raw) return null

  // 1. Direct check in cropImages
  if (cropImages[raw]) return cropImages[raw]
  const lower = raw.toLowerCase()
  if (cropImages[lower]) return cropImages[lower]

  // 2. Normalized canonical lookup
  const canonicalId = normalizeCropId(raw)
  if (canonicalId && cropImages[canonicalId]) return cropImages[canonicalId]
  if (canonicalId && cropCatalogMap[canonicalId]) return cropCatalogMap[canonicalId].image

  // 3. Try with snake_case and kebab-case variants
  const snake = canonicalId.replace(/-/g, '_')
  if (cropImages[snake]) return cropImages[snake]
  const kebab = canonicalId.replace(/_/g, '-')
  if (cropImages[kebab]) return cropImages[kebab]

  return null
}
