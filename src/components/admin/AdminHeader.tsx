import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
} from '@mui/material';
import { ShieldCheck, LogOut, Home, Menu } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_TABS } from '@/config/AdminTabs';

interface AdminHeaderProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, onTabChange }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
          {/* 1. Branding Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                p: 0.75,
                borderRadius: 1.5,
                display: 'flex',
                mr: 1.5,
              }}
            >
              <ShieldCheck size={24} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                Admin Portal
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Bus Booking System
              </Typography>
            </Box>
          </Box>

          {/* 2. Navigation Buttons (Desktop) */}
          {!isMobile && (
            <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
              {ADMIN_TABS.map((tab, index) => {
                const isActive = activeTab === index;
                const IconComponent = tab.icon;

                return (
                  <Button
                    key={tab.path}
                    onClick={(event) => onTabChange(event, index)}
                    startIcon={<IconComponent size={18} />}
                    variant={isActive ? 'contained' : 'text'}
                    disableElevation
                    sx={{
                      textTransform: 'none',
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 2,
                      px: 2,
                      ...(isActive
                        ? {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }
                        : {
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.text.primary, 0.05),
                              color: 'text.primary',
                            },
                          }),
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Stack>
          )}

          {/* 3. User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            {!isMobile && user && (
              <Chip
                label={`Admin: ${user.email}`}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ mr: 1, fontWeight: 500 }}
              />
            )}

            <Tooltip title="Go to Home">
              <IconButton onClick={() => navigate({ to: '/' })} color="inherit">
                <Home size={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout">
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<LogOut size={16} />}
                onClick={handleLogout}
                sx={{
                  ml: 1,
                  display: { xs: 'none', sm: 'flex' },
                  borderColor: 'error.light',
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.lighter',
                    borderColor: 'error.main',
                  },
                }}
              >
                Logout
              </Button>
            </Tooltip>

            {isMobile && (
              <IconButton color="inherit" edge="end" sx={{ ml: 1 }}>
                <Menu size={24} />
              </IconButton>
            )}
          </Box>
        </Toolbar>

        {/* 4. Mobile Navigation (Scrollable Horizontal List) */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 1,
              pb: 2,
              // Hide scrollbar
              '::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {ADMIN_TABS.map((tab, index) => {
              const isActive = activeTab === index;
              const IconComponent = tab.icon;

              return (
                <Chip
                  key={tab.path}
                  icon={<IconComponent size={16} />}
                  label={tab.label}
                  onClick={(event) => onTabChange(event, index)}
                  color={isActive ? 'primary' : 'default'}
                  variant={isActive ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    border: isActive ? 'none' : '1px solid',
                    borderColor: 'divider',
                  }}
                />
              );
            })}
          </Box>
        )}
      </Container>
    </AppBar>
  );
};
