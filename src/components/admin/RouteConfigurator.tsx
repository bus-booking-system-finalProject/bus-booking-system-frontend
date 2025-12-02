import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { Loader2 } from 'lucide-react';
import type { RouteStop } from '@/types/AdminTypes';
import { useSaveRouteMutation } from '@/hooks/useAdminQueries';

export const RouteConfigurator: React.FC = () => {
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState<RouteStop[]>([
    { id: 1, location: 'New York, NY (Penn Station)', offset: '0 mins' },
    { id: 2, location: 'New Haven, CT', offset: '+90 mins' },
  ]);

  const saveRoute = useSaveRouteMutation();

  const handleSave = () => {
    saveRoute.mutate({ name: routeName, stops });
  };

  const addStop = () => {
    const newId = stops.length > 0 ? Math.max(...stops.map((s) => s.id)) + 1 : 1;
    setStops([...stops, { id: newId, location: '', offset: '' }]);
  };

  const removeStop = (id: number) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    if (direction === 'up' && index > 0) {
      [newStops[index], newStops[index - 1]] = [newStops[index - 1], newStops[index]];
    } else if (direction === 'down' && index < newStops.length - 1) {
      [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    }
    setStops(newStops);
  };

  const updateStop = (id: number, field: keyof RouteStop, value: string) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Column: Route Details */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Route Details
            </Typography>
            <TextField
              fullWidth
              label="Route Name"
              placeholder="e.g. NYC to Boston"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure the sequence of stops. The "Time Offset" helps calculate arrival estimates
              relative to departure.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={saveRoute.isPending}
              startIcon={
                saveRoute.isPending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircleIcon />
                )
              }
            >
              {saveRoute.isPending ? 'Saving...' : 'Save Route'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column: Stops Sequence */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Stops Sequence</Typography>
              <Button startIcon={<AddIcon />} onClick={addStop} variant="outlined" size="small">
                Add Stop
              </Button>
            </Box>

            <Stack spacing={2}>
              {stops.map((stop, index) => (
                <Card key={stop.id} variant="outlined" sx={{ bgcolor: '#f8fafc' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <IconButton
                            size="small"
                            onClick={() => moveStop(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => moveStop(index, 'down')}
                            disabled={index === stops.length - 1}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`Stop #${index + 1} Location`}
                          value={stop.location}
                          onChange={(e) => updateStop(stop.id, 'location', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Offset"
                          placeholder="+0m"
                          value={stop.offset}
                          onChange={(e) => updateStop(stop.id, 'offset', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 2 }} sx={{ textAlign: 'right' }}>
                        <IconButton color="error" onClick={() => removeStop(stop.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
