export const reportsMock = {
  reportCards: [
    { id: 'rep1', title: 'Weekly Report', subtitle: 'Operations & risk summary', description: 'KPIs, alerts, and actions for the last 7 days.' },
    { id: 'rep2', title: 'Monthly Report', subtitle: 'Yield & cost overview', description: 'Aggregated performance, resource usage, and trends.' },
    { id: 'rep3', title: 'Region Summary', subtitle: 'Comparative insights', description: 'Regional benchmarks and forecast deltas.' },
  ],
  preview: {
    title: 'Report Preview (Dummy)',
    body:
      'This is a UI-only preview. In a production system, this section would render a formatted report generated from analytics outputs (yield forecasts, risk signals, sustainability metrics, and market insights).\n\nHighlights:\n- Expected yield remains stable with moderate weather risk.\n- Reduce irrigation cycles where soil moisture allows.\n- Increase scouting intensity during high-humidity windows.\n\nNext Steps:\n- Validate sensor calibrations in affected blocks.\n- Re-check nitrogen split schedule after cloudy period.',
  },
}
