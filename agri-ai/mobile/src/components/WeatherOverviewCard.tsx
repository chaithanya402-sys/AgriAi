import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Card } from './Card'
import { colors } from '../theme/colors'
import type { WeatherCurrent, WeatherForecastResponse } from '../types'
import { CloudSun, Droplets, Wind, AlertCircle } from 'lucide-react-native'

interface WeatherOverviewCardProps {
  current: WeatherCurrent | null
  forecast: WeatherForecastResponse | null
  loading: boolean
  error: string | null
}

function getWeatherIcon(cond?: string) {
  const c = (cond || '').toLowerCase()
  if (c.includes('rain')) return '🌧️'
  if (c.includes('cloud')) return '⛅'
  if (c.includes('storm') || c.includes('thunder')) return '⛈️'
  if (c.includes('clear') || c.includes('sun')) return '☀️'
  return '🌤️'
}

function formatDayName(dateString: string) {
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  } catch {
    return dateString
  }
}

export function WeatherOverviewCard({
  current,
  forecast,
  loading,
  error,
}: WeatherOverviewCardProps) {
  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.brand} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </Card>
    )
  }

  if (error || !current) {
    return (
      <Card style={styles.card}>
        <View style={styles.centerContainer}>
          <AlertCircle size={20} color={colors.warning} />
          <Text style={styles.errorText}>
            {error || 'Weather unavailable'}
          </Text>
        </View>
      </Card>
    )
  }

  // Today's high and low from forecast[0] if available
  const todayForecast = forecast?.forecast && forecast.forecast.length > 0 ? forecast.forecast[0] : null
  const highTemp = todayForecast ? todayForecast.temp_max : Math.round(current.temperature + 3)
  const lowTemp = todayForecast ? todayForecast.temp_min : Math.round(current.temperature - 4)

  // 4-day forecast
  const fourDayForecast = forecast?.forecast ? forecast.forecast.slice(1, 5) : []

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <CloudSun size={18} color={colors.brand} />
          <Text style={styles.headerTitle}>Weather Overview</Text>
        </View>
        <Text style={styles.conditionText}>{current.condition}</Text>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.tempContainer}>
          <Text style={styles.tempIcon}>{getWeatherIcon(current.condition)}</Text>
          <View>
            <Text style={styles.tempValue}>{Math.round(current.temperature)}°C</Text>
            <Text style={styles.highLowText}>
              H: {Math.round(highTemp)}° · L: {Math.round(lowTemp)}°
            </Text>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Droplets size={14} color={colors.info} />
            <Text style={styles.metricText}>Humidity {current.humidity}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Wind size={14} color={colors.info} />
            <Text style={styles.metricText}>Wind {Math.round(current.wind_speed)} km/h</Text>
          </View>
        </View>
      </View>

      {fourDayForecast.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.forecastHeader}>4-Day Forecast</Text>
          <View style={styles.forecastGrid}>
            {fourDayForecast.map((day) => (
              <View key={day.date} style={styles.forecastDayCard}>
                <Text style={styles.forecastDayName}>{formatDayName(day.date)}</Text>
                <Text style={styles.forecastIcon}>{getWeatherIcon(day.condition)}</Text>
                <Text style={styles.forecastMax}>{Math.round(day.temp_max)}°</Text>
                <Text style={styles.forecastMin}>{Math.round(day.temp_min)}°</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  centerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  conditionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tempIcon: {
    fontSize: 34,
  },
  tempValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  highLowText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricsContainer: {
    gap: 6,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 12,
  },
  forecastHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  forecastGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  forecastDayCard: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  forecastDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  forecastIcon: {
    fontSize: 18,
    marginVertical: 3,
  },
  forecastMax: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  forecastMin: {
    fontSize: 10,
    color: colors.textMuted,
  },
})
