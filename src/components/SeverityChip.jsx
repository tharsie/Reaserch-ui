import { Chip } from '@mui/material'

const mapSeverityToColor = (severity) => {
  if (severity === 'High') return 'error'
  if (severity === 'Medium') return 'warning'
  return 'success'
}

export default function SeverityChip({ severity, size = 'small' }) {
  return <Chip size={size} label={severity} color={mapSeverityToColor(severity)} />
}
