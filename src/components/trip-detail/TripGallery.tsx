import React from 'react';
import { Paper, Box } from '@mui/material';
import { type Trip } from '@/types/TripTypes';

const TripGallery: React.FC<{ trip: Trip }> = ({ trip }) => {
  const image = trip?.bus?.images?.[0] || 'https://via.placeholder.com/800x400?text=Bus+Image';

  return (
    <Paper
      elevation={0}
      sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}
    >
      <Box
        component="img"
        src={image}
        alt="Hình ảnh xe"
        sx={{ width: '100%', height: 350, objectFit: 'cover', display: 'block' }}
      />
    </Paper>
  );
};

export default TripGallery;
