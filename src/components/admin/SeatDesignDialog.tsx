import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Grid, 
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Save, EventSeat, GridOn, Delete, Close } from '@mui/icons-material';

// --- Imports from Lib/API & Hooks ---
import { BusesApi } from '@/lib/api/BusesApi';
import { SeatTypesApi } from '@/lib/api/SeatTypesApi';
import { useMutateBus } from '@/hooks/admin/useBuses';
import type { SeatDefinition, SeatType, Bus } from '@/types/AdminTypes';

// --- Internal Types ---

// Extended Bus interface to handle the 'seats' property if it comes from the API
interface BusWithSeats extends Bus {
    seats?: ApiSeat[];
}

interface ApiSeatType {
    id: string;
    name: string;
    price: number;
    description?: string;
}

interface ApiSeat {
  id: string;
  seatCode: string;
  deckNumber: number;
  gridRow: number;
  gridCol: number;
  seatType?: ApiSeatType;
}

interface EditorConfig {
    decks: number;
    rows: number;
    cols: number;
}

interface SelectedCell {
    deck: number;
    row: number;
    col: number;
}

// --- Helper: Grid Cell Component ---
const GridCell = ({ 
    seat, 
    onClick, 
    selected,
    selectedTool 
}: { 
    row: number; 
    col: number; 
    seat?: SeatDefinition; 
    onClick: () => void;
    selected: boolean;
    selectedTool: string;
}) => {
    const isSeat = !!seat;
    const isPath = !seat;

    const getTypeColor = (type: string) => {
        // Handle both standard enums and dynamic types gracefully
        const normalizedType = type.toUpperCase();
        if (normalizedType.includes('VIP')) return '#9c27b0'; // Purple
        if (normalizedType.includes('LIMOUSINE')) return '#ed6c02'; // Orange
        if (normalizedType.includes('SLEEPER')) return '#1976d2'; // Blue
        if (normalizedType.includes('STANDARD')) return '#2e7d32'; // Green
        return '#1976d2'; // Default Blue
    };

    return (
        <Box
            onClick={onClick}
            sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                border: selected ? '2px solid #000' : (isSeat ? 'none' : '1px dashed #ccc'),
                bgcolor: isSeat ? getTypeColor(seat.type) : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.1s',
                position: 'relative',
                boxShadow: selected ? 3 : 0,
                transform: selected ? 'scale(1.1)' : 'scale(1)',
                zIndex: selected ? 10 : 1,
                '&:hover': {
                    opacity: 0.8,
                    bgcolor: isPath && selectedTool !== 'PATH' ? 'rgba(25, 118, 210, 0.1)' : undefined,
                    borderColor: '#1976d2'
                }
            }}
        >
            {isSeat ? (
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    {seat.seatCode}
                </Typography>
            ) : null}
        </Box>
    );
};

// --- Helper: Deck Editor ---
const DeckEditor = ({
    deckNum,
    config,
    seats,
    selectedCell,
    onCellClick,
    selectedTool
}: {
    deckNum: number;
    config: EditorConfig;
    seats: SeatDefinition[];
    selectedCell: SelectedCell | null;
    onCellClick: (d: number, r: number, c: number) => void;
    selectedTool: string;
}) => {
    const rows = Array.from({ length: config.rows }, (_, i) => i + 1);
    const cols = Array.from({ length: config.cols }, (_, i) => i + 1);

    const getSeat = (r: number, c: number) => 
        seats.find(s => s.deck === deckNum && s.row === r && s.col === c);

    const isSelected = (r: number, c: number) => 
        selectedCell?.deck === deckNum && selectedCell?.row === r && selectedCell?.col === c;

    return (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
            <Typography variant="subtitle2" align="center" gutterBottom sx={{ textTransform: 'uppercase', color: '#666' }}>
                Deck {deckNum}
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
                {rows.map(r => (
                    <Box key={r} sx={{ display: 'flex', gap: 1 }}>
                        {cols.map(c => (
                            <GridCell 
                                key={`${r}-${c}`}
                                row={r} 
                                col={c} 
                                seat={getSeat(r, c)}
                                selected={isSelected(r, c)}
                                onClick={() => onCellClick(deckNum, r, c)}
                                selectedTool={selectedTool}
                            />
                        ))}
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

// --- Main Dialog Component ---
const SeatDesignDialog = ({
  open,
  onClose,
  busId,
  busName,
  operatorId
}: {
  open: boolean;
  onClose: () => void;
  busId: string | null;
  busName: string;
  operatorId?: string;
}) => {
  const [loading, setLoading] = useState(false);
  
  // Api Data State
  const [seatTypes, setSeatTypes] = useState<ApiSeatType[]>([]);
  
  // Editor State
  const [config, setConfig] = useState<EditorConfig>({ decks: 1, rows: 10, cols: 5 });
  const [seats, setSeats] = useState<SeatDefinition[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('PATH');
  
  // Selection State for Editing
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  // Mutation Hook
  const { saveSeatMap } = useMutateBus();

  // Load Data on Open
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
        if (!open || !busId) return;

        setLoading(true);
        try {
            const [busData, typesData] = await Promise.all([
                BusesApi.getById(busId),
                operatorId ? SeatTypesApi.getByOperator(operatorId) : Promise.resolve([])
            ]);

            if (!mounted) return;

            // 1. Set Seat Types
            setSeatTypes(typesData as ApiSeatType[]);
            if (typesData.length > 0) setSelectedTool(typesData[0].name);

            // 2. Parse Existing Seats from Bus Response
            // Safely cast to BusWithSeats to access optional 'seats' property
            const busWithSeats = busData as BusWithSeats;
            const apiSeats = busWithSeats.seats || [];
            
            if (apiSeats.length > 0) {
                const maxRow = Math.max(...apiSeats.map(s => s.gridRow), 10);
                const maxCol = Math.max(...apiSeats.map(s => s.gridCol), 3);
                const maxDeck = Math.max(...apiSeats.map(s => s.deckNumber), 1);
                
                setConfig({ decks: maxDeck, rows: maxRow, cols: maxCol });

                const mappedSeats: SeatDefinition[] = apiSeats.map(s => ({
                    seatCode: s.seatCode,
                    row: s.gridRow,
                    col: s.gridCol,
                    deck: s.deckNumber,
                    // Cast type to any to allow string values from DB even if strict enum exists
                    type: (s.seatType?.name || 'STANDARD') as any 
                }));
                setSeats(mappedSeats);
            } else {
                // Default Layout for New Bus
                setConfig({ decks: 1, rows: 10, cols: 5 });
                setSeats([]);
            }
        } catch (error) {
            console.error("Error loading seat map:", error);
            // Don't alert here, just let it be empty or retry
        } finally {
            if (mounted) setLoading(false);
        }
    };

    fetchData();

    return () => { mounted = false; };
  }, [open, busId, operatorId]);

  // Handle Cell Click
  const handleCellClick = (deck: number, row: number, col: number) => {
    setSelectedCell({ deck, row, col });

    const existingIndex = seats.findIndex(s => s.deck === deck && s.row === row && s.col === col);
    const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    if (selectedTool === 'PATH') {
        // Eraser Mode
        if (existingIndex !== -1) {
            const newSeats = [...seats];
            newSeats.splice(existingIndex, 1);
            setSeats(newSeats);
            setSelectedCell(null); // Deselect after deleting
        }
    } else {
        // Paint Mode (Create or Update Type)
        const colChar = colLabels[col - 1] || `Col${col}`;
        const defaultCode = `${colChar}${row}`;

        const newSeat: SeatDefinition = {
            seatCode: existingIndex !== -1 ? seats[existingIndex].seatCode : defaultCode,
            deck,
            row,
            col,
            type: selectedTool as any // Cast string to SeatTypeCategory
        };

        const newSeats = [...seats];
        if (existingIndex !== -1) {
            newSeats[existingIndex] = { ...newSeats[existingIndex], type: selectedTool as any };
        } else {
            newSeats.push(newSeat);
        }
        setSeats(newSeats);
    }
  };

  // Handle Manual Seat Edits (Name/Type) from Sidebar
  const handleSelectedSeatChange = (field: keyof SeatDefinition, value: string) => {
    if (!selectedCell) return;
    
    const index = seats.findIndex(s => 
        s.deck === selectedCell.deck && 
        s.row === selectedCell.row && 
        s.col === selectedCell.col
    );

    if (index !== -1) {
        const newSeats = [...seats];
        newSeats[index] = { ...newSeats[index], [field]: value };
        setSeats(newSeats);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedCell) return;
    const newSeats = seats.filter(s => 
        !(s.deck === selectedCell.deck && s.row === selectedCell.row && s.col === selectedCell.col)
    );
    setSeats(newSeats);
    setSelectedCell(null);
  };

  const handleSave = () => {
      if (!busId) return;
      if (!confirm("This will overwrite the current seat map. Continue?")) return;
      
      saveSeatMap.mutate({ busId, seats }, {
          onSuccess: () => {
              alert("Seat map saved successfully!");
              onClose();
          },
          onError: (error) => {
              console.error("Failed to save seat map:", error);
              alert("Failed to save configuration.");
          }
      });
  };

  // Get currently selected seat object for the form
  const selectedSeatObj = selectedCell 
    ? seats.find(s => s.deck === selectedCell.deck && s.row === selectedCell.row && s.col === selectedCell.col)
    : null;

  const activeDecks = Array.from({ length: config.decks }, (_, i) => i + 1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <EventSeat />
        <Box sx={{ flex: 1 }}>
            Seat Map Designer: {busName}
            <Typography variant="caption" display="block" color="text.secondary">
                Select a tool to paint seats. Click any seat to select and rename it.
            </Typography>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saveSeatMap.isPending || loading}
        >
            {saveSeatMap.isPending ? 'Saving...' : 'Save Layout'}
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
            <Grid container spacing={3} sx={{ height: '100%' }}>
                {/* LEFT: Toolbar & Settings */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ borderRight: '1px solid #eee' }}>
                    <Stack spacing={3}>
                        
                        {/* 1. Selected Seat Editor (Appears on Selection) */}
                        {selectedSeatObj ? (
                            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle2" color="primary">Edit Selected Seat</Typography>
                                    <IconButton size="small" onClick={() => setSelectedCell(null)}><Close fontSize="small"/></IconButton>
                                </Stack>
                                <Stack spacing={2} mt={1}>
                                    <TextField 
                                        label="Seat Code" 
                                        size="small" 
                                        fullWidth 
                                        value={selectedSeatObj.seatCode}
                                        onChange={(e) => handleSelectedSeatChange('seatCode', e.target.value)}
                                        helperText="Custom label (e.g. A1, Driver)"
                                    />
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={selectedSeatObj.type}
                                            label="Type"
                                            onChange={(e) => handleSelectedSeatChange('type', e.target.value)}
                                        >
                                            {seatTypes.map(t => (
                                                <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        startIcon={<Delete />} 
                                        onClick={handleDeleteSelected}
                                    >
                                        Remove Seat
                                    </Button>
                                </Stack>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Click a seat in the grid to edit its name or type.
                                </Typography>
                            </Paper>
                        )}

                        {/* 2. Tool Palette */}
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Tool Palette</Typography>
                            <ToggleButtonGroup
                                orientation="vertical"
                                value={selectedTool}
                                exclusive
                                onChange={(_, val) => val && setSelectedTool(val)}
                                fullWidth
                                size="small"
                            >
                                <ToggleButton value="PATH" sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                    <GridOn fontSize="small" /> Path (Eraser)
                                </ToggleButton>
                                {seatTypes.map(type => (
                                    <ToggleButton key={type.id} value={type.name} sx={{ justifyContent: 'flex-start', gap: 1 }}>
                                        <EventSeat fontSize="small" /> {type.name}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Paper>

                        {/* 3. Grid Settings */}
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Grid Dimensions</Typography>
                            <Stack spacing={2}>
                                <TextField 
                                    label="Decks" type="number" size="small" 
                                    value={config.decks}
                                    onChange={e => setConfig({...config, decks: Math.max(1, +e.target.value)})}
                                />
                                <Stack direction="row" spacing={1}>
                                    <TextField 
                                        label="Rows" type="number" size="small" 
                                        value={config.rows}
                                        onChange={e => setConfig({...config, rows: Math.max(1, +e.target.value)})}
                                    />
                                    <TextField 
                                        label="Cols" type="number" size="small" 
                                        value={config.cols}
                                        onChange={e => setConfig({...config, cols: Math.max(1, +e.target.value)})}
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                        
                    </Stack>
                </Grid>

                {/* RIGHT: Visual Editor */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <Box sx={{ 
                        height: '100%', 
                        overflow: 'auto', 
                        display: 'flex', 
                        gap: 4, 
                        justifyContent: 'center', 
                        p: 2,
                        bgcolor: '#fafafa'
                    }}>
                        {activeDecks.map(deck => (
                            <DeckEditor 
                                key={deck}
                                deckNum={deck}
                                config={config}
                                seats={seats}
                                selectedCell={selectedCell}
                                onCellClick={handleCellClick}
                                selectedTool={selectedTool}
                            />
                        ))}
                    </Box>
                </Grid>
            </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatDesignDialog;