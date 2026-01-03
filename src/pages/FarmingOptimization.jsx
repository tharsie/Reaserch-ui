import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import PageHeader from '../components/PageHeader.jsx'
import SeverityChip from '../components/SeverityChip.jsx'
import { getOptimization } from '../api/dashboardApi.js'

function TabPanel({ value, index, children }) {
  if (value !== index) return null
  return <Box sx={{ pt: 2 }}>{children}</Box>
}

export default function FarmingOptimization() {
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  // Scenario planner inputs (UI-only)
  const [fertilizerKg, setFertilizerKg] = useState(85)
  const [irrigationPerWeek, setIrrigationPerWeek] = useState(3)
  const [dateShiftDays, setDateShiftDays] = useState(0)
  const [soilType, setSoilType] = useState('Loam')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await getOptimization()
      if (!mounted) return
      setData(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const predictedYield = useMemo(() => {
    const fertEffect = Math.min(1.2, 0.85 + fertilizerKg / 250)
    const irrigEffect = Math.min(1.15, 0.9 + irrigationPerWeek / 10)
    const shiftPenalty = 1 - Math.min(0.15, Math.abs(dateShiftDays) / 80)
    const soilBonus = soilType === 'Clay' ? 1.03 : soilType === 'Sandy' ? 0.97 : 1.0
    const base = 4.8
    return Math.round(base * fertEffect * irrigEffect * shiftPenalty * soilBonus * 10) / 10
  }, [fertilizerKg, irrigationPerWeek, dateShiftDays, soilType])

  const sustainabilityScore = useMemo(() => {
    const fertPenalty = Math.min(25, (fertilizerKg - 60) * 0.35)
    const irrigPenalty = Math.min(20, (irrigationPerWeek - 2) * 6)
    const shiftPenalty = Math.min(10, Math.abs(dateShiftDays) * 0.15)
    const score = 85 - fertPenalty - irrigPenalty - shiftPenalty
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [fertilizerKg, irrigationPerWeek, dateShiftDays])

  return (
    <Box>
      <PageHeader
        title="Farming Optimization (Part 1)"
        subtitle="Crop plan, resource optimization, risk, and scenario planning"
      />

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Crop Plan" />
          <Tab label="Resource Optimization" />
          <Tab label="Risk & Sustainability" />
          <Tab label="Scenario Planner" />
        </Tabs>
      </Paper>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Weekly Schedule
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {(data?.cropPlan ?? []).map((row) => (
                    <ListItem
                      key={row.id}
                      sx={{
                        px: 1.5,
                        py: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                      }}
                    >
                      <ListItemText primary={`${row.day}: ${row.action}`} secondary={row.detail} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Alert severity="info">
              UI-only: in production, schedules would be generated from field telemetry + agronomy models.
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          {(data?.resourceRecommendations ?? []).map((rec) => (
            <Grid key={rec.id} item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    Recommendation
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    {rec.action}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {rec.reason}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(rec.confidence * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={rec.confidence * 100} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          {(data?.risks ?? []).map((risk) => (
            <Grid key={risk.id} item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {risk.type} Risk
                    </Typography>
                    <SeverityChip severity={risk.severity} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {risk.note}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Alert severity="success">
              Sustainability improves when fertilizer and irrigation stay within target bands.
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  Scenario Inputs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Fertilizer (kg/ha)"
                      type="number"
                      value={fertilizerKg}
                      onChange={(e) => setFertilizerKg(Number(e.target.value))}
                      inputProps={{ min: 0, max: 200 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="soil-type-label">Soil Type</InputLabel>
                      <Select
                        labelId="soil-type-label"
                        label="Soil Type"
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                      >
                        <MenuItem value="Loam">Loam</MenuItem>
                        <MenuItem value="Clay">Clay</MenuItem>
                        <MenuItem value="Sandy">Sandy</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Irrigation Frequency (per week)
                    </Typography>
                    <Slider
                      value={irrigationPerWeek}
                      onChange={(_, v) => setIrrigationPerWeek(v)}
                      valueLabelDisplay="auto"
                      step={1}
                      min={0}
                      max={7}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Planting Date Shift (days)
                    </Typography>
                    <Slider
                      value={dateShiftDays}
                      onChange={(_, v) => setDateShiftDays(v)}
                      valueLabelDisplay="auto"
                      step={1}
                      min={-21}
                      max={21}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  Mock Outputs
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Predicted Yield
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {predictedYield} t/ha
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Sustainability Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {sustainabilityScore} / 100
                  </Typography>
                  <LinearProgress sx={{ mt: 1 }} variant="determinate" value={sustainabilityScore} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  )
}
