import client from './client.js'
import { overviewMock } from '../data/overview.js'
import { optimizationMock } from '../data/optimization.js'
import { buildForecastingMock } from '../data/forecasting.js'
import { alertsMock } from '../data/alerts.js'
import { reportsMock } from '../data/reports.js'
import { settingsMock } from '../data/settings.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function safeGet(path, fallback) {
  try {
    const res = await client.get(path)
    return res.data
  } catch {
    // Placeholder: simulate network latency and use mock data.
    await delay(250)
    return fallback
  }
}

export async function getOverview() {
  return safeGet('/overview', overviewMock)
}

export async function getOptimization() {
  return safeGet('/optimization', optimizationMock)
}

export async function getForecasting({
  horizonDays,
  startDate,
  nitrogenN,
  phosphorusP,
  potassiumK,
}) {
  if (FORCE_MOCK_FORECASTING) {
    await delay(150)
    return buildForecastingMock({
      region: 'Central',
      variety: 'BG-352',
      horizonDays,
      startDate: startDate || null,
      nitrogenN: nitrogenN ?? null,
      phosphorusP: phosphorusP ?? null,
      potassiumK: potassiumK ?? null,
    })
  }

  try {
    const res = await client.post('/forecasting', {
      horizonDays,
      startDate: startDate || null,
      nitrogenN: nitrogenN ?? null,
      phosphorusP: phosphorusP ?? null,
      potassiumK: potassiumK ?? null,
    })
    return res.data
  } catch {
    await delay(250)
    return buildForecastingMock({
      region: 'Central',
      variety: 'BG-352',
      horizonDays,
      startDate: startDate || null,
      nitrogenN: nitrogenN ?? null,
      phosphorusP: phosphorusP ?? null,
      potassiumK: potassiumK ?? null,
    })
  }
}

export async function getAlerts() {
  return safeGet('/alerts', alertsMock)
}

export async function getReports() {
  return safeGet('/reports', reportsMock)
}

export async function getSettings() {
  return safeGet('/settings', settingsMock)
}

export async function getPestPrediction(stage, light, pressure, humidity, temperature) {
  await delay(800)
  // Simple mock logic for demonstration
  let risk = 0.2
  // Normalize inputs if they come in as strings or non-numbers
  const h = Number(humidity) || 0
  const t = Number(temperature) || 0
  const l = Number(light) || 0

  if (h > 80) risk += 0.3
  if (t > 30) risk += 0.2
  if (l < 200) risk += 0.1

  if (Math.random() > 0.5 || risk > 0.6) {
    return {
      predicted_pest: 'Brown Plant Hopper',
      probability: Math.min(risk, 0.95),
      recommended_action: 'Apply Imidacloprid 17.8 SL at 1ml/liter of water immediately.',
      severity: 'High'
    }
  } else {
    return {
      predicted_pest: 'Rice Blast',
      probability: 0.45,
      recommended_action: 'Monitor condition. If lesions appear, apply Tricyclazole 75 WP.',
      severity: 'Medium'
    }
  }
}
