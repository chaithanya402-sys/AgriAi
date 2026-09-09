import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import {
  authApi,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  testServerConnection,
  DEFAULT_API_BASE_URL,
} from '../services/api'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { colors } from '../theme/colors'
import { User, LogOut, Server, Shield, Check, Info, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react-native'

export function SettingsScreen() {
  const { user, logout, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [location, setLocation] = useState(user?.location || '')
  const [saving, setSaving] = useState(false)

  // Server config state
  const [serverUrl, setServerUrl] = useState(DEFAULT_API_BASE_URL)
  const [serverInput, setServerInput] = useState(DEFAULT_API_BASE_URL)
  const [testingServer, setTestingServer] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    async function loadServer() {
      const url = await getApiBaseUrl()
      setServerUrl(url)
      setServerInput(url)
    }
    loadServer()
  }, [])

  const handleTestServer = async () => {
    setTestingServer(true)
    setTestResult(null)
    const res = await testServerConnection(serverInput)
    setTestResult(res)
    setTestingServer(false)
  }

  const handleSaveServer = async () => {
    await setApiBaseUrl(serverInput)
    setServerUrl(serverInput)
    Alert.alert('Saved', `API Backend updated to: ${serverInput}`)
  }

  const handleResetServer = async () => {
    const def = await resetApiBaseUrl()
    setServerInput(def)
    setServerUrl(def)
    setTestResult(null)
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      })
      await refreshUser()
      Alert.alert('Success', 'Profile updated successfully.')
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Profile</Text>
        <Text style={styles.subtitle}>Account & Network Configuration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'test@test.com'}</Text>
            </View>
            <Badge label="Active" variant="success" size="sm" />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Region / State</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Andhra Pradesh"
            />
          </View>

          <Button
            title="Save Changes"
            onPress={handleUpdateProfile}
            loading={saving}
            size="sm"
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* API Backend Configuration Card (Requirement 15) */}
        <Card style={styles.configCard}>
          <View style={styles.configHeader}>
            <Server size={18} color={colors.brand} />
            <Text style={styles.configTitle}>Backend API Configuration</Text>
          </View>
          <Text style={styles.configDesc}>
            Connected host address used by all API requests:
          </Text>

          <View style={styles.serverInputRow}>
            <TextInput
              style={styles.serverTextInput}
              value={serverInput}
              onChangeText={setServerInput}
              placeholder="http://172.16.129.105:8000"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {testResult && (
            <View
              style={[
                styles.testStatusBox,
                testResult.ok ? styles.testStatusSuccess : styles.testStatusError,
              ]}
            >
              {testResult.ok ? (
                <CheckCircle size={15} color={colors.success} style={{ marginRight: 6 }} />
              ) : (
                <AlertTriangle size={15} color={colors.danger} style={{ marginRight: 6 }} />
              )}
              <Text
                style={[
                  styles.testStatusText,
                  testResult.ok ? styles.testStatusSuccessText : styles.testStatusErrorText,
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.serverBtnRow}>
            <TouchableOpacity
              style={styles.testServerBtn}
              onPress={handleTestServer}
              disabled={testingServer}
            >
              {testingServer ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <Text style={styles.testServerBtnText}>Test Ping</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveServerBtn}
              onPress={handleSaveServer}
            >
              <Text style={styles.saveServerBtnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetServerBtn}
              onPress={handleResetServer}
            >
              <RotateCcw size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.apiHint}>
            Connect your phone to the same Wi-Fi network as your computer to access the FastAPI backend.
          </Text>
        </Card>

        {/* App Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Application</Text>
            <Text style={styles.infoValue}>AgriAI Mobile (Expo Go)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Architecture</Text>
            <Text style={styles.infoValue}>FastAPI + SQLite + React Native</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Soil Dataset</Text>
            <Text style={styles.infoValue}>AP Village 105k Records</Text>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="danger"
          icon={<LogOut size={18} color="#FFFFFF" />}
          onPress={handleSignOut}
          style={{ marginTop: 16 }}
        />
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
  userCard: {
    padding: 16,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 14,
  },
  inputGroup: {
    marginBottom: 12,
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
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
  },
  configCard: {
    padding: 16,
    marginTop: 10,
    backgroundColor: '#FAFDFB',
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  configTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  configDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  serverInputRow: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  serverTextInput: {
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  testStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  testStatusSuccess: {
    backgroundColor: colors.successLight,
  },
  testStatusError: {
    backgroundColor: colors.dangerLight,
  },
  testStatusText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  testStatusSuccessText: {
    color: colors.success,
  },
  testStatusErrorText: {
    color: colors.danger,
  },
  serverBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  testServerBtn: {
    flex: 1,
    backgroundColor: colors.brandTonal,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testServerBtnText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
  saveServerBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveServerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resetServerBtn: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiHint: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 15,
  },
  infoCard: {
    padding: 16,
    marginTop: 10,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
})
