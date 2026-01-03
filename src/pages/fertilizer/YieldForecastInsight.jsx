import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const quantityVsYield = [
  { quantity: 80, yield: 6.2 },
  { quantity: 100, yield: 6.8 },
  { quantity: 120, yield: 7.0 },
  { quantity: 140, yield: 7.2 },
  { quantity: 160, yield: 7.1 },
  { quantity: 180, yield: 6.9 },
  { quantity: 200, yield: 6.5 },
]

const yieldComparison = [
  { fertilizer: 'NPK 16-16-16', yield: 7.2, quantity: 140 },
  { fertilizer: 'Urea + DAP', yield: 6.8, quantity: 100 },
  { fertilizer: 'Organic Blend', yield: 6.5, quantity: 200 },
  { fertilizer: 'Current Practice', yield: 5.8, quantity: 120 },
]

export default function YieldForecastInsight() {
  const [selectedYield] = useState(7.2)
  const category = selectedYield >= 6.5 ? 'high' : selectedYield >= 5.5 ? 'medium' : 'low'

  const advisoryNotes = {
    low: [
      'Apply recommended fertilizer immediately to improve soil nutrients',
      'Consider soil testing to identify specific nutrient deficiencies',
      'Monitor soil moisture levels and irrigation schedule',
      'Consult with agricultural extension officer for additional support',
    ],
    medium: [
      'Continue with current fertilizer application schedule',
      'Monitor crop growth and adjust fertilizer if needed',
      'Maintain optimal irrigation and soil moisture levels',
      'Consider additional organic matter to boost soil health',
    ],
    high: [
      'Excellent yield potential! Maintain current practices',
      'Continue monitoring soil conditions and adjust as needed',
      'Consider crop rotation planning for next season',
      'Document successful practices for future reference',
    ],
  }

  const currentAdvisory = advisoryNotes[category]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Yield Forecast Insight</h1>
        <p className="mt-2 text-lg text-gray-600">
          AI-powered yield predictions with actionable insights and recommendations
        </p>
      </div>

      {/* Main Yield Indicator */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{category === 'high' ? '✅' : category === 'medium' ? '📊' : '⚠️'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Predicted Yield</h2>
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {selectedYield} <span className="text-2xl text-gray-600">ton/ha</span>
          </div>
          <div
            className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
              category === 'high'
                ? 'bg-green-500'
                : category === 'medium'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          >
            {category === 'high' ? 'High' : category === 'medium' ? 'Medium' : 'Low'} Yield Category
          </div>
        </div>

        {/* Yield Gauge Visualization */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="relative">
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  category === 'high'
                    ? 'from-green-400 to-green-600'
                    : category === 'medium'
                    ? 'from-yellow-400 to-yellow-600'
                    : 'from-red-400 to-red-600'
                } transition-all duration-1000`}
                style={{ width: `${Math.min(100, (selectedYield / 8) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Quantity vs Yield */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quantity vs Yield</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={quantityVsYield}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quantity" label={{ value: 'Quantity (kg/acre)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Yield (ton/ha)', angle: -90, position: 'insideLeft' }} />
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

        {/* Bar Chart: Yield Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Yield Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>

      {/* Advisory Text */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Advisory Recommendations</h2>
        <div className="space-y-3">
          {currentAdvisory.map((note, index) => (
            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
              <span className="text-agri-green-500 mr-3 mt-1">•</span>
              <p className="text-gray-700 flex-1">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Forecast Confidence</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">87%</p>
          <p className="text-xs text-gray-500 mt-1">Based on ML model accuracy</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Yield Improvement</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">+24%</p>
          <p className="text-xs text-gray-500 mt-1">vs. historical average</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-sm font-medium text-gray-600">Expected Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">LKR 324K</p>
          <p className="text-xs text-gray-500 mt-1">per hectare</p>
        </div>
      </div>
    </div>
  )
}
