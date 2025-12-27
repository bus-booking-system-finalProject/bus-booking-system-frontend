import React from 'react';
import { Paper, Typography, Stack } from '@mui/material';
import { Wifi, AcUnit, LocalDrink, Usb, Chair } from '@mui/icons-material';
import { type Trip } from '@/types/TripTypes';

const AmenityItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    sx={{
      bgcolor: '#f8f9fa',
      px: 1.5,
      py: 1,
      borderRadius: 2,
      border: '1px solid #eee',
    }}
  >
    {icon}
    <Typography variant="body2" fontWeight={500}>
      {label}
    </Typography>
  </Stack>
);

const TripAmenities: React.FC<{ trip: Trip }> = ({ trip }) => {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Thông tin xe
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
        {trip?.bus?.model || 'Xe hiện đại'} ({trip?.bus?.type}) được trang bị tiện nghi cao cấp. Ghế
        rộng rãi với chỗ để chân thoải mái, phù hợp cho hành trình đường dài.
      </Typography>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
        <AmenityItem icon={<Wifi fontSize="small" color="primary" />} label="Miễn phí Wifi" />
        <AmenityItem icon={<AcUnit fontSize="small" color="info" />} label="Điều hòa" />
        <AmenityItem icon={<LocalDrink fontSize="small" color="secondary" />} label="Nước uống" />
        <AmenityItem icon={<Usb fontSize="small" color="action" />} label="Cổng USB" />
        <AmenityItem icon={<Chair fontSize="small" color="success" />} label="Ghế ngả" />
      </Stack>
    </Paper>
  );
};

export default TripAmenities;
