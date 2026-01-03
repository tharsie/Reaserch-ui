import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import PageHeader from '../components/PageHeader.jsx'
import { getSettings } from '../api/dashboardApi.js'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('en')
  const [prefs, setPrefs] = useState({
    weather: true,
    market: true,
    operations: false,
    sustainability: true,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await getSettings()
      if (!mounted) return
      setData(res)
      setFullName(res.defaults.fullName)
      setEmail(res.defaults.email)
      setPhone(res.defaults.phone)
      setLanguage(res.defaults.language)
      setPrefs(res.defaults.notifications)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const languages = useMemo(() => data?.languages ?? [], [data])

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Profile, notifications, and language preferences (UI-only)"
      />
      {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Notification Preferences
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={prefs.weather}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, weather: e.target.checked }))
                    }
                  />
                }
                label="Weather alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={prefs.market}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, market: e.target.checked }))
                    }
                  />
                }
                label="Market alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={prefs.operations}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, operations: e.target.checked }))
                    }
                  />
                }
                label="Operations alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={prefs.sustainability}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, sustainability: e.target.checked }))
                    }
                  />
                }
                label="Sustainability alerts"
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Language
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="lang-label">Language</InputLabel>
                <Select
                  labelId="lang-label"
                  label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languages.map((l) => (
                    <MenuItem key={l.code} value={l.code}>
                      {l.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Note: settings are not persisted in this UI-only build.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
