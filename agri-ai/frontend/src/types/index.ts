// Shared TypeScript types mirroring backend Pydantic schemas

export interface User {
  id: number
  name: string
  fullName?: string
  email: string
  phone?: string | null
  location?: string | null
  language_preference: string
  is_active: boolean
  status?: string
  created_at?: string | null
}

export interface Field {
  id: number
  farm_id: number
  name: string
  area?: number | null
  crop_type?: string | null
  current_stage?: string | null
  latitude?: number | null
  longitude?: number | null
  created_at?: string | null
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
  latitude?: number | null
  longitude?: number | null
  total_area?: number | null
  area_unit: string
  soil_type?: string | null
  irrigation_type?: string | null
  description?: string | null
  created_at?: string | null
  fields: Field[]
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// ---- Phase 3: Soil ----
export interface SoilAnalysisInput {
  farm_id: number
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  organic_carbon: number
  moisture: number
  texture?: string
}

export interface NutrientStatus {
  nutrient: string
  value: number
  status: 'Low' | 'Optimal' | 'High'
  explanation: string
}

export interface SoilAnalysisResult {
  id: number
  health_score: number
  grade: string
  nutrients: NutrientStatus[]
  recommendations: string[]
  explanation: string
}

// ---- Phase 4: Crop recommendation ----
export interface CropRecommendationInput {
  farm_id: number
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}

export interface CropOption {
  crop: string
  score: number
  reason: string
  expected_yield: number
  production: number
  revenue: number
  risk: number
}

export interface CropRecommendationResult {
  recommendations: CropOption[]
  input_features: Record<string, number>
  feature_importance: { label: string; importance: number }[]
  demo_mode: boolean
}

// ---- Yield prediction ----
export interface YieldPredictionInput {
  farm_id: number
  crop: string
  area: number
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
}

export interface YieldPredictionResult {
  predicted_yield: number
  unit: string
  confidence: number
  area: number
  crop: string
  feature_importance: { label: string; importance: number }[]
  demo_mode: boolean
  is_model_supported?: boolean
  unsupported_message?: string
}

export interface DashboardOverview {
  status: string
  farm_count: number
  demographics?: {
    total_farms: number
    total_area: number
    total_fields: number
  }
}

export interface MarketPriceItem {
  crop: string
  market: string
  price_per_tonne: number
  currency: string
  source: string
  demo_mode: boolean
  date: string
  modal_price_rs_qtl?: number
  min_price_rs_qtl?: number
  max_price_rs_qtl?: number
  arrival_quantity_qtl?: number
  unit_of_price?: string
  variety?: string
  grade?: string
  district?: string
  mandal?: string
  village?: string
  region?: string
  market_type?: string
  commodity_group?: string
  price_trend?: string
  trading_channel?: string
  reporting_date?: string
  msp_benchmark?: number
  msp_diff_pct?: number
}

export interface MarketPricesResponse {
  prices: MarketPriceItem[]
  as_of: string
  demo_mode: boolean
  total?: number
  page?: number
  limit?: number
  total_pages?: number
}

export interface MarketSummaryData {
  total_records: number
  total_arrivals_qtl: number
  avg_modal_price_rs_qtl: number
  avg_price_per_tonne: number
  distinct_commodities: number
  distinct_districts: number
  distinct_markets: number
  date_range: { start: string; end: string }
  trends: {
    bullish: number
    stable: number
    bearish: number
    bullish_pct: number
    stable_pct: number
    bearish_pct: number
  }
  trading_channels: Record<string, number>
  market_types: Record<string, number>
  top_commodities: {
    commodity: string
    commodity_group: string
    total_arrivals_qtl: number
    avg_price_rs_qtl: number
    record_count: number
  }[]
  top_mandis: {
    market_name: string
    district: string
    market_type: string
    record_count: number
    total_arrivals_qtl: number
    avg_price_rs_qtl: number
  }[]
  msp_metrics: {
    applicable_crops: number
    crops_at_or_above_msp: number
    compliance_pct: number
  }
  is_district_filtered?: boolean
  filtered_district?: string | null
}

export interface MarketLocationResolution {
  district: string
  matched_district: string
  state: string
  lat: number
  lon: number
  distance_km?: number
  source: string
  is_exact_ap: boolean
  message: string
}

export interface DistrictSummaryItem {
  district: string
  commodity_name: string
  record_count: number
  total_arrivals_qtl: number
  avg_modal_price_rs_qtl: number
  min_trade_price: number
  max_trade_price: number
}

export interface MSPBenchmarkItem {
  commodity_name: string
  commodity_group: string
  msp_price_rs_qtl: number
  support_mechanism: string
  standard_unit: string
  avg_market_price_rs_qtl?: number
  min_market_price_rs_qtl?: number
  max_market_price_rs_qtl?: number
  diff_pct?: number
  status: string
}

export interface MarketDistrictInfo {
  district: string
  region?: string
  record_count: number
  market_count: number
  commodity_count: number
  total_arrivals_qtl: number
}

export interface MarketCommodityInfo {
  commodity_name: string
  commodity_group: string
  record_count: number
  avg_modal_price_rs_qtl: number
  min_price_rs_qtl: number
  max_price_rs_qtl: number
  total_arrivals_qtl: number
}
