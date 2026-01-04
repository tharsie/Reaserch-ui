import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const features = [
  {
    icon: '📊',
    title: 'AI-Powered Analysis',
    description: 'Machine learning models analyze soil and environmental conditions to provide accurate recommendations',
  },
  {
    icon: '🌡️',
    title: 'Real-Time Monitoring',
    description: 'Live sensor data integration for continuous field condition monitoring',
  },
  {
    icon: '🎯',
    title: 'Precision Recommendations',
    description: 'Top 3 fertilizer options with quantity, yield prediction, and confidence scores',
  },
  {
    icon: '📈',
    title: 'Yield Forecasting',
    description: 'Predict crop yield based on fertilizer application and growth stage',
  },
]

const workflowSteps = [
  { step: 1, title: 'Data Collection', description: 'Collect soil temperature, moisture, air temperature, and humidity data', icon: '📥' },
  { step: 2, title: 'Input Processing', description: 'Process growth stage and purpose along with sensor data', icon: '⚙️' },
  { step: 3, title: 'AI Analysis', description: 'ML models analyze inputs and generate fertilizer recommendations', icon: '🤖' },
  { step: 4, title: 'Recommendations', description: 'Display top 3 fertilizers with quantity, yield, and confidence', icon: '✅' },
  { step: 5, title: 'Implementation', description: 'Apply recommended fertilizer and track results', icon: '🌾' },
]

const yieldData = [
  { month: 'Jan', yield: 4.2 },
  { month: 'Feb', yield: 4.5 },
  { month: 'Mar', yield: 4.8 },
  { month: 'Apr', yield: 5.1 },
  { month: 'May', yield: 5.4 },
  { month: 'Jun', yield: 5.7 },
]

export default function FertilizerOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fertilizer Recommendation System</h1>
        <p className="mt-2 text-lg text-gray-600">
          AI-powered fertilizer recommendations to optimize crop yield and reduce costs
        </p>
      </div>

      {/* System Explanation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-700 mb-4">
          Our AI-based fertilizer recommendation system uses machine learning models to analyze field conditions
          and provide optimal fertilizer recommendations. The system takes into account soil temperature, soil moisture,
          air temperature, air humidity, paddy growth stage, and farming purpose to generate personalized recommendations.
        </p>
        <p className="text-gray-700">
          The system provides top 3 fertilizer options with detailed information including recommended quantity (kg/acre),
          predicted yield (ton/ha), and confidence percentage. This helps farmers make informed decisions to maximize
          crop yield while optimizing costs.
        </p>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Workflow</h2>
        <div className="relative">
          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="bg-agri-green-50 border-2 border-agri-green-500 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="w-8 h-8 bg-agri-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <svg className="w-4 h-4 text-agri-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Summary */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Yield Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Average Yield Trend (ton/ha)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yieldData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="yield" stroke="#22c55e" strokeWidth={2} name="Yield (ton/ha)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
