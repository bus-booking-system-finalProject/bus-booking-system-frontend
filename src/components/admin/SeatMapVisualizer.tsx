import {
  Box,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import type { SeatDto, SeatDefinition } from '@/types/AdminTypes';

const SeatMapVisualizer = ({ seats, totalDecks }: { seats: SeatDto[] | SeatDefinition[], totalDecks: number }) => {
  // Group seats by deck
  const decks = Array.from({ length: totalDecks }, (_, i) => i + 1);

  const getSeatsByDeck = (deckNum: number) => seats.filter((s) => ('deck' in s ? s.deck : (s as any).deckNumber) === deckNum);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
      {decks.map((deck) => (
        <Paper key={deck} variant="outlined" sx={{ p: 2, minWidth: 200, bgcolor: '#f8f9fa' }}>
          <Typography variant="subtitle1" align="center" gutterBottom>
            Deck {deck}
          </Typography>
          <Box sx={{ display: 'grid', gap: 1, justifyItems: 'center' }}>
            {/* Simple visualization grouping by Row */}
            {/* Note: A real implementation would verify max rows/cols to set gridTemplateColumns */}
             {getSeatsByDeck(deck).length === 0 ? (
                 <Typography variant="body2" color="text.secondary">No seats configured</Typography>
             ) : (
                // This is a simplified list view of the grid. 
                // For a true grid, you'd calculate max cols and rows.
                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 300 }}>
                    {getSeatsByDeck(deck)
                        .sort((a,b) => (a.row - b.row) || (a.col - b.col))
                        .map((seat, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                boxShadow: 1
                            }}
                        >
                            {seat.seatCode}
                        </Box>
                    ))}
                 </Box>
             )}
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

export default SeatMapVisualizer;