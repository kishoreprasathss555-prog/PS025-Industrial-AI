import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import MachinesPage from './pages/Machines'
import ToolsPage from './pages/Tools'
import PredictionsPage from './pages/Predictions'
import MaintenancePage from './pages/Maintenance'
import OptimizationPage from './pages/Optimization'
import AlertsPage from './pages/Alerts'
import SimulatorPage from './pages/Simulator'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-cyan-400 text-sm animate-pulse">Initializing PS-025...</div>
    </div>
  )
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="machines" element={<MachinesPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="optimization" element={<OptimizationPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
