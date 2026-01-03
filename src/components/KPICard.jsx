import { Box, Card, CardContent, Chip, Typography } from '@mui/material'

export default function KPICard({ label, value, helper, status, icon }) {
  const Icon = icon

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {value}
            </Typography>
            {helper ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {helper}
              </Typography>
            ) : null}
          </Box>
          {Icon ? (
            <Box sx={{ color: 'text.secondary', mt: 0.5 }}>
              <Icon fontSize="small" />
            </Box>
          ) : null}
        </Box>
        {status ? (
          <Box sx={{ mt: 1.5 }}>
            <Chip size="small" label={status} />
          </Box>
        ) : null}
      </CardContent>
    </Card>
  )
}
