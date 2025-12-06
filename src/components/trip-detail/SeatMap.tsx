import React, { useState } from 'react';
import { Box, Typography, Stack, Tabs, Tab, Tooltip } from '@mui/material';
import { EventSeat } from '@mui/icons-material';
import { type Seat, type SeatLayout } from '@/types/trip';

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
    const booked = seat.status === 'booked';

    // Determine color
    let color = '#e0e0e0'; // Default gray (booked)
    let cursor = 'not-allowed';

    if (!booked) {
      cursor = 'pointer';
      if (selected) {
        color = '#FFC107'; // Selected (Orange/Warning)
      } else {
        color = '#d1e7dd'; // Available (Light Green/Blue)
      }
    }

    return (
      <Tooltip
        key={seat.seatId}
        title={booked ? 'Booked' : `${seat.seatCode} - ${seat.price.toLocaleString()}đ`}
      >
        <Box
          onClick={() => !booked && onSeatToggle(seat)}
          sx={{
            width: 40,
            height: 40,
            bgcolor: color,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: cursor,
            border: selected ? '2px solid #ffca2c' : '1px solid transparent',
            transition: 'all 0.2s',
            position: 'relative',
            '&:hover': {
              bgcolor: !booked && !selected ? '#a3cfbb' : color, // Darker green on hover
            },
          }}
        >
          <Stack alignItems="center" spacing={-0.5}>
            <EventSeat
              sx={{
                fontSize: 18,
                color: booked ? '#9e9e9e' : selected ? '#fff' : '#198754',
                opacity: 0.7,
              }}
            />
            <Typography
              variant="caption"
              sx={{ fontSize: '0.65rem', fontWeight: 700, color: booked ? '#9e9e9e' : '#1a1a1a' }}
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
            <Tab key={i + 1} label={`Deck ${i + 1}`} value={i + 1} />
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
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{ w: 12, h: 12, borderRadius: 0.5, bgcolor: '#d1e7dd', width: 16, height: 16 }}
          />
          <Typography variant="caption">Ghế trống</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{ w: 12, h: 12, borderRadius: 0.5, bgcolor: '#FFC107', width: 16, height: 16 }}
          />
          <Typography variant="caption">Đã chọn</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{ w: 12, h: 12, borderRadius: 0.5, bgcolor: '#e0e0e0', width: 16, height: 16 }}
          />
          <Typography variant="caption">Đã đặt</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SeatMap;
