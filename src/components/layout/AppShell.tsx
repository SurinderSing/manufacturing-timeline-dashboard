import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Tooltip,
  Container,
  Divider,
  ListItemIcon,
} from '@mui/material'
import {
  PrecisionManufacturing,
  Logout,
  Apartment,
  AdminPanelSettings,
} from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
  const userRole = user?.roles?.[0] || 'Operator'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          color: 'text.primary',
          borderBottom: '1px solid #E2E8F0',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar disableGutters sx={{ minHeight: 64, justifyContent: 'space-between' }}>
            {/* Left: Brand / Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                }}
              >
                <PrecisionManufacturing fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                  Noviga DMS
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Timeline & Production Analytics
                </Typography>
              </Box>
            </Box>

            {/* Right: User Profile & Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Customer / Plant Chip */}
              {user?.customer_name && (
                <Chip
                  icon={<Apartment sx={{ fontSize: '16px !important' }} />}
                  label={user.customer_name}
                  size="small"
                  variant="outlined"
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    borderColor: '#CBD5E1',
                    fontWeight: 500,
                  }}
                />
              )}

              {/* User Menu */}
              <Tooltip title="Account settings">
                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    cursor: 'pointer',
                    p: 0.5,
                    px: 1,
                    borderRadius: 2,
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {userInitial}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                      {user?.name || user?.username || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {userRole}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: { minWidth: 200, mt: 1, borderRadius: 2 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {user?.email || user?.username}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem disabled sx={{ py: 1 }}>
                  <ListItemIcon>
                    <AdminPanelSettings fontSize="small" />
                  </ListItemIcon>
                  Role: {userRole}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1 }}>
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Body */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2.5, md: 3 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 0, sm: 1, md: 2 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
