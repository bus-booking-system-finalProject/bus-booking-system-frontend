// src/components/trip-detail/SeatMap.tsx
import React, { useState } from 'react';
import { Box, Typography, Stack, Tabs, Tab, Tooltip } from '@mui/material';
import { EventSeat } from '@mui/icons-material'; // Import Lock icon
import { type Seat, type SeatLayout } from '@/types/TripTypes';

interface SeatMapProps {
  layout: SeatLayout;
  selectedSeats: Seat[];
  onSeatToggle: (seat: Seat) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ layout, selectedSeats, onSeatToggle }) => {
  const [currentDeck, setCurrentDeck] = useState(1);

  // Helper to check if a seat is selected
  const isSelected = (seatId: string) => selectedSeats.some((s) => s.seatId === seatId);

  // Filter seats for the current deck
  const deckSeats = layout.seats.filter((s) => s.deck === currentDeck);

  const renderSeat = (row: number, col: number) => {
    // Find the seat at this specific grid position
    const seat = deckSeats.find((s) => s.row === row && s.col === col);

    if (!seat) {
      // Empty space (aisle)
      return <Box key={`empty-${row}-${col}`} sx={{ width: 40, height: 40 }} />;
    }

    const selected = isSelected(seat.seatId);
    const locked = seat.status === 'locked';
    const booked = seat.status === 'booked' || locked;

    // Status Logic
    const isUnavailable = booked || locked;

    // Determine visuals
    let bgcolor = '#e0e0e0'; // Default gray
    let borderColor = 'transparent';
    let iconColor = '#9e9e9e';
    let cursor = 'not-allowed';
    let tooltipTitle = '';

    if (booked) {
      bgcolor = '#e0e0e0'; // Gray
      iconColor = '#9e9e9e'; // Dark Gray
      tooltipTitle = 'Đã bán';
    } else if (selected) {
      bgcolor = '#FFC107'; // Yellow/Orange
      borderColor = '#ffca2c';
      iconColor = '#fff';
      cursor = 'pointer';
      tooltipTitle = `${seat.seatCode} - ${seat.price.toLocaleString()}đ`;
    } else {
      // Available
      bgcolor = '#d1e7dd'; // Light Green
      iconColor = '#198754'; // Green
      cursor = 'pointer';
      tooltipTitle = `${seat.seatCode} - ${seat.price.toLocaleString()}đ`;
    }

    return (
      <Tooltip key={seat.seatId} title={tooltipTitle} arrow>
        <Box
          onClick={() => !isUnavailable && onSeatToggle(seat)}
          sx={{
            width: 40,
            height: 40,
            bgcolor: bgcolor,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: cursor,
            border: `1px solid ${selected ? borderColor : 'transparent'}`,
            transition: 'all 0.2s',
            position: 'relative',
            '&:hover': {
              // Only darken if it's clickable (available/selected)
              bgcolor: !isUnavailable && !selected ? '#a3cfbb' : bgcolor,
              transform: !isUnavailable ? 'scale(1.05)' : 'none',
            },
          }}
        >
          <Stack alignItems="center" spacing={-0.5}>
            {/* Use Lock icon for locked seats, Seat icon for others */}
            <EventSeat sx={{ fontSize: 18, color: iconColor, opacity: 0.8 }} />

            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: isUnavailable ? '#757575' : '#1a1a1a',
                mt: 0,
              }}
            >
              {seat.seatCode}
            </Typography>
          </Stack>
        </Box>
      </Tooltip>
    );
  };

  // Generate grid cells
  const gridCells = [];
  for (let r = 1; r <= layout.gridRows; r++) {
    for (let c = 1; c <= layout.gridColumns; c++) {
      gridCells.push(renderSeat(r, c));
    }
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Deck Selector (Only if > 1 deck) */}
      {layout.totalDecks > 1 && (
        <Tabs
          value={currentDeck}
          onChange={(_, v) => setCurrentDeck(v)}
          sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { py: 0.5, minHeight: 36 } }}
        >
          {Array.from({ length: layout.totalDecks }).map((_, i) => (
            <Tab key={i + 1} label={`Tầng ${i + 1}`} value={i + 1} />
          ))}
        </Tabs>
      )}

      {/* The Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.gridColumns}, 40px)`,
          gap: 1.5,
          p: 2,
          bgcolor: '#fff',
          borderRadius: 4,
          border: '1px solid #eee',
        }}
      >
        {gridCells}
      </Box>

      {/* Legend */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ borderRadius: 0.5, bgcolor: '#d1e7dd', width: 16, height: 16 }} />
          <Typography variant="caption">Ghế trống</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ borderRadius: 0.5, bgcolor: '#FFC107', width: 16, height: 16 }} />
          <Typography variant="caption">Đang chọn</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ borderRadius: 0.5, bgcolor: '#e0e0e0', width: 16, height: 16 }} />
          <Typography variant="caption">Đã bán</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SeatMap;
