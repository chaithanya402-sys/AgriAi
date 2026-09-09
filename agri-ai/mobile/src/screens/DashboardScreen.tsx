import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { useAuth } from '../context/AuthContext'
import { Header } from '../components/Header'
import { FarmOverviewCard } from '../components/FarmOverviewCard'
import { AndhraPradeshMap } from '../components/AndhraPradeshMap'
import { WeatherOverviewCard } from '../components/WeatherOverviewCard'
import { SoilSummaryCard } from '../components/SoilSummaryCard'
import { FarmSelectModal } from '../components/FarmSelectModal'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { colors } from '../theme/colors'
import { locationService } from '../services/locationService'
import {
  MapPin,
  Sprout,
  Wheat,
  TrendingUp,
  AlertTriangle,
  FlaskConical,
  Droplets,
  Bug,
  LineChart,
  Target,
  FileText,
} from 'lucide-react-native'

export function DashboardScreen({ navigation }: any) {
  const { user } = useAuth()
  const {
    farms,
    selectedFarmId,
    currentFarm,
    activeLocation,
    soilData,
    soilLoading,
    weatherCurrent,
    weatherForecast,
    weatherLoading,
    weatherError,
    setSelectedFarmId,
    refetchFarms,
    updateActiveLocationFromGps,
  } = useFarm()

  const [farmModalVisible, setFarmModalVisible] = useState(false)
  const [locatingGps, setLocatingGps] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetchFarms()
    setRefreshing(false)
  }

  // "Use Current Location" handler (Requirement 12)
  const handleUseCurrentLocation = async () => {
    setLocatingGps(true)
    try {
      const res = await locationService.requestAndGetCurrentLocation(currentFarm?.id)
      if (res.success && res.resolved) {
        await updateActiveLocationFromGps(res.resolved)
        const place = [res.resolved.district, res.resolved.state]
          .filter(Boolean)
          .join(', ')
        Alert.alert(
          'Location Detected',
          `Your farm location was resolved to: ${place || 'Current Location'}.\n\nSoil dataset and weather have been refreshed!`
        )
      } else {
        Alert.alert('Location Notice', res.error || 'Could not resolve location.')
      }
    } catch (err: any) {
      Alert.alert('Location Error', err.message || 'GPS location error.')
    } finally {
      setLocatingGps(false)
    }
  }

  // Metric values
  const healthScore = soilData?.healthScore ?? 76
  const totalFarms = farms.length
  const totalArea = farms.reduce((acc, f) => acc + (f.total_area || 0), 0)

  const quickActions = [
    { label: 'Soil Health', icon: FlaskConical, route: 'SoilTab', color: colors.brand },
    { label: 'Crops', icon: Sprout, route: 'CropRecommendation', color: colors.fresh500 },
    { label: 'Yield', icon: Wheat, route: 'YieldPrediction', color: colors.earth500 },
    { label: 'Irrigation', icon: Droplets, route: 'Irrigation', color: colors.info },
    { label: 'Weather', icon: LineChart, route: 'WeatherTab', color: colors.info },
    { label: 'Disease AI', icon: Bug, route: 'DiseaseDetection', color: colors.danger },
    { label: 'Risk Status', icon: Target, route: 'RiskAnalysis', color: colors.warning },
    { label: 'Reports', icon: FileText, route: 'Reports', color: colors.textSecondary },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header with Selected Farm Switcher */}
      <Header
        selectedFarmName={currentFarm?.name}
        onOpenFarmSelect={() => setFarmModalVisible(true)}
        onPressProfile={() => navigation.navigate('Settings')}
        userInitial={user?.name ? user.name[0] : 'U'}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome & GPS Action Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.welcomeTitle}>
              Hello, {user?.name || 'Farmer'} 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Real-time intelligence for your farm
            </Text>
          </View>

          <Button
            title={locatingGps ? 'Locating...' : 'Use Current Location'}
            onPress={handleUseCurrentLocation}
            loading={locatingGps}
            variant="outline"
            size="sm"
            icon={<MapPin size={14} color={colors.brand} />}
            style={styles.gpsButton}
            textStyle={styles.gpsButtonText}
          />
        </View>

        {/* 1. Selected Farm Overview Card */}
        <FarmOverviewCard
          farm={currentFarm}
          state={activeLocation.state}
          district={activeLocation.district}
          mandal={activeLocation.mandal}
          village={activeLocation.village}
        />

        {/* 2. Dynamic Andhra Pradesh Map (updates automatically on farm switch) */}
        <Card style={styles.mapCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Farm Location Map</Text>
            <Text style={styles.mapSubtitle}>Andhra Pradesh District Map</Text>
          </View>
          <AndhraPradeshMap
            activeDistrict={activeLocation.district}
            activeState={activeLocation.state}
            mandal={activeLocation.mandal || currentFarm?.mandal}
            village={activeLocation.village || currentFarm?.village}
            farmName={currentFarm?.name}
            latitude={currentFarm?.latitude}
            longitude={currentFarm?.longitude}
          />
        </Card>

        {/* 3. Weather Overview Card */}
        <WeatherOverviewCard
          current={weatherCurrent}
          forecast={weatherForecast}
          loading={weatherLoading}
          error={weatherError}
        />

        {/* 4. Soil Analysis Card (Village Dataset) */}
        <SoilSummaryCard soilData={soilData} loading={soilLoading} />

        {/* 5. Key Intelligence Metrics (Expected Yield, Profitability, Risk, Health) */}
        <View style={styles.statGrid}>
          <Card style={styles.statTile}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Soil Health</Text>
              <Sprout size={16} color={colors.brand} />
            </View>
            <Text style={styles.statValue}>{healthScore}/100</Text>
            <Text style={styles.statSub}>
              {healthScore >= 70 ? 'Grade A · Optimal' : 'Needs attention'}
            </Text>
          </Card>

          <Card style={styles.statTile}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Expected Yield</Text>
              <Wheat size={16} color={colors.earth500} />
            </View>
            <Text style={styles.statValue}>4.2 t/ha</Text>
            <Text style={styles.statSub}>+14% vs district avg</Text>
          </Card>

          <Card style={styles.statTile}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Profitability</Text>
              <TrendingUp size={16} color={colors.fresh500} />
            </View>
            <Text style={styles.statValue}>High</Text>
            <Text style={styles.statSub}>₹1.4L est. / ha</Text>
          </Card>

          <Card style={styles.statTile}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Risk Status</Text>
              <AlertTriangle size={16} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>Low Risk</Text>
            <Text style={styles.statSub}>Score: 28/100</Text>
          </Card>
        </View>

        {/* 6. Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <TouchableOpacity
                  key={action.label}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (action.route.endsWith('Tab')) {
                      navigation.navigate(action.route)
                    } else {
                      navigation.navigate(action.route)
                    }
                  }}
                  style={styles.actionCard}
                >
                  <View
                    style={[
                      styles.actionIconCircle,
                      { backgroundColor: `${action.color}15` },
                    ]}
                  >
                    <Icon size={20} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel} numberOfLines={1}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      {/* Farm Switcher Modal */}
      <FarmSelectModal
        visible={farmModalVisible}
        onClose={() => setFarmModalVisible(false)}
        farms={farms}
        selectedFarmId={selectedFarmId}
        onSelectFarm={(id) => setSelectedFarmId(id)}
        onAddFarm={() => navigation.navigate('FarmTab')}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gpsButton: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.brand,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  gpsButtonText: {
    fontSize: 12,
  },
  mapCard: {
    padding: 14,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  mapSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  statTile: {
    width: '48%',
    padding: 12,
    marginVertical: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  statSub: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginTop: 12,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionCard: {
    width: '23%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#101C17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
