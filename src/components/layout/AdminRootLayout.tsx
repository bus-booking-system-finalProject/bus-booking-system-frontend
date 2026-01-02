import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
} from '@mui/material';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ADMIN_TABS } from '@/config/AdminTabs';
import { AdminLayoutContext, type AdminContextType } from '@/context/AdminLayoutContext';

const DRAWER_WIDTH = 280;

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Calculate active tab based on URL path
  const activeTabIndex = useMemo(() => {
    const matches = ADMIN_TABS.map((tab, index) => {
      const isMatch =
        location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
      return isMatch ? { index, length: tab.path.length } : null;
    }).filter((item) => item !== null);

    // Sort to find the most specific match (longest matching path wins)
    matches.sort((a, b) => b!.length - a!.length);
    return matches.length > 0 ? matches[0]!.index : 0;
  }, [location.pathname]);

  // 2. Prepare Context Value
  const activeTabConfig = ADMIN_TABS[activeTabIndex];
  const contextValue: AdminContextType = {
    activeTab: activeTabConfig,
    pageTitle: activeTabConfig?.label || 'Admin Portal',
    PageIcon: activeTabConfig?.icon || null,
  };

  const handleTabChange = (path: string) => {
    navigate({ to: path });
  };

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CssBaseline />

        {/* TOP HEADER */}
        <AdminHeader drawerWidth={DRAWER_WIDTH} />

        {/* LEFT SIDEBAR (DRAWER) */}
        <Drawer
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: '#1e293b', // Slate-900
              color: '#f1f5f9', // Slate-100
              borderRight: '1px solid rgba(255,255,255,0.1)',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {/* Branding Area */}
          <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
                borderRadius: 1,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              V
            </Box>
            <Typography
              variant="h6"
              color="inherit"
              noWrap
              sx={{ fontWeight: 700, letterSpacing: 0.5 }}
            >
              VEXESIEURE
            </Typography>
          </Toolbar>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Navigation List */}
          <List sx={{ pt: 2, px: 2 }}>
            {ADMIN_TABS.map((tab, index) => {
              const isActive = activeTabIndex === index;
              const Icon = tab.icon;

              return (
                <ListItem key={tab.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => handleTabChange(tab.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      transition: 'all 0.2s',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    {Icon && (
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive ? 'inherit' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        <Icon size={20} />
                      </ListItemIcon>
                    )}

                    <ListItemText
                      primary={tab.label}
                      slotProps={{
                        primary: {
                          fontSize: '0.9rem',
                          fontWeight: isActive ? 600 : 400,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>

        {/* MAIN CONTENT */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          <Toolbar /> {/* Spacer to push content below AppBar */}
          <Container maxWidth="xl" sx={{ py: 2 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </AdminLayoutContext.Provider>
  );
}
