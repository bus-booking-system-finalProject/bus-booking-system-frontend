import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Grid as Grid, // Sử dụng Grid2 cho MUI v6
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import type { SummaryMetric } from '@/types/dashboard';
import { summaryMetrics } from '@/types/dashboard';

// Định nghĩa bảng màu sắc nhẹ nhàng, hiện đại
const CARD_COLORS = [
  { main: '#0060c4', light: '#e3f2fd' }, // Blue (Thương hiệu)
  { main: '#ed6c02', light: '#fff3e0' }, // Orange (Cảnh báo/Chú ý)
  { main: '#2e7d32', light: '#e8f5e9' }, // Green (Thành công/Tăng trưởng)
  { main: '#9c27b0', light: '#f3e5f5' }, // Purple (Người dùng/Khác)
];

const SummaryCards: React.FC = () => {
  const { user } = useAuth();

  // Lọc metrics theo role
  const visible = summaryMetrics.filter(
    (m: SummaryMetric) => !m.roles || (user?.role && m.roles.includes(user.role)),
  );

  return (
    <Grid container spacing={3}>
      {visible.map((m, index) => {
        // Lấy màu dựa trên index (nếu index > 3 thì quay lại 0)
        const colorSet = CARD_COLORS[index % CARD_COLORS.length];

        return (
          <Grid key={m.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid #f0f0f0',
                boxShadow: '0px 10px 40px rgba(0,0,0,0.05)', // Shadow rất nhẹ
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-4px)', // Nổi lên khi hover
                  boxShadow: '0px 15px 30px rgba(0,0,0,0.1)',
                  borderColor: colorSet.light,
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 3,
                  '&:last-child': { pb: 3 }, // Override padding mặc định của MUI
                }}
              >
                {/* Phần Text bên trái */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {m.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#1a1a1a',
                      letterSpacing: '-1px', // Làm số trông chặt chẽ hơn
                    }}
                  >
                    {m.value}
                  </Typography>
                </Box>

                {/* Phần Icon bên phải */}
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: colorSet.light,
                    color: colorSet.main,
                    width: 56,
                    height: 56,
                    borderRadius: 2, // Bo góc mềm mại cho icon container
                    boxShadow: 'none',
                  }}
                >
                  {/* Render icon, tăng kích thước font nếu icon là text/emoji */}
                  <Box sx={{ fontSize: '1.75rem', display: 'flex' }}>{m.icon}</Box>
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SummaryCards;
