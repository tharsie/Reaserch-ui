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

export async function getForecasting({ horizonDays, startDate }) {
  const res = await client.post('/forecasting', {
    horizonDays,
    startDate: startDate || null,
  })
  return res.data
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
