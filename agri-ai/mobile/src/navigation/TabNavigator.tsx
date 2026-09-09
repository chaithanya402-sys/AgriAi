import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Platform } from 'react-native'
import { DashboardScreen } from '../screens/DashboardScreen'
import { FarmManagementScreen } from '../screens/FarmManagementScreen'
import { SoilAnalysisScreen } from '../screens/SoilAnalysisScreen'
import { WeatherScreen } from '../screens/WeatherScreen'
import { MoreMenuScreen } from '../screens/MoreMenuScreen'
import { colors } from '../theme/colors'
import { LayoutDashboard, Home, FlaskConical, CloudSun, Grid } from 'lucide-react-native'

const Tab = createBottomTabNavigator()

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="FarmTab"
        component={FarmManagementScreen}
        options={{
          tabBarLabel: 'Farm',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tab.Screen
        name="SoilTab"
        component={SoilAnalysisScreen}
        options={{
          tabBarLabel: 'Soil',
          tabBarIcon: ({ color, size }) => (
            <FlaskConical size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WeatherTab"
        component={WeatherScreen}
        options={{
          tabBarLabel: 'Weather',
          tabBarIcon: ({ color, size }) => (
            <CloudSun size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreMenuScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <Grid size={size || 22} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
