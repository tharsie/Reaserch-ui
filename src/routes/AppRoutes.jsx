import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import DashboardOverview from '../pages/DashboardOverview.jsx'
import FarmingOptimization from '../pages/FarmingOptimization.jsx'
import Forecasting from '../pages/Forecasting.jsx'
import Alerts from '../pages/Alerts.jsx'
import Reports from '../pages/Reports.jsx'
import Settings from '../pages/Settings.jsx'
import NotFound from '../pages/NotFound.jsx'
import FertilizerRecommendation from '../pages/fertilizer/FertilizerRecommendation.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/farming-optimization" element={<FarmingOptimization />} />
        <Route path="/forecasting" element={<Forecasting />} />
        <Route path="/fertilizer-recommendation" element={<FertilizerRecommendation />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
