const regions = ['North', 'South', 'East', 'West', 'Central']
const varieties = ['BG-352', 'BG-300', 'AT-362', 'LD-365']

export const forecastingOptions = {
  regions,
  varieties,
  horizons: [7, 30, 90],
}

function hashToSeed(input) {
  const str = String(input ?? '')
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function rand() {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function getDefaultStartDateISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function normalizeStartDateISO(startDate) {
  if (!startDate) return getDefaultStartDateISO()
  const d = new Date(startDate)
  if (Number.isNaN(d.getTime())) return getDefaultStartDateISO()
  return d.toISOString().slice(0, 10)
}

function buildSeries({
  horizonDays,
  base,
  volatility,
  key,
  startDate,
  driftScale = 0.35,
  driftDirection = 1,
  walkScale = 0.9,
  shockChance = 0.15,
  shockScale = 2.4,
  meanReversion = 0.08,
}) {
  const points = []
  const steps = horizonDays

  const start = new Date(normalizeStartDateISO(startDate))
  const rand = mulberry32(hashToSeed(`${key}|${normalizeStartDateISO(startDate)}|${base}|${volatility}|${steps}`))

  let current = base + (rand() - 0.5) * volatility * 0.6
  for (let i = 1; i <= steps; i += 1) {
    const drift = (i / steps) * volatility * driftScale * driftDirection
    const walk = (rand() - 0.5) * volatility * walkScale

    // Occasional sudden jump up/down (spike/drop)
    const shock = rand() < shockChance
      ? (rand() < 0.5 ? -1 : 1) * volatility * shockScale * (0.6 + rand())
      : 0

    // Mean reversion prevents runaway growth.
    const revert = (base - current) * meanReversion

    current = current + drift + walk + shock + revert
    const value = Math.round(current * 10) / 10

    const date = new Date(start)
    date.setDate(start.getDate() + (i - 1))
    points.push({
      t: `D${i}`,
      date: date.toISOString().slice(0, 10),
      [key]: value,
    })
  }
  return points
}

export function buildForecastingMock({
  region,
  variety,
  horizonDays,
  startDate,
  nitrogenN,
  phosphorusP,
  potassiumK,
}) {
  const regionFactor = regions.indexOf(region) >= 0 ? regions.indexOf(region) : 1
  const varietyFactor = varieties.indexOf(variety) >= 0 ? varieties.indexOf(variety) : 1

  const n = Number.isFinite(Number(nitrogenN)) ? Number(nitrogenN) : null
  const p = Number.isFinite(Number(phosphorusP)) ? Number(phosphorusP) : null
  const k = Number.isFinite(Number(potassiumK)) ? Number(potassiumK) : null

  // Simple mock influence from soil nutrients (UI-only):
  // Higher nutrients -> slightly higher demand index and slightly lower price index.
  const nutrientMean = [n, p, k].filter((v) => typeof v === 'number').reduce((a, b) => a + b, 0)
  const nutrientCount = [n, p, k].filter((v) => typeof v === 'number').length
  const nutrientIndex = nutrientCount ? nutrientMean / nutrientCount : 0
  const nutrientDelta = Math.max(-0.35, Math.min(0.35, (nutrientIndex - 40) / 120))

  const priceBase = 88 + regionFactor * 2 + varietyFactor * 1.5 - nutrientDelta * 8
  const demandBase = 62 + regionFactor * 1.2 + varietyFactor * 1.0 + nutrientDelta * 10

  const priceForecast = buildSeries({
    horizonDays,
    base: priceBase,
    volatility: horizonDays <= 7 ? 2.2 : horizonDays <= 30 ? 4.8 : 7.5,
    key: 'price',
    startDate,
    driftScale: 0.28,
    driftDirection: 1,
    walkScale: 0.85,
    shockChance: horizonDays <= 7 ? 0.18 : 0.12,
    shockScale: 2.1,
    meanReversion: 0.09,
  })

  const demandForecast = buildSeries({
    horizonDays,
    base: demandBase,
    volatility: horizonDays <= 7 ? 1.6 : horizonDays <= 30 ? 3.2 : 5.2,
    key: 'demand',
    startDate,
    driftScale: 0.18,
    driftDirection: -1,
    walkScale: 1.05,
    shockChance: horizonDays <= 7 ? 0.22 : 0.17,
    shockScale: 2.8,
    meanReversion: 0.07,
  })

  const sentimentScore = Math.max(
    10,
    Math.min(95, Math.round(62 + regionFactor * 3 - varietyFactor * 2)),
  )

  const drivers = ['Policy', 'Weather', 'Supply chain']
  if (nutrientCount) drivers.unshift('Soil nutrients (NPK)')

  return {
    filters: {
      region,
      variety,
      horizonDays,
      nitrogenN: n,
      phosphorusP: p,
      potassiumK: k,
    },
    priceForecast,
    demandForecast,
    sentiment: {
      score: sentimentScore,
      drivers,
      notes: [
        { id: 's1', date: '2026-01-02', text: 'Policy chatter improved market outlook.' },
        { id: 's2', date: '2026-01-01', text: 'Weather uncertainty adds mild downside risk.' },
        { id: 's3', date: '2025-12-31', text: 'Supply chain constraints easing in major hubs.' },
      ],
    },
  }
}
