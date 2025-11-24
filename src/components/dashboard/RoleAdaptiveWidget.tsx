import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
} from '@mui/material';

// Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { useAuth } from '@/context/AuthContext';

const RoleAdaptiveWidget: React.FC = () => {
  const { user } = useAuth();

  // Helper render item đẹp hơn với Icon có nền màu
  const renderActionItem = (
    text: string,
    icon: React.ReactNode,
    colorHex: string,
    onClick?: () => void,
  ) => (
    <ListItem disablePadding sx={{ mb: 1.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          py: 1.5,
          transition: 'all 0.2s',
          border: '1px solid transparent',
          '&:hover': {
            bgcolor: '#f8fdff', // Nền xanh rất nhạt khi hover
            borderColor: '#e3f2fd',
            transform: 'translateX(4px)', // Hiệu ứng đẩy nhẹ sang phải
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 50 }}>
          {/* Tạo khối nền cho Icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: `${colorHex}15`, // Độ trong suốt 15%
              color: colorHex,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </ListItemIcon>
        <ListItemText
          primary={text}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: 600,
            color: '#333',
          }}
        />
        <ChevronRightIcon sx={{ color: '#ccc', fontSize: 20 }} />
      </ListItemButton>
    </ListItem>
  );

  // --- 1. ADMIN VIEW ---
  if (user?.role === 'ADMIN') {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          boxShadow: '0px 10px 40px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: '#ffebee', color: '#d32f2f' }}>
              <AdminPanelSettingsIcon />
            </Avatar>
          }
          title="Quản trị viên"
          titleTypographyProps={{ variant: 'h6', fontWeight: 700, color: '#d32f2f' }}
          subheader="Bảng điều khiển hệ thống"
          sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}
        />
        <CardContent sx={{ pt: 2 }}>
          <List disablePadding>
            {renderActionItem('Quản lý tuyến đường', <MapIcon fontSize="small" />, '#d32f2f')}
            {renderActionItem('Xử lý khiếu nại', <WarningAmberIcon fontSize="small" />, '#ed6c02')}
            {renderActionItem(
              'Sức khỏe hệ thống',
              <MonitorHeartIcon fontSize="small" />,
              '#2e7d32',
            )}
          </List>
        </CardContent>
      </Card>
    );
  }

  // // --- 2. USER VIEW ---
  // if (userRole === 'USER') {
  //   return (
  //     <Card
  //       sx={{
  //         height: '100%',
  //         borderRadius: 3,
  //         boxShadow: '0px 10px 40px rgba(0,0,0,0.08)',
  //         border: '1px solid #f0f0f0',
  //       }}
  //     >
  //       <CardHeader
  //         title="Truy cập nhanh"
  //         titleTypographyProps={{ variant: 'h6', fontWeight: 700, color: '#0060c4' }}
  //         subheader="Quản lý chuyến đi của bạn"
  //         action={
  //           <IconButton size="small" sx={{ color: '#0060c4' }}>
  //             <VerifiedUserIcon />
  //           </IconButton>
  //         }
  //         sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}
  //       />
  //       <CardContent sx={{ pt: 2 }}>
  //         <List disablePadding>
  //           {renderActionItem(
  //             'Chuyến đi sắp tới',
  //             <DirectionsCarIcon fontSize="small" />,
  //             '#0060c4',
  //           )}
  //           {renderActionItem('Tìm kiếm vé mới', <SearchIcon fontSize="small" />, '#0288d1')}
  //           {renderActionItem('Cập nhật hồ sơ', <PersonIcon fontSize="small" />, '#7b1fa2')}
  //         </List>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  // --- 3. GUEST VIEW (Call to Action) ---
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0px 10px 40px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decor (vòng tròn mờ) */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: 'rgba(0, 96, 196, 0.05)',
          zIndex: 0,
        }}
      />

      <CardContent
        sx={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          px: 3,
          py: 5,
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: '#e3f2fd',
            color: '#0060c4',
            mx: 'auto',
            mb: 2,
          }}
        >
          <LoginIcon sx={{ fontSize: 32 }} />
        </Avatar>

        <Typography variant="h6" fontWeight={700} gutterBottom>
          Xin chào quý khách
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          Đăng nhập để xem lịch sử chuyến đi, tích điểm và nhận ưu đãi độc quyền.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<LoginIcon />}
          sx={{
            background: 'linear-gradient(135deg, #65c7f7 0%, #0052d4 100%)',
            boxShadow: '0 4px 12px rgba(0, 82, 212, 0.3)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            py: 1.5,
          }}
        >
          Đăng nhập ngay
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleAdaptiveWidget;
