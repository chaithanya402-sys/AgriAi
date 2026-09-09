import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/context/AuthContext'
import { FarmProvider } from './src/context/FarmContext'
import { AppNavigator } from './src/navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FarmProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </FarmProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
