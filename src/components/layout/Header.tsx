import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import { LucideLayoutDashboard as DashboardIcon } from 'lucide-react';
import {
  Menu as MenuIcon,
  DirectionsBusFilled,
  Logout,
  AccountCircle,
  Search,
  History,
} from '@mui/icons-material';
import AuthModal from './AuthModal';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS, type NavItem } from '@/config/HeaderNav';

function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const isAdmin = isLoggedIn && user?.role === 'ADMIN';
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const [activePage, setActivePage] = useState<string>('');

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handlePageClick = (item: NavItem) => {
    setActivePage(item.label);
    handleCloseNavMenu();
    navigate({ to: item.path });
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    setActivePage('');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNavigateDashboard = () => {
    navigate({ to: '/admin' });
  };

  const handleLogoClick = () => {
    setActivePage('');
    navigate({ to: '/' });
  };

  // --- NEW HANDLER FOR HISTORY ---
  const handleNavigateHistory = () => {
    handleCloseUserMenu();
    navigate({ to: '/history' });
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0060c4', color: 'white', boxShadow: 0 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* 1. MOBILE MENU */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {NAV_ITEMS.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => handlePageClick(item)}
                  selected={activePage === item.label}
                >
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate({ to: '/admin' });
                  }}
                >
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* 2. DESKTOP LOGO */}
          <Box
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', cursor: 'pointer' }}
            onClick={handleLogoClick}
          >
            <DirectionsBusFilled sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 800,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '1.5rem',
              }}
            >
              VEXESIEURE
            </Typography>
          </Box>

          {/* 3. MOBILE LOGO */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              flexGrow: 1,
              cursor: 'pointer',
            }}
            onClick={handleLogoClick}
          >
            <DirectionsBusFilled sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                display: { xs: 'flex', md: 'none' },
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              VEXESIEURE
            </Typography>
          </Box>

          {/* 4. DESKTOP NAV */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-end',
              mr: 2,
              gap: 1,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);

              return (
                <Button
                  key={item.label}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate({ to: item.path });
                  }}
                  startIcon={item.label === 'Tra cứu vé' ? <Search /> : undefined}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'flex',
                    px: 2,
                    borderRadius: 2,
                    bgcolor: active ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                    fontWeight: active ? 700 : 500,
                    '&:hover': {
                      bgcolor: active ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {isAdmin && (
              <Button
                onClick={handleNavigateDashboard}
                startIcon={<DashboardIcon />}
                sx={{
                  my: 2,
                  ml: 2,
                  display: { xs: 'none', md: 'flex' },
                  bgcolor: 'white',
                  color: '#0060c4',
                  fontWeight: 800,
                  px: 2.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          {/* 5. AUTH */}
          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn && user ? (
              <>
                <Tooltip title="Tài khoản">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.email} sx={{ bgcolor: 'primary.dark' }}>
                      {user.email[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar-user"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  keepMounted
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />

                  {/* --- NEW HISTORY ITEM --- */}
                  <MenuItem onClick={handleNavigateHistory}>
                    <History sx={{ mr: 1, color: 'text.secondary' }} /> Lịch sử đặt vé
                  </MenuItem>

                  <MenuItem onClick={handleCloseUserMenu}>
                    <AccountCircle sx={{ mr: 1, color: 'text.secondary' }} /> Tài khoản
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1, color: 'text.secondary' }} /> Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleOpenModal}
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    backgroundColor: 'white',
                    color: '#0060c4',
                    fontWeight: 700,
                    border: '1px solid white',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  Đăng nhập
                </Button>

                <Button
                  onClick={handleOpenModal}
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    minWidth: 'auto',
                    p: 1,
                    backgroundColor: 'white',
                    color: '#0060c4',
                    fontWeight: 700,
                    border: '1px solid white',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ mr: 0.5 }}>
                    Đăng nhập
                  </Typography>
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      <AuthModal open={isModalOpen} onClose={handleCloseModal} initialView="login" />
    </AppBar>
  );
}
export default Header;
