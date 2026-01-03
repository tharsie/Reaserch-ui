export const optimizationMock = {
  fertilizerSchedule: [
    {
      id: 'f1',
      day: 'Mon',
      stage: 'Basal (before transplanting)',
      action: 'Incorporate P + K as basal',
      detail: 'Work into topsoil; avoid placing directly on seedlings.',
    },
    {
      id: 'f2',
      day: 'Wed',
      stage: 'Tillering',
      action: 'Apply Nitrogen split #1',
      detail: 'Apply on moist soil; irrigate lightly after if possible.',
    },
    {
      id: 'f3',
      day: 'Sat',
      stage: 'Panicle initiation',
      action: 'Apply Nitrogen split #2 + K top-up',
      detail: 'Avoid heavy rain days to reduce losses (runoff/leaching).',
    },
  ],
  doseRecommendations: [
    {
      id: 'd1',
      stage: 'Basal',
      nutrient: 'P2O5',
      product: 'TSP (Triple Super Phosphate)',
      rateKgHa: 40,
      reason: 'Supports early root development and improves early vigor.',
      confidence: 0.82,
    },
    {
      id: 'd2',
      stage: 'Tillering',
      nutrient: 'N',
      product: 'Urea',
      rateKgHa: 35,
      reason: 'Boosts tiller formation; split application improves uptake efficiency.',
      confidence: 0.76,
    },
    {
      id: 'd3',
      stage: 'Panicle initiation',
      nutrient: 'K2O',
      product: 'MOP (Muriate of Potash)',
      rateKgHa: 25,
      reason: 'Improves grain filling and reduces lodging risk in windy periods.',
      confidence: 0.7,
    },
  ],
  risks: [
    {
      id: 'k1',
      type: 'Leaching',
      severity: 'Medium',
      note: 'If heavy rain is expected, postpone urea by 1–2 days to reduce N losses.',
    },
    {
      id: 'k2',
      type: 'Runoff',
      severity: 'Low',
      note: 'Keep bunds intact; avoid surface application right before irrigation flush.',
    },
    {
      id: 'k3',
      type: 'Over-application',
      severity: 'High',
      note: 'Excess N can increase pest/disease pressure and reduce grain quality.',
    },
  ],
}
