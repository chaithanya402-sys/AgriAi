import { request } from './api'
import type {
  FarmSoilData,
  WeatherCurrent,
  WeatherForecastResponse,
  CropRecommendationResponse,
  YieldPredictionResponse,
  IrrigationResponse,
  DiseaseDetectionResponse,
  FertilizerResponse,
  RiskAssessmentResponse,
  MarketPricesResponse,
  ResolvedLocation,
} from '../types'

export const agriculturalService = {
  // Soil
  getFarmSoil: (farmId: number): Promise<FarmSoilData> => {
    return request<FarmSoilData>(`/soil/farm/${farmId}`)
  },

  analyzeSoil: (data: {
    farm_id: number
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
    organic_carbon: number
    moisture: number
  }) => {
    return request('/soil/analyze', { method: 'POST', body: data })
  },

  listDistricts: (): Promise<{ districts: string[] }> => {
    return request<{ districts: string[] }>('/soil/districts')
  },

  listMandals: (district: string): Promise<{ mandals: string[] }> => {
    return request<{ mandals: string[] }>(
      `/soil/mandals?district=${encodeURIComponent(district)}`
    )
  },

  listVillages: (district: string, mandal: string): Promise<{ villages: string[] }> => {
    return request<{ villages: string[] }>(
      `/soil/villages?district=${encodeURIComponent(district)}&mandal=${encodeURIComponent(mandal)}`
    )
  },

  // Weather (receives lat & lon internally; NEVER displayed in UI)
  getCurrentWeather: (lat: number, lon: number): Promise<WeatherCurrent> => {
    return request<WeatherCurrent>(`/weather/current?lat=${lat}&lon=${lon}`)
  },

  getWeatherForecast: (lat: number, lon: number): Promise<WeatherForecastResponse> => {
    return request<WeatherForecastResponse>(`/weather/forecast?lat=${lat}&lon=${lon}`)
  },

  // Location Resolution
  resolveLocation: (
    coords?: { lat: number; lon: number } | null,
    farmId?: number | null
  ): Promise<ResolvedLocation> => {
    const params: string[] = []
    if (coords && coords.lat && coords.lon) {
      params.push(`lat=${coords.lat}&lon=${coords.lon}`)
    }
    if (farmId) {
      params.push(`farm_id=${farmId}`)
    }
    const qs = params.length > 0 ? `?${params.join('&')}` : ''
    return request<ResolvedLocation>(`/data/location/resolve${qs}`)
  },

  // Crop Recommendation
  recommendCrops: (data: {
    farm_id: number
    nitrogen: number
    phosphorus: number
    potassium: number
    temperature: number
    humidity: number
    ph: number
    rainfall: number
    area?: number
    state?: string | null
    district?: string | null
  }): Promise<CropRecommendationResponse> => {
    return request<CropRecommendationResponse>('/crop/recommend', {
      method: 'POST',
      body: data,
    })
  },

  // Yield Prediction
  predictYield: (data: {
    farm_id: number
    crop: string
    area: number
    season?: string
    nitrogen: number
    phosphorus: number
    potassium: number
    temperature: number
    humidity: number
    ph: number
    rainfall: number
    state?: string | null
    district?: string | null
  }): Promise<YieldPredictionResponse> => {
    return request<YieldPredictionResponse>('/predict/yield', {
      method: 'POST',
      body: data,
    })
  },

  // Irrigation Advisory
  recommendIrrigation: (data: {
    farm_id: number
    soil_moisture: number
    crop: string
    temperature?: number
    forecast_rainfall_mm?: number
  }): Promise<IrrigationResponse> => {
    return request<IrrigationResponse>('/irrigation/recommend', {
      method: 'POST',
      body: data,
    })
  },

  // Disease Detection
  predictDisease: (formData: FormData): Promise<DiseaseDetectionResponse> => {
    return request<DiseaseDetectionResponse>('/disease/predict', {
      method: 'POST',
      body: formData,
    })
  },

  // Fertilizer Recommendation
  recommendFertilizer: (data: {
    farm_id: number
    crop: string
    nitrogen: number
    phosphorus: number
    potassium: number
    soil_ph: number
  }): Promise<FertilizerResponse> => {
    return request<FertilizerResponse>('/fertilizer/recommend', {
      method: 'POST',
      body: data,
    })
  },

  // Risk Assessment
  assessRisk: (data: {
    farm_id: number
    crop?: string
    weather_risk?: number
    soil_health_score?: number
    water_availability?: number
    disease_risk?: number
    price_volatility?: number
  }): Promise<RiskAssessmentResponse> => {
    return request<RiskAssessmentResponse>('/risk/assess', {
      method: 'POST',
      body: data,
    })
  },

  // Market Prices
  getMarketPrices: (crop?: string): Promise<MarketPricesResponse> => {
    const qs = crop ? `?crop=${encodeURIComponent(crop)}` : ''
    return request<MarketPricesResponse>(`/market/prices${qs}`)
  },

  // Reports
  generateReport: (farmId: number): Promise<any> => {
    return request(`/reports/farm/${farmId}`, { method: 'POST' })
  },
}
