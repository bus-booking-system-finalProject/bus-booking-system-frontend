import React, { useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ADMIN_TABS } from '@/config/adminTabs';
import { AdminLayoutContext, type AdminContextType } from '@/context/AdminLayoutContext';

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate active tab index
  const activeTabIndex = useMemo(() => {
    const matches = ADMIN_TABS.map((tab, index) => {
      const isMatch =
        location.pathname === tab.path || location.pathname.startsWith(`${tab.path}/`);
      return isMatch ? { index, length: tab.path.length } : null;
    }).filter((item) => item !== null);

    // Sort to find the most specific match (longest path)
    matches.sort((a, b) => b!.length - a!.length);
    return matches.length > 0 ? matches[0]!.index : 0;
  }, [location.pathname]);

  // Retrieve the actual Tab Configuration Object
  const activeTabConfig = ADMIN_TABS[activeTabIndex];

  // Prepare Context Value
  const contextValue: AdminContextType = {
    activeTab: activeTabConfig,
    pageTitle: activeTabConfig?.label || 'Admin',
    PageIcon: activeTabConfig?.icon || null,
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const targetRoute = ADMIN_TABS[newValue];
    if (targetRoute) {
      navigate({ to: targetRoute.path });
    }
  };

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      <Box
        sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}
      >
        <AdminHeader activeTab={activeTabIndex} onTabChange={handleTabChange} />

        <Box component="main" sx={{ flexGrow: 1 }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </AdminLayoutContext.Provider>
  );
}
