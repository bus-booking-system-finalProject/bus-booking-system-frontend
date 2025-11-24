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
import {
  Menu as MenuIcon,
  DirectionsBusFilled,
  Logout,
  AccountCircle,
  Dashboard as DashboardIcon, // Đổi tên import icon để tránh trùng tên component
} from '@mui/icons-material';
import AuthModal from './AuthModal';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

const pages = ['Giới thiệu', 'Cổ đông', 'Liên hệ'];

function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const isAdmin = isLoggedIn && user?.role === 'ADMIN';
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  // --- STATE: Track active page ---
  const [activePage, setActivePage] = useState<string>('');

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/'; // Trang chủ
    return currentPath.startsWith(path);
  };
  // --- Handlers ---
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Xử lý khi click vào Menu Item (Pages)
  const handlePageClick = (page: string) => {
    setActivePage(page);
    handleCloseNavMenu();
    // navigate({ to: ... }) // Logic điều hướng của bạn ở đây
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
    setActivePage(''); // Reset active page khi logout
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNavigateDashboard = () => {
    navigate({ to: '/dashboard' });
  };

  const handleLogoClick = () => {
    setActivePage(''); // Reset active state về trang chủ
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0060c4', color: 'white', boxShadow: 0 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* ==============================
              1. MOBILE VIEW: MENU ICON (LEFT)
             ============================== */}
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
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => handlePageClick(page)}
                  // Highlight trên Mobile Menu
                  selected={activePage === page}
                  sx={{
                    '&.Mui-selected': { bgcolor: 'rgba(0, 96, 196, 0.1)' },
                  }}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* ==============================
              2. DESKTOP VIEW: LOGO (LEFT)
             ============================== */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <DirectionsBusFilled sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              onClick={handleLogoClick}
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

          {/* ==============================
              3. MOBILE VIEW: LOGO (CENTER)
             ============================== */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
            <DirectionsBusFilled sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              onClick={handleLogoClick}
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

          {/* ==============================
              4. DESKTOP VIEW: NAVIGATION (CENTER/RIGHT)
             ============================== */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-end',
              mr: 2,
              gap: 1, // Khoảng cách giữa các nút
            }}
          >
            {pages.map((page) => {
              // Giả sử bạn map tên trang thành đường dẫn: 'Giới thiệu' -> '/gioi-thieu'
              // Bạn có thể tùy chỉnh logic mapping này
              const pathMap: Record<string, string> = {
                'Giới thiệu': '/gioi-thieu',
                'Cổ đông': '/co-dong',
                'Liên hệ': '/lien-he',
              };
              const pagePath = pathMap[page] || '/';
              const active = isActive(pagePath);

              return (
                <Button
                  key={page}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate({ to: pagePath }); // Điều hướng thật
                  }}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'block',
                    px: 2,
                    borderRadius: 2,
                    // --- LOGIC ACTIVE DỰA TRÊN URL ---
                    bgcolor: active ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                    fontWeight: active ? 700 : 500,
                    '&:hover': {
                      bgcolor: active ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  {page}
                </Button>
              );
            })}

            {/* Dashboard Button */}
            {isAdmin && (
              <Button
                onClick={handleNavigateDashboard}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  ml: 1,
                  px: 2,
                  borderRadius: 2,
                  // --- KIỂM TRA TRỰC TIẾP VỚI /dashboard ---
                  bgcolor: isActive('/dashboard') ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                  fontWeight: isActive('/dashboard') ? 700 : 500,
                  '&:hover': {
                    bgcolor: isActive('/dashboard')
                      ? 'rgba(0, 0, 0, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          {/* ==============================
              5. AUTH SECTION (RIGHT)
             ============================== */}
          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn && user ? (
              <>
                <Tooltip title="Dashboard">
                  <IconButton
                    onClick={handleNavigateDashboard}
                    sx={{ color: 'inherit', mr: 1, display: { xs: 'flex', md: 'none' } }}
                  >
                    <DashboardIcon />
                  </IconButton>
                </Tooltip>
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
                    color: 'inherit',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid white' },
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
