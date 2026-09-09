export interface User {
  id: number
  email: string
  name: string
  phone?: string | null
  location?: string | null
  created_at?: string
}

export interface Field {
  id: number
  farm_id: number
  name: string
  area?: number | null
  crop_type?: string | null
  current_stage?: string | null
  created_at?: string
}

export interface Farm {
  id: number
  user_id: number
  name: string
  location?: string | null
  state?: string | null
  district?: string | null
  mandal?: string | null
  village?: string | null
  // latitude and longitude are stored internally and NEVER displayed in UI
  latitude?: number | null
  longitude?: number | null
  total_area?: number | null
  area_unit?: string | null
  soil_type?: string | null
  irrigation_type?: string | null
  description?: string | null
  created_at?: string
  fields?: Field[]
}

export interface NutrientStatus {
  name: string
  value: number
  status: 'optimal' | 'low' | 'high' | 'deficient' | 'excess'
  unit?: string
  optimal_range?: [number, number]
}

export interface FarmSoilData {
  farmId: number
  farmName?: string
  state?: string
  district?: string
  mandal?: string | null
  village?: string | null
  // Village-level fields (AP 105k dataset)
  ph?: number | null
  ec?: number | null
  organicCarbon?: number | string | null
  nitrogen?: number | null
  phosphorus?: number | null
  potassium?: number | null
  sulfur?: number | null
  zinc?: number | null
  iron?: number | null
  copper?: number | null
  manganese?: number | null
  boron?: number | null
  soilType?: string | null
  croppingSeason?: string | null
  fertilityIndex?: string | null
  advisory?: string | null
  dataSource?: string
  matchLevel?: number
  recordCount?: number
  found: boolean
  message?: string
  healthScore?: number
  grade?: string
  nutrients?: NutrientStatus[]
  recommendations?: string[]
  explanation?: string
}

export interface WeatherCurrent {
  temperature: number
  humidity: number
  wind_speed: number
  rainfall: number
  condition: string
  source?: string
  demo_mode?: boolean
  recorded_at?: string
}

export interface DayForecast {
  date: string
  temp_min: number
  temp_max: number
  humidity: number
  rainfall_probability: number
  condition: string
}

export interface WeatherForecastResponse {
  forecast: DayForecast[]
  source?: string
  demo_mode?: boolean
}

export interface CropRecommendation {
  crop: string
  score: number
  confidence?: number
  reason: string
  expected_yield?: number
  production?: number
  revenue?: number
  risk?: number
  water_requirement?: string
  growth_duration_days?: number
}

export interface CropRecommendationResponse {
  recommendations: CropRecommendation[]
  input_features?: Record<string, number>
  feature_importance?: Array<{ label: string; importance: number }>
  demo_mode?: boolean
  message?: string
}

export interface YieldPredictionResponse {
  crop: string
  predicted_yield: number
  expected_production: number
  unit: string
  confidence: number
  area: number
  state?: string
  district?: string
  feature_importance?: Array<{ label: string; importance: number }>
  demo_mode?: boolean
}

export interface IrrigationResponse {
  recommendation: string
  amount_mm: number
  reason: string
  demo_mode: boolean
  soil_moisture?: number
}

export interface DiseaseDetectionResponse {
  prediction: string
  confidence: number
  probabilities: Record<string, number>
  is_healthy: boolean
  low_confidence: boolean
  message?: string | null
  demo_mode: boolean
  image_processed: string
}

export interface FertilizerResponse {
  crop: string
  recommended: Record<string, number>
  guidance: string
  disclaimer?: string
  demo_mode: boolean
}

export interface RiskAssessmentResponse {
  overall_risk: number
  level: string
  breakdown: Record<string, number>
  top_risks: string[]
  recommendations: string[]
  demo_mode: boolean
}

export interface MarketPriceItem {
  crop: string
  market: string
  price_per_tonne: number
  currency: string
  source: string
  trend?: string
  modal_price_rs_qtl?: number
  min_price_rs_qtl?: number
  max_price_rs_qtl?: number
  arrival_quantity_qtl?: number
  district?: string
  mandal?: string
  village?: string
  price_trend?: string
  trading_channel?: string
  variety?: string
  msp_diff_pct?: number
}

export interface MarketPricesResponse {
  prices: MarketPriceItem[]
  as_of: string
  demo_mode: boolean
}

export interface ResolvedLocation {
  state: string | null
  district: string | null
  mandal?: string | null
  village?: string | null
  source: string
  lat?: number
  lon?: number
  farm_id?: number
  farm_name?: string
  message?: string
}
