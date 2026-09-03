import request from './api'
import type { NutrientStatus } from '@/types'

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
}

// ---- Risk ----
export const riskApi = {
  assess: (data: Record<string, unknown>) => request('/risk/assess', { method: 'POST', body: data }),
}

// ---- Market ----
export const marketApi = {
  prices: (crop?: string) => request(crop ? `/market/prices?crop=${crop}` : '/market/prices'),
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
