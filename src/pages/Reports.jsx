import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material'
import PageHeader from '../components/PageHeader.jsx'
import { getReports } from '../api/dashboardApi.js'

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [snackOpen, setSnackOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await getReports()
      if (!mounted) return
      setData(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generated summaries (UI-only placeholders)"
        actions={
          <Button variant="contained" onClick={() => setSnackOpen(true)}>
            Export PDF
          </Button>
        }
      />

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {(data?.reportCards ?? []).map((c) => (
          <Grid key={c.id} item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {c.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {c.subtitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
          {data?.preview?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
          {data?.preview?.body}
        </Typography>
      </Paper>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message="Export PDF (placeholder)"
      />
    </Box>
  )
}
