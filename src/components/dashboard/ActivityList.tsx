import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Box,
  IconButton,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InboxIcon from '@mui/icons-material/Inbox'; // Icon cho trạng thái trống
import { useAuth } from '@/context/AuthContext';
import { activities } from '@/types/dashboard';

const ActivityList: React.FC = () => {
  const { user } = useAuth();

  // Filter logic
  const visible = activities.filter(
    (a) => !a.roleVisibility || (user?.role && a.roleVisibility.includes(user.role)),
  );

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3, // Bo góc giống khung tìm kiếm
        boxShadow: '0px 10px 40px rgba(0,0,0,0.08)', // Shadow mềm mại
        border: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
      }}
    >
      {/* HEADER: Dùng màu xanh thương hiệu và style đậm */}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon sx={{ color: '#0060c4' }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: '#0060c4' }}>
              Hoạt động gần đây
            </Typography>
          </Box>
        }
        action={
          <IconButton size="small">
            <MoreHorizIcon />
          </IconButton>
        }
        sx={{
          pb: 1.5,
          borderBottom: '1px solid #f0f0f0',
          '& .MuiCardHeader-action': { alignSelf: 'center' },
        }}
      />

      <CardContent
        sx={{
          p: 0,
          flex: 1,
          overflowY: 'auto',
          // Custom Scrollbar cho đẹp
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
          '&::-webkit-scrollbar-thumb': { background: '#bdbdbd', borderRadius: '4px' },
          '&:last-child': { pb: 0 },
        }}
      >
        {visible.length === 0 ? (
          // EMPTY STATE: Thêm icon và căn giữa
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 200,
              gap: 2,
              color: 'text.secondary',
            }}
          >
            <InboxIcon sx={{ fontSize: 48, opacity: 0.2 }} />
            <Typography variant="body2" fontStyle="italic">
              Chưa có hoạt động nào
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', py: 0 }}>
            {visible.map((a, index) => (
              <React.Fragment key={a.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    px: 3,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#f8fdff', // Màu nền xanh rất nhạt khi hover
                    },
                  }}
                >
                  <ListItemAvatar>
                    {/* AVATAR: Sử dụng Gradient Blue/Cyan của Banner */}
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #65c7f7 0%, #0052d4 100%)',
                        boxShadow: '0 4px 6px rgba(0, 82, 212, 0.2)',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {/* Lấy ký tự đầu hoặc icon mặc định */}
                      <Typography variant="subtitle2" fontWeight="bold" color="#fff">
                        {a.message.charAt(0).toUpperCase()}
                      </Typography>
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#333',
                          fontWeight: 600,
                          mb: 0.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {a.message}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: '#888',
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#888' }} />
                        {a.timestamp}
                      </Typography>
                    }
                  />
                </ListItem>
                {/* Divider mảnh, trừ item cuối cùng */}
                {index < visible.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ ml: 9, borderColor: '#f5f5f5' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityList;
