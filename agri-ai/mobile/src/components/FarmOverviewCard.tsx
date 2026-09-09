import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from './Card'
import { Badge } from './Badge'
import { colors } from '../theme/colors'
import type { Farm } from '../types'
import { Home, FileText, MapPin, Compass } from 'lucide-react-native'

interface FarmOverviewCardProps {
  farm: Farm | null
  state?: string | null
  district?: string | null
  mandal?: string | null
  village?: string | null
}

export function FarmOverviewCard({
  farm,
  state,
  district,
  mandal,
  village,
}: FarmOverviewCardProps) {
  if (!farm) {
    return (
      <Card>
        <Text style={styles.emptyText}>No farm selected</Text>
      </Card>
    )
  }

  const farmIdFormatted = `FARM${String(farm.id).padStart(3, '0')}`
  const displayState = state || farm.state || 'Not specified'
  const displayDistrict = district || farm.district || 'Not specified'
  const displayMandal = mandal || farm.mandal || null
  const displayVillage = village || farm.village || null

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Home size={18} color={colors.brand} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.farmName} numberOfLines={1}>
            {farm.name}
          </Text>
          <Text style={styles.farmId}>{farmIdFormatted}</Text>
        </View>
        <Badge label="Active Farm" variant="success" size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.infoRow}>
          <MapPin size={15} color={colors.textMuted} style={styles.rowIcon} />
          <Text style={styles.label}>State:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {displayState}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Compass size={15} color={colors.textMuted} style={styles.rowIcon} />
          <Text style={styles.label}>District:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {displayDistrict}
          </Text>
        </View>

        {displayMandal && (
          <View style={styles.infoRow}>
            <MapPin size={15} color={colors.textMuted} style={styles.rowIcon} />
            <Text style={styles.label}>Mandal:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {displayMandal}
            </Text>
          </View>
        )}

        {displayVillage && (
          <View style={styles.infoRow}>
            <Home size={15} color={colors.textMuted} style={styles.rowIcon} />
            <Text style={styles.label}>Village:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {displayVillage}
            </Text>
          </View>
        )}

        {farm.total_area != null && (
          <View style={styles.infoRow}>
            <FileText size={15} color={colors.textMuted} style={styles.rowIcon} />
            <Text style={styles.label}>Area:</Text>
            <Text style={styles.value}>
              {farm.total_area} {farm.area_unit || 'ha'}
            </Text>
          </View>
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.brandTonal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  farmId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 12,
  },
  grid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    width: 65,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
})
