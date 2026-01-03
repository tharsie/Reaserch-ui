import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'
import SeverityChip from './SeverityChip.jsx'

export default function AlertList({ title = 'Recent Alerts', items = [] }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
        {title}
      </Typography>
      <List dense sx={{ p: 0 }}>
        {items.map((a) => (
          <ListItem
            key={a.id}
            sx={{
              px: 1.5,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              mb: 1,
            }}
            secondaryAction={<SeverityChip severity={a.severity} />}
          >
            <ListItemText primary={a.title} secondary={`${a.category} • ${a.date}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
