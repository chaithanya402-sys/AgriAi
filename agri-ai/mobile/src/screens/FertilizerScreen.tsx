import React, { useState, useEffect } from 'react'
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
import { colors } from '../theme/colors'
import type { FertilizerResponse } from '../types'
import { FlaskConical, CheckCircle2, AlertCircle } from 'lucide-react-native'

const CROPS = ['Paddy', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Chili', 'Pulses']

export function FertilizerScreen() {
  const { currentFarm, soilData } = useFarm()
  const [selectedCrop, setSelectedCrop] = useState('Paddy')
  const [n, setN] = useState('180')
  const [p, setP] = useState('50')
  const [k, setK] = useState('220')
  const [ph, setPh] = useState('6.8')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FertilizerResponse | null>(null)

  useEffect(() => {
    if (soilData && soilData.found) {
      if (soilData.nitrogen != null) setN(String(soilData.nitrogen))
      if (soilData.phosphorus != null) setP(String(soilData.phosphorus))
      if (soilData.potassium != null) setK(String(soilData.potassium))
      if (soilData.ph != null) setPh(String(soilData.ph))
    }
  }, [soilData])

  const handleRecommend = async () => {
    if (!currentFarm) {
      Alert.alert('Notice', 'Please select a farm first.')
      return
    }
    setLoading(true)
    try {
      const res = await agriculturalService.recommendFertilizer({
        farm_id: currentFarm.id,
        crop: selectedCrop,
        nitrogen: parseFloat(n) || 180,
        phosphorus: parseFloat(p) || 50,
        potassium: parseFloat(k) || 220,
        soil_ph: parseFloat(ph) || 6.8,
      })
      setResult(res)
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to get fertilizer recommendations.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Fertilizer Advisory</Text>
        <Text style={styles.subtitle}>
          Precision NPK Dosing · Agronomic Guidance
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Target Crop</Text>
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

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Current Soil Profile</Text>
          <View style={styles.inputGrid}>
            <View style={[styles.inputBox, { marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Nitrogen (kg/ha)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={n}
                onChangeText={setN}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Phosphorus (kg/ha)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={p}
                onChangeText={setP}
              />
            </View>
          </View>

          <View style={[styles.inputGrid, { marginTop: 8 }]}>
            <View style={[styles.inputBox, { marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Potassium (kg/ha)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={k}
                onChangeText={setK}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Soil pH</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={ph}
                onChangeText={setPh}
              />
            </View>
          </View>

          <Button
            title="Generate Fertilizer Plan"
            onPress={handleRecommend}
            loading={loading}
            icon={<FlaskConical size={18} color="#FFFFFF" />}
            style={{ marginTop: 16 }}
          />
        </Card>

        {result && (
          <Card style={styles.resultCard}>
            <Text style={styles.resultHeading}>
              Recommended Dose for {result.crop}
            </Text>

            {/* Split pills */}
            {result.recommended && (
              <View style={styles.splitGrid}>
                {Object.entries(result.recommended).map(([nutrient, amt]) => (
                  <View key={nutrient} style={styles.splitTile}>
                    <Text style={styles.splitLabel}>{nutrient}</Text>
                    <Text style={styles.splitVal}>{amt}</Text>
                    <Text style={styles.splitUnit}>kg/ha</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.guidanceBox}>
              <Text style={styles.guidanceTitle}>Agronomic Guidance</Text>
              <Text style={styles.guidanceBody}>{result.guidance}</Text>
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ⚠️ {result.disclaimer || 'AgriAI is a decision-support tool, not a substitute for professional agronomic advice or soil testing.'}
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
  inputGrid: {
    flexDirection: 'row',
  },
  inputBox: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  resultCard: {
    padding: 16,
    marginTop: 12,
    backgroundColor: '#F8FCF9',
    borderColor: '#BBF7D0',
  },
  resultHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.deepGreen,
    marginBottom: 12,
  },
  splitGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  splitTile: {
    flex: 1,
    backgroundColor: colors.brandTonal,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand,
    textTransform: 'uppercase',
  },
  splitVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.deepGreen,
    marginVertical: 2,
  },
  splitUnit: {
    fontSize: 10,
    color: colors.textMuted,
  },
  guidanceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  guidanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  guidanceBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
})
