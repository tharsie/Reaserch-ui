import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFound() {
  return (
    <Box sx={{ py: 6 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The route you requested does not exist.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/dashboard">
        Go to Dashboard
      </Button>
    </Box>
  )
}
