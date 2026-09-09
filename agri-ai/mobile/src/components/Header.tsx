import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors } from '../theme/colors'
import { ChevronDown, Sprout } from 'lucide-react-native'

interface HeaderProps {
  selectedFarmName?: string | null
  onOpenFarmSelect?: () => void
  onPressProfile?: () => void
  userInitial?: string
}

export function Header({
  selectedFarmName,
  onOpenFarmSelect,
  onPressProfile,
  userInitial = 'U',
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Farm Switcher Button on Left */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenFarmSelect}
        style={styles.farmSelectButton}
      >
        <View style={styles.sproutBadge}>
          <Sprout size={16} color={colors.brand} />
        </View>
        <View style={styles.farmNameContainer}>
          <Text style={styles.selectedFarmLabel}>Selected Farm</Text>
          <Text style={styles.farmName} numberOfLines={1}>
            {selectedFarmName || 'Select Farm'}
          </Text>
        </View>
        <ChevronDown size={16} color={colors.textMuted} style={styles.chevron} />
      </TouchableOpacity>

      {/* User profile avatar on Right */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressProfile}
        style={styles.avatarButton}
      >
        <Text style={styles.avatarText}>{userInitial.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  farmSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sproutBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.brandTonal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  farmNameContainer: {
    flexShrink: 1,
  },
  selectedFarmLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
  },
  farmName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    marginLeft: 6,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101C17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
})
