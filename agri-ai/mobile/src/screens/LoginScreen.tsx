import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { colors } from '../theme/colors'
import {
  Sprout,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Server,
  Settings,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react-native'
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  testServerConnection,
  DEFAULT_API_BASE_URL,
} from '../services/api'

export function LoginScreen() {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('chaitu@gmail.com')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('Farmer')
  const [phone, setPhone] = useState('9876543210')
  const [location, setLocation] = useState('Andhra Pradesh')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Server settings modal state
  const [serverModalVisible, setServerModalVisible] = useState(false)
  const [activeServerUrl, setActiveServerUrl] = useState(DEFAULT_API_BASE_URL)
  const [serverInput, setServerInput] = useState(DEFAULT_API_BASE_URL)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    async function loadServerUrl() {
      const url = await getApiBaseUrl()
      setActiveServerUrl(url)
      setServerInput(url)
    }
    loadServerUrl()
  }, [])

  const handleTestConnection = async () => {
    setTestLoading(true)
    setTestResult(null)
    const res = await testServerConnection(serverInput)
    setTestResult(res)
    setTestLoading(false)
  }

  const handleSaveServer = async () => {
    await setApiBaseUrl(serverInput)
    setActiveServerUrl(serverInput)
    setServerModalVisible(false)
    setError(null)
    Alert.alert('Server Updated', `Now pointing to ${serverInput}`)
  }

  const handleResetServer = async () => {
    const def = await resetApiBaseUrl()
    setServerInput(def)
    setActiveServerUrl(def)
    setTestResult(null)
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please fill in both email and password.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        if (!name) {
          Alert.alert('Required Fields', 'Please provide your full name.')
          setLoading(false)
          return
        }
        await register({ name, email, password, phone, location })
      } else {
        await login(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickDemo = (userEmail: string) => {
    setEmail(userEmail)
    setPassword('password123')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <Sprout size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>AgriAI</Text>
            <Text style={styles.brandSubtitle}>
              Smart Farming · Soil Intelligence · Yield Optimization
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isRegister
                ? 'Register to manage your farms and soil data'
                : 'Sign in to access your farm intelligence'}
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                {(error.includes('Cannot connect') ||
                  error.includes('fetch failed') ||
                  error.includes('NoRouteToHostException') ||
                  error.includes('network') ||
                  error.includes('Failed to fetch')) && (
                  <TouchableOpacity
                    style={styles.errorActionBtn}
                    onPress={() => {
                      setServerInput(activeServerUrl)
                      setTestResult(null)
                      setServerModalVisible(true)
                    }}
                  >
                    <Settings size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.errorActionBtnText}>Configure Server IP / Host</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={colors.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {isRegister && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={18} color={colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor={colors.textLight}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Region / State</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={18} color={colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Andhra Pradesh"
                      placeholderTextColor={colors.textLight}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>
              </>
            )}

            <Button
              title={isRegister ? 'Register & Continue' : 'Sign In'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Toggle Mode */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleText}>
                {isRegister
                  ? 'Already have an account?'
                  : "Don't have an account?"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsRegister(!isRegister)
                  setError(null)
                }}
              >
                <Text style={styles.toggleLink}>
                  {isRegister ? ' Sign In' : ' Register'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Demo Quick-Fill Shortcuts */}
            {!isRegister && (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Quick Demo Logins</Text>
                <View style={styles.demoButtonsRow}>
                  <TouchableOpacity
                    style={styles.demoChip}
                    onPress={() => fillQuickDemo('chaitu@gmail.com')}
                  >
                    <Text style={styles.demoChipText}>chaitu@gmail.com</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.demoChip}
                    onPress={() => fillQuickDemo('smoke@test.com')}
                  >
                    <Text style={styles.demoChipText}>smoke@test.com</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Server Connection Status Pill */}
            <TouchableOpacity
              style={styles.serverStatusPill}
              onPress={() => {
                setServerInput(activeServerUrl)
                setTestResult(null)
                setServerModalVisible(true)
              }}
            >
              <Server size={12} color={colors.brand} style={{ marginRight: 6 }} />
              <Text style={styles.serverStatusText} numberOfLines={1}>
                API: {activeServerUrl}
              </Text>
              <Settings size={12} color={colors.brand} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Server Configuration Modal */}
      <Modal
        visible={serverModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setServerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Server size={22} color={colors.brand} />
              <Text style={styles.modalTitle}>Backend Server Configuration</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Ensure your mobile device and host computer are on the same Wi-Fi network.
            </Text>

            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalTextInput}
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
                  styles.testResultBox,
                  testResult.ok ? styles.testResultSuccess : styles.testResultError,
                ]}
              >
                {testResult.ok ? (
                  <CheckCircle size={16} color={colors.success} style={{ marginRight: 6 }} />
                ) : (
                  <AlertTriangle size={16} color={colors.danger} style={{ marginRight: 6 }} />
                )}
                <Text
                  style={[
                    styles.testResultText,
                    testResult.ok ? styles.testResultSuccessText : styles.testResultErrorText,
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestConnection}
                disabled={testLoading}
              >
                {testLoading ? (
                  <ActivityIndicator size="small" color={colors.brand} />
                ) : (
                  <Text style={styles.testBtnText}>Test Connection</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleResetServer}
              >
                <RotateCcw size={14} color={colors.textMuted} />
                <Text style={styles.resetBtnText}>Reset Default</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooterButtons}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setServerModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleSaveServer}
              >
                <Text style={styles.saveModalBtnText}>Save & Connect</Text>
              </TouchableOpacity>
            </View>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.deepGreen,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    shadowColor: '#101C17',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  errorActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  errorActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.textPrimary,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  toggleLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  demoChip: {
    backgroundColor: colors.brandTonal,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  demoChipText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '600',
  },
  serverStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.brandTonal,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 18,
  },
  serverStatusText: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 14,
  },
  modalInputWrapper: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  modalTextInput: {
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  testResultSuccess: {
    backgroundColor: colors.successLight,
  },
  testResultError: {
    backgroundColor: colors.dangerLight,
  },
  testResultText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  testResultSuccessText: {
    color: colors.success,
  },
  testResultErrorText: {
    color: colors.danger,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  testBtn: {
    flex: 1,
    backgroundColor: colors.brandTonal,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resetBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelModalBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cancelModalBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  saveModalBtn: {
    backgroundColor: colors.brand,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
})
