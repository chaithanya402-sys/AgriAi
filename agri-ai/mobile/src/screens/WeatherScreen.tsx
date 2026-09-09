import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFarm } from '../context/FarmContext'
import { Card } from '../components/Card'
import { colors } from '../theme/colors'
import { CloudSun, Droplets, Wind, CloudRain, AlertCircle, MapPin } from 'lucide-react-native'

function getWeatherIcon(cond?: string) {
  const c = (cond || '').toLowerCase()
  if (c.includes('rain')) return '🌧️'
  if (c.includes('cloud')) return '⛅'
  if (c.includes('thunder') || c.includes('storm')) return '⛈️'
  if (c.includes('clear') || c.includes('sun')) return '☀️'
  return '🌤️'
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function WeatherScreen() {
  const { currentFarm, activeLocation, weatherCurrent, weatherForecast, weatherLoading, weatherError } =
    useFarm()

  const placeName = [activeLocation.district, activeLocation.state].filter(Boolean).join(', ')

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Weather Intelligence</Text>
        <Text style={styles.subtitle}>
          {currentFarm?.name ? `${currentFarm.name} · ` : ''}
          {placeName || 'Farm Location'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {weatherLoading ? (
          <Card style={styles.centerCard}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </Card>
        ) : weatherError || !weatherCurrent ? (
          <Card style={styles.centerCard}>
            <AlertCircle size={28} color={colors.warning} />
            <Text style={styles.errorTitle}>
              {weatherError || 'Weather unavailable'}
            </Text>
            <Text style={styles.errorSub}>
              Unable to reach meteorological service. Check internet connection or farm location.
            </Text>
          </Card>
        ) : (
          <>
            {/* Current Weather Hero Card */}
            <Card style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroLocation}>
                    {placeName || currentFarm?.name || 'Local Farm'}
                  </Text>
                  <Text style={styles.heroCondition}>{weatherCurrent.condition}</Text>
                </View>
                <Text style={styles.heroEmoji}>
                  {getWeatherIcon(weatherCurrent.condition)}
                </Text>
              </View>

              <Text style={styles.heroTemp}>
                {Math.round(weatherCurrent.temperature)}°C
              </Text>

              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Droplets size={18} color={colors.info} />
                  <Text style={styles.metricValue}>{weatherCurrent.humidity}%</Text>
                  <Text style={styles.metricLabel}>Humidity</Text>
                </View>

                <View style={styles.metricCard}>
                  <Wind size={18} color={colors.info} />
                  <Text style={styles.metricValue}>
                    {Math.round(weatherCurrent.wind_speed)} km/h
                  </Text>
                  <Text style={styles.metricLabel}>Wind Speed</Text>
                </View>

                <View style={styles.metricCard}>
                  <CloudRain size={18} color={colors.info} />
                  <Text style={styles.metricValue}>{weatherCurrent.rainfall} mm</Text>
                  <Text style={styles.metricLabel}>Precipitation</Text>
                </View>
              </View>
            </Card>

            {/* 7-Day Forecast */}
            {weatherForecast?.forecast && weatherForecast.forecast.length > 0 && (
              <Card style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>7-Day Forecast</Text>
                <View style={styles.forecastList}>
                  {weatherForecast.forecast.map((day, idx) => (
                    <View
                      key={day.date}
                      style={[
                        styles.forecastRow,
                        idx < weatherForecast.forecast.length - 1 && styles.forecastRowBorder,
                      ]}
                    >
                      <Text style={styles.forecastDate}>{formatDate(day.date)}</Text>
                      <View style={styles.forecastCenter}>
                        <Text style={styles.forecastIcon}>
                          {getWeatherIcon(day.condition)}
                        </Text>
                        <Text style={styles.forecastCondition} numberOfLines={1}>
                          {day.condition}
                        </Text>
                      </View>
                      <View style={styles.forecastTemps}>
                        <Text style={styles.tempMax}>{Math.round(day.temp_max)}°</Text>
                        <Text style={styles.tempMin}>{Math.round(day.temp_min)}°</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </>
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
  centerCard: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
  },
  errorSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  heroCard: {
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLocation: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroCondition: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heroEmoji: {
    fontSize: 42,
  },
  heroTemp: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.deepGreen,
    marginVertical: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  forecastCard: {
    padding: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  forecastList: {
    gap: 2,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  forecastRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  forecastDate: {
    width: 90,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  forecastCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginHorizontal: 8,
  },
  forecastIcon: {
    fontSize: 18,
  },
  forecastCondition: {
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 8,
    width: 60,
    justifyContent: 'flex-end',
  },
  tempMax: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tempMin: {
    fontSize: 13,
    color: colors.textLight,
  },
})
