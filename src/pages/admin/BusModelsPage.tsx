import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Stack,
  Chip,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Paper,
  CircularProgress,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Armchair,
  MousePointer2,
  Eraser,
  PlusSquare,
  Save,
} from 'lucide-react';
import { useBusModels } from '@/hooks/admin/useBusModels';
import type { BusModelRequest, BusTypes, Seat } from '@/types/admin/BusTypes';

const BUS_TYPES: BusTypes[] = ['SEATER', 'SLEEPER', 'CABIN'];

type ToolMode = 'select' | 'add' | 'erase';

export default function BusModelsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { busModelsQuery, useBusModelDetails, createBusModel, updateBusModel, deleteBusModel } =
    useBusModels();

  const [open, setOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Tool Mode State
  const [toolMode, setToolMode] = useState<ToolMode>('select');

  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [currentSeat, setCurrentSeat] = useState<Seat | null>(null);
  const [pendingSeatLoc, setPendingSeatLoc] = useState<{
    deck: number;
    row: number;
    col: number;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<BusModelRequest>({
    name: '',
    type: 'SLEEPER',
    totalDecks: 1,
    gridRows: 10,
    gridColumns: 4,
    isLimousine: false,
    hasWC: false,
    seats: [],
  });

  const { data: busModelDetails, isLoading: loadingDetails } = useBusModelDetails(editingId);

  useEffect(() => {
    if (editingId && busModelDetails) {
      setFormData({
        name: busModelDetails.details.name,
        type: busModelDetails.details.type,
        totalDecks: busModelDetails.totalDecks,
        gridRows: busModelDetails.gridRows,
        gridColumns: busModelDetails.gridColumns,
        isLimousine: busModelDetails.details.isLimousine,
        hasWC: busModelDetails.details.hasWC,
        seats: busModelDetails.seats,
      });
    }
  }, [busModelDetails, editingId]);

  const handleOpen = (id: string | null = null, view: boolean = false) => {
    setEditingId(id);
    setViewOnly(view);
    setToolMode('select'); // Reset tool

    if (!id) {
      setFormData({
        name: '',
        type: 'SLEEPER',
        totalDecks: 2,
        gridRows: 6,
        gridColumns: 3,
        isLimousine: false,
        hasWC: false,
        seats: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  // --- Seat Interaction Logic ---

  const handleCellClick = (deck: number, row: number, col: number) => {
    if (viewOnly) return;

    const existingSeatIndex = formData.seats.findIndex(
      (s) => s.deck === deck && s.row === row && s.col === col,
    );
    const existingSeat = existingSeatIndex !== -1 ? formData.seats[existingSeatIndex] : null;

    // 1. ERASER MODE: Remove seat if clicked
    if (toolMode === 'erase') {
      if (existingSeat) {
        const newSeats = [...formData.seats];
        newSeats.splice(existingSeatIndex, 1);
        setFormData({ ...formData, seats: newSeats });
      }
      return;
    }

    // 2. ADD MODE: Instant add if empty
    if (toolMode === 'add') {
      if (!existingSeat) {
        const deckChar = deck === 1 ? 'A' : 'B';
        const defaultCode = `${deckChar}${row.toString().padStart(2, '0')}-${col}`;
        const newSeat: Seat = {
          code: defaultCode,
          row,
          col,
          deck,
        };
        setFormData((prev) => ({
          ...prev,
          seats: [...prev.seats, newSeat],
        }));
      }
      return;
    }

    // 3. SELECT/EDIT MODE (Default)
    if (existingSeat) {
      // Edit existing seat
      setCurrentSeat(existingSeat);
      setPendingSeatLoc(null);
      setSeatDialogOpen(true);
    } else {
      // Prompt to create new seat with custom code
      setPendingSeatLoc({ deck, row, col });
      const deckChar = deck === 1 ? 'A' : 'B';
      const defaultCode = `${deckChar}${row.toString().padStart(2, '0')}`;
      setCurrentSeat({
        code: defaultCode,
        row,
        col,
        deck,
      });
      setSeatDialogOpen(true);
    }
  };

  const handleSaveSeat = () => {
    if (!currentSeat) return;

    setFormData((prev) => {
      // Remove existing seat at this location if it exists (update logic)
      const filteredSeats = prev.seats.filter(
        (s) =>
          !(s.deck === currentSeat.deck && s.row === currentSeat.row && s.col === currentSeat.col),
      );
      return {
        ...prev,
        seats: [...filteredSeats, currentSeat],
      };
    });
    setSeatDialogOpen(false);
  };

  const handleDeleteSeat = () => {
    if (!currentSeat) return;
    setFormData((prev) => ({
      ...prev,
      seats: prev.seats.filter(
        (s) =>
          !(s.deck === currentSeat.deck && s.row === currentSeat.row && s.col === currentSeat.col),
      ),
    }));
    setSeatDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure we send the correct structure (id separate from body for update)
    if (editingId) {
      updateBusModel.mutate({ id: editingId, data: formData }, { onSuccess: handleClose });
    } else {
      createBusModel.mutate(formData, { onSuccess: handleClose });
    }
  };

  const renderSeatMap = () => {
    if (loadingDetails && editingId) return <CircularProgress />;

    const rows = Math.max(1, formData.gridRows || 1);
    const cols = Math.max(1, formData.gridColumns || 1);

    return (
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        justifyContent="center"
        alignItems={{ xs: 'center', md: 'flex-start' }}
        sx={{ overflowX: 'auto', p: 1, width: '100%' }}
      >
        {[...Array(formData.totalDecks)].map((_, i) => {
          const deckNum = i + 1;

          return (
            <Paper
              key={deckNum}
              elevation={2}
              sx={{
                p: 2,
                bgcolor: '#fff',
                border: '1px solid #e0e0e0',
                minWidth: 'fit-content',
              }}
            >
              <Typography align="center" fontWeight="bold" mb={2} color="text.secondary">
                {deckNum === 1 ? 'LOWER DECK' : 'UPPER DECK'}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, 45px)`,
                  gap: 1,
                  justifyContent: 'center',
                }}
              >
                {Array.from({ length: rows * cols }).map((_, idx) => {
                  const row = Math.floor(idx / cols) + 1;
                  const col = (idx % cols) + 1;

                  const seat = formData.seats.find(
                    (s) => s.deck === deckNum && s.row === row && s.col === col,
                  );

                  return (
                    <Box
                      onClick={() => handleCellClick(deckNum, row, col)}
                      sx={{
                        width: 45,
                        height: 45,
                        bgcolor: seat ? 'white' : '#f5f5f5',
                        border: seat ? '2px solid #1976d2' : '1px dashed #bdbdbd',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: viewOnly
                          ? 'default'
                          : toolMode === 'erase' && seat
                            ? 'alias'
                            : toolMode === 'add' && !seat
                              ? 'copy'
                              : 'pointer',
                        transition: 'all 0.1s',
                        '&:hover': !viewOnly
                          ? {
                              bgcolor: seat
                                ? toolMode === 'erase'
                                  ? '#ffebee'
                                  : '#e3f2fd' // Red hint for erase
                                : toolMode === 'add'
                                  ? '#e8f5e9'
                                  : 'rgba(0,0,0,0.05)', // Green hint for add
                              borderColor: toolMode === 'erase' && seat ? '#d32f2f' : undefined,
                            }
                          : {},
                        position: 'relative',
                      }}
                    >
                      {seat ? (
                        <>
                          <Armchair
                            size={18}
                            color={toolMode === 'erase' ? '#d32f2f' : '#1976d2'}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                              color: 'text.primary',
                            }}
                          >
                            {seat.code}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#bdbdbd', fontSize: '0.6rem' }}>
                          {toolMode === 'add' ? '+' : ''}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    );
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Model Name', minWidth: 260 },
    {
      field: 'typeDisplay',
      headerName: 'Seats',
      minWidth: 260,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" />,
    },
    {
      field: 'seatCapacity',
      headerName: 'Seats',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ height: '100%', alignItems: 'center' }}
        >
          <IconButton size="small" onClick={() => handleOpen(params.row.id, true)} color="info">
            <Eye size={18} />
          </IconButton>
          <IconButton size="small" onClick={() => handleOpen(params.row.id, false)} color="primary">
            <Edit size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => deleteBusModel.mutate(params.row.id)}
            color="error"
          >
            <Trash2 size={18} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', p: { xs: 1, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Bus Models
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage seating layouts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpen()}>
          Add New
        </Button>
      </Stack>

      <Card sx={{ height: 600, width: '100%', boxShadow: 2 }}>
        <DataGrid
          rows={busModelsQuery.data || []}
          columns={columns}
          loading={busModelsQuery.isLoading}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Card>

      {/* --- Main Edit/Create Dialog --- */}
      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullScreen={isMobile}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {viewOnly ? 'View Seat Map' : editingId ? 'Edit Bus Model' : 'New Bus Model'}
          <IconButton onClick={handleClose} size="small" sx={{ ml: 2 }}>
            {/* Close Icon placeholder or just standard X */}X
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Left Column: Configuration Form */}
              <Grid sx={{ borderRight: { md: '1px solid #eee' }, pr: { md: 2 }, xs: 12, md: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Model Name"
                    required
                    fullWidth
                    value={formData.name}
                    disabled={viewOnly}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <TextField
                    select
                    label="Type"
                    fullWidth
                    value={formData.type}
                    disabled={viewOnly}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BusTypes })}
                  >
                    {BUS_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Divider />

                  <Typography variant="subtitle2" color="text.secondary">
                    Grid Dimensions
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Decks"
                      type="number"
                      size="small"
                      slotProps={{
                        htmlInput: { min: 1, max: 3 },
                      }}
                      value={formData.totalDecks}
                      disabled={viewOnly}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, totalDecks: Math.min(3, Math.max(1, val)) });
                        }
                      }}
                    />
                    <TextField
                      label="Rows"
                      type="number"
                      size="small"
                      slotProps={{
                        htmlInput: { min: 1, max: 15 },
                      }}
                      value={formData.gridRows}
                      disabled={viewOnly}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, gridRows: Math.min(15, Math.max(1, val)) });
                        }
                      }}
                    />
                    <TextField
                      label="Cols"
                      type="number"
                      size="small"
                      slotProps={{
                        htmlInput: { min: 1, max: 5 },
                      }}
                      value={formData.gridColumns}
                      disabled={viewOnly}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          setFormData({ ...formData, gridColumns: Math.min(5, Math.max(1, val)) });
                        }
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isLimousine}
                          disabled={viewOnly}
                          onChange={(e) =>
                            setFormData({ ...formData, isLimousine: e.target.checked })
                          }
                        />
                      }
                      label="Limo"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasWC}
                          disabled={viewOnly}
                          onChange={(e) => setFormData({ ...formData, hasWC: e.target.checked })}
                        />
                      }
                      label="WC"
                    />
                  </Stack>
                </Stack>
              </Grid>

              {/* Right Column: Visualizer & Tools */}
              <Grid sx={{ xs: 12, md: 9 }}>
                <Stack direction="column" spacing={2} alignItems="center">
                  {/* --- Tool Bar --- */}
                  {!viewOnly && (
                    <Paper elevation={0} sx={{ border: '1px solid #ddd', p: 0.5, borderRadius: 2 }}>
                      <ToggleButtonGroup
                        value={toolMode}
                        exclusive
                        onChange={(_, newMode) => {
                          if (newMode) setToolMode(newMode);
                        }}
                        size="small"
                        aria-label="seat tools"
                      >
                        <ToggleButton value="select" aria-label="select">
                          <MousePointer2 size={18} style={{ marginRight: 8 }} />
                          Select & Edit
                        </ToggleButton>
                        <ToggleButton value="add" aria-label="add seat">
                          <PlusSquare size={18} style={{ marginRight: 8 }} />
                          Paint Seat
                        </ToggleButton>
                        <ToggleButton value="erase" aria-label="erase">
                          <Eraser size={18} style={{ marginRight: 8 }} />
                          Eraser
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Paper>
                  )}

                  {/* --- Map Container --- */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      width: '100%',
                      minHeight: 450,
                      bgcolor: '#fafafa',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      width="100%"
                      mb={2}
                      px={2}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Seat Map Preview ({formData.seats.length} seats)
                      </Typography>
                      <Chip
                        label={toolMode.toUpperCase() + ' MODE'}
                        size="small"
                        color={
                          toolMode === 'select'
                            ? 'default'
                            : toolMode === 'add'
                              ? 'success'
                              : 'error'
                        }
                        variant="outlined"
                      />
                    </Stack>

                    {renderSeatMap()}

                    {!viewOnly && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}
                      >
                        {toolMode === 'select' &&
                          '* Click seat to edit code. Click empty to add custom seat.'}
                        {toolMode === 'add' && '* Click empty boxes to instantly add seats.'}
                        {toolMode === 'erase' && '* Click seats to remove them.'}
                      </Typography>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            {!viewOnly && (
              <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
                <Button onClick={handleClose} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<Save size={18} />}>
                  Save Changes
                </Button>
              </Stack>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Seat Detail Edit Dialog */}
      <Dialog open={seatDialogOpen} onClose={() => setSeatDialogOpen(false)} maxWidth="xs">
        <DialogTitle>{pendingSeatLoc ? 'Add New Seat' : 'Edit Seat Details'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Seat Code"
              autoFocus
              value={currentSeat?.code || ''}
              onChange={(e) =>
                setCurrentSeat((prev) => (prev ? { ...prev, code: e.target.value } : null))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission if inside a form
                  handleSaveSeat();
                }
              }}
              helperText="Examples: A01, B05, 1A, 2B"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {!pendingSeatLoc && (
            <Button onClick={handleDeleteSeat} color="error" sx={{ mr: 'auto' }}>
              Delete Seat
            </Button>
          )}
          <Button onClick={() => setSeatDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSeat} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
