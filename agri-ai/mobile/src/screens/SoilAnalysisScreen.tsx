import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { agriculturalService } from '../services/agriculturalService'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import { FlaskConical, CheckCircle2, ChevronRight, Sparkles, MapPin } from 'lucide-react-native'

export function SoilAnalysisScreen() {
  const { currentFarm, soilData, soilLoading } = useFarm()

  // Interactive analyzer tool state
  const [showCustomTool, setShowCustomTool] = useState(false)
  const [n, setN] = useState('180')
  const [p, setP] = useState('50')
  const [k, setK] = useState('220')
  const [ph, setPh] = useState('6.8')
  const [oc, setOc] = useState('0.6')
  const [moisture, setMoisture] = useState('45')
  const [analyzing, setAnalyzing] = useState(false)
  const [customResult, setCustomResult] = useState<any>(null)

  const handleCustomAnalyze = async () => {
    if (!currentFarm) {
      Alert.alert('Notice', 'Please select a farm first.')
      return
    }
    setAnalyzing(true)
    try {
      const res = await agriculturalService.analyzeSoil({
        farm_id: currentFarm.id,
        nitrogen: parseFloat(n) || 0,
        phosphorus: parseFloat(p) || 0,
        potassium: parseFloat(k) || 0,
        ph: parseFloat(ph) || 7.0,
        organic_carbon: parseFloat(oc) || 0.5,
        moisture: parseFloat(moisture) || 50,
      })
      setCustomResult(res)
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Error calculating soil health.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topHeader}>
        <Text style={styles.pageTitle}>Soil Analysis</Text>
        <Text style={styles.pageSubtitle}>
          Village-Level Soil Dataset · {currentFarm?.name || 'Farm'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Farm Location Pill */}
        <View style={styles.locationPill}>
          <MapPin size={14} color={colors.brand} />
          <Text style={styles.locationPillText}>
            {[soilData?.village, soilData?.mandal, soilData?.district, 'AP']
              .filter(Boolean)
              .join(', ') || 'Andhra Pradesh'}
          </Text>
        </View>

        {soilLoading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Loading village-level soil dataset...</Text>
          </Card>
        ) : soilData && soilData.found ? (
          <>
            {/* Health Score Banner */}
            <Card style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreLabel}>Overall Soil Health</Text>
                  <Text style={styles.scoreValue}>
                    {soilData.healthScore ?? 78}
                    <Text style={styles.scoreTotal}> / 100</Text>
                  </Text>
                  <Text style={styles.scoreGrade}>
                    Grade {soilData.grade || 'A'} · Optimal Fertility
                  </Text>
                </View>
                <View style={styles.scoreBadgeBox}>
                  <FlaskConical size={32} color={colors.brand} />
                </View>
              </View>
              <Text style={styles.scoreMeta}>
                Source: {soilData.dataSource || 'Andhra Pradesh Village Soil Record'}
                {soilData.recordCount ? ` · ${soilData.recordCount} records aggregated` : ''}
              </Text>
            </Card>

            {/* 15 Primary & Micro Soil Nutrients (Requirement 10) */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Nutrient Composition</Text>
              <Text style={styles.cardHeaderSub}>
                Exact parameters from local soil profile
              </Text>

              <View style={styles.grid}>
                {/* 1. Nitrogen */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Nitrogen (N)</Text>
                  <Text style={styles.nutVal}>{soilData.nitrogen ?? '—'}</Text>
                  <Text style={styles.nutUnit}>kg/ha</Text>
                </View>

                {/* 2. Phosphorus */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Phosphorus (P)</Text>
                  <Text style={styles.nutVal}>{soilData.phosphorus ?? '—'}</Text>
                  <Text style={styles.nutUnit}>kg/ha</Text>
                </View>

                {/* 3. Potassium */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Potassium (K)</Text>
                  <Text style={styles.nutVal}>{soilData.potassium ?? '—'}</Text>
                  <Text style={styles.nutUnit}>kg/ha</Text>
                </View>

                {/* 4. pH */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>pH Level</Text>
                  <Text style={styles.nutVal}>{soilData.ph ?? '—'}</Text>
                  <Text style={styles.nutUnit}>pH scale</Text>
                </View>

                {/* 5. EC */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>EC (Salinity)</Text>
                  <Text style={styles.nutVal}>{soilData.ec ?? '—'}</Text>
                  <Text style={styles.nutUnit}>dS/m</Text>
                </View>

                {/* 6. Organic Carbon */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Organic Carbon</Text>
                  <Text style={styles.nutVal}>{soilData.organicCarbon ?? '—'}</Text>
                  <Text style={styles.nutUnit}>%</Text>
                </View>

                {/* 7. Sulfur */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Sulfur (S)</Text>
                  <Text style={styles.nutVal}>{soilData.sulfur ?? '—'}</Text>
                  <Text style={styles.nutUnit}>ppm</Text>
                </View>

                {/* 8. Zinc */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Zinc (Zn)</Text>
                  <Text style={styles.nutVal}>{soilData.zinc ?? '—'}</Text>
                  <Text style={styles.nutUnit}>ppm</Text>
                </View>

                {/* 9. Iron */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Iron (Fe)</Text>
                  <Text style={styles.nutVal}>{soilData.iron ?? '—'}</Text>
                  <Text style={styles.nutUnit}>ppm</Text>
                </View>

                {/* 10. Copper */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Copper (Cu)</Text>
                  <Text style={styles.nutVal}>{soilData.copper ?? '—'}</Text>
                  <Text style={styles.nutUnit}>ppm</Text>
                </View>

                {/* 11. Manganese */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Manganese (Mn)</Text>
                  <Text style={styles.nutVal}>{soilData.manganese ?? '—'}</Text>
                  <Text style={styles.nutUnit}>ppm</Text>
                </View>

                {/* 12. Boron */}
                <View style={styles.nutrientBox}>
                  <Text style={styles.nutLabel}>Boron (B)</Text>
                  <Text style={styles.nutVal}>{soilData.boron ?? '—'}</Text>
                  <Text style={styles.nutUnit}>ppm</Text>
                </View>
              </View>

              {/* 13. Fertility Index & 14. Soil Type */}
              <View style={styles.metaContainer}>
                {soilData.soilType && (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaTitle}>Soil Type:</Text>
                    <Text style={styles.metaContent}>{soilData.soilType}</Text>
                  </View>
                )}
                {soilData.fertilityIndex && (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaTitle}>Fertility Index:</Text>
                    <Text style={styles.metaContent}>{soilData.fertilityIndex}</Text>
                  </View>
                )}
                {soilData.croppingSeason && (
                  <View style={styles.metaPill}>
                    <Text style={styles.metaTitle}>Season:</Text>
                    <Text style={styles.metaContent}>{soilData.croppingSeason}</Text>
                  </View>
                )}
              </View>
            </Card>

            {/* 15. Plot-Specific Advisory */}
            {soilData.advisory && (
              <Card style={styles.advisoryCard}>
                <View style={styles.advisoryHeader}>
                  <CheckCircle2 size={20} color="#065F46" />
                  <Text style={styles.advisoryTitle}>Plot-Specific Advisory</Text>
                </View>
                <Text style={styles.advisoryBody}>{soilData.advisory}</Text>
              </Card>
            )}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyCardTitle}>Soil Data Unavailable</Text>
            <Text style={styles.emptyCardSub}>
              Ensure your farm has a valid Andhra Pradesh location specified.
            </Text>
          </Card>
        )}

        {/* Interactive Soil Analyzer Tool Accordion */}
        <Card style={styles.customToolCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowCustomTool(!showCustomTool)}
            style={styles.customToolToggle}
          >
            <View style={styles.customToolTitleRow}>
              <Sparkles size={18} color={colors.brand} />
              <Text style={styles.customToolTitle}>
                Test Custom Lab Soil Sample
              </Text>
            </View>
            <ChevronRight
              size={18}
              color={colors.textMuted}
              style={{
                transform: [{ rotate: showCustomTool ? '90deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>

          {showCustomTool && (
            <View style={styles.customToolBody}>
              <Text style={styles.customToolDesc}>
                Enter values from a recent soil test report to run custom AI health assessment:
              </Text>

              <View style={styles.formRow}>
                <View style={[styles.formInputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Nitrogen (kg/ha)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={n}
                    onChangeText={setN}
                  />
                </View>
                <View style={[styles.formInputGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Phosphorus (kg/ha)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={p}
                    onChangeText={setP}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formInputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Potassium (kg/ha)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={k}
                    onChangeText={setK}
                  />
                </View>
                <View style={[styles.formInputGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>pH Level</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={ph}
                    onChangeText={setPh}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formInputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>Organic Carbon (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={oc}
                    onChangeText={setOc}
                  />
                </View>
                <View style={[styles.formInputGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Moisture (%)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={moisture}
                    onChangeText={setMoisture}
                  />
                </View>
              </View>

              <Button
                title="Calculate Custom Soil Score"
                onPress={handleCustomAnalyze}
                loading={analyzing}
                style={{ marginTop: 8 }}
              />

              {customResult && (
                <View style={styles.customResultBox}>
                  <Text style={styles.customResultTitle}>
                    Score: {customResult.health_score}/100 (Grade {customResult.grade})
                  </Text>
                  {customResult.explanation ? (
                    <Text style={styles.customResultText}>
                      {customResult.explanation}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.brandTonal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    gap: 5,
  },
  locationPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand,
  },
  loadingCard: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  scoreCard: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#14532D',
    lineHeight: 34,
  },
  scoreTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  scoreGrade: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  scoreBadgeBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreMeta: {
    fontSize: 11,
    color: '#166534',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    paddingTop: 8,
  },
  sectionCard: {
    padding: 16,
    marginVertical: 8,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardHeaderSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nutrientBox: {
    width: '31%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  nutLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  nutVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  nutUnit: {
    fontSize: 9,
    color: colors.textLight,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  metaPill: {
    flexDirection: 'row',
    backgroundColor: colors.brandTonal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginRight: 4,
  },
  metaContent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
  },
  advisoryCard: {
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    marginVertical: 4,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  advisoryBody: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyCardSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  customToolCard: {
    padding: 16,
    marginTop: 10,
  },
  customToolToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customToolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customToolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customToolBody: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  customToolDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  formInputGroup: {},
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    color: colors.textPrimary,
  },
  customResultBox: {
    backgroundColor: colors.brandTonal,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  customResultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand,
  },
  customResultText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
})
