import request from './api'
import type {
  NutrientStatus,
  MarketPricesResponse,
  MarketSummaryData,
  DistrictSummaryItem,
  MSPBenchmarkItem,
  MarketDistrictInfo,
  MarketCommodityInfo,
  MarketLocationResolution,
} from '@/types'

export interface FarmSoilData {
  farmId: number
  farmName?: string
  state?: string
  district?: string
  mandal?: string | null
  village?: string | null
  // village-level fields (AP 105k dataset)
  ph?: number
  ec?: number
  organicCarbon?: number | string
  nitrogen?: number
  phosphorus?: number
  potassium?: number
  sulfur?: number
  zinc?: number
  iron?: number
  copper?: number
  manganese?: number
  boron?: number
  soilType?: string
  croppingSeason?: string
  fertilityIndex?: string
  advisory?: string
  dataSource?: string
  matchLevel?: number
  recordCount?: number
  // legacy fallback fields
  moisture?: number
  soilTypes?: string[]
  irrigationTypes?: string[]
  lastUpdated?: string
  source?: string
  found: boolean
  message?: string
  healthScore?: number
  grade?: string
  nutrients?: NutrientStatus[]
  recommendations?: string[]
  explanation?: string
}

// ---- Soil ----
export const soilApi = {
  analyze: (data: Record<string, unknown>) => request('/soil/analyze', { method: 'POST', body: data }),
  getFarmSoil: (farmId: number) => request<FarmSoilData>(`/soil/farm/${farmId}`),
  listDistricts: () => request<{ districts: string[] }>('/soil/districts'),
  listMandals: (district: string) =>
    request<{ mandals: string[] }>(`/soil/mandals?district=${encodeURIComponent(district)}`),
  listVillages: (district: string, mandal: string) =>
    request<{ villages: string[] }>(
      `/soil/villages?district=${encodeURIComponent(district)}&mandal=${encodeURIComponent(mandal)}`
    ),
}

// ---- Crop recommendation ----
export const cropApi = {
  recommend: (data: Record<string, unknown>) => request('/crop/recommend', { method: 'POST', body: data }),
}

// ---- Yield prediction ----
export const yieldApi = {
  predict: (data: Record<string, unknown>) => request('/predict/yield', { method: 'POST', body: data }),
}

// ---- Fertilizer ----
export const fertilizerApi = {
  recommend: (data: Record<string, unknown>) => request('/fertilizer/recommend', { method: 'POST', body: data }),
}

// ---- Irrigation ----
export const irrigationApi = {
  recommend: (data: Record<string, unknown>) => request('/irrigation/recommend', { method: 'POST', body: data }),
}

export interface ActionChecklistItem {
  id: number
  item_key?: string
  name: string
  spec?: string
  description?: string
  sort_order: number
  completed: boolean
}

export interface ActionPlanStepItem {
  id: number
  crop_name: string
  step_number: number
  title: string
  description?: string
  timeframe?: string
  stage?: string
  youtube_video_id: string
  youtube_title?: string
  youtube_duration?: string
  learn_points: string[]
  why_explanation?: string
  tutorial_watched: boolean
  tutorial_watched_at?: string
  status: 'pending' | 'in_progress' | 'completed'
  completed_at?: string
  checklists: ActionChecklistItem[]
}

export interface ActionPlanProgressData {
  farm_id: number
  crop_name: string
  completed_steps: number
  total_steps: number
  percent: number
  active_step: number
}

// ---- Farm Action Plan & YouTube Tutorials ----
export const actionPlanApi = {
  getSteps: (crop: string, farmId: number) =>
    request<ActionPlanStepItem[]>(`/action-plan/steps?crop=${encodeURIComponent(crop)}&farm_id=${farmId}`),
  recordTutorialWatched: (stepId: number, farmId: number, cropName: string) =>
    request(`/action-plan/steps/${stepId}/tutorial-progress`, {
      method: 'POST',
      body: { farm_id: farmId, crop_name: cropName },
    }),
  toggleChecklist: (stepId: number, itemId: number, farmId: number, cropName: string, completed: boolean) =>
    request(`/action-plan/steps/${stepId}/checklist/${itemId}`, {
      method: 'POST',
      body: { farm_id: farmId, crop_name: cropName, completed },
    }),
  completeStep: (stepId: number, farmId: number, cropName: string) =>
    request(`/action-plan/steps/${stepId}/complete`, {
      method: 'POST',
      body: { farm_id: farmId, crop_name: cropName },
    }),
  getProgress: (farmId: number, crop: string) =>
    request<ActionPlanProgressData>(`/action-plan/progress?farm_id=${farmId}&crop=${encodeURIComponent(crop)}`),
}

// ---- Weather ----
export const weatherApi = {
  current: (lat: number, lon: number) => request(`/weather/current?lat=${lat}&lon=${lon}`),
  forecast: (lat: number, lon: number) => request(`/weather/forecast?lat=${lat}&lon=${lon}`),
}

// ---- Disease ----
export const diseaseApi = {
  predict: (formData: FormData) =>
    request('/disease/predict', {
      method: 'POST',
      body: formData,
      headers: {},
    }),
  getLatest: (farmId: number) =>
    request<{
      found: boolean
      prediction?: string
      confidence?: number
      is_healthy?: boolean
      image_name?: string
      created_at?: string
      probabilities?: Record<string, number>
      message?: string
    }>(`/disease/latest/${farmId}`),
}

// ---- Risk ----
export const riskApi = {
  assess: (data: Record<string, unknown>) => request('/risk/assess', { method: 'POST', body: data }),
}

export interface MarketFilterParams {
  crop?: string
  district?: string
  commodity_group?: string
  market_type?: string
  price_trend?: string
  trading_channel?: string
  search?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// ---- Market ----
export const marketApi = {
  prices: (params?: MarketFilterParams | string) => {
    if (typeof params === 'string') {
      return request<MarketPricesResponse>(params && params !== 'all' ? `/market/prices?crop=${encodeURIComponent(params)}` : '/market/prices')
    }
    if (!params) {
      return request<MarketPricesResponse>('/market/prices')
    }
    const query = new URLSearchParams()
    if (params.crop && params.crop !== 'all') query.set('crop', params.crop)
    if (params.district && params.district !== 'all') query.set('district', params.district)
    if (params.commodity_group && params.commodity_group !== 'all') query.set('commodity_group', params.commodity_group)
    if (params.market_type && params.market_type !== 'all') query.set('market_type', params.market_type)
    if (params.price_trend && params.price_trend !== 'all') query.set('price_trend', params.price_trend)
    if (params.trading_channel && params.trading_channel !== 'all') query.set('trading_channel', params.trading_channel)
    if (params.search) query.set('search', params.search)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.sort_by) query.set('sort_by', params.sort_by)
    if (params.sort_order) query.set('sort_order', params.sort_order)
    const qs = query.toString()
    return request<MarketPricesResponse>(qs ? `/market/prices?${qs}` : '/market/prices')
  },
  summary: (district?: string) =>
    request<MarketSummaryData>(
      district && district !== 'all'
        ? `/market/summary?district=${encodeURIComponent(district)}`
        : '/market/summary'
    ),
  districts: () => request<MarketDistrictInfo[]>('/market/districts'),
  commodities: () => request<MarketCommodityInfo[]>('/market/commodities'),
  districtSummary: (params?: { district?: string; crop?: string; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.district && params.district !== 'all') query.set('district', params.district)
    if (params?.crop && params.crop !== 'all') query.set('crop', params.crop)
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return request<DistrictSummaryItem[]>(qs ? `/market/district-summary?${qs}` : '/market/district-summary')
  },
  msp: (district?: string) =>
    request<MSPBenchmarkItem[]>(
      district && district !== 'all'
        ? `/market/msp?district=${encodeURIComponent(district)}`
        : '/market/msp'
    ),
  resolveLocation: (lat: number, lon: number) =>
    request<MarketLocationResolution>(`/market/resolve-location?lat=${lat}&lon=${lon}`),
}

// ---- Profit ----
export const profitApi = {
  calculate: (data: Record<string, unknown>) => request('/profit/calculate', { method: 'POST', body: data }),
}

// ---- Optimization ----
export const optimizeApi = {
  plan: (data: Record<string, unknown>) => request('/optimize/plan', { method: 'POST', body: data }),
}

// ---- Assistant ----
export const assistantApi = {
  ask: (data: Record<string, unknown>) => request('/assistant/ask', { method: 'POST', body: data }),
}

// ---- Notifications ----
export const notificationApi = {
  list: () => request('/notifications'),
  markRead: (id: number) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  remove: (id: number) => request(`/notifications/${id}`, { method: 'DELETE' }),
}

// ---- Reports ----
export const reportApi = {
  generate: (farmId: number) => request(`/reports/farm/${farmId}`, { method: 'POST' }),
}
