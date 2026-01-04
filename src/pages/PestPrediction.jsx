
import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    Chip,
    Stack,
    useTheme,
    Paper,
    Avatar,
    TextField,
    InputAdornment,
    MenuItem,
    Button,
    CircularProgress,
    LinearProgress,
    Switch,
    FormControlLabel,
    Fade
} from '@mui/material'
import {
    WbSunnyRounded as SunIcon,
    WaterDropRounded as HumidityIcon,
    SpeedRounded as PressureIcon,
    LightbulbRounded as LightIcon,
    TimelineRounded as TimelineIcon,
    GrassRounded as CropIcon,
    BugReportRounded as PestIcon,
    CheckCircleRounded as CheckIcon,
    ScienceRounded as PredictionIcon,
    SensorsRounded as SensorIcon,
    SettingsInputAntennaRounded as IotIcon,
    ThermostatRounded as ThermostatIcon,
    CloudRounded as CloudIcon,
    OpacityRounded as MoistureIcon
} from '@mui/icons-material'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'
import { alpha } from '@mui/material/styles'
import { getPestPrediction } from '../api/dashboardApi.js'

// --- Constants & Helpers ---

const PADDY_STAGES = [
    'Seedling',
    'Tillering',
    'Panicle Initiation',
    'Flowering',
    'Ripening'
]

const generateSensorData = () => ({
    temperature: 25 + Math.random() * 10,
    humidity: 60 + Math.random() * 20,
    pressure: 1000 + Math.random() * 20,
    light: Math.floor(Math.random() * 1024),
    timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

const getLightStatus = (value) => {
    if (value < 100) return { label: 'Very Dark', color: '#757575' }
    if (value < 300) return { label: 'Dark', color: '#616161' }
    if (value < 600) return { label: 'Low Light', color: '#ffb74d' }
    if (value < 900) return { label: 'Bright', color: '#ff9800' }
    return { label: 'Very Bright', color: '#ffc107' }
}

export default function PestPrediction() {
    const theme = useTheme()
    const [isRealTime, setIsRealTime] = useState(true)

    // Real-time chart data
    const [currentData, setCurrentData] = useState(generateSensorData())
    const [history, setHistory] = useState(() => {
        return Array.from({ length: 20 }, (_, i) => {
            const d = new Date()
            d.setSeconds(d.getSeconds() - (20 - i) * 2)
            return {
                temperature: 25 + Math.random() * 10,
                humidity: 60 + Math.random() * 20,
                pressure: 1000 + Math.random() * 20,
                light: Math.floor(Math.random() * 1024),
                timestamp: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }
        })
    })

    // Manual Prediction State
    const [manualValues, setManualValues] = useState({
        stage: 'Tillering',
        light: '',
        humidity: '',
        pressure: '',
        temperature: ''
    })

    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)

    // Simulation Loop for the top chart/strip
    useEffect(() => {
        const interval = setInterval(() => {
            const newData = generateSensorData()
            setCurrentData(newData)
            setHistory(prev => {
                const newHistory = [...prev, newData]
                if (newHistory.length > 30) newHistory.shift()
                return newHistory
            })

            // If in Real-time mode, auto-fill the manual inputs for the prediction
            if (isRealTime) {
                setManualValues(prev => ({
                    ...prev,
                    light: newData.light,
                    humidity: newData.humidity.toFixed(0),
                    pressure: newData.pressure.toFixed(0),
                    temperature: newData.temperature.toFixed(1)
                }))
            }

        }, 2000)
        return () => clearInterval(interval)
    }, [isRealTime])

    // When switching to manual, ensure we have some values initially (current ones)
    const handleModeToggle = (event) => {
        const checked = event.target.checked;
        setIsRealTime(checked);
        if (checked) {
            setManualValues(prev => ({
                ...prev,
                light: currentData.light,
                humidity: currentData.humidity.toFixed(0),
                pressure: currentData.pressure.toFixed(0),
                temperature: currentData.temperature.toFixed(1)
            }))
        }
    }

    const handleInputChange = (e) => {
        setManualValues({
            ...manualValues,
            [e.target.name]: e.target.value
        })
    }

    const handlePredict = async () => {
        setLoading(true)
        setPrediction(null)
        try {
            const data = await getPestPrediction(
                manualValues.stage,
                Number(manualValues.light) || 0,
                Number(manualValues.pressure) || 0,
                Number(manualValues.humidity) || 0,
                Number(manualValues.temperature) || 0
            )
            setPrediction(data)
        } catch (error) {
            console.error("Prediction failed", error)
        } finally {
            setLoading(false)
        }
    }

    const lightStatus = getLightStatus(currentData.light)

    return (
        <Box sx={{
            p: 3,
            minHeight: '100vh',
            bgcolor: '#f4f6f8'
        }}>

            {/* Top Header Card */}
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[1] }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary', mb: 2 }}>
                        AI-Based Pest Prediction System
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: '90%' }}>
                        Sensor-based AI decision support system for early pest detection and risk assessment.
                        The system analyzes real-time IoT sensor data (Temperature, Humidity, Pressure, Light) or
                        manual inputs along with crop growth stages to predict potential pest outbreaks and recommend
                        preventive actions for optimal crop health.
                    </Typography>
                </CardContent>
            </Card>

            <Stack spacing={3}>

                {/* LIVE SENSOR STRIP */}
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'text.primary' }}>Live Sensor Readings</Typography>
                        <Grid container spacing={2}>
                            {/* Soil Temperature */}
                            <Grid item xs={12} sm={3} md={3}>
                                <MetricCard
                                    title="Soil Temperature"
                                    value={currentData.temperature.toFixed(1)}
                                    unit="°C"
                                    icon={<ThermostatIcon />}
                                    stripeColor="#00e676"
                                    color="#e8f5e9"
                                    iconColor="#ff1744"
                                />
                            </Grid>
                            {/* Soil Moisture */}
                            <Grid item xs={12} sm={3} md={3}>
                                <MetricCard
                                    title="Soil Moisture"
                                    value={currentData.humidity.toFixed(0)}
                                    unit="%"
                                    icon={<MoistureIcon />}
                                    stripeColor="#2979ff"
                                    color="#e3f2fd"
                                    iconColor="#2979ff"
                                />
                            </Grid>
                            {/* Air Temperature */}
                            <Grid item xs={12} sm={3} md={3}>
                                <MetricCard
                                    title="Air Temperature"
                                    value={(currentData.temperature + 2).toFixed(1)}
                                    unit="°C"
                                    icon={<ThermostatIcon />}
                                    stripeColor="#ff9800"
                                    color="#fff3e0"
                                    iconColor="#ff1744"
                                />
                            </Grid>
                            {/* Air Humidity */}
                            <Grid item xs={12} sm={3} md={3}>
                                <MetricCard
                                    title="Air Humidity"
                                    value={(currentData.humidity - 5).toFixed(0)}
                                    unit="%"
                                    icon={<CloudIcon />}
                                    stripeColor="#00b0ff"
                                    color="#e1f5fe"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* MAIN CHART SECTION */}
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                    <CardContent sx={{ p: 3, pb: 1 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
                                    <TimelineIcon />
                                </Avatar>
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>Environmental Trends</Typography>
                                        <Box sx={{
                                            px: 1, py: 0.25, borderRadius: 1,
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            color: theme.palette.error.main,
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                            display: 'flex', alignItems: 'center', gap: 0.5
                                        }}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor', animation: 'pulse 1.5s infinite' }} />
                                            <Typography variant="caption" fontWeight="bold" sx={{ lineHeight: 1 }}>LIVE</Typography>
                                        </Box>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">Real-time sensor data stream</Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Chip label="Temperature" size="small" sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ed6c02', fontWeight: 'bold' }} />
                                <Chip label="Humidity" size="small" sx={{ bgcolor: alpha('#0ea5e9', 0.1), color: '#0288d1', fontWeight: 'bold' }} />
                            </Stack>
                        </Stack>

                        <Box sx={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff9800" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis orientation="left" stroke={theme.palette.text.secondary} fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: 'none',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            padding: '12px',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="temperature" stroke="#ff9800" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                                    <Area type="monotone" dataKey="humidity" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>

                {/* IOT SENSOR CONNECTION TOGGLE CARD */}
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
                    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                                <IotIcon color="primary" />
                                <Typography variant="h6" fontWeight="bold">IoT Sensor Connection</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                {isRealTime
                                    ? "Real-time sensor data is being used for predictions"
                                    : "Manual input mode enabled for custom analysis"}
                            </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="button" color={!isRealTime ? 'text.primary' : 'text.secondary'} fontWeight={!isRealTime ? 'bold' : 'normal'}>Manual</Typography>
                            <Switch
                                checked={isRealTime}
                                onChange={handleModeToggle}
                                color="success"
                                size="medium"
                            />
                            <Typography variant="button" color={isRealTime ? 'text.primary' : 'text.secondary'} fontWeight={isRealTime ? 'bold' : 'normal'}>Real-time</Typography>
                        </Stack>
                    </CardContent>
                </Card>

                {/* PEST PREDICTION INPUT SECTION */}
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'visible', transition: 'all 0.3s ease' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                                    <PredictionIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">Pest Prediction Analysis</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {isRealTime ? "Using live sensor data" : "Enter values manually"}
                                    </Typography>
                                </Box>
                            </Stack>
                            {isRealTime && (
                                <Chip
                                    label="AUTO-FILLED"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    icon={<SensorIcon fontSize="small" />}
                                    sx={{ fontWeight: 'bold' }}
                                />
                            )}
                        </Stack>

                        <Grid container spacing={3}>
                            {/* Paddy Stage */}
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Paddy Stage"
                                    name="stage"
                                    value={manualValues.stage}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CropIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                >
                                    {PADDY_STAGES.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Light Intensity */}
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    disabled={isRealTime}
                                    label="Light (lux)"
                                    name="light"
                                    type="number"
                                    value={manualValues.light}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LightIcon color={isRealTime ? "disabled" : "action"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                                        bgcolor: isRealTime ? 'action.hover' : 'transparent'
                                    }}
                                />
                            </Grid>

                            {/* Humidity */}
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    disabled={isRealTime}
                                    label="Humidity (%)"
                                    name="humidity"
                                    type="number"
                                    value={manualValues.humidity}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HumidityIcon color={isRealTime ? "disabled" : "action"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                                        bgcolor: isRealTime ? 'action.hover' : 'transparent'
                                    }}
                                />
                            </Grid>

                            {/* Pressure */}
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    disabled={isRealTime}
                                    label="Pressure (hPa)"
                                    name="pressure"
                                    type="number"
                                    value={manualValues.pressure}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PressureIcon color={isRealTime ? "disabled" : "action"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                                        bgcolor: isRealTime ? 'action.hover' : 'transparent'
                                    }}
                                />
                            </Grid>

                            {/* Temperature */}
                            <Grid item xs={12} sm={2}>
                                <TextField
                                    fullWidth
                                    disabled={isRealTime}
                                    label="Temperature (°C)"
                                    name="temperature"
                                    type="number"
                                    value={manualValues.temperature}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SunIcon color={isRealTime ? "disabled" : "action"} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                                        bgcolor: isRealTime ? 'action.hover' : 'transparent'
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {/* PREDICT BUTTON */}
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                onClick={handlePredict}
                                disabled={loading}
                                sx={{
                                    px: 5,
                                    py: 1.5,
                                    borderRadius: 1.5,
                                    fontWeight: 'bold',
                                    boxShadow: '0 8px 16px rgba(46, 125, 50, 0.24)'
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'PREDICT PEST'}
                            </Button>
                        </Box>

                    </CardContent>
                </Card>

                {/* PREDICTION RESULT OUTPUT */}
                {prediction && (
                    <Card sx={{
                        borderRadius: 2,
                        boxShadow: theme.shadows[3],
                        bgcolor: '#fff',
                        border: '1px solid',
                        borderColor: 'divider',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3}>
                                <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 56, height: 56 }}>
                                    <PestIcon sx={{ fontSize: 32 }} />
                                </Avatar>

                                <Box sx={{ flexGrow: 1, width: '100%' }}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>
                                        PREDICTED PEST
                                    </Typography>
                                    <Typography variant="h5" fontWeight="800" color="text.primary" sx={{ mb: 1 }}>
                                        {prediction.predicted_pest}
                                    </Typography>

                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                                            Probability: {(prediction.probability * 100).toFixed(1)}%
                                        </Typography>
                                        <Box sx={{ flexGrow: 1, maxWidth: 200 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={prediction.probability * 100}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                    '& .MuiLinearProgress-bar': { bgcolor: 'error.main' }
                                                }}
                                            />
                                        </Box>
                                    </Stack>

                                    <Paper variant="outlined" sx={{ mt: 1, p: 1.5, bgcolor: '#f9fafb', borderStyle: 'dashed', borderRadius: 1.5 }}>
                                        <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ display: 'block', mb: 0.5 }}>
                                            RECOMMENDED ACTION:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {prediction.recommended_action}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

            </Stack>

            <style>
                {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
           @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </Box>
    )
}

// --- Components ---



function MetricCard({ title, value, unit, icon, color, stripeColor, iconColor, subLabel, trend }) {
    // Use React.cloneElement to pass styles to the icon
    // This allows the icon to be passed as a simple <Icon /> but rendered with custom size/color

    return (
        <Paper
            sx={{
                p: 2.5,
                borderRadius: 2,
                height: '100%',
                minHeight: 160,
                bgcolor: color,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
                position: 'relative',
                overflow: 'hidden',
                borderLeft: stripeColor ? `5px solid ${stripeColor}` : 'none',
                boxShadow: 'none'
            }}
            elevation={0}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box sx={{ color: iconColor || stripeColor, p: 0.5 }}>
                    {React.isValidElement(icon)
                        ? React.cloneElement(icon, { sx: { fontSize: 32, color: iconColor || stripeColor } })
                        : icon
                    }
                </Box>
                <Box
                    sx={{
                        bgcolor: 'white',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        height: 'fit-content'
                    }}
                >
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                        Live
                    </Typography>
                </Box>
            </Stack>

            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                    {title}
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', letterSpacing: -0.5 }}>
                    {value}
                    <Typography component="span" variant="body1" color="text.secondary" fontWeight="600" sx={{ ml: 0.5 }}>
                        {unit}
                    </Typography>
                </Typography>
                {subLabel && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.6)', width: 'fit-content', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold' }}>
                        {subLabel}
                    </Typography>
                )}
            </Box>
        </Paper>
    )
}
