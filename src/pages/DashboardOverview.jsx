import { useEffect, useMemo, useState } from 'react'
import { Box, LinearProgress } from '@mui/material'
import Grid from '@mui/material/Grid'
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined'
import SpaOutlinedIcon from '@mui/icons-material/SpaOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
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
import KPICard from '../components/KPICard.jsx'
import ChartCard from '../components/ChartCard.jsx'
import AlertList from '../components/AlertList.jsx'
import { getOverview } from '../api/dashboardApi.js'

const kpiIcons = {
  weatherRisk: CloudOutlinedIcon,
  soilHealth: SpaOutlinedIcon,
  expectedYield: ShowChartOutlinedIcon,
  marketPrice: PaidOutlinedIcon,
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await getOverview()
      if (!mounted) return
      setData(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const kpis = useMemo(() => data?.kpis ?? [], [data])

  return (
    <Box>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Key signals across weather, soil, yield, and market conditions"
      />

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              label={kpi.label}
              value={kpi.value}
              helper={kpi.helper}
              status={kpi.status}
              icon={kpiIcons[kpi.key]}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <ChartCard title="Price Forecast" subtitle="Mock line forecast (LKR / kg)">
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.priceForecast ?? []} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </ChartCard>
            </Grid>
            <Grid size={12}>
              <ChartCard title="Demand Forecast" subtitle="Mock line forecast (index)">
                <Box sx={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.demandForecast ?? []} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="demand" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </ChartCard>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title="Recent Alerts" subtitle="3–6 latest items with severity">
            <AlertList items={data?.recentAlerts ?? []} title="Alerts" />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  )
}
