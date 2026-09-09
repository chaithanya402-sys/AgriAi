import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { farmApi } from '../services/api'
import { agriculturalService } from '../services/agriculturalService'
import type {
  Farm,
  FarmSoilData,
  WeatherCurrent,
  WeatherForecastResponse,
  ResolvedLocation,
} from '../types'

export interface ActiveFarmLocation {
  farmId: number | null
  state: string | null
  district: string | null
  mandal: string | null
  village: string | null
  // stored internally; NEVER displayed in UI
  lat?: number | null
  lng?: number | null
}

interface FarmContextValue {
  farms: Farm[]
  selectedFarmId: number | null
  currentFarm: Farm | null
  activeLocation: ActiveFarmLocation
  soilData: FarmSoilData | null
  soilLoading: boolean
  weatherCurrent: WeatherCurrent | null
  weatherForecast: WeatherForecastResponse | null
  weatherLoading: boolean
  weatherError: string | null
  loading: boolean
  setSelectedFarmId: (id: number | null) => void
  refetchFarms: () => Promise<void>
  updateActiveLocationFromGps: (resolved: ResolvedLocation) => Promise<void>
}

const FarmContext = createContext<FarmContextValue | undefined>(undefined)
const STORAGE_SELECTED_FARM_KEY = 'agriai_selected_farm_id'

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmIdState] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Active Location & dynamic pipeline
  const [activeLocation, setActiveLocation] = useState<ActiveFarmLocation>({
    farmId: null,
    state: null,
    district: null,
    mandal: null,
    village: null,
    lat: null,
    lng: null,
  })

  // Soil data from AP Village dataset
  const [soilData, setSoilData] = useState<FarmSoilData | null>(null)
  const [soilLoading, setSoilLoading] = useState(false)

  // Weather data
  const [weatherCurrent, setWeatherCurrent] = useState<WeatherCurrent | null>(null)
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecastResponse | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  // Request race condition guards to PREVENT STALE DATA
  const activeRequestIdRef = useRef(0)
  const activeFarmIdRef = useRef<number | null>(null)

  // Load farms on mount
  const refetchFarms = useCallback(async () => {
    try {
      const list = await farmApi.list()
      setFarms(list)
      const storedId = await AsyncStorage.getItem(STORAGE_SELECTED_FARM_KEY)
      const parsedId = storedId ? Number(storedId) : null

      setSelectedFarmIdState((prev) => {
        if (prev && list.some((f) => f.id === prev)) return prev
        if (parsedId && list.some((f) => f.id === parsedId)) return parsedId
        return list.length > 0 ? list[0].id : null
      })
    } catch (err) {
      console.warn('Failed to load farms:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetchFarms()
  }, [refetchFarms])

  const setSelectedFarmId = useCallback((id: number | null) => {
    setSelectedFarmIdState(id)
    if (id !== null) {
      AsyncStorage.setItem(STORAGE_SELECTED_FARM_KEY, String(id)).catch(() => {})
    } else {
      AsyncStorage.removeItem(STORAGE_SELECTED_FARM_KEY).catch(() => {})
    }
  }, [])

  const currentFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || null

  // ── Reactive Farm Pipeline ──────────────────────────────────────────────
  // When selectedFarm changes:
  // Selected Farm → Farm Name → Farm ID → State → District → Mandal → Village → Map → Soil Data → Weather
  useEffect(() => {
    if (!currentFarm) {
      activeFarmIdRef.current = null
      setActiveLocation({
        farmId: null,
        state: null,
        district: null,
        mandal: null,
        village: null,
        lat: null,
        lng: null,
      })
      setSoilData(null)
      setWeatherCurrent(null)
      setWeatherForecast(null)
      return
    }

    const farmId = currentFarm.id
    activeFarmIdRef.current = farmId
    const currentReqId = ++activeRequestIdRef.current

    // Initialize location state immediately for smooth UI transition
    const initLocation: ActiveFarmLocation = {
      farmId,
      state: currentFarm.state || null,
      district: currentFarm.district || null,
      mandal: currentFarm.mandal || null,
      village: currentFarm.village || null,
      lat: currentFarm.latitude || null,
      lng: currentFarm.longitude || null,
    }
    setActiveLocation(initLocation)

    // Clear previous soil and weather or set loading states
    setSoilLoading(true)
    setWeatherLoading(true)
    setWeatherError(null)

    // Step 1: Fetch Soil Data from AP Village-level dataset
    agriculturalService
      .getFarmSoil(farmId)
      .then((soil) => {
        if (currentReqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) {
          return // stale request guard
        }
        setSoilData(soil)
        // If soil lookup resolved more specific district/mandal/village, enrich location
        if (soil.found) {
          setActiveLocation((prev) => ({
            ...prev,
            state: soil.state || prev.state,
            district: soil.district || prev.district,
            mandal: soil.mandal || prev.mandal,
            village: soil.village || prev.village,
          }))
        }
      })
      .catch((err) => {
        if (currentReqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) return
        console.warn('Failed to fetch soil data for farm:', err)
        setSoilData(null)
      })
      .finally(() => {
        if (currentReqId === activeRequestIdRef.current) {
          setSoilLoading(false)
        }
      })

    // Step 2: Fetch Weather Data using coordinates
    const lat = currentFarm.latitude
    const lon = currentFarm.longitude

    if (lat != null && lon != null) {
      Promise.all([
        agriculturalService.getCurrentWeather(lat, lon),
        agriculturalService.getWeatherForecast(lat, lon),
      ])
        .then(([curr, fore]) => {
          if (currentReqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) {
            return // stale request guard
          }
          setWeatherCurrent(curr)
          setWeatherForecast(fore)
          setWeatherError(null)
        })
        .catch((err) => {
          if (currentReqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) return
          setWeatherError('Weather unavailable')
          setWeatherCurrent(null)
          setWeatherForecast(null)
        })
        .finally(() => {
          if (currentReqId === activeRequestIdRef.current) {
            setWeatherLoading(false)
          }
        })
    } else {
      // Try resolving coordinates from backend location resolver if missing
      agriculturalService
        .resolveLocation(null, farmId)
        .then((loc) => {
          if (currentReqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) return
          if (loc.lat != null && loc.lon != null) {
            setActiveLocation((prev) => ({
              ...prev,
              lat: loc.lat,
              lng: loc.lon,
              state: loc.state || prev.state,
              district: loc.district || prev.district,
              mandal: loc.mandal || prev.mandal,
              village: loc.village || prev.village,
            }))
            return Promise.all([
              agriculturalService.getCurrentWeather(loc.lat, loc.lon),
              agriculturalService.getWeatherForecast(loc.lat, loc.lon),
            ]).then(([curr, fore]) => {
              if (currentReqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) return
              setWeatherCurrent(curr)
              setWeatherForecast(fore)
              setWeatherError(null)
            })
          } else {
            setWeatherError('Weather unavailable')
          }
        })
        .catch(() => {
          if (currentReqId === activeRequestIdRef.current) {
            setWeatherError('Weather unavailable')
          }
        })
        .finally(() => {
          if (currentReqId === activeRequestIdRef.current) {
            setWeatherLoading(false)
          }
        })
    }
  }, [currentFarm?.id, currentFarm?.state, currentFarm?.district, currentFarm?.latitude, currentFarm?.longitude])

  // "Use Current Location" handler update
  const updateActiveLocationFromGps = async (resolved: ResolvedLocation) => {
    if (!currentFarm) return
    const reqId = ++activeRequestIdRef.current
    const farmId = currentFarm.id

    // Update active location
    setActiveLocation({
      farmId,
      state: resolved.state,
      district: resolved.district,
      mandal: resolved.mandal || null,
      village: resolved.village || null,
      lat: resolved.lat,
      lng: resolved.lon,
    })

    // Persist to farm on backend
    if (resolved.lat && resolved.lon) {
      try {
        await farmApi.update(farmId, {
          latitude: resolved.lat,
          longitude: resolved.lon,
          state: resolved.state || currentFarm.state,
          district: resolved.district || currentFarm.district,
          mandal: resolved.mandal || currentFarm.mandal,
          village: resolved.village || currentFarm.village,
          location: [resolved.district, resolved.state].filter(Boolean).join(', '),
        })
        // Refresh farms list in background
        refetchFarms()
      } catch (err) {
        console.warn('Could not persist GPS location to backend farm:', err)
      }
    }

    // Refresh soil & weather for new GPS position
    setSoilLoading(true)
    agriculturalService
      .getFarmSoil(farmId)
      .then((soil) => {
        if (reqId === activeRequestIdRef.current) {
          setSoilData(soil)
        }
      })
      .finally(() => {
        if (reqId === activeRequestIdRef.current) {
          setSoilLoading(false)
        }
      })

    if (resolved.lat && resolved.lon) {
      setWeatherLoading(true)
      Promise.all([
        agriculturalService.getCurrentWeather(resolved.lat, resolved.lon),
        agriculturalService.getWeatherForecast(resolved.lat, resolved.lon),
      ])
        .then(([curr, fore]) => {
          if (reqId === activeRequestIdRef.current) {
            setWeatherCurrent(curr)
            setWeatherForecast(fore)
            setWeatherError(null)
          }
        })
        .catch(() => {
          if (reqId === activeRequestIdRef.current) {
            setWeatherError('Weather unavailable')
          }
        })
        .finally(() => {
          if (reqId === activeRequestIdRef.current) {
            setWeatherLoading(false)
          }
        })
    }
  }

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarmId,
        currentFarm,
        activeLocation,
        soilData,
        soilLoading,
        weatherCurrent,
        weatherForecast,
        weatherLoading,
        weatherError,
        loading,
        setSelectedFarmId,
        refetchFarms,
        updateActiveLocationFromGps,
      }}
    >
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used within a FarmProvider')
  return ctx
}
