import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/services/auth'
import { PageLoader } from '@/components/ui/Loading'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageLoader label="Checking your session…" />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
