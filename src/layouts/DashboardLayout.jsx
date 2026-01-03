import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { navItems } from '../routes/navConfig.js'

const drawerWidth = 280

function DrawerContent({ onNavigate }) {
  const location = useLocation()
  const theme = useTheme()

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.common.white }}>
         Agri Go
        </Typography>
      </Box>
      <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.18) }} />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const selected = location.pathname === item.to
          return (
            <ListItemButton
              key={item.key}
              component={NavLink}
              to={item.to}
              selected={selected}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                color: theme.palette.common.white,
                '& .MuiListItemIcon-root': { color: 'inherit' },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.common.white, 0.16),
                },
                '&.Mui-selected:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.22),
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.18) }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.75) }}>
          @Copyright 2024 Agri Go
        </Typography>
      </Box>
    </Box>
  )
}

export default function DashboardLayout() {
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const userMenuOpen = Boolean(anchorEl)

  const handleToggleMobile = () => setMobileOpen((prev) => !prev)
  const handleCloseMobile = () => setMobileOpen(false)

  const handleOpenUserMenu = (event) => setAnchorEl(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorEl(null)

  const drawer = useMemo(
    () => <DrawerContent onNavigate={mdUp ? undefined : handleCloseMobile} />,
    [mdUp],
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100%' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {!mdUp && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleToggleMobile}
              sx={{ mr: 1 }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI-Driven Sustainable Paddy Farming System
          </Typography>
          <Tooltip title="Notifications">
            <IconButton color="inherit" aria-label="notifications">
              <Badge color="secondary" variant="dot" overlap="circular">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 1 }}>
            <IconButton
              color="inherit"
              onClick={handleOpenUserMenu}
              aria-label="open user menu"
              aria-controls={userMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
            >
              <Avatar sx={{ width: 28, height: 28 }}>A</Avatar>
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>Admin</MenuItem>
              <Divider />
              <MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>Sign out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar navigation"
      >
        {!mdUp && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleToggleMobile}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
        {mdUp && (
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.common.white,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          p: { xs: 2, sm: 3 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
