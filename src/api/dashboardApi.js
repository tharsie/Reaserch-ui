import client from './client.js'
import { overviewMock } from '../data/overview.js'
import { optimizationMock } from '../data/optimization.js'
import { buildForecastingMock } from '../data/forecasting.js'
import { alertsMock } from '../data/alerts.js'
import { reportsMock } from '../data/reports.js'
import { settingsMock } from '../data/settings.js'

const FORCE_MOCK_FORECASTING = true

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
