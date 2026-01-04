import { useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import PageHeader from '../components/PageHeader.jsx'

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
})

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export default function Alerts() {
  const [areaHa, setAreaHa] = useState(1)

  // Per-hectare inputs (editable)
  const [seedKgHa, setSeedKgHa] = useState(40)
  const [seedCostPerKg, setSeedCostPerKg] = useState(220)

  const [fertilizerKgHa, setFertilizerKgHa] = useState(80)
  const [fertilizerCostPerKg, setFertilizerCostPerKg] = useState(160)

  const [laborDaysHa, setLaborDaysHa] = useState(18)
  const [laborCostPerDay, setLaborCostPerDay] = useState(3500)

  const [irrigationCostHa, setIrrigationCostHa] = useState(12000)
  const [machineryCostHa, setMachineryCostHa] = useState(15000)
  const [transportCostHa, setTransportCostHa] = useState(6000)
  const [miscCostHa, setMiscCostHa] = useState(5000)

  const breakdown = useMemo(() => {
    const a = Math.max(0, toNumber(areaHa, 0))
    const items = [
      {
        key: 'seed',
        label: 'Seed',
        perHa: toNumber(seedKgHa) * toNumber(seedCostPerKg),
        detail: `${toNumber(seedKgHa)} kg/ha × ${currency.format(toNumber(seedCostPerKg))}/kg`,
      },
      {
        key: 'fertilizer',
        label: 'Fertilizer',
        perHa: toNumber(fertilizerKgHa) * toNumber(fertilizerCostPerKg),
        detail: `${toNumber(fertilizerKgHa)} kg/ha × ${currency.format(
          toNumber(fertilizerCostPerKg),
        )}/kg`,
      },
      {
        key: 'labor',
        label: 'Labor',
        perHa: toNumber(laborDaysHa) * toNumber(laborCostPerDay),
        detail: `${toNumber(laborDaysHa)} day(s)/ha × ${currency.format(toNumber(laborCostPerDay))}/day`,
      },
      {
        key: 'irrigation',
        label: 'Irrigation',
        perHa: toNumber(irrigationCostHa),
        detail: 'Per-hectare irrigation cost',
      },
      {
        key: 'machinery',
        label: 'Machinery',
        perHa: toNumber(machineryCostHa),
        detail: 'Land prep / harvesting / services',
      },
      {
        key: 'transport',
        label: 'Transport',
        perHa: toNumber(transportCostHa),
        detail: 'Logistics and haulage',
      },
      {
        key: 'misc',
        label: 'Misc',
        perHa: toNumber(miscCostHa),
        detail: 'Bags, repairs, small tools',
      },
    ]

    const perHaTotal = items.reduce((sum, it) => sum + it.perHa, 0)
    const total = perHaTotal * a
    return { items, perHaTotal, total }
  }, [
    areaHa,
    fertilizerCostPerKg,
    fertilizerKgHa,
    irrigationCostHa,
    laborCostPerDay,
    laborDaysHa,
    machineryCostHa,
    miscCostHa,
    seedCostPerKg,
    seedKgHa,
    transportCostHa,
  ])

  return (
    <Box>
      <PageHeader title="Cost Estimation" subtitle="Estimate total cultivation cost based on area and inputs" />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Inputs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Area (ha)"
                  type="number"
                  value={areaHa}
                  onChange={(e) => setAreaHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 0.1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Seed rate (kg/ha)"
                  type="number"
                  value={seedKgHa}
                  onChange={(e) => setSeedKgHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Seed cost (LKR/kg)"
                  type="number"
                  value={seedCostPerKg}
                  onChange={(e) => setSeedCostPerKg(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 10 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fertilizer amount (kg/ha)"
                  type="number"
                  value={fertilizerKgHa}
                  onChange={(e) => setFertilizerKgHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fertilizer cost (LKR/kg)"
                  type="number"
                  value={fertilizerCostPerKg}
                  onChange={(e) => setFertilizerCostPerKg(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 10 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Labor (days/ha)"
                  type="number"
                  value={laborDaysHa}
                  onChange={(e) => setLaborDaysHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Labor cost (LKR/day)"
                  type="number"
                  value={laborCostPerDay}
                  onChange={(e) => setLaborCostPerDay(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 100 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Irrigation cost (LKR/ha)"
                  type="number"
                  value={irrigationCostHa}
                  onChange={(e) => setIrrigationCostHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 500 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Machinery cost (LKR/ha)"
                  type="number"
                  value={machineryCostHa}
                  onChange={(e) => setMachineryCostHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 500 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Transport cost (LKR/ha)"
                  type="number"
                  value={transportCostHa}
                  onChange={(e) => setTransportCostHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 500 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Misc cost (LKR/ha)"
                  type="number"
                  value={miscCostHa}
                  onChange={(e) => setMiscCostHa(toNumber(e.target.value, 0))}
                  inputProps={{ min: 0, step: 500 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Cost per ha
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {currency.format(breakdown.perHaTotal)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Total cost
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {currency.format(breakdown.total)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Breakdown
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {breakdown.items.map((it) => (
                <Paper
                  key={it.key}
                  variant="outlined"
                  sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', gap: 2 }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {it.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {it.detail}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {currency.format(it.perHa)} / ha
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currency.format(it.perHa * Math.max(0, toNumber(areaHa, 0)))} total
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
