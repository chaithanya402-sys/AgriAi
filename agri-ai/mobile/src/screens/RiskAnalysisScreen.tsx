import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { agriculturalService } from '../services/agriculturalService'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import type { RiskAssessmentResponse } from '../types'
import { Target, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react-native'

export function RiskAnalysisScreen() {
  const { currentFarm, soilData } = useFarm()
  const [loading, setLoading] = useState(true)
  const [riskData, setRiskData] = useState<RiskAssessmentResponse | null>(null)

  useEffect(() => {
    if (!currentFarm) return
    setLoading(true)
    agriculturalService
      .assessRisk({
        farm_id: currentFarm.id,
        crop: 'Paddy',
        weather_risk: 30,
        soil_health_score: soilData?.healthScore || 75,
        water_availability: 80,
        disease_risk: 25,
        price_volatility: 35,
      })
      .then((res) => {
        setRiskData(res)
      })
      .catch((err) => {
        console.warn('Risk assessment failed:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentFarm?.id, soilData?.healthScore])

  const getLevelVariant = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'success'
      case 'moderate':
        return 'warning'
      case 'high':
      case 'critical':
        return 'danger'
      default:
        return 'primary'
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Risk Analysis</Text>
        <Text style={styles.subtitle}>
          Multi-Factor Risk Assessment & Prevention
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Card style={styles.centerCard}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Assessing farm risk factors...</Text>
          </Card>
        ) : !riskData ? (
          <Card style={styles.centerCard}>
            <AlertTriangle size={24} color={colors.warning} />
            <Text style={styles.emptyTitle}>Assessment Unavailable</Text>
          </Card>
        ) : (
          <>
            {/* Overall Risk Score Card */}
            <Card style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroLabel}>Overall Farm Risk</Text>
                  <Text style={styles.heroScore}>
                    {riskData.overall_risk}
                    <Text style={styles.heroMax}> / 100</Text>
                  </Text>
                </View>
                <Badge
                  label={riskData.level}
                  variant={getLevelVariant(riskData.level)}
                  size="md"
                />
              </View>

              <Text style={styles.heroDesc}>
                {riskData.overall_risk <= 40
                  ? 'Farm operational risk is low. Soil, climate, and water conditions are favorable.'
                  : 'Moderate to high risk detected in specific operational areas. Review recommendations.'}
              </Text>
            </Card>

            {/* Risk Factor Breakdown */}
            {riskData.breakdown && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Risk Factor Breakdown</Text>
                {Object.entries(riskData.breakdown).map(([factor, val]) => (
                  <View key={factor} style={styles.factorRow}>
                    <Text style={styles.factorLabel}>
                      {factor.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                    <View style={styles.track}>
                      <View
                        style={[
                          styles.fill,
                          {
                            width: `${Math.min(100, Math.round(val))}%`,
                            backgroundColor:
                              val > 60
                                ? colors.danger
                                : val > 35
                                ? colors.warning
                                : colors.brand,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.factorVal}>{Math.round(val)}%</Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Top Risks */}
            {riskData.top_risks && riskData.top_risks.length > 0 && (
              <Card style={styles.topRisksCard}>
                <Text style={styles.sectionHeading}>Primary Concerns</Text>
                {riskData.top_risks.map((risk, i) => (
                  <View key={i} style={styles.topRiskItem}>
                    <AlertTriangle size={16} color={colors.warning} />
                    <Text style={styles.topRiskText}>{risk}</Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Mitigation Recommendations */}
            {riskData.recommendations && riskData.recommendations.length > 0 && (
              <Card style={styles.recomCard}>
                <Text style={styles.recomHeading}>Actionable Mitigation Steps</Text>
                {riskData.recommendations.map((rec, i) => (
                  <View key={i} style={styles.recItem}>
                    <CheckCircle2 size={16} color={colors.brand} style={{ marginTop: 2 }} />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </Card>
            )}
          </>
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
  heroCard: {
    padding: 16,
    backgroundColor: '#FAFDFB',
    borderColor: colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  heroScore: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroMax: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  heroDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
  sectionCard: {
    padding: 16,
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  factorLabel: {
    width: 120,
    fontSize: 12,
    color: colors.textSecondary,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  factorVal: {
    width: 34,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  topRisksCard: {
    padding: 16,
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  topRiskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  topRiskText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  recomCard: {
    padding: 16,
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  recomHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 10,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 4,
  },
  recText: {
    fontSize: 13,
    color: '#15803D',
    flex: 1,
    lineHeight: 18,
  },
})
