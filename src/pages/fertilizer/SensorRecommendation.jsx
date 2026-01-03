import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SensorRecommendation() {
  const [sensorData, setSensorData] = useState({
    soilTemperature: 28.5,
    soilMoisture: 65,
    airTemperature: 32.2,
    airHumidity: 75,
  })

  const [isConnected, setIsConnected] = useState(true)
  const [results, setResults] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Simulate live sensor updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setSensorData((prev) => ({
          soilTemperature: parseFloat((parseFloat(prev.soilTemperature) + (Math.random() - 0.5) * 0.5).toFixed(1)),
          soilMoisture: Math.max(40, Math.min(80, Math.round(prev.soilMoisture + (Math.random() - 0.5) * 2))),
          airTemperature: parseFloat((parseFloat(prev.airTemperature) + (Math.random() - 0.5) * 0.5).toFixed(1)),
          airHumidity: Math.max(60, Math.min(90, Math.round(prev.airHumidity + (Math.random() - 0.5) * 2))),
        }))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isConnected])

  // Auto-update recommendations when sensor data changes
  useEffect(() => {
    if (isConnected) {
      generateRecommendations()
    }
  }, [sensorData, isConnected])

  const generateRecommendations = () => {
    // Simulate AI prediction based on sensor data
    const mockResults = {
      top3: [
        {
          rank: 1,
          fertilizer: 'NPK 16-16-16',
          quantity: 140,
          predictedYield: 7.2,
          confidence: 92,
          note: 'Best for balanced growth and high yield based on current sensor readings.',
        },
        {
          rank: 2,
          fertilizer: 'Urea + DAP Mix',
          quantity: 100,
          predictedYield: 6.8,
          confidence: 87,
          note: 'Good alternative with lower initial cost.',
        },
        {
          rank: 3,
          fertilizer: 'Organic Compost Blend',
          quantity: 200,
          predictedYield: 6.5,
          confidence: 82,
          note: 'Sustainable option for long-term soil health.',
        },
      ],
    }
    setResults(mockResults)
    setLastUpdated(new Date().toLocaleTimeString())
  }

  // Generate history data for charts
  const [historyData, setHistoryData] = useState([])

  useEffect(() => {
    const generateHistory = () => {
      const data = []
      for (let i = 23; i >= 0; i--) {
        const time = new Date()
        time.setHours(time.getHours() - i)
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          temperature: 28 + Math.sin(i / 4) * 3 + Math.random() * 2,
          moisture: 60 + Math.sin(i / 3) * 10 + Math.random() * 5,
        })
      }
      setHistoryData(data)
    }
    generateHistory()
  }, [])

  const sensorCards = [
    { label: 'Soil Temperature', value: `${sensorData.soilTemperature}°C`, icon: '🌡️' },
    { label: 'Soil Moisture', value: `${sensorData.soilMoisture}%`, icon: '💧' },
    { label: 'Air Temperature', value: `${sensorData.airTemperature}°C`, icon: '🌡️' },
    { label: 'Air Humidity', value: `${sensorData.airHumidity}%`, icon: '☁️' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Sensor Recommendation</h1>
          <p className="mt-2 text-lg text-gray-600">
            Real-time sensor data for automated fertilizer recommendations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button
            onClick={() => setIsConnected(!isConnected)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Sensor Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensorCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-agri-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs text-gray-500">Live</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Temperature Trend (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#fee2e2" name="Temperature (°C)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Moisture Trend (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="moisture" stroke="#3b82f6" fill="#dbeafe" name="Moisture (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations Section */}
      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Auto-Generated Recommendations</h2>
            {lastUpdated && (
              <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{item.quantity} kg/acre</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Predicted Yield:</span>
                    <span className="font-semibold">{item.predictedYield} ton/ha</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold">{item.confidence}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
