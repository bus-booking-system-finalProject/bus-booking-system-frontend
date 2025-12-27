import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- TYPES ---
export interface FilterState {
  priceRange: number[];
  minTime: string | undefined;
  maxTime: string | undefined;
  selectedOperators: string[];
  selectedTypes: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  availableOperators: string[];
  availableBusTypes: string[];
  maxPrice: number;
}

// --- HELPER FUNCTIONS ---
const minutesToTime = (minutes: number): string => {
  // Fix: Java LocalTime max is 23:59. "24:00" will cause a parsing error.
  if (minutes >= 1440) return '23:59';

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const timeToMinutes = (time: string | undefined, defaultVal: number): number => {
  if (!time) return defaultVal;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  availableOperators,
  availableBusTypes,
  maxPrice,
}) => {
  // 1. LOCAL STATE
  const [localPriceRange, setLocalPriceRange] = useState<number[]>(filters.priceRange);
  const [localTimeRange, setLocalTimeRange] = useState<number[]>([
    timeToMinutes(filters.minTime, 0),
    timeToMinutes(filters.maxTime, 1440),
  ]);

  // 2. STATE TO TRACK PREVIOUS PROPS (Sync Pattern)
  const [prevPriceProp, setPrevPriceProp] = useState<number[]>(filters.priceRange);
  const [prevMinTime, setPrevMinTime] = useState(filters.minTime);
  const [prevMaxTime, setPrevMaxTime] = useState(filters.maxTime);

  // Sync Price
  if (filters.priceRange[0] !== prevPriceProp[0] || filters.priceRange[1] !== prevPriceProp[1]) {
    setPrevPriceProp(filters.priceRange);
    setLocalPriceRange(filters.priceRange);
  }

  // Sync Time
  if (filters.minTime !== prevMinTime || filters.maxTime !== prevMaxTime) {
    setPrevMinTime(filters.minTime);
    setPrevMaxTime(filters.maxTime);
    setLocalTimeRange([timeToMinutes(filters.minTime, 0), timeToMinutes(filters.maxTime, 1440)]);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumSignificantDigits: 3,
    }).format(value);
  };

  const getBusTypeLabel = (type: string): string => {
    const labelMap: Record<string, string> = {
      standard: 'Ghế ngồi',
      limousine: 'Limousine',
      sleeper: 'Giường nằm',
    };
    return labelMap[type] || type;
  };

  // --- HANDLERS ---
  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setLocalPriceRange(newValue as number[]);
  };

  const handlePriceCommitted = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    onFilterChange({ ...filters, priceRange: newValue as number[] });
  };

  const handleTimeChange = (_event: Event, newValue: number | number[]) => {
    setLocalTimeRange(newValue as number[]);
  };

  const handleTimeCommitted = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    const [startMin, endMin] = newValue as number[];
    onFilterChange({
      ...filters,
      minTime: minutesToTime(startMin),
      maxTime: minutesToTime(endMin),
    });
  };

  // Generic Checkbox Handler (Used for both Operators and Bus Types now)
  const handleCheckboxChange = (category: keyof FilterState, value: string) => {
    const currentList = filters[category] as string[];
    const newList = currentList.includes(value)
      ? currentList.filter((item) => item !== value)
      : [...currentList, value];

    onFilterChange({ ...filters, [category]: newList });
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'white', position: 'sticky', top: 24 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Bộ lọc
        </Typography>
        <Button size="small" onClick={onReset} sx={{ textTransform: 'none' }}>
          Xóa lọc
        </Button>
      </Box>

      {/* 1. PRICE RANGE */}
      <Accordion
        defaultExpanded
        elevation={0}
        disableGutters
        sx={{ '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Giá vé
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1, pb: 2 }}>
          <Slider
            value={localPriceRange}
            onChange={handlePriceChange}
            onChangeCommitted={handlePriceCommitted}
            valueLabelDisplay="auto"
            min={0}
            max={maxPrice}
            step={10000}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(localPriceRange[0])}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatCurrency(localPriceRange[1])}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 2. DEPARTURE TIME */}
      <Accordion
        defaultExpanded
        elevation={0}
        disableGutters
        sx={{ '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 48 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Giờ đi
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1, pb: 2 }}>
          <Slider
            value={localTimeRange}
            onChange={handleTimeChange}
            onChangeCommitted={handleTimeCommitted}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => minutesToTime(val)}
            min={0}
            max={1440}
            step={30}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {minutesToTime(localTimeRange[0])}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {minutesToTime(localTimeRange[1])}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 3. OPERATOR */}
      <Accordion
        defaultExpanded
        elevation={0}
        disableGutters
        sx={{ '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Nhà xe
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <FormGroup>
            {availableOperators.map((op) => (
              <FormControlLabel
                key={op}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.selectedOperators.includes(op)}
                    onChange={() => handleCheckboxChange('selectedOperators', op)}
                  />
                }
                label={op}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* 4. BUS TYPE (UPDATED: Checkbox for Multi-Select) */}
      <Accordion
        defaultExpanded
        elevation={0}
        disableGutters
        sx={{ '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Loại xe
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <FormGroup>
            {availableBusTypes.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.selectedTypes.includes(type)}
                    onChange={() => handleCheckboxChange('selectedTypes', type)}
                  />
                }
                label={getBusTypeLabel(type)}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default FilterSidebar;
