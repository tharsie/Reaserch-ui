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

  // Fertilizer calculator inputs (UI-only)
  const [areaHa, setAreaHa] = useState(1)
  const [soilType, setSoilType] = useState('Loam')
  const [stage, setStage] = useState('Tillering')
  const [targetYield, setTargetYield] = useState(5)

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

  const recommendedPerHa = useMemo(() => {
    const stageMap = {
      Basal: { n: 35, p: 40, k: 20 },
      Tillering: { n: 35, p: 0, k: 10 },
      'Panicle initiation': { n: 20, p: 0, k: 15 },
      Heading: { n: 10, p: 0, k: 10 },
    }

    const base = stageMap[stage] ?? stageMap.Tillering
    const soilAdj = soilType === 'Sandy' ? 1.1 : soilType === 'Clay' ? 0.95 : 1.0
    const yieldAdj = Math.max(0.8, Math.min(1.3, targetYield / 5))

    const n = Math.round(base.n * soilAdj * yieldAdj)
    const p = Math.round(base.p * yieldAdj)
    const k = Math.round(base.k * soilAdj * yieldAdj)
    return { n, p, k, total: n + p + k }
  }, [soilType, stage, targetYield])

  const totalKg = useMemo(() => {
    const a = Number.isFinite(areaHa) ? Math.max(0, areaHa) : 0
    return {
      n: Math.round(recommendedPerHa.n * a),
      p: Math.round(recommendedPerHa.p * a),
      k: Math.round(recommendedPerHa.k * a),
      total: Math.round(recommendedPerHa.total * a),
    }
  }, [areaHa, recommendedPerHa])

  const nutrientEfficiencyScore = useMemo(() => {
    const soilPenalty = soilType === 'Sandy' ? 12 : soilType === 'Clay' ? 6 : 8
    const yieldPenalty = Math.max(0, (targetYield - 5) * 7)
    const stagePenalty = stage === 'Basal' ? 4 : stage === 'Heading' ? 10 : 6
    const score = 92 - soilPenalty - yieldPenalty - stagePenalty
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [soilType, stage, targetYield])

  return (
    <Box>
      <PageHeader
        title="Fertilizer Recommendation System"
        subtitle="Stage-based NPK guidance, risk flags, and a simple dose calculator"
      />

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Fertilizer Schedule" />
          <Tab label="Dose Recommendations" />
          <Tab label="Risks & Safety" />
          <Tab label="Dose Calculator" />
        </Tabs>
      </Paper>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Suggested Fertilizer Schedule
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {(data?.fertilizerSchedule ?? []).map((row) => (
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
                      <ListItemText
                        primary={`${row.day}: ${row.action}`}
                        secondary={`${row.stage} • ${row.detail}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Alert severity="info">
              UI-only: in production, recommendations would be generated from soil tests + crop stage.
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          {(data?.doseRecommendations ?? []).map((rec) => (
            <Grid key={rec.id} item xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    {rec.stage}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    {rec.product}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Rate: <strong>{rec.rateKgHa} kg/ha</strong> ({rec.nutrient})
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
              Split dosing and timing around rainfall typically improves nutrient-use efficiency.
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
                  Dose Calculator Inputs
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Area (ha)"
                      type="number"
                      value={areaHa}
                      onChange={(e) => setAreaHa(Number(e.target.value))}
                      inputProps={{ min: 0, step: 0.1 }}
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
                    <FormControl fullWidth>
                      <InputLabel id="stage-label">Growth Stage</InputLabel>
                      <Select
                        labelId="stage-label"
                        label="Growth Stage"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                      >
                        <MenuItem value="Basal">Basal</MenuItem>
                        <MenuItem value="Tillering">Tillering</MenuItem>
                        <MenuItem value="Panicle initiation">Panicle initiation</MenuItem>
                        <MenuItem value="Heading">Heading</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Target Yield (t/ha)
                    </Typography>
                    <Slider
                      value={targetYield}
                      onChange={(_, v) => setTargetYield(v)}
                      valueLabelDisplay="auto"
                      step={0.5}
                      min={3}
                      max={8}
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
                    Recommended (per ha)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    N: <strong>{recommendedPerHa.n}</strong> kg/ha
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    P2O5: <strong>{recommendedPerHa.p}</strong> kg/ha
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    K2O: <strong>{recommendedPerHa.k}</strong> kg/ha
                  </Typography>
                  <Typography variant="body2">
                    Total: <strong>{recommendedPerHa.total}</strong> kg/ha
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Total for area
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    N: <strong>{totalKg.n}</strong> kg
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    P2O5: <strong>{totalKg.p}</strong> kg
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    K2O: <strong>{totalKg.k}</strong> kg
                  </Typography>
                  <Typography variant="body2">
                    Total: <strong>{totalKg.total}</strong> kg
                  </Typography>

                  <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Nutrient Efficiency Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {nutrientEfficiencyScore} / 100
                  </Typography>
                  <LinearProgress sx={{ mt: 1 }} variant="determinate" value={nutrientEfficiencyScore} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  )
}
