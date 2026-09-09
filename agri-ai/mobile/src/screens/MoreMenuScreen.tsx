import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import {
  Sprout,
  Wheat,
  Droplets,
  Bug,
  FlaskConical,
  Target,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react-native'

export function MoreMenuScreen({ navigation }: any) {
  const menuItems = [
    {
      title: 'Crop Recommendation',
      desc: 'AI-ranked crops tailored to your soil and regional climate',
      icon: Sprout,
      route: 'CropRecommendation',
      color: colors.brand,
    },
    {
      title: 'Yield Prediction',
      desc: 'Predict harvest yield & production based on soil and crop',
      icon: Wheat,
      route: 'YieldPrediction',
      color: colors.earth500,
    },
    {
      title: 'Irrigation Advisory',
      desc: 'Moisture tracking and scheduled watering recommendations',
      icon: Droplets,
      route: 'Irrigation',
      color: colors.info,
    },
    {
      title: 'Disease Detection',
      desc: 'Snap plant leaf photos for instant pathology and diagnosis',
      icon: Bug,
      route: 'DiseaseDetection',
      color: colors.danger,
    },
    {
      title: 'Fertilizer Advisory',
      desc: 'NPK balancing and precision nutritional applications',
      icon: FlaskConical,
      route: 'Fertilizer',
      color: colors.brand,
    },
    {
      title: 'Risk Analysis',
      desc: 'Farm risk audit across climate, soil, pests, and price volatility',
      icon: Target,
      route: 'RiskAnalysis',
      color: colors.warning,
    },
    {
      title: 'Market Prices',
      desc: 'Live commodity rates and price trends across Indian mandis',
      icon: BarChart3,
      route: 'MarketPrices',
      color: colors.fresh500,
    },
    {
      title: 'Farm Reports',
      desc: 'Generate comprehensive downloadable agronomic audits',
      icon: FileText,
      route: 'Reports',
      color: colors.textSecondary,
    },
    {
      title: 'Settings & Profile',
      desc: 'Account management, backend IP connection, and preferences',
      icon: Settings,
      route: 'Settings',
      color: colors.textMuted,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>All Features</Text>
        <Text style={styles.subtitle}>AgriAI Intelligence Modules</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <TouchableOpacity
              key={item.title}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.route)}
              style={styles.menuCard}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Icon size={22} color={item.color} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.desc}
                </Text>
              </View>

              <ChevronRight size={18} color={colors.textLight} />
            </TouchableOpacity>
          )
        })}
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
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#101C17',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
})
