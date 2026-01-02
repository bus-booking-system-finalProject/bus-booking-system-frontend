import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LogOut, Home, Menu } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayoutContext } from '@/context/AdminLayoutContext';

interface AdminHeaderProps {
  drawerWidth: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ drawerWidth }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // FIX: Handle potential undefined context
  const context = useContext(AdminLayoutContext);

  // Fallback if context is missing (though in your layout it shouldn't be)
  const pageTitle = context?.pageTitle || 'Admin Portal';

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        {/* 1. Page Title (Dynamic) */}
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* 2. User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Go to Home">
            <IconButton onClick={() => navigate({ to: '/' })} color="inherit">
              <Home size={20} />
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              A
            </Avatar>
          </Box>

          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} color="error" sx={{ ml: 1 }}>
              <LogOut size={20} />
            </IconButton>
          </Tooltip>

          {isMobile && (
            <IconButton color="inherit" edge="end" sx={{ ml: 1 }}>
              <Menu size={24} />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
