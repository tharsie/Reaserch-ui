import { Component } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'

// Basic error boundary so the dashboard fails gracefully if a page blows up.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught error:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Something went wrong while rendering the dashboard.
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {this.state.error?.message}
        </Typography>
        <Button variant="contained" onClick={this.handleReload}>
          Reload
        </Button>
      </Box>
    )
  }
}
