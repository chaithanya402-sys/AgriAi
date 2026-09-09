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
import type { YieldPredictionResponse } from '../types'
import { Wheat, BarChart3, CheckCircle2 } from 'lucide-react-native'

const CROPS = ['Paddy', 'Maize', 'Cotton', 'Sugarcane', 'Ragi', 'Groundnut', 'Pulses']
const SEASONS = ['Kharif', 'Rabi', 'Whole Year']

export function YieldPredictionScreen() {
  const { currentFarm, activeLocation, soilData } = useFarm()
  const [selectedCrop, setSelectedCrop] = useState('Paddy')
  const [selectedSeason, setSelectedSeason] = useState('Kharif')
  const [area, setArea] = useState('2.5')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<YieldPredictionResponse | null>(null)

  const handlePredict = async () => {
    if (!currentFarm) {
      Alert.alert('Notice', 'Please select a farm first.')
      return
    }
    const areaNum = parseFloat(area) || 1.0
    setLoading(true)
    try {
      const res = await agriculturalService.predictYield({
        farm_id: currentFarm.id,
        crop: selectedCrop,
        area: areaNum,
        season: selectedSeason,
        nitrogen: soilData?.nitrogen || 180,
        phosphorus: soilData?.phosphorus || 50,
        potassium: soilData?.potassium || 220,
        temperature: 28.5,
        humidity: 64,
        ph: soilData?.ph || 7.1,
        rainfall: 1150,
        state: activeLocation.state || 'Andhra Pradesh',
        district: activeLocation.district || 'Nellore',
      })
      setResult(res)
    } catch (err: any) {
      Alert.alert('Prediction Error', err.message || 'Failed to predict yield.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Yield Prediction</Text>
        <Text style={styles.subtitle}>
          AI Machine Learning Model · {activeLocation.district || 'Andhra Pradesh'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Parameters Card */}
        <Card style={styles.inputCard}>
          <Text style={styles.sectionTitle}>Select Crop</Text>
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

          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Cultivation Season</Text>
          <View style={styles.seasonRow}>
            {SEASONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSelectedSeason(s)}
                style={[
                  styles.seasonBtn,
                  selectedSeason === s && styles.seasonBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.seasonText,
                    selectedSeason === s && styles.seasonTextSelected,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Cultivation Area (Hectares)</Text>
          <TextInput
            style={styles.areaInput}
            keyboardType="numeric"
            value={area}
            onChangeText={setArea}
            placeholder="e.g. 2.5"
          />

          <Button
            title="Predict Crop Yield"
            onPress={handlePredict}
            loading={loading}
            icon={<Wheat size={18} color="#FFFFFF" />}
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Prediction Results */}
        {result && (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultLabel}>Predicted Yield</Text>
                <Text style={styles.resultYield}>
                  {result.predicted_yield.toFixed(1)} {result.unit || 't/ha'}
                </Text>
              </View>
              <Badge
                label={`${Math.round(result.confidence * 100)}% Confidence`}
                variant="success"
                size="md"
              />
            </View>

            <View style={styles.productionBanner}>
              <Text style={styles.productionTitle}>Total Expected Production</Text>
              <Text style={styles.productionVal}>
                {result.expected_production.toFixed(1)} Tonnes
              </Text>
              <Text style={styles.productionSub}>
                Calculated for {result.area} hectares of {result.crop}
              </Text>
            </View>

            {/* Feature Importance */}
            {result.feature_importance && result.feature_importance.length > 0 && (
              <View style={styles.featureSection}>
                <Text style={styles.featureTitle}>Feature Importance (Explainable AI)</Text>
                {result.feature_importance.map((f) => (
                  <View key={f.label} style={styles.featureRow}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <View style={styles.featureBarTrack}>
                      <View
                        style={[
                          styles.featureBarFill,
                          { width: `${Math.min(100, Math.round(f.importance * 100))}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.featureVal}>
                      {Math.round(f.importance * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
  inputCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
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
  seasonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seasonBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  seasonBtnSelected: {
    backgroundColor: colors.brandTonal,
    borderColor: colors.brand,
  },
  seasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  seasonTextSelected: {
    color: colors.brand,
    fontWeight: '700',
  },
  areaInput: {
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
    backgroundColor: '#FAFDFB',
    borderColor: '#BBF7D0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  resultYield: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.deepGreen,
  },
  productionBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  productionTitle: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  productionVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#14532D',
    marginVertical: 4,
  },
  productionSub: {
    fontSize: 11,
    color: '#15803D',
  },
  featureSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  featureLabel: {
    width: 90,
    fontSize: 11,
    color: colors.textSecondary,
  },
  featureBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  featureBarFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 4,
  },
  featureVal: {
    width: 32,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
})
