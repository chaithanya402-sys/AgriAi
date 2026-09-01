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
