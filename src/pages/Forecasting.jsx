import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PageHeader from '../components/PageHeader.jsx'
import ChartCard from '../components/ChartCard.jsx'
import { getForecasting } from '../api/dashboardApi.js'

export default function Forecasting() {
  const [horizonDays, setHorizonDays] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function runForecast() {
    setLoading(true)
    setError(null)
    try {
      const res = await getForecasting({
        horizonDays,
        startDate: startDate ? startDate : null,
      })
      setData(res)
    } catch (e) {
      setData(null)
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        'Failed to load forecasting data. Ensure the Python API is running on http://127.0.0.1:8000.'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  // Run once on first render with defaults. User-triggered afterwards.
  useEffect(() => {
    runForecast()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sentiment = useMemo(() => data?.sentiment ?? null, [data])
  const recommendation = data?.recommendation
  const runSummary = useMemo(() => {
    const firstDate = data?.priceForecast?.[0]?.date
    const days = data?.priceForecast?.length
    if (!firstDate || !days) return null
    return `Last run: ${days} day(s) starting ${firstDate}`
  }, [data])

  return (
    <Box>
      <PageHeader
        title="Sales and demand forcasting"
        subtitle="Filter-based price/demand forecasting with sentiment insights"
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Horizon (days)"
              type="number"
              value={horizonDays}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v)) setHorizonDays(v)
              }}
              inputProps={{ min: 1, step: 1 }}
              helperText="Enter number of days (e.g., 7, 30, 90)"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Start date (optional)"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Controls the chart date labels. If empty, API uses tomorrow."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Button
              variant="contained"
              onClick={runForecast}
              disabled={loading}
              sx={{ height: 56 }}
            >
              Run forecast
            </Button>
          </Grid>
        </Grid>
        {runSummary ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {runSummary}
          </Typography>
        ) : null}
      </Paper>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={12}>
          <ChartCard title="Price Forecast" subtitle="AI model forecast (LKR / kg)">
            <Box sx={{ width: '100%', height: { xs: 320, md: 440, lg: 560 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.priceForecast ?? []} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        <Grid size={12}>
          <ChartCard title="Demand Forecast" subtitle="AI model forecast (tons)">
            <Box sx={{ width: '100%', height: { xs: 320, md: 440, lg: 560 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.demandForecast ?? []} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="demand" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        <Grid size={12}>
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Sentiment Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Sentiment gauge
              </Typography>
              <LinearProgress
                variant="determinate"
                value={sentiment?.score ?? 0}
                sx={{ height: 10, borderRadius: 8 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Score: {sentiment?.score ?? '--'} / 100
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Top Drivers
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {(sentiment?.drivers ?? []).map((d) => (
                    <ListItem key={d} sx={{ px: 0 }}>
                      <ListItemText primary={d} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Farmer Recommendation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recommendation ?? '—'}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">
                  Sentiment Timeline
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {(sentiment?.notes ?? []).map((n) => (
                    <ListItem key={n.id} sx={{ px: 0 }}>
                      <ListItemText primary={n.text} secondary={n.date} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
