import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

export type SortOption = 'earliest' | 'latest' | 'lowest_price' | 'highest_rating';

interface SortBarProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
  resultCount: number;
}

const SortBar: React.FC<SortBarProps> = ({ currentSort, onSortChange, resultCount }) => {
  const renderSortButton = (label: string, value: SortOption) => {
    const isActive = currentSort === value;
    return (
      <Button
        variant={isActive ? 'text' : 'text'}
        color={isActive ? 'primary' : 'inherit'}
        onClick={() => onSortChange(value)}
        sx={{
          fontWeight: isActive ? 700 : 400,
          textTransform: 'none',
          color: isActive ? 'primary.main' : 'text.secondary',
          position: 'relative',
          '&:after': isActive
            ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: '10%',
                width: '80%',
                height: '2px',
                bgcolor: 'primary.main',
                borderRadius: '2px',
              }
            : {},
          '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        {resultCount} chuyến xe được tìm thấy
      </Typography>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}
        >
          Sắp xếp theo:
        </Typography>
        {renderSortButton('Giờ đi sớm nhất', 'earliest')}
        {renderSortButton('Giờ đi muộn nhất', 'latest')}
        {renderSortButton('Giá tăng dần', 'lowest_price')}
        {renderSortButton('Đánh giá cao', 'highest_rating')}
      </Stack>
    </Box>
  );
};

export default SortBar;
