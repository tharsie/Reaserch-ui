import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const mockHistory = [
  {
    id: 1,
    date: '2024-01-15',
    growthStage: 'Tillering',
    fertilizer: 'NPK 16-16-16',
    quantity: 140,
    yield: 7.2,
    status: 'completed',
  },
  {
    id: 2,
    date: '2024-01-08',
    growthStage: 'Seedling',
    fertilizer: 'Urea',
    quantity: 80,
    yield: 6.5,
    status: 'completed',
  },
  {
    id: 3,
    date: '2024-01-01',
    growthStage: 'Seedling',
    fertilizer: 'DAP',
    quantity: 60,
    yield: 6.2,
    status: 'completed',
  },
  {
    id: 4,
    date: '2023-12-25',
    growthStage: 'Maturity',
    fertilizer: 'NPK 14-14-14',
    quantity: 125,
    yield: 6.8,
    status: 'completed',
  },
  {
    id: 5,
    date: '2023-12-18',
    growthStage: 'Dough Stage',
    fertilizer: 'Potash',
    quantity: 50,
    yield: 6.5,
    status: 'completed',
  },
  {
    id: 6,
    date: '2023-12-10',
    growthStage: 'Flowering',
    fertilizer: 'NPK 16-16-16',
    quantity: 120,
    yield: 6.9,
    status: 'completed',
  },
  {
    id: 7,
    date: '2023-12-03',
    growthStage: 'Heading',
    fertilizer: 'Urea + DAP',
    quantity: 100,
    yield: 6.7,
    status: 'completed',
  },
  {
    id: 8,
    date: '2023-11-26',
    growthStage: 'Booting',
    fertilizer: 'NPK 14-14-14',
    quantity: 110,
    yield: 6.4,
    status: 'completed',
  },
]

const chartData = mockHistory
  .slice(0, 6)
  .reverse()
  .map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    yield: item.yield,
  }))

export default function RecommendationHistory() {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const filteredHistory = [...mockHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date)
    } else if (sortBy === 'yield') {
      return b.yield - a.yield
    }
    return 0
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recommendation History</h1>
          <p className="mt-2 text-lg text-gray-600">
            Track all your previous fertilizer recommendations and their outcomes
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
          >
            <option value="date">Sort by Date</option>
            <option value="yield">Sort by Yield</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Total Recommendations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{mockHistory.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Average Yield</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {(mockHistory.reduce((sum, item) => sum + item.yield, 0) / mockHistory.length).toFixed(1)} ton/ha
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-sm font-medium text-gray-600">Best Yield</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {Math.max(...mockHistory.map((item) => item.yield))} ton/ha
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
          <p className="text-sm font-medium text-gray-600">Total Fertilizer Used</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {mockHistory.reduce((sum, item) => sum + item.quantity, 0)} kg
          </p>
        </div>
      </div>

      {/* Yield Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Yield Trend (Last 6 Recommendations)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="yield"
              stroke="#22c55e"
              strokeWidth={3}
              name="Yield (ton/ha)"
              dot={{ fill: '#22c55e', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recommendation Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fertilizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg/acre)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yield (ton/ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.growthStage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    {item.fertilizer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.yield}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Data</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-agri-green-600 text-white rounded-lg hover:bg-agri-green-700 transition-colors">
            Export as CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export as PDF
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Print Report
          </button>
        </div>
      </div>
    </div>
  )
}

