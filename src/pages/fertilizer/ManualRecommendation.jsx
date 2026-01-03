import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const growthStages = [
  'Seedling',
  'Tillering',
  'Stem Elongation',
  'Booting',
  'Heading',
  'Flowering',
  'Milk Stage',
  'Dough Stage',
  'Maturity',
]

const purposes = [
  'Yield Maximization',
  'Cost Optimization',
  'Soil Health',
  'Balanced Growth',
  'Organic Farming',
]

export default function ManualRecommendation() {
  const [formData, setFormData] = useState({
    soilTemperature: '',
    soilMoisture: '',
    airTemperature: '',
    airHumidity: '',
    growthStage: '',
    purpose: '',
  })

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call with mock data
    setTimeout(() => {
      const mockResults = {
        top3: [
          {
            rank: 1,
            fertilizer: 'NPK 16-16-16',
            quantity: 140,
            predictedYield: 7.2,
            confidence: 92,
            note: 'Best for balanced growth and high yield. Recommended for current soil conditions.',
          },
          {
            rank: 2,
            fertilizer: 'Urea + DAP Mix',
            quantity: 100,
            predictedYield: 6.8,
            confidence: 87,
            note: 'Good alternative with lower initial cost. Suitable for budget-conscious farmers.',
          },
          {
            rank: 3,
            fertilizer: 'Organic Compost Blend',
            quantity: 200,
            predictedYield: 6.5,
            confidence: 82,
            note: 'Sustainable option for long-term soil health. Lower yield but better soil quality.',
          },
        ],
      }
      setResults(mockResults)
      setLoading(false)
    }, 1500)
  }

  const chartData = results?.top3
    ? results.top3.map((item) => ({
        name: item.fertilizer,
        yield: item.predictedYield,
        quantity: item.quantity,
      }))
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manual Recommendation</h1>
        <p className="mt-2 text-lg text-gray-600">
          Enter your field conditions to get AI-powered fertilizer recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Field Conditions</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="soilTemperature" className="block text-sm font-medium text-gray-700 mb-2">
                Soil Temperature (°C)
              </label>
              <input
                type="number"
                id="soilTemperature"
                name="soilTemperature"
                value={formData.soilTemperature}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                placeholder="e.g., 28"
                required
              />
            </div>

            <div>
              <label htmlFor="soilMoisture" className="block text-sm font-medium text-gray-700 mb-2">
                Soil Moisture (%)
              </label>
              <input
                type="number"
                id="soilMoisture"
                name="soilMoisture"
                value={formData.soilMoisture}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                placeholder="e.g., 65"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label htmlFor="airTemperature" className="block text-sm font-medium text-gray-700 mb-2">
                Air Temperature (°C)
              </label>
              <input
                type="number"
                id="airTemperature"
                name="airTemperature"
                value={formData.airTemperature}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                placeholder="e.g., 32"
                required
              />
            </div>

            <div>
              <label htmlFor="airHumidity" className="block text-sm font-medium text-gray-700 mb-2">
                Air Humidity (%)
              </label>
              <input
                type="number"
                id="airHumidity"
                name="airHumidity"
                value={formData.airHumidity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                placeholder="e.g., 75"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label htmlFor="growthStage" className="block text-sm font-medium text-gray-700 mb-2">
                Paddy Growth Stage
              </label>
              <select
                id="growthStage"
                name="growthStage"
                value={formData.growthStage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                required
              >
                <option value="">Select growth stage</option>
                {growthStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <select
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agri-green-500 focus:border-agri-green-500"
                required
              >
                <option value="">Select purpose</option>
                {purposes.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-agri-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-agri-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Generate Recommendation'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top 3 Recommendations</h2>
                <div className="space-y-4">
                  {results.top3.map((item, index) => (
                    <div
                      key={item.rank}
                      className={`p-4 rounded-lg border-2 ${
                        index === 0
                          ? 'bg-agri-green-50 border-agri-green-500'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-8 h-8 bg-agri-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {item.rank}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{item.fertilizer}</h3>
                        </div>
                        {index === 0 && (
                          <span className="text-xs bg-agri-green-600 text-white px-2 py-1 rounded">Recommended</span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Quantity</p>
                          <p className="text-sm font-semibold text-gray-900">{item.quantity} kg/acre</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Predicted Yield</p>
                          <p className="text-sm font-semibold text-gray-900">{item.predictedYield} ton/ha</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Confidence</p>
                          <p className="text-sm font-semibold text-gray-900">{item.confidence}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Yield Comparison</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="yield" fill="#22c55e" name="Yield (ton/ha)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌾</div>
                <p className="text-gray-600">Fill in the form and click "Generate Recommendation" to get results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
