import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useTheme } from '@mui/material/styles'
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

const MOCK_SENSOR_READINGS = [
  { nitrogenN: 42, phosphorusP: 18, potassiumK: 33 },
  { nitrogenN: 55, phosphorusP: 24, potassiumK: 40 },
  { nitrogenN: 38, phosphorusP: 14, potassiumK: 28 },
  { nitrogenN: 61, phosphorusP: 29, potassiumK: 46 },
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Forecasting() {
  const theme = useTheme()
  const [horizonDays, setHorizonDays] = useState(30)
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [sensorReading, setSensorReading] = useState(null)
  const [sensorAt, setSensorAt] = useState(null)
  const [sensorStatus, setSensorStatus] = useState('idle')
  const [sensorConnected, setSensorConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const sensorIndexRef = useRef(0)

  useEffect(() => {
    if (!sensorConnected) return undefined

    setSensorStatus('connected')
    const id = setInterval(() => {
      const idx = sensorIndexRef.current % MOCK_SENSOR_READINGS.length
      sensorIndexRef.current = idx + 1
      const reading = MOCK_SENSOR_READINGS[idx]
      setSensorReading(reading)
      setSensorAt(new Date())
    }, 1000)

    return () => clearInterval(id)
  }, [sensorConnected])

  async function readNpkFromSensor() {
    setSensorStatus('reading')
    await delay(350)
    const idx = sensorIndexRef.current % MOCK_SENSOR_READINGS.length
    sensorIndexRef.current = idx + 1
    const reading = MOCK_SENSOR_READINGS[idx]
    setSensorReading(reading)
    setSensorAt(new Date())
    setSensorStatus('ok')
    return reading
  }

  async function runForecast() {
    setLoading(true)
    setError(null)
    try {
      const reading = sensorReading ?? (await readNpkFromSensor())
      const res = await getForecasting({
        horizonDays,
        startDate: todayISO,
        nitrogenN: reading.nitrogenN,
        phosphorusP: reading.phosphorusP,
        potassiumK: reading.potassiumK,
      })
      setData(res)
    } catch (e) {
      setData(null)
      setSensorStatus('error')
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        'Failed to load forecasting data. Ensure the Python API is running on http://127.0.0.1:8000.'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  const sentiment = useMemo(() => data?.sentiment ?? null, [data])
  const recommendation = data?.recommendation
  const runSummary = useMemo(() => {
    const firstDate = data?.priceForecast?.[0]?.date
    const days = data?.priceForecast?.length
    if (!firstDate || !days) return null
    const npk = data?.filters
      ? ` | NPK: N=${data.filters.nitrogenN ?? '--'} P=${data.filters.phosphorusP ?? '--'} K=${data.filters.potassiumK ?? '--'}`
      : ''
    return `Last run: ${days} day(s) starting ${firstDate}${npk}`
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
              label="Today's date"
              value={todayISO}
              inputProps={{ readOnly: true }}
              helperText="Sensor readings are shown for the current day."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSensorConnected(true)
                  setSensorStatus('connecting')
                }}
                disabled={sensorConnected || loading}
              >
                Connect sensor
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSensorConnected(false)
                  setSensorStatus('disconnected')
                }}
                disabled={!sensorConnected || loading}
              >
                Disconnect sensor
              </Button>
              <Button
                variant="contained"
                onClick={runForecast}
                disabled={loading}
                sx={{ height: 56 }}
              >
                Run forecast
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Sensor status: {sensorStatus}
          {sensorAt ? ` • Last reading: ${sensorAt.toLocaleString()}` : ''}
        </Typography>
        {runSummary ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {runSummary}
          </Typography>
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          NPK (from sensor)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                Nitrogen (N)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {sensorReading?.nitrogenN ?? '--'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                Phosphorus (P)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {sensorReading?.phosphorusP ?? '--'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="overline" color="text.secondary">
                Potassium (K)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {sensorReading?.potassiumK ?? '--'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
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
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={false}
                  />
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
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={3}
                    dot={false}
                  />
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
