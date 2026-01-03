import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import PageHeader from '../components/PageHeader.jsx'
import SeverityChip from '../components/SeverityChip.jsx'
import { getAlerts } from '../api/dashboardApi.js'

export default function Alerts() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [category, setCategory] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await getAlerts()
      if (!mounted) return
      setData(res)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const rows = useMemo(() => {
    const items = data?.items ?? []
    return items
      .filter((a) => (category === 'All' ? true : a.category === category))
      .filter((a) => (severity === 'All' ? true : a.severity === severity))
      .map((a) => ({ ...a, id: a.id }))
  }, [data, category, severity])

  const columns = useMemo(
    () => [
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 220 },
      { field: 'category', headerName: 'Category', width: 160 },
      { field: 'date', headerName: 'Date', width: 120 },
      {
        field: 'severity',
        headerName: 'Severity',
        width: 130,
        renderCell: (params) => <SeverityChip severity={params.value} />,
        sortable: false,
      },
      {
        field: 'actions',
        headerName: '',
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button size="small" onClick={() => setSelected(params.row)}>
            View details
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <Box>
      <PageHeader title="Alerts" subtitle="Filter alerts by category and severity" />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {(data?.categories ?? []).map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                label="Severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {(data?.severities ?? []).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Paper variant="outlined" sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        />
      </Paper>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            {selected?.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {selected?.category} • {selected?.date}
            </Typography>
            {selected?.severity ? <SeverityChip severity={selected.severity} /> : null}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {selected?.details}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
