import { Box, Divider, Typography } from '@mui/material'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {actions ? <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box> : null}
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}
