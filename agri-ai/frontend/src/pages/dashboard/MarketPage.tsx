import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Truck,
  Store,
  ShieldCheck,
  Scale,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Calendar,
  Layers,
  Navigation,
  Crosshair,
  Compass,
  Home,
  Globe,
  AlertCircle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { marketApi, MarketFilterParams } from '@/services/modules'
import { useFarm } from '@/components/farm/FarmContext'
import {
  MarketPriceItem,
  MarketSummaryData,
  DistrictSummaryItem,
  MSPBenchmarkItem,
  MarketDistrictInfo,
  MarketCommodityInfo,
  MarketLocationResolution,
} from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { PageLoader } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'

const COMMODITY_GROUPS = [
  'All Groups',
  'Cereals',
  'Pulses',
  'Oilseeds',
  'Commercial',
  'Spices',
  'Vegetables',
  'Fruits',
  'Plantation',
]

const TRADING_CHANNELS = [
  'All Channels',
  'e-NAM Electronic Auction',
  'APMC Physical Open Auction',
  'Direct Farmer Counter (Rythu Bazar)',
  'FPO Aggregation / Mill Gate',
]

const PRICE_TRENDS = [
  'All Trends',
  'Bullish (+)',
  'Stable (=)',
  'Bearish (-)',
]

const SENTIMENT_COLORS = ['#2ea848', '#ddba77', '#b3402e']
const CHANNEL_COLORS = ['#2a6ea8', '#1e7a3a', '#b07a2b', '#7a4b1c']

export function MarketPage() {
  // Main Data States
  const [summary, setSummary] = useState<MarketSummaryData | null>(null)
  const [districtsList, setDistrictsList] = useState<MarketDistrictInfo[]>([])
  const [commoditiesList, setCommoditiesList] = useState<MarketCommodityInfo[]>([])
  const [prices, setPrices] = useState<MarketPriceItem[]>([])
  const [districtSummaries, setDistrictSummaries] = useState<DistrictSummaryItem[]>([])
  const [mspBenchmarks, setMspBenchmarks] = useState<MSPBenchmarkItem[]>([])

  // Pagination & Metadata
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(25)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [asOfDate, setAsOfDate] = useState<string>('')

  // UI & Loading States
  const [loading, setLoading] = useState<boolean>(true)
  const [pricesLoading, setPricesLoading] = useState<boolean>(false)
  const [isDistrictDataLoading, setIsDistrictDataLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('mandi-rates')

  // Live Location & Farm Context Integration
  const { currentFarm, activeLocation } = useFarm()
  const activeFarmDistrict = activeLocation?.district || currentFarm?.district || null

  const [isLiveLocationActive, setIsLiveLocationActive] = useState<boolean>(false)
  const [liveLocationLoading, setLiveLocationLoading] = useState<boolean>(false)
  const [liveLocationError, setLiveLocationError] = useState<string | null>(null)
  const [liveLocationData, setLiveLocationData] = useState<MarketLocationResolution | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all')
  const [selectedTrend, setSelectedTrend] = useState<string>('all')
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('reporting_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Initial Data Fetch (Districts & Commodities reference)
  const fetchMetadata = async () => {
    try {
      setLoading(true)
      setError(null)
      const [distRes, commRes] = await Promise.all([
        marketApi.districts(),
        marketApi.commodities(),
      ])
      setDistrictsList(distRes || [])
      setCommoditiesList(commRes || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch market metadata')
    } finally {
      setLoading(false)
    }
  }

  // Fetch District-Scoped Metrics (Summary KPI cards, Charts, District Summary Table, MSP)
  const fetchDistrictMetrics = async (district: string) => {
    try {
      setIsDistrictDataLoading(true)
      const [sumRes, distSumRes, mspRes] = await Promise.all([
        marketApi.summary(district),
        marketApi.districtSummary({ district: district !== 'all' ? district : undefined, limit: 150 }),
        marketApi.msp(district !== 'all' ? district : undefined),
      ])
      setSummary(sumRes)
      setDistrictSummaries(distSumRes || [])
      setMspBenchmarks(mspRes || [])
    } catch (err: any) {
      console.error('Failed to update district metrics:', err)
    } finally {
      setIsDistrictDataLoading(false)
    }
  }

  // Fetch Prices with Filters
  const fetchPrices = async () => {
    try {
      setPricesLoading(true)
      const params: MarketFilterParams = {
        crop: selectedCrop !== 'all' ? selectedCrop : undefined,
        district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
        commodity_group: selectedGroup !== 'all' ? selectedGroup : undefined,
        price_trend: selectedTrend !== 'all' ? selectedTrend : undefined,
        trading_channel: selectedChannel !== 'all' ? selectedChannel : undefined,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      }
      const res = await marketApi.prices(params)
      setPrices(res.prices || [])
      setTotalRecords(res.total || 0)
      setTotalPages(res.total_pages || 1)
      setAsOfDate(res.as_of || new Date().toISOString())
    } catch (err: any) {
      console.error('Failed to load prices:', err)
    } finally {
      setPricesLoading(false)
    }
  }

  useEffect(() => {
    fetchMetadata()
  }, [])

  // Reactive District Reloading for KPIs, Sentiment & Volume charts, and District Summaries
  useEffect(() => {
    fetchDistrictMetrics(selectedDistrict)
  }, [selectedDistrict])

  useEffect(() => {
    fetchPrices()
  }, [
    page,
    limit,
    selectedCrop,
    selectedGroup,
    selectedDistrict,
    selectedTrend,
    selectedChannel,
    sortBy,
    sortOrder,
  ])

  // Live Location Detection via Browser Geolocation API
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setLiveLocationError('Geolocation is not supported by your browser.')
      return
    }
    setLiveLocationLoading(true)
    setLiveLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await marketApi.resolveLocation(latitude, longitude)
          setLiveLocationData(res)
          setIsLiveLocationActive(true)
          setSelectedDistrict(res.district)
          setPage(1)
        } catch (err: any) {
          setLiveLocationError(err?.message || 'Failed to resolve GPS coordinates to an AP mandi district.')
        } finally {
          setLiveLocationLoading(false)
        }
      },
      (geoErr) => {
        let msg = 'Unable to retrieve your location.'
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in browser settings.'
        } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
          msg = 'Location position unavailable. Please check your device GPS.'
        } else if (geoErr.code === geoErr.TIMEOUT) {
          msg = 'Location request timed out. Please try again.'
        }
        setLiveLocationError(msg)
        setLiveLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  // Quick Select Active Farm District
  const handleUseFarmDistrict = () => {
    if (!activeFarmDistrict) return
    setSelectedDistrict(activeFarmDistrict)
    setIsLiveLocationActive(false)
    setLiveLocationError(null)
    setPage(1)
  }

  // Reset back to statewide (All 26 Districts)
  const handleResetToAllDistricts = () => {
    setSelectedDistrict('all')
    setIsLiveLocationActive(false)
    setLiveLocationError(null)
    setPage(1)
  }

  // Trigger search on submit or clear
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPrices()
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCrop('all')
    setSelectedGroup('all')
    setSelectedDistrict('all')
    setIsLiveLocationActive(false)
    setLiveLocationError(null)
    setSelectedTrend('all')
    setSelectedChannel('all')
    setSortBy('reporting_date')
    setSortOrder('desc')
    setPage(1)
  }

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCrop !== 'all' ||
    selectedGroup !== 'all' ||
    selectedDistrict !== 'all' ||
    selectedTrend !== 'all' ||
    selectedChannel !== 'all'

  // Chart Data Preparation
  const sentimentChartData = useMemo(() => {
    if (!summary?.trends) return []
    return [
      { name: 'Bullish (+)', value: summary.trends.bullish, pct: summary.trends.bullish_pct },
      { name: 'Stable (=)', value: summary.trends.stable, pct: summary.trends.stable_pct },
      { name: 'Bearish (-)', value: summary.trends.bearish, pct: summary.trends.bearish_pct },
    ]
  }, [summary])

  const channelChartData = useMemo(() => {
    if (!summary?.trading_channels) return []
    return Object.entries(summary.trading_channels).map(([key, value]) => ({
      name: key.replace('Electronic Auction', '').replace('Physical Open Auction', '').trim(),
      fullName: key,
      value,
    }))
  }, [summary])

  const topCommoditiesVolumeData = useMemo(() => {
    if (!summary?.top_commodities) return []
    return summary.top_commodities.slice(0, 7).map((c) => ({
      commodity: c.commodity.length > 12 ? c.commodity.slice(0, 10) + '..' : c.commodity,
      fullName: c.commodity,
      arrivals: Math.round(c.total_arrivals_qtl / 1000), // in thousands
      avgPrice: c.avg_price_rs_qtl,
    }))
  }, [summary])

  const topMandisSpreadData = useMemo(() => {
    if (!summary?.top_mandis) return []
    return summary.top_mandis.slice(0, 6).map((m) => ({
      name: m.market_name.replace('Agricultural Market Committee (AMC)', 'AMC').trim(),
      district: m.district,
      avgPrice: m.avg_price_rs_qtl,
      arrivals: Math.round(m.total_arrivals_qtl / 100),
    }))
  }, [summary])

  if (loading && !summary) {
    return <PageLoader label="Loading AP Agricultural Market Intelligence dataset..." />
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Market Intelligence & Mandi Rates
            </h1>
            <Badge variant="success" className="px-2 py-0.5 text-xs font-semibold">
              Live AP AgMarket
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Official mandi transactions, e-NAM electronic auctions, Rythu Bazars, and MSP safety benchmarks across 26 Andhra Pradesh districts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {summary?.date_range && (
            <div className="hidden lg:flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">
              <Calendar className="h-3.5 w-3.5 text-brand" />
              <span>
                Reported: {summary.date_range.start} to {summary.date_range.end}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDistrictMetrics(selectedDistrict)
              fetchPrices()
            }}
            disabled={pricesLoading || isDistrictDataLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${pricesLoading || isDistrictDataLoading ? 'animate-spin text-brand' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="flex items-center gap-2">
          <span className="font-semibold">Error:</span> {error}
        </Alert>
      )}

      {/* ── Live Location & District Quick-Select Bar ──────────────── */}
      {isLiveLocationActive ? (
        <div className="relative overflow-hidden rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-100/40 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100">
                <Navigation className="h-5 w-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    📍 Live Location Active
                  </span>
                  <Badge className="px-2 py-0.5 text-xs font-bold bg-emerald-700 text-white border-none shadow-xs">
                    {selectedDistrict} District
                  </Badge>
                  {liveLocationData?.distance_km !== undefined && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Centroid proximity: {liveLocationData.distance_km} km
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-emerald-900 font-medium">
                  Showing exclusively {selectedDistrict}&apos;s mandi transactions, arrival volumes, and price trend analytics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseLiveLocation}
                disabled={liveLocationLoading}
                className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100/80 bg-white/80"
              >
                <Crosshair className={`h-3.5 w-3.5 mr-1 text-emerald-600 ${liveLocationLoading ? 'animate-spin' : ''}`} />
                <span>Refresh GPS</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToAllDistricts}
                className="h-8 text-xs text-neutral-700 hover:text-neutral-900 hover:bg-white/80"
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                <span>Switch to All AP Mandis</span>
              </Button>
            </div>
          </div>
        </div>
      ) : selectedDistrict !== 'all' ? (
        <div className="relative overflow-hidden rounded-xl border border-brand/20 bg-gradient-to-r from-emerald-50/40 via-neutral-50 to-brand/5 p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                {selectedDistrict === activeFarmDistrict ? <Home className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    {selectedDistrict === activeFarmDistrict ? '🏡 Active Farm District' : '🎯 Filtered District'}
                  </span>
                  <Badge className="px-2 py-0.5 text-xs font-bold bg-brand text-white border-none shadow-xs">
                    {selectedDistrict}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600">
                  Mandi board, volume analytics, and trends are scoped strictly to {selectedDistrict}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseLiveLocation}
                disabled={liveLocationLoading}
                className="h-8 text-xs border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              >
                <Navigation className={`h-3.5 w-3.5 mr-1 text-emerald-600 ${liveLocationLoading ? 'animate-spin' : ''}`} />
                <span>Use Live Location</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToAllDistricts}
                className="h-8 text-xs text-neutral-600 hover:text-neutral-900"
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                <span>Switch to All AP Mandis</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-700">
            <span className="flex items-center gap-1.5 text-neutral-500">
              <Compass className="h-4 w-4 text-brand" />
              Quick Location Filter:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseLiveLocation}
              disabled={liveLocationLoading}
              className="h-8 text-xs font-medium border-emerald-600/30 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-500 transition-all shadow-xs"
            >
              <Navigation className={`h-3.5 w-3.5 mr-1.5 text-emerald-600 ${liveLocationLoading ? 'animate-spin' : ''}`} />
              {liveLocationLoading ? 'Detecting GPS...' : '📍 Use Live Location'}
            </Button>

            {activeFarmDistrict && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseFarmDistrict}
                className="h-8 text-xs font-medium border-blue-600/30 text-blue-800 bg-blue-50/60 hover:bg-blue-100 hover:border-blue-500 transition-all shadow-xs"
              >
                <Home className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                🏡 Use Active Farm District ({activeFarmDistrict})
              </Button>
            )}
          </div>

          <div className="text-xs text-neutral-500 hidden md:block">
            Showing all 26 Andhra Pradesh districts
          </div>
        </div>
      )}

      {liveLocationError && (
        <Alert variant="danger" className="flex items-center justify-between text-xs py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <span>{liveLocationError}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLiveLocationError(null)}
            className="h-6 px-1.5 text-xs text-neutral-500 hover:text-neutral-700"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Alert>
      )}

      {/* ── Top KPI Metrics Cards ──────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Average Modal Price */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {selectedDistrict !== 'all' ? `${selectedDistrict} Avg Modal Rate` : 'State Avg Modal Rate'}
                </span>
                <div className="rounded-full bg-fresh-500/10 p-2 text-fresh-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(summary.avg_modal_price_rs_qtl)}
                </span>
                <span className="text-xs font-medium text-neutral-500">/ Quintal</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {selectedDistrict !== 'all'
                  ? `Filtered exclusively for ${selectedDistrict} Mandis`
                  : `≈ ${formatCurrency(summary.avg_price_per_tonne)} / Tonne (37 Commodities)`}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Total Market Arrivals */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {selectedDistrict !== 'all' ? `${selectedDistrict} Market Arrivals` : 'Total Market Arrivals'}
                </span>
                <div className="rounded-full bg-brand/10 p-2 text-brand">
                  <Truck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {(summary.total_arrivals_qtl / 100000).toFixed(2)} Lakh
                </span>
                <span className="text-xs font-medium text-neutral-500">Quintals</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {selectedDistrict !== 'all'
                  ? `${summary.total_records.toLocaleString('en-IN')} transactions in ${selectedDistrict}`
                  : `${summary.total_records.toLocaleString('en-IN')} transactions recorded`}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Market Sentiment */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {selectedDistrict !== 'all' ? `${selectedDistrict} Sentiment` : 'Price Sentiment'}
                </span>
                <div className="rounded-full bg-earth-500/10 p-2 text-earth-500">
                  <Scale className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-bold text-fresh-500">
                  {summary.trends.bullish_pct}%
                </span>
                <span className="text-xs font-semibold text-neutral-600">Bullish Mandis</span>
              </div>
              {/* Sentiment Progress Bar */}
              <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  style={{ width: `${summary.trends.bullish_pct}%` }}
                  className="bg-fresh-500"
                  title={`Bullish: ${summary.trends.bullish}`}
                />
                <div
                  style={{ width: `${summary.trends.stable_pct}%` }}
                  className="bg-amber-400"
                  title={`Stable: ${summary.trends.stable}`}
                />
                <div
                  style={{ width: `${summary.trends.bearish_pct}%` }}
                  className="bg-red-500"
                  title={`Bearish: ${summary.trends.bearish}`}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-neutral-500">
                <span className="text-fresh-500 font-medium">Up: {summary.trends.bullish}</span>
                <span className="text-amber-600 font-medium">Flat: {summary.trends.stable}</span>
                <span className="text-red-500 font-medium">Down: {summary.trends.bearish}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: MSP Safety Floor */}
          <Card className="border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  {selectedDistrict !== 'all' ? `${selectedDistrict} MSP Safety` : 'MSP Safety Compliance'}
                </span>
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">
                  {summary.msp_metrics.compliance_pct}%
                </span>
                <span className="text-xs font-medium text-emerald-600">≥ Govt Floor</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {summary.msp_metrics.crops_at_or_above_msp} of {summary.msp_metrics.applicable_crops}{' '}
                {selectedDistrict !== 'all' ? `crops in ${selectedDistrict} trading above MSP` : 'benchmarked crops trading above MSP'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Interactive Multi-Facet Filter Bar ────────────────────────── */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Filter className="h-4 w-4 text-brand" />
              <span>Granular Mandi Filters & Search</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Reset All Filters
              </Button>
            )}
          </div>

          {/* Search Row */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by mandi name, village, mandal, variety, or channel (e.g., Guntur, Vadlamudi, e-NAM, BPT 5204)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4 bg-brand hover:bg-brand-hover text-white">
              Search
            </Button>
          </form>

          {/* Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Commodity Filter */}
            <div>
              <label className="text-[11px] font-medium uppercase text-neutral-500 mb-1 block">
                Commodity / Crop
              </label>
              <Select value={selectedCrop} onValueChange={(val) => { setSelectedCrop(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Commodities" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All Commodities (37)</SelectItem>
                  {commoditiesList.map((c) => (
                    <SelectItem key={c.commodity_name} value={c.commodity_name}>
                      {c.commodity_name} ({c.record_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Commodity Group */}
            <div>
              <label className="text-[11px] font-medium uppercase text-neutral-500 mb-1 block">
                Category Group
              </label>
              <Select value={selectedGroup} onValueChange={(val) => { setSelectedGroup(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {COMMODITY_GROUPS.slice(1).map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Filter */}
            <div>
              <label className="text-[11px] font-medium uppercase text-neutral-500 mb-1 block">
                AP District
              </label>
              <Select
                value={selectedDistrict}
                onValueChange={(val) => {
                  setSelectedDistrict(val)
                  if (isLiveLocationActive && val !== liveLocationData?.district) {
                    setIsLiveLocationActive(false)
                  }
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All Districts (26)</SelectItem>
                  {districtsList.map((d) => {
                    const isLive = isLiveLocationActive && d.district === liveLocationData?.district
                    const isFarm = d.district === activeFarmDistrict
                    let label = `${d.district} (${d.market_count} mandis)`
                    if (isLive) {
                      label = `📍 ${d.district} (Live Location)`
                    } else if (isFarm) {
                      label = `🏡 ${d.district} (Farm - ${d.market_count} mandis)`
                    }
                    return (
                      <SelectItem key={d.district} value={d.district}>
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Price Trend */}
            <div>
              <label className="text-[11px] font-medium uppercase text-neutral-500 mb-1 block">
                Price Trend
              </label>
              <Select value={selectedTrend} onValueChange={(val) => { setSelectedTrend(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Trends" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trends</SelectItem>
                  {PRICE_TRENDS.slice(1).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trading Channel */}
            <div>
              <label className="text-[11px] font-medium uppercase text-neutral-500 mb-1 block">
                Trading Channel
              </label>
              <Select value={selectedChannel} onValueChange={(val) => { setSelectedChannel(val); setPage(1); }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {TRADING_CHANNELS.slice(1).map((ch) => (
                    <SelectItem key={ch} value={ch}>
                      {ch.length > 24 ? ch.slice(0, 22) + '..' : ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Multi-Tab Navigation ────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-neutral-100 p-1 rounded-lg">
          <TabsTrigger value="mandi-rates" className="text-xs sm:text-sm font-medium">
            <Store className="mr-1.5 h-4 w-4" />
            Mandi Price Board ({totalRecords})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm font-medium">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            Visual Analytics & Trends
          </TabsTrigger>
          <TabsTrigger value="district-summary" className="text-xs sm:text-sm font-medium">
            <MapPin className="mr-1.5 h-4 w-4" />
            District-Wise Summary
          </TabsTrigger>
          <TabsTrigger value="msp-benchmarks" className="text-xs sm:text-sm font-medium">
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Official MSP Benchmarks ({mspBenchmarks.length})
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: MANDI PRICE BOARD ────────────────────────────────── */}
        <TabsContent value="mandi-rates" className="space-y-4">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand" />
                  {selectedDistrict !== 'all'
                    ? `Live Mandi & Procurement Rates — ${selectedDistrict}`
                    : 'Live AP Mandi & Procurement Rates'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing page {page} of {totalPages} ({totalRecords.toLocaleString('en-IN')} total transactions {selectedDistrict !== 'all' ? `in ${selectedDistrict}` : 'matching filters'})
                </CardDescription>
              </div>

              {/* Sorting & Limit Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span>Sort:</span>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reporting_date">Latest Date</SelectItem>
                      <SelectItem value="modal_price">Modal Price</SelectItem>
                      <SelectItem value="arrival_quantity">Arrival Volume</SelectItem>
                      <SelectItem value="crop">Commodity Name</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    title={`Current: ${sortOrder.toUpperCase()}`}
                  >
                    {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </Button>
                </div>

                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <span>Rows:</span>
                  <Select value={String(limit)} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
                    <SelectTrigger className="h-8 text-xs w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {pricesLoading ? (
                <div className="py-12">
                  <PageLoader label="Fetching filtered mandi rates..." />
                </div>
              ) : prices.length === 0 ? (
                <EmptyState
                  title="No market records match criteria"
                  description="Try clearing search keywords or selecting a broader district or commodity."
                  action={
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      Reset Filters
                    </Button>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                        <th className="py-3 px-3">Commodity & Variety</th>
                        <th className="py-3 px-3">Mandi / Market Center</th>
                        <th className="py-3 px-3">Location</th>
                        <th className="py-3 px-3 text-right">Modal Rate</th>
                        <th className="py-3 px-3 text-center">Min — Max Spread</th>
                        <th className="py-3 px-3 text-right">Arrivals</th>
                        <th className="py-3 px-3 text-center">Trend</th>
                        <th className="py-3 px-3 text-center">Trading Channel</th>
                        <th className="py-3 px-3 text-right">MSP Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {prices.map((item, idx) => {
                        const isBullish = item.price_trend?.includes('Bullish')
                        const isBearish = item.price_trend?.includes('Bearish')
                        const isAboveMSP = item.msp_diff_pct !== undefined && item.msp_diff_pct !== null && item.msp_diff_pct > 0

                        return (
                          <tr key={`${item.crop}-${item.market}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                            {/* Commodity & Variety */}
                            <td className="py-3 px-3">
                              <div className="font-semibold text-neutral-900">{item.crop}</div>
                              <div className="text-xs text-neutral-500 truncate max-w-[170px]" title={item.variety}>
                                {item.variety || 'Standard Variety'}
                              </div>
                              {item.grade && (
                                <span className="inline-block mt-0.5 text-[10px] font-medium text-neutral-400">
                                  {item.grade}
                                </span>
                              )}
                            </td>

                            {/* Market Center Name */}
                            <td className="py-3 px-3">
                              <div className="font-medium text-neutral-800 line-clamp-1" title={item.market}>
                                {item.market}
                              </div>
                              <span className="text-[11px] text-neutral-500">{item.market_type || 'APMC Yard'}</span>
                            </td>

                            {/* Location */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 text-xs font-medium text-neutral-700">
                                <MapPin className="h-3 w-3 text-neutral-400 flex-shrink-0" />
                                <span>{item.district}</span>
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                {item.mandal ? `${item.mandal}` : ''}
                                {item.village ? ` · ${item.village}` : ''}
                              </div>
                            </td>

                            {/* Modal Price */}
                            <td className="py-3 px-3 text-right">
                              <div className="font-bold text-neutral-900">
                                {formatCurrency(item.modal_price_rs_qtl || item.price_per_tonne / 10)}
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                / Quintal
                              </div>
                              <div className="text-[10px] font-medium text-neutral-500">
                                ({formatCurrency(item.price_per_tonne)}/t)
                              </div>
                            </td>

                            {/* Min - Max Spread */}
                            <td className="py-3 px-3">
                              <div className="text-center text-xs font-medium text-neutral-700">
                                ₹{item.min_price_rs_qtl?.toLocaleString('en-IN')} — ₹{item.max_price_rs_qtl?.toLocaleString('en-IN')}
                              </div>
                              {/* Range Visualizer Bar */}
                              {item.min_price_rs_qtl && item.max_price_rs_qtl && item.modal_price_rs_qtl && item.max_price_rs_qtl > item.min_price_rs_qtl && (
                                <div className="mx-auto mt-1 h-1.5 w-28 rounded-full bg-neutral-200 relative overflow-hidden">
                                  <div
                                    className="absolute top-0 bottom-0 bg-brand rounded-full"
                                    style={{
                                      left: '0%',
                                      width: '100%',
                                    }}
                                  />
                                </div>
                              )}
                            </td>

                            {/* Arrival Quantity */}
                            <td className="py-3 px-3 text-right">
                              <div className="font-semibold text-neutral-800">
                                {item.arrival_quantity_qtl?.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[11px] text-neutral-400">Qtl</div>
                            </td>

                            {/* Trend */}
                            <td className="py-3 px-3 text-center">
                              {isBullish ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                                  <TrendingUp className="h-3 w-3" />
                                  Bullish
                                </span>
                              ) : isBearish ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60">
                                  <TrendingDown className="h-3 w-3" />
                                  Bearish
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
                                  <Minus className="h-3 w-3" />
                                  Stable
                                </span>
                              )}
                            </td>

                            {/* Channel */}
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant={item.trading_channel?.includes('e-NAM') ? 'info' : 'outline'}
                                className="text-[10px] font-medium"
                              >
                                {item.trading_channel?.includes('e-NAM')
                                  ? 'e-NAM'
                                  : item.trading_channel?.includes('Rythu')
                                  ? 'Rythu Bazar'
                                  : item.trading_channel?.includes('FPO')
                                  ? 'FPO Gate'
                                  : 'APMC Open'}
                              </Badge>
                            </td>

                            {/* MSP Diff */}
                            <td className="py-3 px-3 text-right">
                              {item.msp_diff_pct !== null && item.msp_diff_pct !== undefined ? (
                                <span
                                  className={`inline-block font-semibold text-xs ${
                                    isAboveMSP ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {item.msp_diff_pct > 0 ? `+${item.msp_diff_pct}%` : `${item.msp_diff_pct}%`}
                                  <span className="block text-[10px] text-neutral-400 font-normal">vs MSP</span>
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200 pt-4 mt-4">
                  <div className="text-xs text-neutral-500">
                    Showing <span className="font-semibold text-neutral-800">{(page - 1) * limit + 1}</span> to{' '}
                    <span className="font-semibold text-neutral-800">{Math.min(page * limit, totalRecords)}</span> of{' '}
                    <span className="font-semibold text-neutral-800">{totalRecords.toLocaleString('en-IN')}</span> records
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || pricesLoading}
                      className="h-8 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-xs font-medium px-2 text-neutral-700">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || pricesLoading}
                      className="h-8 text-xs"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: VISUAL ANALYTICS & CHARTS ───────────────────────── */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Highest Traded Commodities by Volume */}
            <Card className="border-neutral-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4 text-brand" />
                  {selectedDistrict !== 'all'
                    ? `Top Commodities in ${selectedDistrict} by Arrivals (Thousand Qtl)`
                    : 'Top Commodities by Market Arrivals (Thousand Quintals)'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedDistrict !== 'all'
                    ? `Largest physical supply arrival volumes recorded inside ${selectedDistrict} mandis`
                    : 'Largest physical supply arrival volumes across Andhra Pradesh mandis'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCommoditiesVolumeData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8e1" />
                      <XAxis dataKey="commodity" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: number) => [`${val.toLocaleString('en-IN')}k Qtl`, 'Arrival Volume']}
                        labelFormatter={(label) => `Commodity: ${label}`}
                      />
                      <Bar dataKey="arrivals" fill="#1e7a3a" radius={[4, 4, 0, 0]} name="Arrivals (Thousand Qtl)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Top Mandis Price Overview */}
            <Card className="border-neutral-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Store className="h-4 w-4 text-fresh-500" />
                  {selectedDistrict !== 'all'
                    ? `${selectedDistrict} Mandi Hubs — Average Trade Price (₹/Quintal)`
                    : 'Top Mandi Hubs — Average Trade Price (₹/Quintal)'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedDistrict !== 'all'
                    ? `Representative price levels in ${selectedDistrict} agricultural market committees`
                    : 'Representative price levels in major AMC principal and sub-market yards'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMandisSpreadData} margin={{ top: 10, right: 20, left: 0, bottom: 35 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8e1" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Avg Modal Rate']}
                      />
                      <Bar dataKey="avgPrice" fill="#2ea848" radius={[4, 4, 0, 0]} name="Avg Price (₹/Qtl)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 3: Market Price Sentiment Pie */}
            <Card className="border-neutral-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  {selectedDistrict !== 'all'
                    ? `Price Trend Breakdown for ${selectedDistrict}`
                    : 'Price Trend Breakdown across Andhra Pradesh'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedDistrict !== 'all'
                    ? `Sentiment ratio across ${summary?.total_records || 0} mandi transactions in ${selectedDistrict}`
                    : 'Sentiment ratio based on 12,500 daily mandi auction records'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, pct }) => `${name} (${pct}%)`}
                      >
                        {sentimentChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [`${val.toLocaleString('en-IN')} mandis`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 4: Trading Channels Share */}
            <Card className="border-neutral-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  {selectedDistrict !== 'all'
                    ? `Trading Channels Share in ${selectedDistrict}`
                    : 'Trading Channels Volume Share'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedDistrict !== 'all'
                    ? `e-NAM, APMC physical auctions, and Rythu Bazars operating in ${selectedDistrict}`
                    : 'e-NAM electronic auctions, APMC physical auctions, and Rythu Bazars'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {channelChartData.map((_, index) => (
                          <Cell key={`cell-ch-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [`${val.toLocaleString('en-IN')} auctions`, 'Transactions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 3: DISTRICT-WISE SUMMARY ───────────────────────────── */}
        <TabsContent value="district-summary" className="space-y-4">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand" />
                {selectedDistrict !== 'all'
                  ? `Aggregated Mandi Commodity Price Indices — ${selectedDistrict}`
                  : 'Aggregated District Commodity Price Indices'}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedDistrict !== 'all'
                  ? `Official commodity arrivals and trade ranges for mandis located in ${selectedDistrict}`
                  : 'Official district-level commodity arrivals and trade ranges derived from the AP Agricultural Marketing department'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      <th className="py-3 px-3">District</th>
                      <th className="py-3 px-3">Commodity</th>
                      <th className="py-3 px-3 text-right">Transactions</th>
                      <th className="py-3 px-3 text-right">Total Arrivals (Qtl)</th>
                      <th className="py-3 px-3 text-right">Avg Modal Price</th>
                      <th className="py-3 px-3 text-right">Min Trade Price</th>
                      <th className="py-3 px-3 text-right">Max Trade Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {districtSummaries.slice(0, 100).map((d, i) => (
                      <tr key={`${d.district}-${d.commodity_name}-${i}`} className="hover:bg-neutral-50/80">
                        <td className="py-2.5 px-3 font-medium text-neutral-900">{d.district}</td>
                        <td className="py-2.5 px-3 text-neutral-800">{d.commodity_name}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">{d.record_count}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-neutral-900">
                          {d.total_arrivals_qtl.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-brand">
                          ₹{d.avg_modal_price_rs_qtl.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">
                          ₹{d.min_trade_price.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">
                          ₹{d.max_trade_price.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: OFFICIAL MSP BENCHMARKS ─────────────────────────── */}
        <TabsContent value="msp-benchmarks" className="space-y-4">
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Official Minimum Support Price (MSP) & Benchmark Guidelines
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedDistrict !== 'all'
                  ? `Reference safety thresholds set by the Government of India compared against current modal prices in ${selectedDistrict}`
                  : 'Reference safety thresholds set by the Government of India (2024-25 / 2025-26) and AP Market Intervention Scheme compared against current mandi modal prices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      <th className="py-3 px-3">Commodity</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Official MSP (₹/Qtl)</th>
                      <th className="py-3 px-3 text-right">
                        {selectedDistrict !== 'all' ? `${selectedDistrict} Mandi Avg` : 'Current AP Mandi Avg'}
                      </th>
                      <th className="py-3 px-3 text-center">Market Spread</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3">Support Policy Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {mspBenchmarks.map((msp, idx) => {
                      const isAbove = msp.status === 'Above MSP'
                      const isBelow = msp.status === 'Below MSP'

                      return (
                        <tr key={`${msp.commodity_name}-${idx}`} className="hover:bg-neutral-50/80">
                          <td className="py-3 px-3 font-semibold text-neutral-900">{msp.commodity_name}</td>
                          <td className="py-3 px-3 text-xs text-neutral-500">{msp.commodity_group}</td>
                          <td className="py-3 px-3 text-right font-bold text-neutral-900">
                            ₹{msp.msp_price_rs_qtl.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-neutral-900">
                            {msp.avg_market_price_rs_qtl
                              ? `₹${msp.avg_market_price_rs_qtl.toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {msp.diff_pct !== null && msp.diff_pct !== undefined ? (
                              <span
                                className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded ${
                                  isAbove
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isBelow
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {msp.diff_pct > 0 ? `+${msp.diff_pct}%` : `${msp.diff_pct}%`}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              variant={isAbove ? 'success' : isBelow ? 'danger' : 'warning'}
                              className="text-xs font-semibold"
                            >
                              {msp.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-xs text-neutral-600 max-w-xs">{msp.support_mechanism}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg bg-emerald-50/80 border border-emerald-200 p-3 text-xs text-emerald-800">
                <span className="font-semibold">Farmer Advisory Note:</span> If the prevailing mandi open auction rate for any scheduled crop is below the designated MSP floor, farmers are eligible to register at designated Village Rythu Bharosa Kendras (RBKs) and FCI/MARKFED procurement centers for procurement at guaranteed MSP.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
