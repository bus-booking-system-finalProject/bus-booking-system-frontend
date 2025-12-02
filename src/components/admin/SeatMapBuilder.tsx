import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Grid, Button, IconButton, 
  TextField, ToggleButton, ToggleButtonGroup, Tooltip 
} from '@mui/material';
import { EventSeat, DirectionsBus, Square } from '@mui/icons-material';
import type { SeatDefinition } from '@/types/AdminTypes';

interface SeatMapBuilderProps {
  busId: string;
  initialSeats?: SeatDefinition[];
  onSave: (seats: SeatDefinition[]) => void;
  isSaving?: boolean;
}

type CellType = 'NONE' | 'STANDARD' | 'VIP' | 'DRIVER' | 'DOOR';

interface CellData {
  id: string;
  row: number;
  col: number;
  deck: number;
  type: CellType;
  label: string;
}

export const SeatMapBuilder: React.FC<SeatMapBuilderProps> = ({ busId, onSave, isSaving }) => {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(4);
  const [decks, setDecks] = useState<1 | 2>(1);
  const [grid, setGrid] = useState<Record<string, CellData>>({});

  // Initialize Grid
  useEffect(() => {
    const newGrid: Record<string, CellData> = {};
    for (let d = 1; d <= decks; d++) {
      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          const key = `${d}-${r}-${c}`;
          // Preserve existing if resizing, else default to NONE
          newGrid[key] = grid[key] || {
            id: key,
            row: r,
            col: c,
            deck: d,
            type: 'NONE',
            label: `${String.fromCharCode(64 + r)}${c}` // A1, A2 style
          };
        }
      }
    }
    setGrid(newGrid);
  }, [rows, cols, decks]);

  const handleCellClick = (key: string) => {
    const types: CellType[] = ['NONE', 'STANDARD', 'VIP', 'DRIVER', 'DOOR'];
    setGrid((prev) => {
      const current = prev[key];
      const nextIndex = (types.indexOf(current.type) + 1) % types.length;
      return {
        ...prev,
        [key]: { ...current, type: types[nextIndex] }
      };
    });
  };

  const handleSave = () => {
    const seatList: SeatDefinition[] = Object.values(grid)
      .filter(cell => cell.type !== 'NONE')
      .map(cell => ({
        seatCode: cell.label,
        row: cell.row,
        col: cell.col,
        deck: cell.deck,
        type: cell.type as any
      }));
    onSave(seatList);
  };

  const renderDeck = (deckNum: number) => (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Typography variant="subtitle1" gutterBottom>Deck {deckNum}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 40px)`,
          gap: 1,
          justifyContent: 'center',
          p: 2,
          bgcolor: 'background.default',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        {Array.from({ length: rows * cols }).map((_, idx) => {
          const r = Math.floor(idx / cols) + 1;
          const c = (idx % cols) + 1;
          const key = `${deckNum}-${r}-${c}`;
          const cell = grid[key];
          
          if (!cell) return null;

          // Visual determination
          let bg = 'transparent';
          let icon = <Square fontSize="small" sx={{ opacity: 0.1 }} />;
          
          switch(cell.type) {
            case 'STANDARD': bg = '#e3f2fd'; icon = <EventSeat color="primary" fontSize="small" />; break;
            case 'VIP': bg = '#fff3e0'; icon = <EventSeat color="warning" fontSize="small" />; break;
            case 'DRIVER': bg = '#e0e0e0'; icon = <DirectionsBus color="action" fontSize="small" />; break;
            case 'DOOR': bg = '#ffebee'; icon = <Typography variant="caption" color="error">EXIT</Typography>; break;
          }

          return (
            <Tooltip title={`${cell.label} - ${cell.type}`} key={key}>
              <Box
                onClick={() => handleCellClick(key)}
                sx={{
                  width: 40, height: 40,
                  bgcolor: bg,
                  borderRadius: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  border: cell.type === 'NONE' ? '1px dashed #ccc' : '1px solid transparent',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                {icon}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Seat Map Configuration</Typography>
      
      {/* Controls */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <TextField label="Rows" type="number" size="small" value={rows} onChange={e => setRows(+e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={3}>
          <TextField label="Cols" type="number" size="small" value={cols} onChange={e => setCols(+e.target.value)} fullWidth />
        </Grid>
        <Grid item xs={6}>
          <ToggleButtonGroup 
            value={decks} 
            exclusive 
            onChange={(_, val) => val && setDecks(val)} 
            size="small"
            fullWidth
          >
            <ToggleButton value={1}>Single Deck</ToggleButton>
            <ToggleButton value={2}>Double Deck</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {/* Visual Map */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {renderDeck(1)}
        {decks === 2 && renderDeck(2)}
      </Box>

      {/* Legend & Save */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Click cells to toggle: Standard -> VIP -> Driver -> Door -> Empty
        </Typography>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>
    </Paper>
  );
};