import { useState, useEffect } from 'react'
import { TrendingUp, RefreshCw, Info } from 'lucide-react'
import { marketApi } from '@/services/modules'
import { useAsync } from '@/hooks/useAsync'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { PageLoader } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CROPS } from '@/lib/crops'

interface MarketPrice {
  crop: string
  market: string
  price_per_tonne: number
  currency: string
  source: string
  demo_mode: boolean
  date: string
}

interface MarketPricesResponse {
  prices: MarketPrice[]
  as_of: string
  demo_mode: boolean
}

// The explicit "All Crops" item is rendered separately in the Select.
const CROP_OPTIONS = [...CROPS]

export function MarketPage() {
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const { data, loading, error, run } = useAsync<MarketPricesResponse>()

  const fetchPrices = (crop?: string) => {
    run(() => marketApi.prices(crop || undefined))
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop)
    fetchPrices(crop === 'all' ? undefined : crop)
  }

  const handleRefresh = () => {
    fetchPrices(selectedCrop === 'all' ? undefined : selectedCrop)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Market Prices</h1>
          <p className="text-sm text-neutral-500">
            Real-time commodity prices across major Indian markets
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* As-of timestamp */}
      {data && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Info className="h-4 w-4" />
          <span>
            Data as of: <span className="font-medium text-neutral-700">{formatDate(data.as_of)}</span>
          </span>
        </div>
      )}

      {/* Demo mode banner */}
      {data?.demo_mode && (
        <Alert variant="warning" className="flex items-center gap-2">
          <Badge variant="warning">Demo data</Badge>
          <span>
            Showing simulated market prices. Connect to a live data source for real-time pricing.
          </span>
        </Alert>
      )}

      {/* Crop filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter by Crop</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-72">
              <Select value={selectedCrop || 'all'} onValueChange={handleCropChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All crops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {CROP_OPTIONS.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCrop && selectedCrop !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCropChange('all')}
              >
                Clear filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && <PageLoader label="Fetching market prices..." />}

      {/* Error state */}
      {error && !loading && (
        <Alert variant="danger" className="flex items-center gap-2">
          <span className="font-medium">Error loading prices:</span> {error}
        </Alert>
      )}

      {/* Prices table */}
      {data && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-fresh-500" />
              Commodity Prices
            </CardTitle>
            <CardDescription>
              {data.prices.length} price{data.prices.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.prices.length === 0 ? (
              <EmptyState
                title="No prices available"
                description="No market price data found for the selected filter. Try selecting a different crop."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left">
                      <th className="pb-3 pr-4 font-medium text-neutral-600">Crop</th>
                      <th className="pb-3 pr-4 font-medium text-neutral-600">Market</th>
                      <th className="pb-3 pr-4 text-right font-medium text-neutral-600">
                        Price / Tonne
                      </th>
                      <th className="pb-3 pr-4 font-medium text-neutral-600">Source</th>
                      <th className="pb-3 pr-4 font-medium text-neutral-600">Date</th>
                      <th className="pb-3 text-right font-medium text-neutral-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.prices.map((price, idx) => (
                      <tr
                        key={`${price.crop}-${price.market}-${idx}`}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                      >
                        <td className="py-3 pr-4 font-medium text-neutral-900">{price.crop}</td>
                        <td className="py-3 pr-4 text-neutral-700">{price.market}</td>
                        <td className="py-3 pr-4 text-right font-semibold text-neutral-900">
                          {formatCurrency(price.price_per_tonne)}
                          <span className="ml-1 text-xs font-normal text-neutral-400">/t</span>
                        </td>
                        <td className="py-3 pr-4 text-neutral-600">{price.source}</td>
                        <td className="py-3 pr-4 text-neutral-600">{formatDate(price.date)}</td>
                        <td className="py-3 text-right">
                          {price.demo_mode ? (
                            <Badge variant="warning">Demo</Badge>
                          ) : (
                            <Badge variant="success">Live</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
