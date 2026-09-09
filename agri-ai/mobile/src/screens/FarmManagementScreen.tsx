import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { farmApi } from '../services/api'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import { Home, Plus, Trash2, MapPin, Check, X, Sprout } from 'lucide-react-native'

export function FarmManagementScreen() {
  const { farms, selectedFarmId, setSelectedFarmId, refetchFarms } = useFarm()
  const [modalVisible, setModalVisible] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [district, setDistrict] = useState('Nellore')
  const [mandal, setMandal] = useState('')
  const [village, setVillage] = useState('')
  const [totalArea, setTotalArea] = useState('2.5')
  const [soilType, setSoilType] = useState('Red Loam')
  const [irrigationType, setIrrigationType] = useState('Drip')

  const handleCreateFarm = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a farm name.')
      return
    }
    setCreating(true)
    try {
      await farmApi.create({
        name: name.trim(),
        state: 'Andhra Pradesh',
        district: district.trim(),
        mandal: mandal.trim() || undefined,
        village: village.trim() || undefined,
        total_area: parseFloat(totalArea) || 1.0,
        area_unit: 'hectares',
        soil_type: soilType,
        irrigation_type: irrigationType,
        location: `${district}, Andhra Pradesh`,
      })
      await refetchFarms()
      setModalVisible(false)
      setName('')
      setMandal('')
      setVillage('')
      Alert.alert('Success', 'New farm added successfully!')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create farm.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteFarm = (id: number, farmName: string) => {
    Alert.alert(
      'Delete Farm',
      `Are you sure you want to delete "${farmName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await farmApi.remove(id)
              await refetchFarms()
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete farm.')
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Farm Management</Text>
          <Text style={styles.subtitle}>
            {farms.length} Farm{farms.length === 1 ? '' : 's'} registered
          </Text>
        </View>
        <Button
          title="Add Farm"
          size="sm"
          icon={<Plus size={16} color="#FFFFFF" />}
          onPress={() => setModalVisible(true)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {farms.map((farm) => {
          const isSelected = farm.id === selectedFarmId
          const farmIdFormatted = `FARM${String(farm.id).padStart(3, '0')}`
          const place = [farm.village, farm.mandal, farm.district, farm.state]
            .filter(Boolean)
            .join(', ')

          return (
            <Card
              key={farm.id}
              style={[styles.farmCard, isSelected && styles.selectedFarmCard]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.farmTitleGroup}>
                  <View
                    style={[
                      styles.farmIconBox,
                      isSelected && styles.farmIconBoxSelected,
                    ]}
                  >
                    <Home
                      size={20}
                      color={isSelected ? colors.brand : colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={styles.farmName} numberOfLines={1}>
                        {farm.name}
                      </Text>
                      <Text style={styles.farmIdText}>{farmIdFormatted}</Text>
                    </View>
                    {place ? (
                      <View style={styles.placeRow}>
                        <MapPin size={12} color={colors.textMuted} />
                        <Text style={styles.placeText} numberOfLines={1}>
                          {place}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Farm Details */}
              <View style={styles.detailsRow}>
                {farm.total_area != null && (
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Area:</Text>
                    <Text style={styles.pillValue}>
                      {farm.total_area} {farm.area_unit || 'ha'}
                    </Text>
                  </View>
                )}
                {farm.soil_type && (
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Soil:</Text>
                    <Text style={styles.pillValue}>{farm.soil_type}</Text>
                  </View>
                )}
                {farm.irrigation_type && (
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Irrigation:</Text>
                    <Text style={styles.pillValue}>{farm.irrigation_type}</Text>
                  </View>
                )}
              </View>

              {/* Actions Footer */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedFarmId(farm.id)}
                  style={[
                    styles.selectBtn,
                    isSelected && styles.selectBtnActive,
                  ]}
                >
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text
                    style={[
                      styles.selectBtnText,
                      isSelected && styles.selectBtnTextActive,
                    ]}
                  >
                    {isSelected ? 'Currently Active' : 'Set as Active'}
                  </Text>
                </TouchableOpacity>

                {farms.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleDeleteFarm(farm.id, farm.name)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          )
        })}
      </ScrollView>

      {/* Add Farm Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBody}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Farm</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Farm Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Green Acres"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District (Andhra Pradesh) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nellore, Srikakulam, Visakhapatnam"
                  value={district}
                  onChangeText={setDistrict}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mandal (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Kaviti, Bheemunipatnam"
                  value={mandal}
                  onChangeText={setMandal}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Village (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Borivanka"
                  value={village}
                  onChangeText={setVillage}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Total Area (ha)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2.5"
                    keyboardType="numeric"
                    value={totalArea}
                    onChangeText={setTotalArea}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Soil Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Red Loam / Clay"
                    value={soilType}
                    onChangeText={setSoilType}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Irrigation Method</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Drip, Canal, Well, Rainfed"
                  value={irrigationType}
                  onChangeText={setIrrigationType}
                />
              </View>

              <Button
                title="Create Farm"
                onPress={handleCreateFarm}
                loading={creating}
                style={{ marginTop: 12, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    marginTop: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  farmCard: {
    marginBottom: 12,
    padding: 16,
  },
  selectedFarmCard: {
    borderColor: colors.brand,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  farmIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  farmIconBoxSelected: {
    backgroundColor: colors.brandTonal,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  farmIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  placeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 4,
  },
  pillValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectBtnActive: {
    backgroundColor: colors.brand,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectBtnTextActive: {
    color: '#FFFFFF',
  },
  deleteBtn: {
    padding: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBody: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: colors.textPrimary,
  },
})
