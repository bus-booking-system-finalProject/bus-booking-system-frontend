import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { Armchair, Loader2 } from 'lucide-react';
import type { SeatType } from '@/types/AdminTypes';
import { useSaveSeatMapMutation } from '@/hooks/useAdminQueries';

export const SeatMapDesigner: React.FC = () => {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(4);
  const [selectedType, setSelectedType] = useState<SeatType>('standard');

  const saveSeatMap = useSaveSeatMapMutation();

  // Helper to generate the initial map
  const generateMap = (r: number, c: number): SeatType[] => {
    const newMap: SeatType[] = Array(r * c).fill('standard');
    if (c >= 4) {
      for (let i = 0; i < r; i++) {
        const middleIndex = i * c + Math.floor(c / 2);
        if (middleIndex < newMap.length) newMap[middleIndex] = 'aisle';
      }
    }
    return newMap;
  };

  // Initialize state using the helper
  const [seatMap, setSeatMap] = useState<SeatType[]>(() => generateMap(6, 4));

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setRows(val);
    setSeatMap(generateMap(val, cols));
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setCols(val);
    setSeatMap(generateMap(rows, val));
  };

  const toggleSeat = (index: number) => {
    const newMap = [...seatMap];
    newMap[index] = selectedType;
    setSeatMap(newMap);
  };

  const handleSave = () => {
    saveSeatMap.mutate({ rows, cols, map: seatMap });
  };

  const getSeatColor = (type: SeatType) => {
    switch (type) {
      case 'standard':
        return '#e2e8f0';
      case 'premium':
        return '#fcd34d';
      case 'aisle':
        return '#ffffff';
      case 'blocked':
        return '#ef4444';
      default:
        return '#e2e8f0';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'end' }}>
        <TextField
          label="Rows"
          type="number"
          value={rows}
          onChange={handleRowsChange}
          sx={{ width: 100 }}
          size="small"
        />
        <TextField
          label="Columns"
          type="number"
          value={cols}
          onChange={handleColsChange}
          sx={{ width: 100 }}
          size="small"
        />
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel>Paint Tool</InputLabel>
          <Select
            value={selectedType}
            label="Paint Tool"
            onChange={(e) => setSelectedType(e.target.value as SeatType)}
          >
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="premium">Premium</MenuItem>
            <MenuItem value="aisle">Aisle (Empty)</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saveSeatMap.isPending}
          startIcon={
            saveSeatMap.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <CheckCircleIcon />
            )
          }
        >
          {saveSeatMap.isPending ? 'Saving...' : 'Save Layout'}
        </Button>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          bgcolor: '#f1f5f9',
          overflowX: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 50px)`,
            gap: 1,
          }}
        >
          {seatMap.map((type, idx) => (
            <Box
              key={idx}
              onClick={() => toggleSeat(idx)}
              sx={{
                width: 50,
                height: 50,
                bgcolor: getSeatColor(type),
                border: type === 'aisle' ? 'none' : '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                '&:hover': { opacity: 0.8, transform: 'scale(1.05)' },
              }}
            >
              {type !== 'aisle' && <Armchair size={20} color="#64748b" />}
            </Box>
          ))}
        </Box>
      </Paper>
      <Typography
        variant="caption"
        sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}
      >
        Click on grid cells to apply the selected seat type.
      </Typography>
    </Box>
  );
};
