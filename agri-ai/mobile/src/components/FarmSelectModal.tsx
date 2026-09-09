import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native'
import { colors } from '../theme/colors'
import type { Farm } from '../types'
import { Check, Plus, X, Home, MapPin } from 'lucide-react-native'

interface FarmSelectModalProps {
  visible: boolean
  onClose: () => void
  farms: Farm[]
  selectedFarmId: number | null
  onSelectFarm: (id: number) => void
  onAddFarm?: () => void
}

export function FarmSelectModal({
  visible,
  onClose,
  farms,
  selectedFarmId,
  onSelectFarm,
  onAddFarm,
}: FarmSelectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Switch Farm</Text>
                  <Text style={styles.subtitle}>
                    Select an active farm ({farms.length} available)
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {farms.map((farm) => {
                  const isSelected = farm.id === selectedFarmId
                  const farmIdText = `FARM${String(farm.id).padStart(3, '0')}`
                  const locationText = [farm.district, farm.state]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <TouchableOpacity
                      key={farm.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectFarm(farm.id)
                        onClose()
                      }}
                      style={[
                        styles.farmItem,
                        isSelected && styles.farmItemSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.farmIcon,
                          isSelected && styles.farmIconSelected,
                        ]}
                      >
                        <Home
                          size={18}
                          color={isSelected ? colors.brand : colors.textMuted}
                        />
                      </View>

                      <View style={styles.farmInfo}>
                        <View style={styles.farmNameRow}>
                          <Text
                            style={[
                              styles.farmName,
                              isSelected && styles.farmNameSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {farm.name}
                          </Text>
                          <Text style={styles.farmIdBadge}>{farmIdText}</Text>
                        </View>
                        {locationText ? (
                          <View style={styles.locationRow}>
                            <MapPin size={12} color={colors.textLight} />
                            <Text style={styles.locationText} numberOfLines={1}>
                              {locationText}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      {isSelected ? (
                        <View style={styles.checkCircle}>
                          <Check size={14} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              {onAddFarm && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.addFarmBtn}
                  onPress={() => {
                    onClose()
                    onAddFarm()
                  }}
                >
                  <Plus size={16} color={colors.brand} />
                  <Text style={styles.addFarmText}>Add New Farm</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  list: {
    marginVertical: 4,
  },
  farmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  farmItemSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandTonal,
  },
  farmIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  farmIconSelected: {
    backgroundColor: '#FFFFFF',
  },
  farmInfo: {
    flex: 1,
  },
  farmNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  farmName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  farmNameSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  farmIdBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  addFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    marginTop: 8,
    gap: 6,
  },
  addFarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
  },
})
