import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Card } from './Card'
import { Badge } from './Badge'
import { colors } from '../theme/colors'
import type { FarmSoilData } from '../types'
import { FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react-native'

interface SoilSummaryCardProps {
  soilData: FarmSoilData | null
  loading: boolean
}

export function SoilSummaryCard({ soilData, loading }: SoilSummaryCardProps) {
  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.brand} />
          <Text style={styles.loadingText}>Retrieving village soil data...</Text>
        </View>
      </Card>
    )
  }

  if (!soilData || !soilData.found) {
    return (
      <Card style={styles.card}>
        <View style={styles.centerContainer}>
          <AlertTriangle size={18} color={colors.warning} />
          <Text style={styles.emptyText}>
            {soilData?.message || 'Soil data is not available for this location.'}
          </Text>
        </View>
      </Card>
    )
  }

  const healthScore = soilData.healthScore ?? 78
  const scoreBadgeVariant =
    healthScore >= 75 ? 'success' : healthScore >= 55 ? 'warning' : 'danger'

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <FlaskConical size={18} color={colors.brand} />
          <Text style={styles.headerTitle}>Soil Analysis & Health</Text>
        </View>
        <Badge
          label={`Health: ${healthScore}/100`}
          variant={scoreBadgeVariant}
          size="sm"
        />
      </View>

      <Text style={styles.dataSourceText}>
        Dataset: {soilData.dataSource || 'Andhra Pradesh Village Soil Record'}
        {soilData.recordCount ? ` (${soilData.recordCount} samples)` : ''}
      </Text>

      {/* Primary Soil Parameters (N, P, K, pH, EC, OC) */}
      <View style={styles.metricGrid}>
        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>Nitrogen (N)</Text>
          <Text style={styles.metricValue}>
            {soilData.nitrogen != null ? `${soilData.nitrogen}` : '—'}
          </Text>
          <Text style={styles.metricUnit}>kg/ha</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>Phosphorus (P)</Text>
          <Text style={styles.metricValue}>
            {soilData.phosphorus != null ? `${soilData.phosphorus}` : '—'}
          </Text>
          <Text style={styles.metricUnit}>kg/ha</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>Potassium (K)</Text>
          <Text style={styles.metricValue}>
            {soilData.potassium != null ? `${soilData.potassium}` : '—'}
          </Text>
          <Text style={styles.metricUnit}>kg/ha</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>Soil pH</Text>
          <Text style={styles.metricValue}>
            {soilData.ph != null ? `${soilData.ph}` : '—'}
          </Text>
          <Text style={styles.metricUnit}>pH scale</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>EC (Salinity)</Text>
          <Text style={styles.metricValue}>
            {soilData.ec != null ? `${soilData.ec}` : '—'}
          </Text>
          <Text style={styles.metricUnit}>dS/m</Text>
        </View>

        <View style={styles.metricTile}>
          <Text style={styles.metricLabel}>Organic Carbon</Text>
          <Text style={styles.metricValue}>
            {soilData.organicCarbon != null ? `${soilData.organicCarbon}` : '—'}
          </Text>
          <Text style={styles.metricUnit}>%</Text>
        </View>
      </View>

      {/* Micronutrients row */}
      <View style={styles.microRow}>
        <Text style={styles.microText}>
          Sulfur: <Text style={styles.microBold}>{soilData.sulfur ?? '—'}</Text> ppm · Zinc:{' '}
          <Text style={styles.microBold}>{soilData.zinc ?? '—'}</Text> ppm · Iron:{' '}
          <Text style={styles.microBold}>{soilData.iron ?? '—'}</Text> ppm
        </Text>
        <Text style={styles.microText}>
          Copper: <Text style={styles.microBold}>{soilData.copper ?? '—'}</Text> ppm · Manganese:{' '}
          <Text style={styles.microBold}>{soilData.manganese ?? '—'}</Text> ppm · Boron:{' '}
          <Text style={styles.microBold}>{soilData.boron ?? '—'}</Text> ppm
        </Text>
      </View>

      {/* Soil Type & Fertility Index */}
      {(soilData.soilType || soilData.fertilityIndex) && (
        <View style={styles.metaRow}>
          {soilData.soilType && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaLabel}>Soil Type: </Text>
              <Text style={styles.metaValue}>{soilData.soilType}</Text>
            </View>
          )}
          {soilData.fertilityIndex && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaLabel}>Fertility: </Text>
              <Text style={styles.metaValue}>{soilData.fertilityIndex}</Text>
            </View>
          )}
        </View>
      )}

      {/* Plot-Specific Advisory */}
      {soilData.advisory && (
        <View style={styles.advisoryBox}>
          <CheckCircle2 size={16} color={colors.brand} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.advisoryTitle}>Plot-Specific Advisory</Text>
            <Text style={styles.advisoryText}>{soilData.advisory}</Text>
          </View>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  centerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dataSourceText: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricTile: {
    width: '31%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  metricUnit: {
    fontSize: 9,
    color: colors.textLight,
  },
  microRow: {
    backgroundColor: '#F9FAF9',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 3,
  },
  microText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  microBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    backgroundColor: colors.brandTonal,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
  },
  advisoryBox: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  advisoryText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
})
