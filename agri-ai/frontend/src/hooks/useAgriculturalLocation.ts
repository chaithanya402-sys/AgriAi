import { useState, useEffect, useCallback, useRef } from 'react'
import { agriculturalDataService, ResolvedLocation } from '@/services/agriculturalDataService'
import { useFarm } from '@/components/farm/FarmContext'

export interface AgriculturalLocationState {
  state: string | null
  district: string | null
  source: ResolvedLocation['source']
  loading: boolean
  permissionRequested: boolean
  permissionDenied: boolean
  error: string | null
  refresh: () => void
}

export function useAgriculturalLocation(selectedFarmId?: number): AgriculturalLocationState {
  const { currentFarm } = useFarm()
  const activeFarmId = selectedFarmId || currentFarm?.id

  const [state, setState] = useState<string | null>(null)
  const [district, setDistrict] = useState<string | null>(null)
  const [source, setSource] = useState<ResolvedLocation['source']>('none')
  const [loading, setLoading] = useState(true)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const liveCoordsRef = useRef<{ lat: number; lon: number } | null>(null)

  const resolve = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Priority 1: Check selected farm location and coordinates first
    if (activeFarmId) {
      try {
        const farmCoords =
          currentFarm && currentFarm.id === activeFarmId && currentFarm.latitude && currentFarm.longitude
            ? { lat: currentFarm.latitude, lon: currentFarm.longitude }
            : null

        const resolved = await agriculturalDataService.resolveLocation(farmCoords, activeFarmId)
        if (resolved.state && resolved.district) {
          setState(resolved.state)
          setDistrict(resolved.district)
          setSource(resolved.source)
          setLoading(false)
          return
        }
      } catch (err: any) {
        console.warn('Farm location resolve failed:', err)
      }
    }

    // Priority 2: Live browser location fallback only if farm location unavailable
    if (liveCoordsRef.current) {
      try {
        const resolved = await agriculturalDataService.resolveLocation(liveCoordsRef.current)
        if (resolved.state && resolved.district) {
          setState(resolved.state)
          setDistrict(resolved.district)
          setSource(resolved.source)
          setLoading(false)
          return
        }
      } catch (err: any) {
        console.warn('Live location resolve failed, trying fallback:', err)
      }
    }

    // Priority 3: No-data state
    setState(null)
    setDistrict(null)
    setSource('none')
    setError('Location unavailable. Enable location permission or configure farm location in Farm Management.')
    setLoading(false)
  }, [activeFarmId, currentFarm])

  // Request live geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true)
      resolve()
      return
    }

    setPermissionRequested(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        liveCoordsRef.current = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }
        setPermissionDenied(false)
        resolve()
      },
      (err) => {
        console.info('Geolocation access denied or timed out; using farm fallback:', err.message)
        setPermissionDenied(true)
        resolve()
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  }, [resolve])

  return {
    state,
    district,
    source,
    loading,
    permissionRequested,
    permissionDenied,
    error,
    refresh: resolve,
  }
}
