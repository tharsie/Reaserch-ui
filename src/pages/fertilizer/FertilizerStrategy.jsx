import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const topRecommendations = [
  {
    id: 1,
    name: 'NPK 16-16-16',
    quantity: 140,
    yield: 7.2,
    cost: 12500,
    confidence: 92,
    note: 'Best for balanced growth and high yield. Recommended for current soil conditions.',
    colorClass: 'bg-green-100 text-green-700',
  },
  {
    id: 2,
    name: 'Urea + DAP Mix',
    quantity: 100,
    yield: 6.8,
    cost: 9800,
    confidence: 87,
    note: 'Good alternative with lower initial cost. Suitable for budget-conscious farmers.',
    colorClass: 'bg-blue-100 text-blue-700',
  },
  {
    id: 3,
    name: 'Organic Compost Blend',
    quantity: 200,
    yield: 6.5,
    cost: 11200,
    confidence: 82,
    note: 'Sustainable option for long-term soil health. Lower yield but better soil quality.',
    colorClass: 'bg-amber-100 text-amber-700',
  },
]

const yieldComparison = [
  { fertilizer: 'NPK 16-16-16', yield: 7.2 },
  { fertilizer: 'Urea + DAP', yield: 6.8 },
  { fertilizer: 'Organic Blend', yield: 6.5 },
  { fertilizer: 'Current Practice', yield: 5.8 },
]

const confidenceData = [
  { name: 'NPK 16-16-16', value: 92, color: '#22c55e' },
  { name: 'Urea + DAP', value: 87, color: '#3b82f6' },
  { name: 'Organic Blend', value: 82, color: '#f59e0b' },
]

export default function FertilizerStrategy() {
  const [selectedStrategy, setSelectedStrategy] = useState(1)

  const selected = topRecommendations.find((r) => r.id === selectedStrategy)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fertilizer Analysis</h1>
        <p className="mt-2 text-lg text-gray-600">
          Compare top fertilizer recommendations with yield projections and confidence scores
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Fertilizer vs Yield */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fertilizer vs Yield</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yieldComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fertilizer" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yield" fill="#22c55e" name="Yield (ton/ha)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doughnut Chart: Confidence */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Confidence Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={confidenceData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Fertilizer Comparison Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fertilizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity (kg/acre)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predicted Yield (ton/ha)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost (LKR)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topRecommendations.map((rec, index) => (
                <tr
                  key={rec.id}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedStrategy === rec.id ? 'bg-agri-green-50' : ''
                  }`}
                  onClick={() => setSelectedStrategy(rec.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="w-8 h-8 bg-agri-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {rec.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{rec.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rec.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rec.yield}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rec.confidence}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{rec.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Explanation Box */}
      {selected && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Insight Explanation</h2>
          <div className="bg-agri-green-50 border-l-4 border-agri-green-500 p-6 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-agri-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {selected.id}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selected.name}</h3>
                <p className="text-gray-700 mb-4">{selected.note}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">{selected.quantity} kg/acre</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Predicted Yield</p>
                    <p className="text-lg font-semibold text-gray-900">{selected.yield} ton/ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold text-gray-900">{selected.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="text-lg font-semibold text-gray-900">LKR {selected.cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
