import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { farmApi } from '@/services/api'
import { agriculturalDataService } from '@/services/agriculturalDataService'
import { getCropDetails } from '@/data/cropDetailsData'
import type { Farm } from '@/types'

export interface ActiveFarmLocation {
  farmId: number | null
  latitude: number | null
  longitude: number | null
  state: string | null
  district: string | null
  mandal: string | null
  village: string | null
}

export interface ActiveCrop {
  cropId?: string
  cropName: string
  rawCropName: string
  farmId: number | string
  farmName: string
  location: string
  state?: string
  district?: string
  area: number
  soilType?: string
  cropStage: string
  season?: string
  nitrogen: number
  phosphorus: number
  potassium: number
  soilPH: number
  temperature: number
  humidity: number
  rainfall: number
  recommendationScore?: number
  expectedYield?: number
  riskLevel?: string
  image?: string
  targetYield?: number
  activatedAt?: string
}

interface FarmContextValue {
  farms: Farm[]
  selectedFarmId: number | null
  currentFarm: Farm | null
  activeLocation: ActiveFarmLocation
  activeLocationLoading: boolean
  activeCrop: ActiveCrop | null
  setActiveCrop: (crop: ActiveCrop | null) => void
  activateCropPlan: (cropData: Partial<ActiveCrop> & { cropName: string }) => ActiveCrop
  setSelectedFarmId: (id: number | null) => void
  setCurrentFarm: (farm: Farm | null) => void
  refetch: () => Promise<void>
  loading: boolean
}

const FarmContext = createContext<FarmContextValue | undefined>(undefined)

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('agriai_selected_farm_id')
    return saved ? Number(saved) : null
  })
  const [loading, setLoading] = useState(true)

  // Active farm location state: { farmId, latitude, longitude, state, district }
  const [activeLocation, setActiveLocation] = useState<ActiveFarmLocation>({
    farmId: null,
    latitude: null,
    longitude: null,
    state: null,
    district: null,
    mandal: null,
    village: null,
  })
  const [activeLocationLoading, setActiveLocationLoading] = useState(false)

  const activeRequestIdRef = useRef(0)
  const activeFarmIdRef = useRef<number | null>(null)
  const prevFarmIdRef = useRef<number | null>(null)

  const setSelectedFarmId = useCallback((id: number | null) => {
    setSelectedFarmIdState((prevId) => {
      // Invalidate previous farm cache immediately when farm changes
      if (prevId && prevId !== id) {
        agriculturalDataService.invalidateFarmCache(prevId)
        agriculturalDataService.clearLocationCache()
      }
      return id
    })
    if (id !== null && id !== undefined) {
      localStorage.setItem('agriai_selected_farm_id', String(id))
    } else {
      localStorage.removeItem('agriai_selected_farm_id')
    }
  }, [])

  const refetch = useCallback(async () => {
    try {
      const list: Farm[] = await farmApi.list()
      setFarms(list)
      setSelectedFarmIdState((prevId) => {
        if (prevId && list.some((f) => f.id === prevId)) {
          return prevId
        }
        const defaultId = list[0]?.id ?? null
        if (defaultId) {
          localStorage.setItem('agriai_selected_farm_id', String(defaultId))
        }
        return defaultId
      })
    } catch {
      /* errors handled by pages */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const currentFarm = farms.find((f) => f.id === selectedFarmId) || farms[0] || null

  // Synchronize and resolve active farm location whenever currentFarm changes
  useEffect(() => {
    if (!currentFarm) {
      activeFarmIdRef.current = null
      setActiveLocation({
        farmId: null,
        latitude: null,
        longitude: null,
        state: null,
        district: null,
        mandal: null,
        village: null,
      })
      setActiveLocationLoading(false)
      return
    }

    const farmId = currentFarm.id
    activeFarmIdRef.current = farmId

    // If farm changed, invalidate previous farm's cached location immediately
    if (prevFarmIdRef.current && prevFarmIdRef.current !== farmId) {
      agriculturalDataService.invalidateFarmCache(prevFarmIdRef.current)
      agriculturalDataService.clearLocationCache()
    }
    prevFarmIdRef.current = farmId

    // Selected farm is always source of truth: immediately initialize with new farm's data
    // Never retain previous farm's state or district
    const initialLocation: ActiveFarmLocation = {
      farmId: currentFarm.id,
      latitude: currentFarm.latitude ?? null,
      longitude: currentFarm.longitude ?? null,
      state: currentFarm.state ?? null,
      district: currentFarm.district ?? null,
      mandal: currentFarm.mandal ?? null,
      village: currentFarm.village ?? null,
    }
    setActiveLocation(initialLocation)

    // If both state and district already exist on currentFarm, we're done
    if (currentFarm.state && currentFarm.district) {
      setActiveLocationLoading(false)
      return
    }

    // Otherwise resolve location using selected farm internally
    const reqId = ++activeRequestIdRef.current
    setActiveLocationLoading(true)

    const farmCoords =
      currentFarm.latitude && currentFarm.longitude
        ? { lat: currentFarm.latitude, lon: currentFarm.longitude }
        : null

    agriculturalDataService
      .resolveLocation(farmCoords, farmId)
      .then((resolved) => {
        // Prevent stale responses: ignore if user has switched to another farm in the meantime
        if (reqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) return
        if (resolved.farm_id && resolved.farm_id !== farmId) return

        setActiveLocation({
          farmId: farmId,
          latitude: resolved.lat ?? currentFarm.latitude ?? null,
          longitude: resolved.lon ?? currentFarm.longitude ?? null,
          state: resolved.state ?? currentFarm.state ?? null,
          district: resolved.district ?? currentFarm.district ?? null,
          mandal: (resolved as any).mandal ?? currentFarm.mandal ?? null,
          village: (resolved as any).village ?? currentFarm.village ?? null,
        })

        // Synchronize resolved state & district into farms list for consistency
        if (resolved.state && resolved.district) {
          setFarms((prev) =>
            prev.map((f) =>
              f.id === farmId && (!f.state || !f.district)
                ? { ...f, state: resolved.state, district: resolved.district }
                : f
            )
          )
        }
      })
      .catch((err) => {
        if (reqId !== activeRequestIdRef.current || activeFarmIdRef.current !== farmId) return
        console.warn('Failed to resolve active farm location:', err)
      })
      .finally(() => {
        if (reqId === activeRequestIdRef.current) {
          setActiveLocationLoading(false)
        }
      })
  }, [currentFarm?.id, currentFarm?.state, currentFarm?.district, currentFarm?.latitude, currentFarm?.longitude, currentFarm?.location, currentFarm?.mandal, currentFarm?.village])

  const setCurrentFarm = useCallback(
    (farm: Farm | null) => {
      setSelectedFarmId(farm?.id ?? null)
    },
    [setSelectedFarmId]
  )

  // Active Crop State (Single Source of Truth across the application)
  const [activeCrop, setActiveCropState] = useState<ActiveCrop | null>(() => {
    try {
      const saved = localStorage.getItem('agriai_active_crop')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse active crop from localStorage:', e)
    }
    return null
  })

  const setActiveCrop = useCallback((crop: ActiveCrop | null) => {
    setActiveCropState(crop)
    if (crop) {
      localStorage.setItem('agriai_active_crop', JSON.stringify(crop))
      localStorage.setItem('agriai_selected_crop', crop.rawCropName)
    } else {
      localStorage.removeItem('agriai_active_crop')
      localStorage.removeItem('agriai_selected_crop')
    }
  }, [])

  const activateCropPlan = useCallback(
    (cropData: Partial<ActiveCrop> & { cropName: string }): ActiveCrop => {
      const raw =
        cropData.rawCropName ||
        (cropData.cropName.includes('/')
          ? cropData.cropName.split('/')[0].trim()
          : cropData.cropName)
      const details = getCropDetails(raw)

      const targetFarm =
        farms.find((f) => String(f.id) === String(cropData.farmId)) ||
        currentFarm

      const newActiveCrop: ActiveCrop = {
        cropId: cropData.cropId || String(Date.now()),
        cropName: details.displayName || cropData.cropName,
        rawCropName: raw,
        farmId: cropData.farmId ?? targetFarm?.id ?? 1,
        farmName: cropData.farmName || targetFarm?.name || 'Kharif Farm',
        location:
          cropData.location ||
          targetFarm?.district ||
          targetFarm?.village ||
          'Nellore',
        state: cropData.state || targetFarm?.state || undefined,
        district: cropData.district || targetFarm?.district || undefined,
        area: cropData.area ?? Number(targetFarm?.total_area) ?? 4,
        soilType:
          cropData.soilType ||
          details.soilRequirements?.soilType ||
          'Loamy / Clay',
        cropStage: cropData.cropStage || 'Vegetative (Day 31–45)',
        season:
          cropData.season ||
          details.climateRequirements?.season ||
          'Kharif Season',
        nitrogen: cropData.nitrogen ?? 60,
        phosphorus: cropData.phosphorus ?? 40,
        potassium: cropData.potassium ?? 40,
        soilPH: cropData.soilPH ?? 6.5,
        temperature: cropData.temperature ?? 24.5,
        humidity: cropData.humidity ?? 66.1,
        rainfall: cropData.rainfall ?? 1251,
        recommendationScore:
          cropData.recommendationScore ?? (details.matchScore || 0.88),
        expectedYield: cropData.expectedYield ?? details.benchmarkYield ?? 4.0,
        riskLevel: cropData.riskLevel ?? details.riskLevel ?? 'Low',
        image: cropData.image || details.image || '/crops/ragi.jpg',
        targetYield: cropData.targetYield ?? details.benchmarkYield ?? 4.0,
        activatedAt: new Date().toISOString(),
      }

      setActiveCrop(newActiveCrop)
      return newActiveCrop
    },
    [currentFarm, farms, setActiveCrop]
  )

  // Keep active crop's farm context aligned if currentFarm changes
  useEffect(() => {
    if (!currentFarm || !activeCrop) return
    if (String(activeCrop.farmId) === String(currentFarm.id)) {
      if (
        activeCrop.farmName !== currentFarm.name ||
        (currentFarm.total_area && activeCrop.area !== currentFarm.total_area)
      ) {
        setActiveCrop({
          ...activeCrop,
          farmName: currentFarm.name,
          area: currentFarm.total_area ?? activeCrop.area,
          location: currentFarm.district || currentFarm.village || activeCrop.location,
        })
      }
    }
  }, [currentFarm, activeCrop, setActiveCrop])

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarmId,
        currentFarm,
        activeLocation,
        activeLocationLoading,
        activeCrop,
        setActiveCrop,
        activateCropPlan,
        setSelectedFarmId,
        setCurrentFarm,
        refetch,
        loading,
      }}
    >
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used within FarmProvider')
  return ctx
}
