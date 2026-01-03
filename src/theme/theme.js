import { createTheme } from '@mui/material/styles'
import { green, grey } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: green[800] },
    secondary: { main: green[600] },
    background: {
      default: grey[50],
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
})

export default theme
