const regions = ['North', 'South', 'East', 'West', 'Central']
const varieties = ['BG-352', 'BG-300', 'AT-362', 'LD-365']

export const forecastingOptions = {
  regions,
  varieties,
  horizons: [7, 30, 90],
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
  seasonalDivisor = 6,
  phase = 0,
  driftScale = 0.8,
  driftDirection = 1,
  rippleScale = 0.12,
}) {
  const points = []
  const steps = horizonDays

  const start = new Date(normalizeStartDateISO(startDate))
  for (let i = 1; i <= steps; i += 1) {
    const seasonal = Math.sin((i + phase) / seasonalDivisor) * volatility
    const drift = (i / steps) * volatility * driftScale * driftDirection
    const ripple = Math.cos((i + phase) / 3) * volatility * rippleScale
    const value = Math.round((base + seasonal + drift) * 10) / 10

    const date = new Date(start)
    date.setDate(start.getDate() + (i - 1))
    points.push({
      t: `D${i}`,
      date: date.toISOString().slice(0, 10),
      [key]: Math.round((value + ripple) * 10) / 10,
    })
  }
  return points
}

export function buildForecastingMock({ region, variety, horizonDays, startDate }) {
  const regionFactor = regions.indexOf(region) >= 0 ? regions.indexOf(region) : 1
  const varietyFactor = varieties.indexOf(variety) >= 0 ? varieties.indexOf(variety) : 1

  const priceBase = 88 + regionFactor * 2 + varietyFactor * 1.5
  const demandBase = 62 + regionFactor * 1.2 + varietyFactor * 1.0

  const priceForecast = buildSeries({
    horizonDays,
    base: priceBase,
    volatility: horizonDays <= 7 ? 2.2 : horizonDays <= 30 ? 4.8 : 7.5,
    key: 'price',
    startDate,
    seasonalDivisor: 6,
    phase: 0,
    driftScale: 0.85,
    driftDirection: 1,
  })

  const demandForecast = buildSeries({
    horizonDays,
    base: demandBase,
    volatility: horizonDays <= 7 ? 1.6 : horizonDays <= 30 ? 3.2 : 5.2,
    key: 'demand',
    startDate,
    seasonalDivisor: 4.5,
    phase: 2,
    driftScale: 0.55,
    driftDirection: -1,
    rippleScale: 0.2,
  })

  const sentimentScore = Math.max(
    10,
    Math.min(95, Math.round(62 + regionFactor * 3 - varietyFactor * 2)),
  )

  return {
    filters: { region, variety, horizonDays },
    priceForecast,
    demandForecast,
    sentiment: {
      score: sentimentScore,
      drivers: ['Policy', 'Weather', 'Supply chain'],
      notes: [
        { id: 's1', date: '2026-01-02', text: 'Policy chatter improved market outlook.' },
        { id: 's2', date: '2026-01-01', text: 'Weather uncertainty adds mild downside risk.' },
        { id: 's3', date: '2025-12-31', text: 'Supply chain constraints easing in major hubs.' },
      ],
    },
  }
}
