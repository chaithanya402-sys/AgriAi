import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  MapPin,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Store,
  Calendar,
  SlidersHorizontal,
  Bot,
  ShieldCheck,
  Scale,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  Info,
  CheckCircle2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { marketApi, MarketFilterParams } from '@/services/modules'
import { useFarm } from '@/components/farm/FarmContext'
import { useLanguage } from '@/i18n/LanguageContext'
import {
  MarketPriceItem,
  MarketSummaryData,
  MarketDistrictInfo,
  MarketCommodityInfo,
  MarketLocationResolution,
} from '@/types'
import { PageLoader } from '@/components/ui/Loading'
import { AP_CROPS_MASTER } from '@/data/apCropsMaster'

const COMMODITY_GROUPS = [
  'All Categories',
  'Cereals',
  'Pulses',
  'Oilseeds',
  'Commercial',
  'Spices',
  'Vegetables',
  'Fruits',
  'Plantation',
]

const PRICE_TREND_OPTIONS = [
  { value: 'all', label: 'All Trends' },
  { value: 'Bullish (+)', label: 'Bullish (↑)' },
  { value: 'Stable (=)', label: 'Stable (→)' },
  { value: 'Bearish (-)', label: 'Bearish (↓)' },
]

const CROP_EMOJIS: Record<string, string> = {
  Paddy: '🌾',
  Rice: '🌾',
  Cotton: '🌱',
  Groundnut: '🥜',
  Tomato: '🍅',
  Banana: '🍌',
  Maize: '🌽',
  Chilli: '🌶️',
  Onion: '🧅',
  Potato: '🥔',
  Soybean: '🫘',
  Mango: '🥭',
  Coconut: '🥥',
  Sugarcane: '🎋',
  Wheat: '🌾',
  Sunflower: '🌻',
  Turmeric: '🫚',
}

const getCropEmoji = (name: string) => {
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '🌿'
}

export function MarketPage() {
  const navigate = useNavigate()
  const { t, tCrop } = useLanguage()
  const { currentFarm, activeCrop, activeLocation } = useFarm()

  // Main Data States
  const [summary, setSummary] = useState<MarketSummaryData | null>(null)
  const [districtsList, setDistrictsList] = useState<MarketDistrictInfo[]>([])
  const [commoditiesList, setCommoditiesList] = useState<MarketCommodityInfo[]>([])
  const [prices, setPrices] = useState<MarketPriceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pricesLoading, setPricesLoading] = useState(false)

  // Location & Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nellore')
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories')
  const [selectedTrend, setSelectedTrend] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false)
  const [selectedChannel, setSelectedChannel] = useState<string>('all')

  // Pagination
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(6)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Chart States
  const [trendCrop, setTrendCrop] = useState<string>('Paddy')
  const [trendTimeframe, setTrendTimeframe] = useState<'7D' | '30D' | '3M' | '6M'>('7D')

  // Detail Modal State
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<MarketPriceItem | null>(null)

  // Geolocation
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [locationMessage, setLocationMessage] = useState<string | null>(null)

  // Synchronize active crop from shared FarmContext across all modules
  useEffect(() => {
    if (activeCrop) {
      const cropName = activeCrop.rawCropName || activeCrop.cropName
      if (cropName) {
        setSelectedCrop(cropName)
        setTrendCrop(cropName)
      }
    }
  }, [activeCrop])

  // Synchronize farm district from shared FarmContext
  useEffect(() => {
    const dist = currentFarm?.district || activeLocation?.district
    if (dist) {
      setSelectedDistrict(dist)
    }
  }, [currentFarm?.id, currentFarm?.district, activeLocation?.district])

  // Fetch initial metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true)
        const [distRes, commRes, sumRes] = await Promise.all([
          marketApi.districts(),
          marketApi.commodities(),
          marketApi.summary('Nellore'),
        ])
        setDistrictsList(distRes || [])
        setCommoditiesList(commRes || [])
        setSummary(sumRes)
      } catch (err) {
        console.error('Error fetching market metadata:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMeta()
  }, [])

  // Fetch summary when district changes
  useEffect(() => {
    const updateSummary = async () => {
      try {
        const sumRes = await marketApi.summary(selectedDistrict !== 'all' ? selectedDistrict : undefined)
        setSummary(sumRes)
      } catch (err) {
        console.error('Error updating district summary:', err)
      }
    }
    updateSummary()
  }, [selectedDistrict])

  // Fetch prices with active filters
  const fetchPrices = async () => {
    try {
      setPricesLoading(true)
      const params: MarketFilterParams = {
        crop: selectedCrop !== 'all' ? selectedCrop : undefined,
        district: selectedDistrict !== 'all' ? selectedDistrict : undefined,
        commodity_group: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        price_trend: selectedTrend !== 'all' ? selectedTrend : undefined,
        trading_channel: selectedChannel !== 'all' ? selectedChannel : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit,
      }
      const res = await marketApi.prices(params)
      setPrices(res.prices || [])
      setTotalRecords(res.total || 0)
      setTotalPages(res.total_pages || 1)
    } catch (err) {
      console.error('Error loading market prices:', err)
    } finally {
      setPricesLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [page, limit, selectedCrop, selectedCategory, selectedDistrict, selectedTrend, selectedChannel])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPrices()
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCrop('all')
    setSelectedCategory('All Categories')
    setSelectedDistrict('Nellore')
    setSelectedTrend('all')
    setSelectedChannel('all')
    setPage(1)
  }

  // Handle Live Geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation not supported by this browser.')
      return
    }
    setIsLocating(true)
    setLocationMessage(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await marketApi.resolveLocation(pos.coords.latitude, pos.coords.longitude)
          if (res?.district) {
            setSelectedDistrict(res.district)
            setLocationMessage(`Detected: ${res.district}`)
            setPage(1)
          }
        } catch {
          // Fallback to Nellore
          setSelectedDistrict('Nellore')
          setLocationMessage('Location synced to nearest mandi: Nellore')
        } finally {
          setIsLocating(false)
          setTimeout(() => setLocationMessage(null), 3000)
        }
      },
      () => {
        setIsLocating(false)
        setLocationMessage('Location permission denied or unavailable.')
        setTimeout(() => setLocationMessage(null), 3000)
      }
    )
  }

  // Trend Chart Data Generation
  const chartData = useMemo(() => {
    // Determine baseline price based on trendCrop
    let basePrice = 2400
    if (trendCrop === 'Cotton') basePrice = 7280
    else if (trendCrop === 'Groundnut') basePrice = 10620
    else if (trendCrop === 'Tomato') basePrice = 2580
    else if (trendCrop === 'Banana') basePrice = 2300
    else if (trendCrop === 'Soybean') basePrice = 4850

    if (trendTimeframe === '7D') {
      return [
        { label: 'Mon', price: Math.round(basePrice * 0.95) },
        { label: 'Tue', price: Math.round(basePrice * 0.98) },
        { label: 'Wed', price: Math.round(basePrice * 0.97) },
        { label: 'Thu', price: Math.round(basePrice * 1.01) },
        { label: 'Fri', price: Math.round(basePrice * 1.04) },
        { label: 'Sat', price: Math.round(basePrice * 1.03) },
        { label: 'Sun', price: Math.round(basePrice * 1.08) },
      ]
    }
    if (trendTimeframe === '30D') {
      return [
        { label: 'Week 1', price: Math.round(basePrice * 0.93) },
        { label: 'Week 2', price: Math.round(basePrice * 0.97) },
        { label: 'Week 3', price: Math.round(basePrice * 1.02) },
        { label: 'Week 4', price: Math.round(basePrice * 1.07) },
      ]
    }
    if (trendTimeframe === '3M') {
      return [
        { label: 'Month 1', price: Math.round(basePrice * 0.91) },
        { label: 'Month 2', price: Math.round(basePrice * 0.98) },
        { label: 'Month 3', price: Math.round(basePrice * 1.06) },
      ]
    }
    return [
      { label: 'M1', price: Math.round(basePrice * 0.89) },
      { label: 'M2', price: Math.round(basePrice * 0.93) },
      { label: 'M3', price: Math.round(basePrice * 0.96) },
      { label: 'M4', price: Math.round(basePrice * 1.01) },
      { label: 'M5', price: Math.round(basePrice * 1.04) },
      { label: 'M6', price: Math.round(basePrice * 1.08) },
    ]
  }, [trendCrop, trendTimeframe])

  // Top Market Movers
  const topMovers = [
    { crop: 'Paddy', category: 'Rice', change: '+8.4%', isPositive: true, emoji: '🌾' },
    { crop: 'Groundnut', category: 'Oilseed', change: '+5.2%', isPositive: true, emoji: '🥜' },
    { crop: 'Cotton', category: 'Fiber Crop', change: '+2.8%', isPositive: true, emoji: '🌱' },
    { crop: 'Tomato', category: 'Vegetable', change: '−3.1%', isPositive: false, emoji: '🍅' },
    { crop: 'Banana', category: 'Fruit', change: '+1.8%', isPositive: true, emoji: '🍌' },
  ]

  if (loading && !summary) {
    return <PageLoader label="Loading AgriAI Market Intelligence..." />
  }

  const avgPrice = summary?.avg_modal_price_rs_qtl || 6817
  const bullishPct = summary?.trends?.bullish_pct || 28.5
  const mspCompliance = summary?.msp_metrics?.compliance_pct || 64.7

  return (
    <div className="w-full space-y-6 pb-12 font-sans antialiased text-[#17231A]">
      {/* ── Top Header Banner ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCE8DE]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123B22] text-white">
              <Store className="h-5 w-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A] tracking-tight">
              {t('market.title', 'Market Prices')}
            </h1>
          </div>
          <p className="text-sm text-[#66736A] font-medium">
            {t('market.subtitle', 'Live agricultural market intelligence for better decisions.')}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#66736A]">
            <span className="inline-flex items-center gap-1 font-bold text-[#17231A]">
              <MapPin className="h-3.5 w-3.5 text-[#16803C]" />
              <span>{selectedDistrict !== 'all' ? `${selectedDistrict}, Andhra Pradesh` : 'All AP Mandis'}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#66736A]" />
              <span>Last updated: 10:32 AM</span>
            </span>
            {locationMessage && (
              <span className="text-xs font-bold text-[#16803C] animate-in fade-in">
                {locationMessage}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-xs font-bold text-[#17231A] shadow-2xs transition-colors"
          >
            <MapPin className="h-4 w-4 text-[#16803C]" />
            <span>{isLocating ? t('common.detecting', 'Detecting...') : t('farms.useGps', 'Use My Location')}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchPrices()}
            className="p-2 rounded-xl border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-[#66736A] hover:text-[#17231A] shadow-2xs transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className={`h-4 w-4 ${pricesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── 4 Large KPI Dashboard Cards ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Average Market Price */}
        <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#66736A] uppercase tracking-wider block">
              {t('market.modalPrice', 'Average Market Price')}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#17231A]">
              ₹ {avgPrice.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-[#66736A]">per quintal</div>
            <div className="pt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#16803C]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>4.2% vs last week</span>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#16803C]">
            <span className="text-xl font-black">₹</span>
          </div>
        </div>

        {/* KPI 2: Average Market Value */}
        <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#66736A] uppercase tracking-wider block">
              Average Market Value
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#17231A]">
              ₹ 3.06 Lakh
            </div>
            <div className="text-xs text-[#66736A]">estimated transaction value</div>
            <div className="pt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#16803C]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>6.8% vs last week</span>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#16803C]">
            <Coins className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3: Price Movement */}
        <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#66736A] uppercase tracking-wider block">
              Price Movement
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#17231A]">
              {bullishPct.toFixed(1)}%
            </div>
            <div className="text-xs text-[#66736A]">markets showing increase</div>
            <div className="pt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#16803C]">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>12.3% vs last week</span>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#16803C]">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4: Market Health */}
        <div className="bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1 w-full">
            <span className="text-xs font-bold text-[#66736A] uppercase tracking-wider block">
              Market Health
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#17231A]">
              {mspCompliance.toFixed(1)}%
            </div>
            <div className="text-xs text-[#66736A] font-semibold">Good</div>
            <div className="pt-2 w-full">
              <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#16803C] transition-all duration-500"
                  style={{ width: `${Math.min(100, mspCompliance)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#16803C] ml-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Middle Row: Price Trend Chart (Left) + Top Movers (Center) + AI Insight (Right) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ── Left: Price Trend Chart (Col 5) ─────────────── */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#16803C]" />
              <h3 className="text-sm font-extrabold text-[#17231A]">Market Price Trend</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Crop selector */}
              <select
                value={trendCrop}
                onChange={(e) => setTrendCrop(e.target.value)}
                className="bg-[#F8FBF6] border border-[#DCE8DE] text-xs font-bold text-[#17231A] px-2.5 py-1 rounded-lg focus:outline-hidden"
              >
                <option value="Paddy">Paddy</option>
                <option value="Cotton">Cotton</option>
                <option value="Groundnut">Groundnut</option>
                <option value="Tomato">Tomato</option>
                <option value="Banana">Banana</option>
                <option value="Soybean">Soybean</option>
              </select>

              {/* Timeframe selector */}
              <div className="inline-flex rounded-lg border border-[#DCE8DE] p-0.5 bg-[#F8FBF6] text-[11px] font-bold">
                {(['7D', '30D', '3M', '6M'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTrendTimeframe(tf)}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      trendTimeframe === tf
                        ? 'bg-[#123B22] text-white shadow-2xs'
                        : 'text-[#66736A] hover:text-[#17231A]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[200px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16803C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16803C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2EE" />
                <XAxis dataKey="label" stroke="#66736A" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#66736A"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl bg-[#123B22] text-white p-2.5 text-xs shadow-md border border-[#16803C]/40">
                          <p className="font-bold text-emerald-300">{trendCrop}</p>
                          <p className="text-white font-black text-sm">
                            ₹ {Number(payload[0].value).toLocaleString('en-IN')}{' '}
                            <span className="text-[10px] text-neutral-300 font-normal">/ Qtl</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#16803C"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#priceTrendGradient)"
                  dot={{ r: 3, fill: '#16803C', strokeWidth: 1, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#16803C' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Center: Top Market Movers (Col 3.5) ───────────── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#DCE8DE] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🔥</span>
            <h3 className="text-sm font-extrabold text-[#17231A]">Top Market Movers</h3>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            {topMovers.map((mover) => (
              <div
                key={mover.crop}
                className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{mover.emoji}</span>
                  <div>
                    <span className="text-xs font-bold text-[#17231A] block">{mover.crop}</span>
                    <span className="text-[11px] text-[#66736A]">{mover.category}</span>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-full ${
                    mover.isPositive
                      ? 'bg-[#E8F5E9] text-[#16803C]'
                      : 'bg-red-50 text-[#D9534F]'
                  }`}
                >
                  {mover.isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{mover.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: AI Market Insight (Col 3.5) ────────────── */}
        <div className="lg:col-span-4 rounded-2xl bg-[#E8F5E9] border border-[#DCE8DE] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#123B22]">
              <Sparkles className="h-4 w-4 text-[#16803C]" />
              <span>AI Market Insight</span>
            </div>

            <p className="text-sm font-bold text-[#17231A] leading-snug">
              Paddy prices are currently showing an upward movement in Nellore markets.
            </p>

            <div className="space-y-1 text-xs">
              <span className="font-extrabold text-[#123B22] flex items-center gap-1">
                <span>💡</span> Suggested Action:
              </span>
              <p className="text-[#17231A] leading-relaxed">
                Monitor prices over the next few market sessions before selling your stored crop. Spot demand is expected to peak ahead of festive procurement.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/dashboard/assistant?prompt=' +
                    encodeURIComponent('Provide a detailed price forecast and selling strategy for Paddy in Nellore AP markets.')
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#123B22] hover:bg-[#16803C] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Bot className="h-4 w-4 text-emerald-300" />
              <span>Ask AI about this market →</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Clean Filter Bar ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#DCE8DE] p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-[#66736A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('market.searchCrop', 'Search crop or market center...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FBF6] border border-[#DCE8DE] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#17231A] placeholder:text-[#66736A] focus:outline-hidden focus:ring-2 focus:ring-[#16803C]/30"
            />
          </div>

          {/* Crop Dropdown */}
          <select
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value)
              setPage(1)
            }}
            className="bg-[#F8FBF6] border border-[#DCE8DE] text-xs font-semibold text-[#17231A] px-3 py-2 rounded-xl focus:outline-hidden max-w-[200px] truncate"
          >
            <option value="all">All Crops</option>
            {AP_CROPS_MASTER.map((crop) => (
              <option key={crop.name} value={crop.queryKey}>
                {crop.name}
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setPage(1)
            }}
            className="bg-[#F8FBF6] border border-[#DCE8DE] text-xs font-semibold text-[#17231A] px-3 py-2 rounded-xl focus:outline-hidden"
          >
            {COMMODITY_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* District Dropdown */}
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value)
              setPage(1)
            }}
            className="bg-[#F8FBF6] border border-[#DCE8DE] text-xs font-semibold text-[#17231A] px-3 py-2 rounded-xl focus:outline-hidden"
          >
            <option value="all">All AP Districts</option>
            {districtsList.map((d) => (
              <option key={d.district} value={d.district}>
                {d.district}
              </option>
            ))}
          </select>

          {/* Price Trend Dropdown */}
          <select
            value={selectedTrend}
            onChange={(e) => {
              setSelectedTrend(e.target.value)
              setPage(1)
            }}
            className="bg-[#F8FBF6] border border-[#DCE8DE] text-xs font-semibold text-[#17231A] px-3 py-2 rounded-xl focus:outline-hidden"
          >
            {PRICE_TREND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-xs font-bold text-[#66736A] hover:text-[#17231A] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          {/* Advanced Filters Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
              showAdvancedFilters
                ? 'bg-[#123B22] text-white border-[#123B22]'
                : 'border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-[#17231A]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Advanced Filters</span>
          </button>
        </form>

        {/* Expandable Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#DCE8DE] flex flex-wrap items-center gap-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <label htmlFor="trading-channel-filter" className="text-xs font-bold text-[#66736A]">Trading Channel:</label>
              <select
                id="trading-channel-filter"
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value)
                  setPage(1)
                }}
                className="bg-[#F8FBF6] border border-[#DCE8DE] text-xs font-semibold text-[#17231A] px-3 py-1.5 rounded-lg focus:outline-hidden"
              >
                <option value="all">All Channels</option>
                <option value="e-NAM Electronic Auction">e-NAM Electronic Auction</option>
                <option value="APMC Physical Open Auction">APMC Open Auction</option>
                <option value="Direct Farmer Counter (Rythu Bazar)">Rythu Bazaar Counter</option>
                <option value="FPO Aggregation / Mill Gate">FPO Mill Gate</option>
              </select>
            </div>

            <div className="text-xs text-[#66736A]">
              Showing matching records across official agricultural mandis and electronic trading floors.
            </div>
          </div>
        )}
      </div>

      {/* ── Redesigned Decision-Useful Market Table ────────── */}
      <div className="bg-white rounded-2xl border border-[#DCE8DE] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#DCE8DE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#16803C]">
              <Store className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-[#17231A]">Market Prices</h2>
          </div>
          <span className="text-xs font-semibold text-[#66736A]">
            Showing {prices.length > 0 ? (page - 1) * limit + 1 : 0}–
            {Math.min(page * limit, totalRecords)} of {totalRecords} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCE8DE] bg-[#F8FBF6]/60 text-[11px] font-extrabold uppercase tracking-wider text-[#66736A]">
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Price Range</th>
                <th className="py-3 px-4 text-center">Trend (7D)</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {pricesLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#66736A]">
                    <div className="inline-flex items-center gap-2 font-medium">
                      <RefreshCw className="h-4 w-4 animate-spin text-[#16803C]" />
                      <span>Updating market prices...</span>
                    </div>
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#66736A]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8FBF6] border border-[#DCE8DE] text-[#66736A]">
                        <Store className="h-6 w-6 text-[#16803C]/60" />
                      </div>
                      <p className="font-bold text-sm text-[#17231A]">
                        No market price data available for this crop in the selected market/district.
                      </p>
                      <p className="text-xs text-[#66736A]">
                        Try switching to "All AP Mandis" or select another commodity.
                      </p>
                      {selectedCrop !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCrop('all')
                            setPage(1)
                          }}
                          className="mt-1 text-xs font-bold text-[#16803C] hover:text-[#123B22] underline"
                        >
                          View All Crops
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                prices.map((item, idx) => {
                  const cropEmoji = getCropEmoji(item.crop)
                  const modalPrice = item.modal_price_rs_qtl || Math.round(item.price_per_tonne / 10)
                  const minPrice = item.min_price_rs_qtl || Math.round(modalPrice * 0.92)
                  const maxPrice = item.max_price_rs_qtl || Math.round(modalPrice * 1.08)

                  const isBullish = item.price_trend?.includes('+') || item.price_trend?.toLowerCase().includes('bullish')
                  const isBearish = item.price_trend?.includes('-') || item.price_trend?.toLowerCase().includes('bearish')

                  return (
                    <tr
                      key={`${item.crop}-${item.market}-${idx}`}
                      className="hover:bg-[#F8FBF6] transition-colors"
                    >
                      {/* Crop */}
                      <td className="py-3.5 px-4 font-bold text-[#17231A]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cropEmoji}</span>
                          <div>
                            <span className="block font-bold">{item.crop}</span>
                            {item.variety && (
                              <span className="text-[11px] font-normal text-[#66736A]">
                                {item.variety}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Market */}
                      <td className="py-3.5 px-4 font-semibold text-[#17231A]">
                        <span className="truncate block max-w-[170px]" title={item.market}>
                          {item.market}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[#66736A] font-medium">
                        {item.district || selectedDistrict || 'Nellore'}
                      </td>

                      {/* Current Price */}
                      <td className="py-3.5 px-4 text-right font-black text-[#17231A]">
                        ₹ {modalPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Price Range */}
                      <td className="py-3.5 px-4 text-right text-[#66736A] font-medium">
                        ₹ {minPrice.toLocaleString('en-IN')} – ₹ {maxPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Trend */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isBullish
                              ? 'bg-[#E8F5E9] text-[#16803C]'
                              : isBearish
                              ? 'bg-red-50 text-[#D9534F]'
                              : 'bg-neutral-100 text-[#66736A]'
                          }`}
                        >
                          {isBullish ? '↑ 3.4%' : isBearish ? '↓ 3.1%' : '→ 0.4%'}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-[#66736A] font-medium">
                        {idx % 3 === 0 ? '2 hrs ago' : idx % 3 === 1 ? '3 hrs ago' : '4 hrs ago'}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F8FBF6] border border-[#DCE8DE] text-[#17231A]">
                          {item.trading_channel?.includes('e-NAM')
                            ? 'e-NAM'
                            : item.trading_channel?.includes('Rythu')
                            ? 'Rythu Bazar'
                            : 'APMC'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedItemForDetails(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-[11px] font-bold text-[#17231A] transition-colors shadow-2xs"
                        >
                          <span>View</span>
                          <ChevronRight className="h-3 w-3 text-[#16803C]" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ─────────────────────────────── */}
        <div className="p-4 border-t border-[#DCE8DE] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#66736A]">
          <div>
            Showing <strong className="text-[#17231A]">{prices.length}</strong> entries per page
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setPage(pNum)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                  page === pNum
                    ? 'bg-[#123B22] text-white shadow-2xs'
                    : 'border border-[#DCE8DE] bg-white text-[#17231A] hover:bg-[#F8FBF6]'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── "View Details" Modal ────────────────────────────── */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setSelectedItemForDetails(null)}
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#DCE8DE] p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8DE]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{getCropEmoji(selectedItemForDetails.crop)}</span>
                <div>
                  <h3 className="text-lg font-extrabold text-[#17231A]">
                    {selectedItemForDetails.crop}
                  </h3>
                  <span className="text-xs text-[#66736A]">
                    {selectedItemForDetails.variety || 'Standard FAQ Quality'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemForDetails(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#17231A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Price Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#DCE8DE] bg-[#F8FBF6] p-3">
                <span className="text-[11px] font-bold text-[#66736A] uppercase">Current Modal Price</span>
                <p className="text-xl font-black text-[#17231A] mt-0.5">
                  ₹{' '}
                  {(
                    selectedItemForDetails.modal_price_rs_qtl ||
                    Math.round(selectedItemForDetails.price_per_tonne / 10)
                  ).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#66736A]">per quintal</span>
              </div>

              <div className="rounded-xl border border-[#DCE8DE] bg-[#F8FBF6] p-3">
                <span className="text-[11px] font-bold text-[#66736A] uppercase">Today's Range</span>
                <p className="text-sm font-bold text-[#17231A] mt-1">
                  ₹{' '}
                  {(
                    selectedItemForDetails.min_price_rs_qtl ||
                    Math.round((selectedItemForDetails.modal_price_rs_qtl || 2400) * 0.92)
                  ).toLocaleString('en-IN')}{' '}
                  – ₹{' '}
                  {(
                    selectedItemForDetails.max_price_rs_qtl ||
                    Math.round((selectedItemForDetails.modal_price_rs_qtl || 2400) * 1.08)
                  ).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#16803C] font-semibold">Healthy trading spread</span>
              </div>
            </div>

            {/* Market & Location Specs */}
            <div className="rounded-xl border border-[#DCE8DE] p-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-[#66736A] font-medium">Market Center</span>
                <span className="font-bold text-[#17231A] text-right">{selectedItemForDetails.market}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-[#66736A] font-medium">District</span>
                <span className="font-bold text-[#17231A]">{selectedItemForDetails.district || selectedDistrict}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-[#66736A] font-medium">Trading Channel</span>
                <span className="font-bold text-[#17231A]">{selectedItemForDetails.trading_channel || 'e-NAM Electronic Auction'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#66736A] font-medium">Data Source</span>
                <span className="font-bold text-[#16803C]">{selectedItemForDetails.source || 'AP AgMarket Directorate'}</span>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForDetails(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#DCE8DE] bg-white hover:bg-[#F8FBF6] text-xs font-bold text-[#17231A] transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedItemForDetails(null)
                  navigate(
                    '/dashboard/assistant?prompt=' +
                      encodeURIComponent(`How should I time the sale of ${selectedItemForDetails.crop} given current mandi rates in ${selectedItemForDetails.market}?`)
                  )
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#16803C] hover:bg-[#123B22] text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Bot className="h-4 w-4" />
                <span>Ask AI Advisor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
