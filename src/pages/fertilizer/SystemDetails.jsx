import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const dataSources = [
  {
    name: 'Soil Sensors',
    description: 'Real-time soil temperature and soil moisture measurements',
    frequency: 'Every 5 minutes',
  },
  {
    name: 'Air Sensors',
    description: 'Real-time air temperature and air humidity measurements',
    frequency: 'Every 5 minutes',
  },
  {
    name: 'Farmer Input',
    description: 'Paddy growth stage and farming purpose provided by the farmer',
    frequency: 'On-demand',
  },
  {
    name: 'Historical Farm Data',
    description: 'Past yield records, fertilizer usage, and crop performance',
    frequency: 'On-demand',
  },
]

const mlModels = [
  {
    name: 'Random Forest Regressor',
    purpose: 'Yield Prediction',
    accuracy: 87,
    features: ['Soil temperature', 'Soil moisture', 'Air temperature', 'Air humidity', 'Growth stage'],
    status: 'Active',
  },
  {
    name: 'Neural Network',
    purpose: 'Fertilizer Recommendation',
    accuracy: 91,
    features: ['Multi-sensor data', 'Growth stage', 'Purpose', 'Historical patterns'],
    status: 'Active',
  },
  {
    name: 'Gradient Boosting',
    purpose: 'Confidence Scoring',
    accuracy: 84,
    features: ['Input quality', 'Historical accuracy', 'Model agreement'],
    status: 'Active',
  },
  {
    name: 'Time Series LSTM',
    purpose: 'Yield Forecasting',
    accuracy: 89,
    features: ['Temporal patterns', 'Seasonal trends', 'Growth progression'],
    status: 'Active',
  },
]

const validationMetrics = [
  { metric: 'R² Score', value: 0.89, target: 0.85, status: 'excellent' },
  { metric: 'MAE (Mean Absolute Error)', value: 0.32, target: 0.50, status: 'excellent' },
  { metric: 'RMSE (Root Mean Square Error)', value: 0.45, target: 0.60, status: 'excellent' },
  { metric: 'Cross-Validation Score', value: 0.87, target: 0.80, status: 'excellent' },
]

const modelPerformance = [
  { model: 'Random Forest', accuracy: 87, precision: 85, recall: 88 },
  { model: 'Neural Network', accuracy: 91, precision: 89, recall: 92 },
  { model: 'Gradient Boosting', accuracy: 84, precision: 82, recall: 85 },
  { model: 'LSTM', accuracy: 89, precision: 87, recall: 90 },
]

const pieData = [
  { name: 'Training Data', value: 70, color: '#22c55e' },
  { name: 'Validation Data', value: 15, color: '#3b82f6' },
  { name: 'Test Data', value: 15, color: '#f59e0b' },
]

export default function SystemDetails() {
  const [selectedModel, setSelectedModel] = useState(0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Details</h1>
        <p className="mt-2 text-lg text-gray-600">
          Technical specifications, data sources, and ML model information
        </p>
      </div>

      {/* Data Sources */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataSources.map((source, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-agri-green-500">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{source.name}</h3>
              <p className="text-gray-600 mb-3">{source.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2">📊</span>
                <span>Update frequency: {source.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Models */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Machine Learning Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mlModels.map((model, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md p-6 border-2 cursor-pointer transition-all ${
                selectedModel === index ? 'border-agri-green-500' : 'border-gray-200 hover:border-agri-green-300'
              }`}
              onClick={() => setSelectedModel(index)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{model.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{model.status}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Purpose: {model.purpose}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className="text-sm font-semibold text-gray-900">{model.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-agri-green-600 h-2 rounded-full"
                    style={{ width: `${model.accuracy}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {model.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-agri-green-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Performance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Model Performance Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={modelPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#22c55e" name="Accuracy (%)" />
            <Bar dataKey="precision" fill="#3b82f6" name="Precision (%)" />
            <Bar dataKey="recall" fill="#f59e0b" name="Recall (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Validation Approach */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Evaluation Metrics</h2>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Metrics</h3>
          <div className="space-y-4">
            {validationMetrics.map((metric, index) => (
              <div key={index} className="border-l-4 border-agri-green-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{metric.metric}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Target: {metric.target}</span>
                    <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {metric.status}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-agri-green-600 h-2 rounded-full"
                    style={{ width: `${(metric.value / metric.target) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Split</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Methodology</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-agri-green-500 mr-2">✓</span>
                <span>K-fold cross-validation (k=5) for robust model evaluation</span>
              </li>
              <li className="flex items-start">
                <span className="text-agri-green-500 mr-2">✓</span>
                <span>Time-series split to prevent data leakage</span>
              </li>
              <li className="flex items-start">
                <span className="text-agri-green-500 mr-2">✓</span>
                <span>Hold-out test set (15%) for final model assessment</span>
              </li>
              <li className="flex items-start">
                <span className="text-agri-green-500 mr-2">✓</span>
                <span>Regular retraining with new data every quarter</span>
              </li>
              <li className="flex items-start">
                <span className="text-agri-green-500 mr-2">✓</span>
                <span>A/B testing in production for model comparison</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Data Collection Layer</h3>
            <p className="text-sm text-gray-600">
              Soil and air sensors collect real-time temperature and moisture data. Farmers provide growth stage and purpose inputs.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Processing Layer</h3>
            <p className="text-sm text-gray-600">
              Data preprocessing, feature engineering, and ML model inference to generate fertilizer recommendations.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Application Layer</h3>
            <p className="text-sm text-gray-600">
              User interface displays top 3 fertilizer recommendations with quantity, yield prediction, and confidence scores.
            </p>
          </div>
        </div>
      </div>

      {/* API Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">API Endpoints</h2>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <code className="text-sm text-gray-700">
              POST /api/fertilizer/recommend - Get fertilizer recommendation
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <code className="text-sm text-gray-700">
              GET /api/fertilizer/history - Retrieve recommendation history
            </code>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <code className="text-sm text-gray-700">
              GET /api/sensors/data - Get real-time sensor data
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
