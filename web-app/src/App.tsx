import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import {
  Login,
  Dashboard,
  Patients,
  PatientDetail,
  HealthChecks,
  Consultations,
  FollowUps,
  Alerts,
  Users,
  Reports,
} from '@/pages'
import { useAuthStore } from '@/store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/health-checks" element={<HealthChecks />} />
        <Route path="/consultations" element={<Consultations />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/users" element={<Users />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
