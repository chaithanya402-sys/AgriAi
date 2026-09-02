import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { farmApi } from '@/services/api'
import type { Farm } from '@/types'

interface FarmContextValue {
  farms: Farm[]
  selectedFarmId: number | null
  currentFarm: Farm | null
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

  const setSelectedFarmId = useCallback((id: number | null) => {
    setSelectedFarmIdState(id)
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
