import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FarmProvider } from '@/components/farm/FarmContext'

// Public
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

// Dashboard
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { FarmManagementPage } from '@/pages/dashboard/FarmManagementPage'
import { SoilPage } from '@/pages/dashboard/SoilPage'
import { CropPage } from '@/pages/dashboard/CropPage'
import { YieldPage } from '@/pages/dashboard/YieldPage'
import { IrrigationPage } from '@/pages/dashboard/IrrigationPage'
import { WeatherPage } from '@/pages/dashboard/WeatherPage'
import { DiseasePage } from '@/pages/dashboard/DiseasePage'
import { FertilizerPage } from '@/pages/dashboard/FertilizerPage'
import { RiskPage } from '@/pages/dashboard/RiskPage'
import { MarketPage } from '@/pages/dashboard/MarketPage'
import { ProfitPage } from '@/pages/dashboard/ProfitPage'
import { OptimizePage } from '@/pages/dashboard/OptimizePage'
import { AssistantPage } from '@/pages/dashboard/AssistantPage'
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage'
import { ReportsPage } from '@/pages/dashboard/ReportsPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'

function DashboardShell() {
  return (
    <ProtectedRoute>
      <FarmProvider>
        <DashboardLayout />
      </FarmProvider>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="farms" element={<FarmManagementPage />} />
        <Route path="soil" element={<SoilPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="yield" element={<YieldPage />} />
        <Route path="irrigation" element={<IrrigationPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="disease" element={<DiseasePage />} />
        <Route path="fertilizer" element={<FertilizerPage />} />
        <Route path="risk" element={<RiskPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="profit" element={<ProfitPage />} />
        <Route path="optimize" element={<OptimizePage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
