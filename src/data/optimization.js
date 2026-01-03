export const optimizationMock = {
  cropPlan: [
    { id: 'w1', day: 'Mon', action: 'Seedling nursery check', detail: 'Inspect germination and tray moisture.' },
    { id: 'w2', day: 'Tue', action: 'Irrigation', detail: 'Maintain shallow water level (2–3 cm).' },
    { id: 'w3', day: 'Wed', action: 'Fertilizer (N)', detail: 'Apply split dose based on leaf color chart.' },
    { id: 'w4', day: 'Thu', action: 'Weed management', detail: 'Mechanical weeding in rows; spot-check edges.' },
    { id: 'w5', day: 'Fri', action: 'Pest scouting', detail: 'Check for stem borer and blast symptoms.' },
    { id: 'w6', day: 'Sat', action: 'Irrigation', detail: 'Adjust based on rainfall; avoid over-flooding.' },
    { id: 'w7', day: 'Sun', action: 'Record update', detail: 'Log operations and sensor readings.' },
  ],
  resourceRecommendations: [
    {
      id: 'r1',
      action: 'Reduce irrigation frequency by 1 cycle/week',
      reason: 'Soil moisture remains within target band; rainfall probability is elevated.',
      confidence: 0.78,
    },
    {
      id: 'r2',
      action: 'Shift nitrogen split by +3 days',
      reason: 'Forecast suggests cloudy period; better uptake expected after sunlight improves.',
      confidence: 0.66,
    },
    {
      id: 'r3',
      action: 'Prioritize scouting in Block C',
      reason: 'Microclimate + humidity trend increases disease risk.',
      confidence: 0.72,
    },
  ],
  risks: [
    { id: 'k1', type: 'Pest', severity: 'High', note: 'Blast risk rising with humidity spikes.' },
    { id: 'k2', type: 'Drought', severity: 'Low', note: 'Reservoir levels stable; short dry spell possible.' },
    { id: 'k3', type: 'Flood', severity: 'Medium', note: 'Localized heavy rainfall risk in lowlands.' },
  ],
}
