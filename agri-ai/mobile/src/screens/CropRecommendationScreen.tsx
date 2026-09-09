import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { agriculturalService } from '../services/agriculturalService'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import type { CropRecommendation } from '../types'
import { Sprout, TrendingUp, AlertCircle, ChevronRight, Check } from 'lucide-react-native'

export function CropRecommendationScreen() {
  const { currentFarm, activeLocation, soilData } = useFarm()
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentFarm) return
    setLoading(true)

    // Run crop recommendations based on current farm and soil parameters
    agriculturalService
      .recommendCrops({
        farm_id: currentFarm.id,
        nitrogen: soilData?.nitrogen || 180,
        phosphorus: soilData?.phosphorus || 50,
        potassium: soilData?.potassium || 200,
        temperature: 28,
        humidity: 65,
        ph: soilData?.ph || 7.0,
        rainfall: 1100,
        area: currentFarm.total_area || 1.0,
        state: activeLocation.state || 'Andhra Pradesh',
        district: activeLocation.district || 'Nellore',
      })
      .then((res) => {
        setRecommendations(res.recommendations || [])
      })
      .catch((err) => {
        console.warn('Failed to load crop recommendations:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentFarm?.id, activeLocation.district])

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Crop Recommendation</Text>
        <Text style={styles.subtitle}>
          AI-Ranked for {activeLocation.district || 'Your District'}, {activeLocation.state || 'AP'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Card style={styles.centerCard}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Analyzing soil & regional datasets...</Text>
          </Card>
        ) : recommendations.length === 0 ? (
          <Card style={styles.centerCard}>
            <AlertCircle size={24} color={colors.warning} />
            <Text style={styles.emptyTitle}>No Recommendations Available</Text>
            <Text style={styles.emptySub}>
              Ensure your farm has a valid district and soil parameters assigned.
            </Text>
          </Card>
        ) : (
          recommendations.map((item, idx) => {
            const scorePct = Math.round(item.score * 100)
            const isTop = idx === 0

            return (
              <Card
                key={item.crop}
                style={[styles.cropCard, isTop && styles.topCropCard]}
              >
                <View style={styles.cropHeader}>
                  <View style={styles.cropTitleRow}>
                    <View
                      style={[
                        styles.rankBadge,
                        isTop && styles.topRankBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          isTop && styles.topRankText,
                        ]}
                      >
                        #{idx + 1}
                      </Text>
                    </View>
                    <Text style={styles.cropName}>{item.crop}</Text>
                  </View>

                  <Badge
                    label={`${scorePct}% Match`}
                    variant={scorePct >= 80 ? 'success' : 'primary'}
                    size="sm"
                  />
                </View>

                {/* Reason Explanation */}
                <Text style={styles.cropReason}>{item.reason}</Text>

                {/* Metrics */}
                <View style={styles.metricRow}>
                  {item.expected_yield != null && (
                    <View style={styles.metricTile}>
                      <Text style={styles.metricLabel}>Expected Yield</Text>
                      <Text style={styles.metricVal}>
                        {item.expected_yield} t/ha
                      </Text>
                    </View>
                  )}
                  {item.revenue != null && (
                    <View style={styles.metricTile}>
                      <Text style={styles.metricLabel}>Est. Revenue</Text>
                      <Text style={styles.metricVal}>
                        ₹{(item.revenue / 1000).toFixed(0)}k/ha
                      </Text>
                    </View>
                  )}
                  {item.risk != null && (
                    <View style={styles.metricTile}>
                      <Text style={styles.metricLabel}>Risk Factor</Text>
                      <Text style={styles.metricVal}>
                        {Math.round(item.risk * 100)}%
                      </Text>
                    </View>
                  )}
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
  cropCard: {
    padding: 16,
    marginBottom: 10,
  },
  topCropCard: {
    borderColor: colors.brand,
    borderWidth: 1.5,
    backgroundColor: '#FAFDFB',
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankBadge: {
    backgroundColor: colors.brand,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  topRankText: {
    color: '#FFFFFF',
  },
  cropName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cropReason: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
  },
  metricTile: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
})
