import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { agriculturalService } from '../services/agriculturalService'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import type { MarketPriceItem } from '../types'
import { TrendingUp, TrendingDown, Store, AlertCircle } from 'lucide-react-native'

const CROPS = [
  'All',
  'Paddy',
  'Dry Red Chilli',
  'Cotton',
  'Tobacco',
  'Tomato',
  'Maize',
  'Banana',
  'Groundnut (Pods)',
  'Bengal Gram (Chana)',
  'Turmeric',
]

export function MarketPricesScreen() {
  const [selectedCrop, setSelectedCrop] = useState('All')
  const [prices, setPrices] = useState<MarketPriceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const cropQuery = selectedCrop === 'All' ? undefined : selectedCrop
    agriculturalService
      .getMarketPrices(cropQuery)
      .then((res) => {
        setPrices(res.prices || [])
      })
      .catch((err) => {
        console.warn('Market price fetch failed:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [selectedCrop])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Intelligence</Text>
        <Text style={styles.subtitle}>
          Agricultural Mandi Rates · Price Trends
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Crop Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CROPS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setSelectedCrop(c)}
              style={[
                styles.filterChip,
                selectedCrop === c && styles.filterChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCrop === c && styles.filterTextSelected,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <Card style={styles.centerCard}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Fetching market rates...</Text>
          </Card>
        ) : prices.length === 0 ? (
          <Card style={styles.centerCard}>
            <AlertCircle size={24} color={colors.warning} />
            <Text style={styles.emptyTitle}>No Market Rates Found</Text>
            <Text style={styles.emptySub}>
              Try selecting another commodity or refresh.
            </Text>
          </Card>
        ) : (
          prices.map((item, idx) => {
            const isBullish = item.price_trend?.includes('Bullish')
            const isBearish = item.price_trend?.includes('Bearish')
            const qtlPrice = item.modal_price_rs_qtl || Math.round(item.price_per_tonne / 10)

            return (
              <Card key={idx} style={styles.priceCard}>
                <View style={styles.priceTop}>
                  <View style={styles.cropTitleRow}>
                    <View style={styles.iconBox}>
                      <Store size={18} color={colors.brand} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.cropName}>{item.crop}</Text>
                      {item.variety ? (
                        <Text style={styles.varietyText} numberOfLines={1}>
                          {item.variety}
                        </Text>
                      ) : null}
                      <Text style={styles.marketName} numberOfLines={1}>
                        {item.market}
                      </Text>
                      {item.district ? (
                        <Text style={styles.districtText}>
                          📍 {item.district}{item.mandal ? ` · ${item.mandal}` : ''}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.priceColumn}>
                    <Text style={styles.priceVal}>
                      ₹{qtlPrice.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.priceUnit}>per quintal</Text>
                    <Text style={styles.priceTonneSub}>
                      ₹{item.price_per_tonne.toLocaleString('en-IN')}/t
                    </Text>
                  </View>
                </View>

                {item.min_price_rs_qtl && item.max_price_rs_qtl ? (
                  <View style={styles.rangeRow}>
                    <Text style={styles.rangeText}>
                      Range: ₹{item.min_price_rs_qtl.toLocaleString('en-IN')} — ₹{item.max_price_rs_qtl.toLocaleString('en-IN')}
                    </Text>
                    {item.arrival_quantity_qtl ? (
                      <Text style={styles.arrivalText}>
                        Arr: {item.arrival_quantity_qtl.toLocaleString('en-IN')} Qtl
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <Badge
                    label={
                      item.trading_channel?.includes('e-NAM')
                        ? 'e-NAM'
                        : item.trading_channel?.includes('Rythu')
                        ? 'Rythu Bazar'
                        : item.trading_channel?.includes('FPO')
                        ? 'FPO'
                        : item.source === 'demo'
                        ? 'Standard Mandi'
                        : item.source || 'AP AgMarket'
                    }
                    variant={item.trading_channel?.includes('e-NAM') ? 'info' : 'neutral'}
                    size="sm"
                  />

                  {item.msp_diff_pct !== undefined && item.msp_diff_pct !== null ? (
                    <Badge
                      label={`${item.msp_diff_pct > 0 ? '+' : ''}${item.msp_diff_pct}% vs MSP`}
                      variant={item.msp_diff_pct >= 0 ? 'success' : 'warning'}
                      size="sm"
                    />
                  ) : null}

                  <View style={styles.trendRow}>
                    {isBullish ? (
                      <>
                        <TrendingUp size={14} color={colors.fresh500} />
                        <Text style={[styles.trendText, { color: colors.fresh500 }]}>Bullish</Text>
                      </>
                    ) : isBearish ? (
                      <>
                        <TrendingDown size={14} color="#b3402e" />
                        <Text style={[styles.trendText, { color: '#b3402e' }]}>Bearish</Text>
                      </>
                    ) : (
                      <>
                        <TrendingUp size={14} color="#b07a2b" />
                        <Text style={[styles.trendText, { color: '#b07a2b' }]}>Stable</Text>
                      </>
                    )}
                  </View>
                </View>
              </Card>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  centerCard: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  priceCard: {
    padding: 14,
    marginBottom: 8,
  },
  priceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.brandTonal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  marketName: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.deepGreen,
  },
  priceUnit: {
    fontSize: 10,
    color: colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  varietyText: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '500',
  },
  districtText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  priceTonneSub: {
    fontSize: 9,
    color: colors.textMuted,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle || '#f8faf8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  rangeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  arrivalText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.fresh500,
  },
})
