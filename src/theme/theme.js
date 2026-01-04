import { createTheme } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

const brandGreen = '#1e5c28ff'
const brandGreenSecondary = '#1e5c28ff'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brandGreen },
    secondary: { main: brandGreenSecondary },
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
