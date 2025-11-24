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
import { Menu as MenuIcon, DirectionsBusFilled, Logout, AccountCircle } from '@mui/icons-material';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

const pages = ['Giới thiệu', 'Cổ đông', 'Liên hệ'];

function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Handlers ---
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
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
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    // UPDATE 1: blue background
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
              color="inherit" // White icon
            >
              <MenuIcon />
            </IconButton>
            {/* Menu dropdown on mobile */}
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
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* ==============================
              2. DESKTOP VIEW: LOGO (LEFT)
             ============================== */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {/* UPDATE 2: White */}
            <DirectionsBusFilled sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 4,
                display: { xs: 'none', md: 'flex' },
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 800,
                letterSpacing: '.1rem',
                color: 'inherit', // UPDATE 2: inherit
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
            {/* UPDATE 2: white */}
            <DirectionsBusFilled sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                display: { xs: 'flex', md: 'none' },
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit', // UPDATE 2: inherit
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
            }}
          >
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* ==============================
              5. AUTH SECTION (ALWAYS VISIBLE - RIGHT)
             ============================== */}
          <Box sx={{ flexGrow: 0 }}>
            {isLoggedIn && user ? (
              // --- IF LOGGED IN: SHOW AVATAR ---
              <>
                <Tooltip title="Tài khoản">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user.email} sx={{ bgcolor: 'primary.dark' }}>
                      {/* Use the first letter of the user's name */}
                      {user.email[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar-user"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
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
              // --- IF LOGGED OUT: SHOW LOGIN BUTTON ---
              <>
                {/* Desktop Button: Nút trắng chữ xanh (giữ nguyên vì vẫn đẹp trên nền xanh) */}
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

                {/* Mobile Button: UPDATE 5 - Đổi sang viền trắng chữ trắng */}
                <Button
                  onClick={handleOpenModal}
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    minWidth: 'auto',
                    p: 1,
                    color: 'inherit', // Trắng
                    border: '1px solid rgba(255,255,255,0.5)', // Viền trắng mờ
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
