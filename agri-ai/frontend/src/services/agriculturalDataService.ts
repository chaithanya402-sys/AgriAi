/**
 * Centralized Agricultural Data Service — Single source of truth for location-based data in frontend.
 * Provides caching in memory so duplicate requests are avoided.
 */
import request from './api'

export interface ResolvedLocation {
  state: string | null
  district: string | null
  source: 'live' | 'farm_coordinates' | 'farm_saved' | 'farm_location_match' | 'farm_district_match' | 'none'
  lat?: number
  lon?: number
  farm_id?: number
  farm_name?: string
  message?: string
}

export interface SoilDataResponse {
  found: boolean
  state: string
  district: string
  record_count: number
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  moisture: number
  organic_carbon: string
  soil_types: string[]
  irrigation_types: string[]
  message?: string
}

export interface CropDataResponse {
  found: boolean
  state: string
  district: string
  record_count: number
  crops: string[]
  nitrogen: number
  phosphorus: number
  potassium: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
  message?: string
}

export interface CropRecommendationsResponse {
  recommendations: Array<{
    crop: string
    score: number
    reason: string
    expected_yield: number
    production: number
    revenue: number
    risk: number
  }>
  input_features: Record<string, number>
  feature_importance: Array<{ label: string; importance: number }>
  demo_mode: boolean
  message?: string
}

export interface YieldDataResponse {
  found: boolean
  crop: string
  predicted_yield: number
  expected_production: number
  unit: string
  confidence: number
  area: number
  state: string
  district: string
  record_count: number
  feature_importance: Array<{ label: string; importance: number }>
  demo_mode: boolean
  message?: string
}

// In-memory cache to prevent repeated fetching of the same dataset
const _cache = new Map<string, any>()

export const agriculturalDataService = {
  /**
   * Resolve coordinates or farm fallback to State and District.
   * Farm ID is strictly respected so different farms never share or pollute location cache.
   */
  async resolveLocation(coords?: { lat: number; lon: number } | null, farmId?: number | null): Promise<ResolvedLocation> {
    const params = new URLSearchParams()
    if (coords && coords.lat && coords.lon) {
      params.append('lat', coords.lat.toString())
      params.append('lon', coords.lon.toString())
    }
    if (farmId) {
      params.append('farm_id', farmId.toString())
    }

    const query = params.toString()
    // Explicitly namespace by farmId so different farms never cross-pollute
    const cacheKey = farmId
      ? `loc:farm_${farmId}:${coords?.lat ?? ''},${coords?.lon ?? ''}`
      : `loc:live:${coords?.lat ?? ''},${coords?.lon ?? ''}`

    if (_cache.has(cacheKey)) {
      return _cache.get(cacheKey)
    }

    const res = await request<ResolvedLocation>(`/data/location/resolve?${query}`)
    _cache.set(cacheKey, res)
    return res
  },

  /**
   * Get aggregated soil metrics for State + District.
   */
  async getSoilData(state: string, district: string): Promise<SoilDataResponse> {
    const key = `soil:${state.toLowerCase()}:${district.toLowerCase()}`
    if (_cache.has(key)) {
      return _cache.get(key)
    }

    const res = await request<SoilDataResponse>(
      `/data/soil-data?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
    )
    _cache.set(key, res)
    return res
  },

  /**
   * Get aggregated climate & crop input data for State + District.
   */
  async getCropData(state: string, district: string): Promise<CropDataResponse> {
    const key = `crop:${state.toLowerCase()}:${district.toLowerCase()}`
    if (_cache.has(key)) {
      return _cache.get(key)
    }

    const res = await request<CropDataResponse>(
      `/data/crop-data?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
    )
    _cache.set(key, res)
    return res
  },

  /**
   * Get ranked crop recommendations for State + District from real dataset records.
   */
  async getCropRecommendations(
    state: string,
    district: string,
    area: number = 1.0
  ): Promise<CropRecommendationsResponse> {
    const key = `rec:${state.toLowerCase()}:${district.toLowerCase()}:${area}`
    if (_cache.has(key)) {
      return _cache.get(key)
    }

    const res = await request<CropRecommendationsResponse>(
      `/data/crop-recommendations?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&area=${area}`
    )
    _cache.set(key, res)
    return res
  },

  /**
   * Get historical yield prediction for State + District + Crop (+ Season).
   */
  async getYieldData(
    state: string,
    district: string,
    crop: string,
    area: number = 1.0,
    season?: string
  ): Promise<YieldDataResponse> {
    const key = `yield:${state.toLowerCase()}:${district.toLowerCase()}:${crop.toLowerCase()}:${area}:${season || ''}`
    if (_cache.has(key)) {
      return _cache.get(key)
    }

    let url = `/data/yield-data?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&crop=${encodeURIComponent(crop)}&area=${area}`
    if (season) {
      url += `&season=${encodeURIComponent(season)}`
    }

    const res = await request<YieldDataResponse>(url)
    _cache.set(key, res)
    return res
  },

  /**
   * Invalidate location cache for a specific farm (or generic location cache).
   * Called whenever the user switches farms to ensure Farm A's cached location is never reused for Farm B.
   */
  invalidateFarmCache(farmId?: number | null) {
    if (farmId) {
      for (const key of _cache.keys()) {
        if (key.includes(`farm_${farmId}`) || key.includes(`farm_id=${farmId}`)) {
          _cache.delete(key)
        }
      }
    }
    // Also clear any unresolved/generic location cache entries
    for (const key of _cache.keys()) {
      if (key.startsWith('loc:live:')) {
        _cache.delete(key)
      }
    }
  },

  /**
   * Clear all location-related cache entries.
   */
  clearLocationCache() {
    for (const key of _cache.keys()) {
      if (key.startsWith('loc:')) {
        _cache.delete(key)
      }
    }
  },

  /**
   * Clear cache if needed (e.g. on farm edit or manual refresh).
   */
  clearCache() {
    _cache.clear()
  },
}
