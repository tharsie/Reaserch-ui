import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'

export const navItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
    icon: DashboardOutlinedIcon,
  },
  {
    key: 'forecasting',
    label: 'Forecasting',
    to: '/forecasting',
    icon: TimelineOutlinedIcon,
  },
  {
    key: 'fertilizer-recommendation',
    label: 'Fertilizer Recommendation',
    to: '/fertilizer-recommendation',
    icon: ScienceOutlinedIcon,
  },
  {
    key: 'pest-prediction',
    label: 'Pest Prediction',
    to: '/pest-prediction',
    icon: BugReportOutlinedIcon,
  },
  {
    key: 'alerts',
    label: 'Cost Estimation',
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
