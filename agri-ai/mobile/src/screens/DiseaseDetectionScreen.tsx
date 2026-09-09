import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useFarm } from '../context/FarmContext'
import { agriculturalService } from '../services/agriculturalService'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import type { DiseaseDetectionResponse } from '../types'
import { Camera, Image as ImageIcon, Bug, CheckCircle2, AlertTriangle } from 'lucide-react-native'

export function DiseaseDetectionScreen() {
  const { currentFarm } = useFarm()
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<DiseaseDetectionResponse | null>(null)

  const pickImage = async (useCamera = false) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to capture photos.')
          return
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required to choose photos.')
          return
        }
      }

      const launch = useCamera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync

      const pickerResult = await launch({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!pickerResult.canceled && pickerResult.assets.length > 0) {
        setImageUri(pickerResult.assets[0].uri)
        setResult(null)
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to select image.')
    }
  }

  const handleAnalyze = async () => {
    if (!imageUri) {
      Alert.alert('Image Required', 'Please take or pick a plant photo first.')
      return
    }
    if (!currentFarm) {
      Alert.alert('Farm Required', 'Please select a farm.')
      return
    }

    setAnalyzing(true)
    try {
      const formData = new FormData()
      const filename = imageUri.split('/').pop() || 'leaf.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any)
      formData.append('farm_id', String(currentFarm.id))

      const res = await agriculturalService.predictDisease(formData)
      setResult(res)
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Could not analyze crop photo.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Disease Detection</Text>
        <Text style={styles.subtitle}>
          MobileNetV2 Vision AI · Instant Crop Pathology
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Card */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Upload or Snap Leaf Photo</Text>
          <Text style={styles.cardSub}>
            Take a clear, well-lit photo of an affected leaf or fruit
          </Text>

          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => setImageUri(null)}
              >
                <Text style={styles.retakeText}>Remove / Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Bug size={36} color={colors.textLight} />
              <Text style={styles.placeholderText}>No photo selected yet</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button
              title="Camera"
              variant="outline"
              size="md"
              icon={<Camera size={18} color={colors.brand} />}
              onPress={() => pickImage(true)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Gallery"
              variant="outline"
              size="md"
              icon={<ImageIcon size={18} color={colors.brand} />}
              onPress={() => pickImage(false)}
              style={{ flex: 1 }}
            />
          </View>

          {imageUri && (
            <Button
              title="Analyze Plant Health"
              onPress={handleAnalyze}
              loading={analyzing}
              style={{ marginTop: 12 }}
            />
          )}
        </Card>

        {/* Results Card */}
        {result && (
          <Card
            style={[
              styles.resultCard,
              result.is_healthy ? styles.healthyCard : styles.diseasedCard,
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleGroup}>
                {result.is_healthy ? (
                  <CheckCircle2 size={24} color={colors.success} />
                ) : (
                  <AlertTriangle size={24} color={colors.danger} />
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.diagnosisTitle}>{result.prediction}</Text>
                  <Text style={styles.diagnosisSub}>
                    {result.is_healthy ? 'Plant appears healthy' : 'Action recommended'}
                  </Text>
                </View>
              </View>

              <Badge
                label={`${Math.round(result.confidence * 100)}% Confidence`}
                variant={result.is_healthy ? 'success' : 'danger'}
                size="md"
              />
            </View>

            {result.message && (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{result.message}</Text>
              </View>
            )}

            {/* Probability Breakdown */}
            {result.probabilities && Object.keys(result.probabilities).length > 0 && (
              <View style={styles.probSection}>
                <Text style={styles.probHeader}>Confidence Breakdown</Text>
                {Object.entries(result.probabilities).map(([disease, prob]) => (
                  <View key={disease} style={styles.probRow}>
                    <Text style={styles.probLabel} numberOfLines={1}>
                      {disease}
                    </Text>
                    <View style={styles.probTrack}>
                      <View
                        style={[
                          styles.probFill,
                          {
                            width: `${Math.round(prob * 100)}%`,
                            backgroundColor: result.is_healthy ? colors.brand : colors.danger,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.probVal}>{Math.round(prob * 100)}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ⚠️ AgriAI decision-support tool. Always consult a local agricultural extension officer before chemical treatment.
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  uploadPlaceholder: {
    height: 140,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  previewContainer: {
    marginBottom: 14,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  retakeBtn: {
    marginTop: 8,
  },
  retakeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  resultCard: {
    padding: 16,
    marginTop: 14,
  },
  healthyCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  diseasedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  diagnosisSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  probSection: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  probHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  probLabel: {
    width: 100,
    fontSize: 11,
    color: colors.textSecondary,
  },
  probTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  probFill: {
    height: '100%',
    borderRadius: 4,
  },
  probVal: {
    width: 32,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
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
