import { NavLink, Outlet, useLocation } from 'react-router-dom'

const subNavItems = [
  { key: 'overview', label: 'Overview', to: '/fertilizer-recommendation' },
  { key: 'manual', label: 'Manual Recommendation', to: '/fertilizer-recommendation/manual' },
  { key: 'sensor', label: 'Sensor-Based Recommendation', to: '/fertilizer-recommendation/sensor' },
  { key: 'strategy', label: 'Fertilizer Strategy', to: '/fertilizer-recommendation/strategy' },
  { key: 'yield-forecast', label: 'Yield Forecast Insight', to: '/fertilizer-recommendation/yield-forecast' },
  { key: 'history', label: 'Recommendation History', to: '/fertilizer-recommendation/history' },
  { key: 'system-details', label: 'System Details', to: '/fertilizer-recommendation/system-details' },
]

export default function FertilizerLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto" aria-label="Sub navigation">
            {subNavItems.map((item) => {
              const isActive = location.pathname === item.to || 
                (item.to === '/fertilizer-recommendation' && location.pathname === '/fertilizer-recommendation')
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={`
                    px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${isActive
                      ? 'border-agri-green-600 text-agri-green-700 bg-agri-green-50'
                      : 'border-transparent text-gray-600 hover:text-agri-green-600 hover:border-gray-300'
                    }
                  `}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  )
}

