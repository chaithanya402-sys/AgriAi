import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { farmApi } from '@/services/api'
import type { Farm } from '@/types'

interface FarmContextValue {
  farms: Farm[]
  currentFarm: Farm | null
  setCurrentFarm: (farm: Farm | null) => void
  refetch: () => Promise<void>
  loading: boolean
}

const FarmContext = createContext<FarmContextValue | undefined>(undefined)

export function FarmProvider({ children }: { children: ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const list: Farm[] = await farmApi.list()
      setFarms(list)
      setCurrentFarm((cur) => {
        if (cur) {
          const updated = list.find((f: Farm) => f.id === cur.id)
          return updated || list[0] || null
        }
        return list[0] || null
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

  return (
    <FarmContext.Provider value={{ farms, currentFarm, setCurrentFarm, refetch, loading }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used within FarmProvider')
  return ctx
}
