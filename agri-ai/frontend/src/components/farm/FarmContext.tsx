import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { farmApi } from '@/services/api'
import { agriculturalDataService } from '@/services/agriculturalDataService'
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

interface FarmContextValue {
  farms: Farm[]
  selectedFarmId: number | null
  currentFarm: Farm | null
  activeLocation: ActiveFarmLocation
  activeLocationLoading: boolean
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

  return (
    <FarmContext.Provider
      value={{
        farms,
        selectedFarmId,
        currentFarm,
        activeLocation,
        activeLocationLoading,
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
