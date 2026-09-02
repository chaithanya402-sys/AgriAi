import { useState, useEffect, useCallback, useRef } from 'react'
import { agriculturalDataService, ResolvedLocation } from '@/services/agriculturalDataService'
import { useFarm, ActiveFarmLocation } from '@/components/farm/FarmContext'

export interface AgriculturalLocationState {
  state: string | null
  district: string | null
  source: ResolvedLocation['source']
  loading: boolean
  permissionRequested: boolean
  permissionDenied: boolean
  error: string | null
  refresh: () => void
  requestLiveLocation: () => void
  activeFarmLocation: ActiveFarmLocation
}

export function useAgriculturalLocation(selectedFarmId?: number): AgriculturalLocationState {
  const { currentFarm, farms, activeLocation } = useFarm()

  // Determine the active farm strictly from selectedFarmId, then currentFarm
  const activeFarm = selectedFarmId
    ? (farms.find((f) => f.id === selectedFarmId) ?? currentFarm)
    : currentFarm
  const activeFarmId = activeFarm?.id ?? null

  // Capture stable snapshot of farm identity for async guards
  const activeFarmIdRef = useRef<number | null>(activeFarmId)
  const requestIdRef = useRef(0)
  const prevFarmIdRef = useRef<number | null>(null)

  // Initialize state directly from the farm's saved data — never show previous farm's values
  const [locState, setLocState] = useState<string | null>(activeFarm?.state ?? null)
  const [locDistrict, setLocDistrict] = useState<string | null>(activeFarm?.district ?? null)
  const [source, setSource] = useState<ResolvedLocation['source']>('farm_saved')
  const [loading, setLoading] = useState(false)
  const [permissionRequested, setPermissionRequested] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolve = useCallback(async () => {
    const farmId = activeFarmIdRef.current
    const farm = farmId
      ? (farms.find((f) => f.id === farmId) ?? currentFarm)
      : currentFarm

    if (!farmId || !farm) {
      setLocState(null)
      setLocDistrict(null)
      setSource('none')
      setLoading(false)
      setError(null)
      return
    }

    // Invalidate previous farm cache on farm switch
    if (prevFarmIdRef.current && prevFarmIdRef.current !== farmId) {
      agriculturalDataService.invalidateFarmCache(prevFarmIdRef.current)
      agriculturalDataService.clearLocationCache()
    }
    prevFarmIdRef.current = farmId

    // 1. Farm has saved state + district — use immediately, no async needed
    if (farm.state && farm.district) {
      setLocState(farm.state)
      setLocDistrict(farm.district)
      setSource('farm_saved')
      setError(null)
      setLoading(false)
      return
    }

    // 2. FarmContext activeLocation already resolved for this exact farm
    if (activeLocation.farmId === farmId && activeLocation.state && activeLocation.district) {
      setLocState(activeLocation.state)
      setLocDistrict(activeLocation.district)
      setSource('farm_saved')
      setError(null)
      setLoading(false)
      return
    }

    // 3. Async resolution via coordinates or farm_id fallback
    const currentReqId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    try {
      const farmCoords =
        farm.latitude && farm.longitude
          ? { lat: farm.latitude, lon: farm.longitude }
          : null

      const resolved = await agriculturalDataService.resolveLocation(farmCoords, farmId)

      // Stale response guard: ignore if farm changed during the async call
      if (currentReqId !== requestIdRef.current) return
      if (activeFarmIdRef.current !== farmId) return
      if (resolved.farm_id && resolved.farm_id !== farmId) return

      if (resolved.state && resolved.district) {
        setLocState(resolved.state)
        setLocDistrict(resolved.district)
        setSource(resolved.source)
        setError(null)
      } else {
        setLocState(null)
        setLocDistrict(null)
        setSource('none')
        setError(
          'Location unavailable for this farm. Please configure farm location in Farm Management.'
        )
      }
    } catch (err: any) {
      if (currentReqId !== requestIdRef.current) return
      if (activeFarmIdRef.current !== farmId) return
      console.warn('Farm location resolve failed:', err)
      setError('Failed to resolve farm location.')
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [farms, currentFarm, activeLocation])

  // When the active farm changes: immediately reset to the new farm's saved values,
  // then trigger async resolution if needed.
  useEffect(() => {
    activeFarmIdRef.current = activeFarmId

    // Immediately apply new farm's known state/district (prevents stale display)
    setLocState(activeFarm?.state ?? null)
    setLocDistrict(activeFarm?.district ?? null)

    resolve()
  }, [
    activeFarmId,
    activeFarm?.state,
    activeFarm?.district,
    activeFarm?.latitude,
    activeFarm?.longitude,
    activeFarm?.location,
    resolve,
  ])

  // Live GPS explicitly triggered by user action (optional, not auto-run)
  const requestLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true)
      setError('Geolocation is not supported by your browser.')
      return
    }

    const currentReqId = ++requestIdRef.current
    setPermissionRequested(true)
    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setPermissionDenied(false)
        try {
          const resolved = await agriculturalDataService.resolveLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
          if (currentReqId !== requestIdRef.current) return

          if (resolved.state && resolved.district) {
            setLocState(resolved.state)
            setLocDistrict(resolved.district)
            setSource('live')
            setError(null)
          } else {
            setError('Could not identify State and District from GPS.')
          }
        } catch (err: any) {
          if (currentReqId !== requestIdRef.current) return
          setError('GPS location lookup failed.')
        } finally {
          if (currentReqId === requestIdRef.current) {
            setLoading(false)
          }
        }
      },
      (err) => {
        setPermissionDenied(true)
        setLoading(false)
        setError(`Unable to retrieve location: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  return {
    state: locState,
    district: locDistrict,
    source,
    loading,
    permissionRequested,
    permissionDenied,
    error,
    refresh: resolve,
    requestLiveLocation,
    activeFarmLocation: {
      farmId: activeFarmId,
      latitude:
        (activeLocation.farmId === activeFarmId ? activeLocation.latitude : null) ??
        activeFarm?.latitude ??
        null,
      longitude:
        (activeLocation.farmId === activeFarmId ? activeLocation.longitude : null) ??
        activeFarm?.longitude ??
        null,
      state: locState,
      district: locDistrict,
    },
  }
}
