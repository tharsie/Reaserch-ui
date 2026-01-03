import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'

export const navItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: DashboardOutlinedIcon,
  },
  {
    key: 'optimization',
    label: 'Farming Optimization',
    to: '/farming-optimization',
    icon: AgricultureOutlinedIcon,
  },
  {
    key: 'forecasting',
    label: 'Forecasting',
    to: '/forecasting',
    icon: TimelineOutlinedIcon,
  },
  {
    key: 'alerts',
    label: 'Alerts',
    to: '/alerts',
    icon: WarningAmberOutlinedIcon,
  },
  {
    key: 'reports',
    label: 'Reports',
    to: '/reports',
    icon: DescriptionOutlinedIcon,
  },
  {
    key: 'settings',
    label: 'Settings',
    to: '/settings',
    icon: SettingsOutlinedIcon,
  },
]
