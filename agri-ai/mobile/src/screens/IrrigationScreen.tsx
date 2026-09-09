import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { agriculturalService } from '../services/agriculturalService'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import type { IrrigationResponse } from '../types'
import { Droplets, CheckCircle2, CloudRain, Sun } from 'lucide-react-native'

const CROPS = ['Paddy', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Chili']

export function IrrigationScreen() {
  const { currentFarm, weatherCurrent } = useFarm()
  const [selectedCrop, setSelectedCrop] = useState('Paddy')
  const [moisture, setMoisture] = useState('38')
  const [rainfall, setRainfall] = useState('0')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IrrigationResponse | null>(null)

  const handleCalculate = async () => {
    if (!currentFarm) {
      Alert.alert('Notice', 'Please select a farm first.')
      return
    }
    setLoading(true)
    try {
      const res = await agriculturalService.recommendIrrigation({
        farm_id: currentFarm.id,
        soil_moisture: parseFloat(moisture) || 35,
        crop: selectedCrop,
        temperature: weatherCurrent?.temperature || 29,
        forecast_rainfall_mm: parseFloat(rainfall) || 0,
      })
      setResult(res)
    } catch (err: any) {
      Alert.alert('Irrigation Error', err.message || 'Failed to calculate irrigation advisory.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Irrigation Intelligence</Text>
        <Text style={styles.subtitle}>
          Moisture & Weather-Driven Water Scheduling
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Select Crop</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {CROPS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedCrop(c)}
                style={[
                  styles.cropChip,
                  selectedCrop === c && styles.cropChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.cropChipText,
                    selectedCrop === c && styles.cropChipTextSelected,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Soil Moisture (%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={moisture}
                onChangeText={setMoisture}
                placeholder="e.g. 38"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Rain Forecast (mm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={rainfall}
                onChangeText={setRainfall}
                placeholder="e.g. 0"
              />
            </View>
          </View>

          <Button
            title="Calculate Water Advisory"
            onPress={handleCalculate}
            loading={loading}
            icon={<Droplets size={18} color="#FFFFFF" />}
            style={{ marginTop: 14 }}
          />
        </Card>

        {result && (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.waterIconBox}>
                <Droplets size={24} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{result.recommendation}</Text>
                <Text style={styles.resultAmount}>
                  Recommended: {result.amount_mm} mm
                </Text>
              </View>
              <Badge
                label={result.amount_mm > 0 ? 'Water Needed' : 'Adequate'}
                variant={result.amount_mm > 0 ? 'warning' : 'success'}
                size="sm"
              />
            </View>

            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Agronomic Analysis</Text>
              <Text style={styles.reasonText}>{result.reason}</Text>
            </View>

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Efficient Watering Tip</Text>
              <Text style={styles.tipsBody}>
                Irrigate during early morning or late afternoon to minimize evapotranspiration losses by up to 25%.
              </Text>
            </View>
          </Card>
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
  card: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
    marginBottom: 14,
  },
  cropChip: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cropChipSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  cropChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cropChipTextSelected: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputGroup: {},
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
  resultCard: {
    padding: 16,
    marginTop: 12,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waterIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
  },
  resultAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 1,
  },
  reasonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: '#FEF9C3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#854D0E',
    marginBottom: 2,
  },
  tipsBody: {
    fontSize: 12,
    color: '#713F12',
    lineHeight: 16,
  },
})
