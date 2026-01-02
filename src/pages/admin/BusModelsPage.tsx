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
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  ImageListItemBar,
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
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react';
import { useBusModels } from '@/hooks/admin/useBusModels';
import type { BusModelRequest, BusTypes, Seat } from '@/types/admin/BusTypes';

const BUS_TYPES: BusTypes[] = ['SEATER', 'SLEEPER', 'CABIN'];

type ToolMode = 'select' | 'add' | 'erase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`bus-model-tabpanel-${index}`}
      aria-labelledby={`bus-model-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ p: 2, height: '100%' }}>{children}</Box>}
    </div>
  );
}

export default function BusModelsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { busModelsQuery, useBusModelDetails, createBusModel, updateBusModel, deleteBusModel } =
    useBusModels();

  const [open, setOpen] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

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
    keptImages: [],
  });

  // Image State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

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
        keptImages: busModelDetails.details.images || [],
      });
      setExistingImages(busModelDetails.details.images || []);
    }
  }, [busModelDetails, editingId]);

  const handleOpen = (id: string | null = null, view: boolean = false) => {
    setEditingId(id);
    setViewOnly(view);
    setToolMode('select');
    setTabValue(0);
    setSelectedFiles([]);
    setExistingImages([]);

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
        keptImages: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  // Image Handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setFormData((prev) => ({
      ...prev,
      keptImages: prev.keptImages?.filter((img) => img !== url),
    }));
  };

  // Seat Logic
  const handleCellClick = (deck: number, row: number, col: number) => {
    if (viewOnly) return;

    const existingSeatIndex = formData.seats.findIndex(
      (s) => s.deck === deck && s.row === row && s.col === col,
    );
    const existingSeat = existingSeatIndex !== -1 ? formData.seats[existingSeatIndex] : null;

    if (toolMode === 'erase') {
      if (existingSeat) {
        const newSeats = [...formData.seats];
        newSeats.splice(existingSeatIndex, 1);
        setFormData({ ...formData, seats: newSeats });
      }
      return;
    }

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

    if (existingSeat) {
      setCurrentSeat(existingSeat);
      setPendingSeatLoc(null);
      setSeatDialogOpen(true);
    } else {
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
    if (editingId) {
      updateBusModel.mutate(
        { id: editingId, data: formData, images: selectedFiles },
        { onSuccess: handleClose },
      );
    } else {
      createBusModel.mutate({ model: formData, images: selectedFiles }, { onSuccess: handleClose });
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
                      key={`${deckNum}-${row}-${col}`}
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
                        cursor: viewOnly ? 'default' : 'pointer',
                        '&:hover': !viewOnly
                          ? {
                              bgcolor: '#e3f2fd',
                            }
                          : {},
                        position: 'relative',
                      }}
                    >
                      {seat && (
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
    { field: 'name', headerName: 'Model Name', minWidth: 200 },
    { field: 'typeDisplay', headerName: 'Description', minWidth: 260 },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" />,
    },
    {
      field: 'seatCapacity',
      headerName: 'Seats',
      width: 80,
      align: 'center',
    },
    {
      field: 'images',
      headerName: 'Images',
      width: 80,
      align: 'center',
      renderCell: (params) => (
        <Chip label={params.row.images?.length || 0} size="small" icon={<ImageIcon size={14} />} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      align: 'right',
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
            Manage seating layouts and images
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

      <Dialog open={open} onClose={handleClose} maxWidth="xl" fullScreen={isMobile}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0 }}
        >
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ px: 2, pt: 1 }}>
            <Tab label="Configuration" icon={<Armchair size={18} />} iconPosition="start" />
            <Tab
              label={`Images (${existingImages.length + selectedFiles.length})`}
              icon={<ImageIcon size={18} />}
              iconPosition="start"
            />
          </Tabs>
          <IconButton onClick={handleClose} size="small" sx={{ mr: 2 }}>
            <X />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ height: '100%' }}>
            {/* Tab 1: Configuration & Seat Map */}
            <CustomTabPanel value={tabValue} index={0}>
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid sx={{ borderRight: { md: '1px solid #eee' }, xs: 12, md: 3 }}>
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
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as BusTypes })
                      }
                    >
                      {BUS_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Divider />
                    <Typography variant="subtitle2" color="text.secondary">
                      Dimensions
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="Decks"
                        type="number"
                        size="small"
                        value={formData.totalDecks}
                        disabled={viewOnly}
                        onChange={(e) =>
                          setFormData({ ...formData, totalDecks: parseInt(e.target.value) || 1 })
                        }
                      />
                      <TextField
                        label="Rows"
                        type="number"
                        size="small"
                        value={formData.gridRows}
                        disabled={viewOnly}
                        onChange={(e) =>
                          setFormData({ ...formData, gridRows: parseInt(e.target.value) || 1 })
                        }
                      />
                      <TextField
                        label="Cols"
                        type="number"
                        size="small"
                        value={formData.gridColumns}
                        disabled={viewOnly}
                        onChange={(e) =>
                          setFormData({ ...formData, gridColumns: parseInt(e.target.value) || 1 })
                        }
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

                <Grid sx={{ xs: 12, md: 9 }}>
                  <Stack spacing={2} alignItems="center">
                    {!viewOnly && (
                      <ToggleButtonGroup
                        value={toolMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setToolMode(newMode)}
                        size="small"
                      >
                        <ToggleButton value="select">
                          <MousePointer2 size={16} style={{ marginRight: 8 }} /> Select
                        </ToggleButton>
                        <ToggleButton value="add">
                          <PlusSquare size={16} style={{ marginRight: 8 }} /> Paint
                        </ToggleButton>
                        <ToggleButton value="erase">
                          <Eraser size={16} style={{ marginRight: 8 }} /> Erase
                        </ToggleButton>
                      </ToggleButtonGroup>
                    )}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        width: '100%',
                        minHeight: 400,
                        bgcolor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {renderSeatMap()}
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </CustomTabPanel>

            {/* Tab 2: Images */}
            <CustomTabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
                {!viewOnly && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<Upload />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Upload Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </Button>
                )}

                <Typography variant="subtitle2">
                  Gallery ({existingImages.length} saved, {selectedFiles.length} new)
                </Typography>

                <ImageList cols={isMobile ? 2 : 5} rowHeight={160} gap={16}>
                  {/* Existing Images */}
                  {existingImages.map((url, index) => (
                    <ImageListItem key={`exist-${index}`}>
                      <img
                        src={url}
                        alt={`Bus Model ${index}`}
                        loading="lazy"
                        style={{ height: '100%', objectFit: 'cover', borderRadius: 8 }}
                      />
                      {!viewOnly && (
                        <ImageListItemBar
                          position="top"
                          sx={{ background: 'transparent' }}
                          actionIcon={
                            <IconButton
                              sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', m: 0.5 }}
                              onClick={() => removeExistingImage(url)}
                            >
                              <X size={16} />
                            </IconButton>
                          }
                        />
                      )}
                    </ImageListItem>
                  ))}

                  {/* New Selected Files */}
                  {selectedFiles.map((file, index) => (
                    <ImageListItem key={`new-${index}`}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt="New Upload"
                        loading="lazy"
                        style={{
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 8,
                          opacity: 0.8,
                        }}
                      />
                      <ImageListItemBar
                        title={<Chip label="New" color="success" size="small" />}
                        position="top"
                        sx={{ background: 'transparent' }}
                        actionIcon={
                          !viewOnly ? (
                            <IconButton
                              sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', m: 0.5 }}
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X size={16} />
                            </IconButton>
                          ) : null
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>

                {existingImages.length === 0 && selectedFiles.length === 0 && (
                  <Typography color="text.secondary" align="center" py={5}>
                    No images available.
                  </Typography>
                )}
              </Stack>
            </CustomTabPanel>

            {/* Actions Footer */}
            {!viewOnly && (
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save size={18} />}>
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Seat Edit Dialog (Same as before) */}
      <Dialog open={seatDialogOpen} onClose={() => setSeatDialogOpen(false)} maxWidth="xs">
        <DialogTitle>{pendingSeatLoc ? 'Add Seat' : 'Edit Seat'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Seat Code"
            fullWidth
            value={currentSeat?.code || ''}
            onChange={(e) =>
              setCurrentSeat((prev) => (prev ? { ...prev, code: e.target.value } : null))
            }
          />
        </DialogContent>
        <DialogActions>
          {!pendingSeatLoc && (
            <Button color="error" onClick={handleDeleteSeat}>
              Delete
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
