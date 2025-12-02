import React from 'react';
import { Box, Stack, Pagination } from '@mui/material';
import TripCard from './TripCard';
import { type Trip } from '@/types/trip';

interface TripListProps {
  trips: Trip[];
  page: number;
  pageCount: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, page, pageCount, onPageChange }) => {
  return (
    <Box>
      {/* 1. TRIP CARDS */}
      <Stack spacing={2}>
        {trips.map((trip) => (
          <TripCard key={trip.tripId} trip={trip} />
        ))}
      </Stack>

      {/* 2. PAGINATION */}
      {pageCount > 1 && (
        <Stack alignItems="center" sx={{ mt: 4, mb: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={onPageChange}
            color="primary"
            size="large"
            shape="rounded"
          />
        </Stack>
      )}
    </Box>
  );
};

export default TripList;
