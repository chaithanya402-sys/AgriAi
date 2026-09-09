import * as Location from 'expo-location'
import { agriculturalService } from './agriculturalService'
import type { ResolvedLocation } from '../types'

export interface LocationResult {
  success: boolean
  resolved?: ResolvedLocation
  error?: string
}

export const locationService = {
  async requestAndGetCurrentLocation(farmId?: number | null): Promise<LocationResult> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        return {
          success: false,
          error: 'Location permission was denied. Please allow location access in settings to identify your farm.',
        }
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = position.coords

      // Call backend to reverse resolve State, District, Mandal, Village
      const resolved = await agriculturalService.resolveLocation(
        { lat: latitude, lon: longitude },
        farmId
      )

      return {
        success: true,
        resolved: {
          ...resolved,
          lat: latitude,
          lon: longitude,
        },
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to retrieve your current GPS location.',
      }
    }
  },
}
