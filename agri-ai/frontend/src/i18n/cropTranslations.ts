import { type Language } from './LanguageContext'
import { normalizeCropId } from '@/data/cropImages'

export interface CropNameTranslation {
  en: string
  te: string
  hi: string
}

export const CROP_TRANSLATIONS: Record<string, CropNameTranslation> = {
  // Cereals & Millets
  rice: {
    en: 'Paddy / Rice',
    te: 'వరి / బియ్యం',
    hi: 'धान / चावल',
  },
  wheat: {
    en: 'Wheat',
    te: 'గోధుమ',
    hi: 'गेहूं',
  },
  maize: {
    en: 'Maize / Corn',
    te: 'మొక్కజొన్న',
    hi: 'मक्का',
  },
  sorghum: {
    en: 'Sorghum / Jowar',
    te: 'జొన్న',
    hi: 'ज्वार',
  },
  'pearl-millet': {
    en: 'Bajra / Pearl Millet',
    te: 'సజ్జలు',
    hi: 'बाजरा',
  },
  'finger-millet': {
    en: 'Ragi / Finger Millet',
    te: 'రాగులు',
    hi: 'रागी',
  },
  barley: {
    en: 'Barley / Jau',
    te: 'బార్లీ / యవలు',
    hi: 'जौ',
  },
  oats: {
    en: 'Oats',
    te: 'ఓట్స్',
    hi: 'जई',
  },
  'foxtail-millet': {
    en: 'Foxtail Millet / Kangni',
    te: 'కొర్రలు',
    hi: 'कंगनी',
  },
  'little-millet': {
    en: 'Little Millet / Kutki',
    te: 'సామలు',
    hi: 'कुटकी',
  },
  'kodo-millet': {
    en: 'Kodo Millet / Kodra',
    te: 'అరికెలు',
    hi: 'कोदो',
  },
  'barnyard-millet': {
    en: 'Barnyard Millet / Sanwa',
    te: 'ఊదలు',
    hi: 'सांवा',
  },
  'proso-millet': {
    en: 'Proso Millet / Chena',
    te: 'వరిగెలు',
    hi: 'चीना',
  },
  'browntop-millet': {
    en: 'Browntop Millet / Korale',
    te: 'అండుకొర్రలు',
    hi: 'ब्राउनटॉप बाजरा',
  },
  amaranth: {
    en: 'Amaranth / Rajgira',
    te: 'తోటకూర గింజలు / రాజ్గిరా',
    hi: 'राजगिरा',
  },

  // Pulses
  chickpea: {
    en: 'Chickpea / Bengal Gram',
    te: 'శనగలు',
    hi: 'चना',
  },
  'pigeon-pea': {
    en: 'Pigeon Pea / Toor Dal',
    te: 'కందులు',
    hi: 'अरहर / तूर दाल',
  },
  lentil: {
    en: 'Lentil / Masoor',
    te: 'ఎర్ర కందులు / మసూర్',
    hi: 'मसूर दाल',
  },
  peas: {
    en: 'Peas / Green Pea',
    te: 'బఠానీలు',
    hi: 'हरी मटर',
  },
  'field-pea': {
    en: 'Field Pea / Dry Matar',
    te: 'ఎండిన బఠానీ',
    hi: 'सूखा मटर',
  },
  cowpea: {
    en: 'Cowpea / Lobia',
    te: 'అలసందలు',
    hi: 'लोबिया',
  },
  'moth-bean': {
    en: 'Moth Bean / Matki',
    te: 'బొబ్బర్లు / మట్కీ',
    hi: 'मोठ दाल',
  },
  'kidney-bean': {
    en: 'Kidney Bean / Rajma',
    te: 'రాజ్మా',
    hi: 'राजमा',
  },
  green_gram: {
    en: 'Green Gram / Moong',
    te: 'పెసలు',
    hi: 'मूंग दाल',
  },
  black_gram: {
    en: 'Black Gram / Urad',
    te: 'మినుములు',
    hi: 'उड़द दाल',
  },
  pulses: {
    en: 'Pulses',
    te: 'పప్పుధాన్యాలు',
    hi: 'दालें',
  },

  // Oilseeds
  soybean: {
    en: 'Soybean',
    te: 'సోయాబీన్',
    hi: 'सोयाबीन',
  },
  groundnut: {
    en: 'Groundnut / Peanut',
    te: 'వేరుశనగ',
    hi: 'मूंगफली',
  },
  mustard: {
    en: 'Mustard',
    te: 'ఆవాలు',
    hi: 'सरसों',
  },
  sunflower: {
    en: 'Sunflower',
    te: 'పొద్దుతిరుగుడు',
    hi: 'सूरजमुखी',
  },
  sesame: {
    en: 'Sesame / Til',
    te: 'నువ్వులు',
    hi: 'तिल',
  },
  castor: {
    en: 'Castor',
    te: 'ఆముదం',
    hi: 'अरंडी',
  },
  safflower: {
    en: 'Safflower / Kardi',
    te: 'కుసుమలు',
    hi: 'कुसुम',
  },
  linseed: {
    en: 'Linseed / Flax',
    te: 'అవిసె గింజలు',
    hi: 'अलसी',
  },

  // Fiber & Commercial
  cotton: {
    en: 'Cotton',
    te: 'పత్తి',
    hi: 'कपास',
  },
  jute: {
    en: 'Jute',
    te: 'జనపనార',
    hi: 'जूट / पटसन',
  },
  sugarcane: {
    en: 'Sugarcane',
    te: 'చెరకు',
    hi: 'गन्ना',
  },
  tobacco: {
    en: 'Tobacco',
    te: 'పొగాకు',
    hi: 'तंबाकू',
  },
  'natural-rubber': {
    en: 'Natural Rubber',
    te: 'సహజ రబ్బరు',
    hi: 'प्राकृतिक रबर',
  },

  // Vegetables
  tomato: {
    en: 'Tomato',
    te: 'టమోటా',
    hi: 'टमाटर',
  },
  potato: {
    en: 'Potato',
    te: 'బంగాళాదుంప',
    hi: 'आलू',
  },
  onion: {
    en: 'Onion',
    te: 'ఉల్లిపాయ',
    hi: 'प्याज',
  },
  brinjal: {
    en: 'Brinjal / Eggplant',
    te: 'వంకాయ',
    hi: 'बैंगन',
  },
  okra: {
    en: 'Okra / Lady Finger',
    te: 'బెండకాయ',
    hi: 'भिंडी',
  },
  chilli: {
    en: 'Chilli / Red Pepper',
    te: 'మిరపకాయ',
    hi: 'लाल मिर्च',
  },
  turmeric: {
    en: 'Turmeric / Haldi',
    te: 'పసుపు',
    hi: 'हल्दी',
  },
  capsicum: {
    en: 'Capsicum / Bell Pepper',
    te: 'క్యాప్సికం / బెల్ పెప్పర్',
    hi: 'शिमला मिर्च',
  },
  cabbage: {
    en: 'Cabbage',
    te: 'క్యాబేజీ',
    hi: 'पत्तागोभी',
  },
  cauliflower: {
    en: 'Cauliflower',
    te: 'కాలీఫ్లవర్',
    hi: 'फूलगोभी',
  },
  carrot: {
    en: 'Carrot',
    te: 'క్యారెట్',
    hi: 'गाजर',
  },
  spinach: {
    en: 'Spinach / Palak',
    te: 'పాలకూర',
    hi: 'पालक',
  },
  moringa: {
    en: 'Drumstick / Moringa',
    te: 'మునగకాయ',
    hi: 'सहजन / ड्रमस्टिक',
  },
  'bitter-gourd': {
    en: 'Bitter Gourd / Karela',
    te: 'కాకరకాయ',
    hi: 'करेला',
  },
  cassava: {
    en: 'Tapioca / Cassava',
    te: 'కర్రపెండలం',
    hi: 'कसावा / टैपिओका',
  },
  colocasia: {
    en: 'Colocasia / Arbi',
    te: 'చేమదుంప',
    hi: 'अरबी',
  },
  'elephant-foot-yam': {
    en: 'Elephant Foot Yam / Suran',
    te: 'కందగడ్డ',
    hi: 'जिमीकंद / सूरन',
  },
  garlic: {
    en: 'Garlic / Lahsun',
    te: 'వెల్లుల్లి',
    hi: 'लहसुन',
  },
  ginger: {
    en: 'Ginger / Adrak',
    te: 'అల్లం',
    hi: 'अदरक',
  },
  coriander: {
    en: 'Coriander / Dhaniya',
    te: 'కొత్తిమీర',
    hi: 'धनिया',
  },

  // Fruits
  mango: {
    en: 'Mango',
    te: 'మామిడి',
    hi: 'आम',
  },
  banana: {
    en: 'Banana',
    te: 'అరటి',
    hi: 'केला',
  },
  papaya: {
    en: 'Papaya',
    te: 'బొప్పాయి',
    hi: 'पपीता',
  },
  guava: {
    en: 'Guava',
    te: 'జామకాయ',
    hi: 'अमरूद',
  },
  pomegranate: {
    en: 'Pomegranate',
    te: 'దానిమ్మ',
    hi: 'अनार',
  },
  grapes: {
    en: 'Grapes',
    te: 'ద్రాక్ష',
    hi: 'अंगूर',
  },
  'sweet-orange': {
    en: 'Sweet Orange / Mosambi',
    te: 'బత్తాయి',
    hi: 'मौसमी / संतरा',
  },
  apple: {
    en: 'Apple',
    te: 'యాపిల్',
    hi: 'सेब',
  },
  sapota: {
    en: 'Sapota / Chikoo',
    te: 'సపోటా',
    hi: 'चीकू',
  },
  amla: {
    en: 'Amla / Indian Gooseberry',
    te: 'ఉసిరి',
    hi: 'आंवला',
  },
  'custard-apple': {
    en: 'Custard Apple / Sitaphal',
    te: 'సీతాఫలం',
    hi: 'सीताफल / शरीफा',
  },
  watermelon: {
    en: 'Watermelon',
    te: 'పుచ్చకాయ',
    hi: 'तरबूज',
  },
  jackfruit: {
    en: 'Jackfruit',
    te: 'పనసపండు',
    hi: 'कटहल',
  },
  litchi: {
    en: 'Litchi',
    te: 'లిచీ',
    hi: 'लीची',
  },
  'dragon-fruit': {
    en: 'Dragon Fruit / Pitaya',
    te: 'డ్రాగన్ ఫ్రూట్',
    hi: 'ड्रैगन फ्रूट',
  },
  pineapple: {
    en: 'Pineapple',
    te: 'అనాస పండు',
    hi: 'अनानास',
  },

  // Plantation & Spices
  tea: {
    en: 'Tea',
    te: 'తేయాకు',
    hi: 'चाय',
  },
  coffee: {
    en: 'Coffee',
    te: 'కాఫీ',
    hi: 'कॉफी',
  },
  arecanut: {
    en: 'Arecanut / Betel Nut',
    te: 'పోకచెక్క / వక్క',
    hi: 'सुपारी',
  },
  cardamom: {
    en: 'Cardamom',
    te: 'యాలకులు',
    hi: 'इलायची',
  },
  cumin: {
    en: 'Cumin / Jeera',
    te: 'జీలకర్ర',
    hi: 'जीरा',
  },
  cashew: {
    en: 'Cashew',
    te: 'జీడిపప్పు',
    hi: 'काजू',
  },
  coconut: {
    en: 'Coconut',
    te: 'కొబ్బరి',
    hi: 'नारियल',
  },

  // Flowers
  marigold: {
    en: 'Marigold',
    te: 'బంతి పువ్వు',
    hi: 'गेंदा',
  },
  rose: {
    en: 'Rose',
    te: 'గులాబీ',
    hi: 'गुलाब',
  },
  jasmine: {
    en: 'Jasmine / Mogra',
    te: 'మల్లెపూవు',
    hi: 'चमेली / मोगरा',
  },

  // Medicinal & Aromatic
  ashwagandha: {
    en: 'Ashwagandha',
    te: 'అశ్వగంధ',
    hi: 'अश्वगंधा',
  },
  'aloe-vera': {
    en: 'Aloe Vera',
    te: 'కలబంద',
    hi: 'एलोवेरा',
  },
  tulsi: {
    en: 'Tulsi / Holy Basil',
    te: 'తులసి',
    hi: 'तुलसी',
  },
  lemongrass: {
    en: 'Lemongrass',
    te: 'నిమ్మగడ్డి',
    hi: 'लेमनग्रास',
  },

  // Fodder
  'hybrid-napier': {
    en: 'Hybrid Napier Grass',
    te: 'హైబ్రిడ్ నేపియర్ గడ్డి',
    hi: 'हाइब्रिड नेपियर घास',
  },
  berseem: {
    en: 'Berseem / Egyptian Clover',
    te: 'బర్సీమ్ మేత',
    hi: 'बरसीम',
  },
  lucerne: {
    en: 'Lucerne / Alfalfa',
    te: 'లూసర్న్ మేత',
    hi: 'ल्यूसर्न / रिजका',
  },
}

/**
 * Returns translated crop display name according to the selected language.
 * Internal IDs and values remain unchanged.
 */
export function getCropDisplayName(
  nameOrId: string | null | undefined,
  lang: Language = 'en'
): string {
  if (!nameOrId) return ''
  const trimmed = nameOrId.trim()
  if (!trimmed) return ''

  // Look up directly or normalize
  const canonical = normalizeCropId(trimmed)
  const snake = canonical.replace(/-/g, '_')
  const kebab = canonical.replace(/_/g, '-')

  const match =
    CROP_TRANSLATIONS[canonical] ||
    CROP_TRANSLATIONS[kebab] ||
    CROP_TRANSLATIONS[snake]

  if (match) {
    if (lang === 'te' && match.te) return match.te
    if (lang === 'hi' && match.hi) return match.hi
    return match.en
  }

  return trimmed
}
