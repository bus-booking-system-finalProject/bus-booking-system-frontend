// src/components/admin/analytics/PopularRoutesTable.tsx
import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { type PopularRoute } from '@/types/analytics';

export const PopularRoutesTable: React.FC<{ data?: PopularRoute[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', height: '100%' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>
          Tuyến đường phổ biến
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tuyến đường</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Số lượng vé
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Doanh thu
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((route, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: index < 3 ? 'primary.main' : 'action.selected',
                      color: index < 3 ? 'white' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {route.routeName}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    icon={<TrendingUp sx={{ height: 14 }} />}
                    label={route.totalBookings}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(route.totalRevenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
