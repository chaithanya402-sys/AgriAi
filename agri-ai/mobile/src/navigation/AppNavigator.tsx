import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { TabNavigator } from './TabNavigator'
import { LoginScreen } from '../screens/LoginScreen'
import { CropRecommendationScreen } from '../screens/CropRecommendationScreen'
import { YieldPredictionScreen } from '../screens/YieldPredictionScreen'
import { IrrigationScreen } from '../screens/IrrigationScreen'
import { DiseaseDetectionScreen } from '../screens/DiseaseDetectionScreen'
import { FertilizerScreen } from '../screens/FertilizerScreen'
import { RiskAnalysisScreen } from '../screens/RiskAnalysisScreen'
import { MarketPricesScreen } from '../screens/MarketPricesScreen'
import { ReportsScreen } from '../screens/ReportsScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { colors } from '../theme/colors'
import { View, ActivityIndicator } from 'react-native'

const Stack = createNativeStackNavigator()

export function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.brand,
          headerTitleStyle: {
            fontWeight: '700',
            color: colors.textPrimary,
          },
          headerShadowVisible: false,
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CropRecommendation"
              component={CropRecommendationScreen}
              options={{ title: 'Crop Recommendation' }}
            />
            <Stack.Screen
              name="YieldPrediction"
              component={YieldPredictionScreen}
              options={{ title: 'Yield Prediction' }}
            />
            <Stack.Screen
              name="Irrigation"
              component={IrrigationScreen}
              options={{ title: 'Irrigation Intelligence' }}
            />
            <Stack.Screen
              name="DiseaseDetection"
              component={DiseaseDetectionScreen}
              options={{ title: 'Plant Disease AI' }}
            />
            <Stack.Screen
              name="Fertilizer"
              component={FertilizerScreen}
              options={{ title: 'Fertilizer Advisory' }}
            />
            <Stack.Screen
              name="RiskAnalysis"
              component={RiskAnalysisScreen}
              options={{ title: 'Farm Risk Assessment' }}
            />
            <Stack.Screen
              name="MarketPrices"
              component={MarketPricesScreen}
              options={{ title: 'Mandi Market Rates' }}
            />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
              options={{ title: 'Farm Audits & Reports' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
