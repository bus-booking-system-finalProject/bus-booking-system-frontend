import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  IconButton,
  Autocomplete,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DirectionsBusFilled,
  Flight,
  Train,
  DirectionsCar,
  RadioButtonChecked,
  LocationOn,
  CalendarToday,
  SwapHoriz,
  Close,
} from '@mui/icons-material';

// --- DATA ---
// Display names (kept for UI) — these are the previous province names users expect to see
const PROVINCES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Đồng Tháp',
  'An Giang',
  'Cần Thơ',
  'Bà Rịa - Vũng Tàu',
  'Bình Dương',
  'Đồng Nai',
  'Khánh Hòa',
  'Lâm Đồng',
  'Thừa Thiên Huế',
  'Hải Phòng',
  'Quảng Ninh',
  'Thanh Hóa',
  'Nghệ An',
  'Bình Thuận',
  'Kiên Giang',
  'Cà Mau',
  'Tiền Giang',
  'Long An',
  'Bến Tre',
  'Vĩnh Long',
  'Trà Vinh',
  'Hậu Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Bình Định',
  'Phú Yên',
  'Quảng Nam',
  'Quảng Ngãi',
  'Gia Lai',
  'Đắk Lắk',
  'Bình Phước',
];

// Map displayed province name -> backend province identifier/value
// Keep this mapping up-to-date if backend keys change. We default to the displayed value when no mapping exists.
const PROVINCE_BACKEND_MAP: Record<string, string> = {
  'Hồ Chí Minh': 'Ho Chi Minh City',
  'Hà Nội': 'Hanoi',
  'Đà Nẵng': 'Da Nang',
  'Đồng Tháp': 'Dong Thap',
  'An Giang': 'An Giang',
  'Cần Thơ': 'Can Tho',
  'Bà Rịa - Vũng Tàu': 'Ba Ria - Vung Tau',
  'Bình Dương': 'Binh Duong',
  'Đồng Nai': 'Dong Nai',
  'Khánh Hòa': 'Khanh Hoa',
  'Lâm Đồng': 'Lam Dong',
  'Thừa Thiên Huế': 'Thua Thien Hue',
  'Hải Phòng': 'Hai Phong',
  'Quảng Ninh': 'Quang Ninh',
  'Thanh Hóa': 'Thanh Hoa',
  'Nghệ An': 'Nghe An',
  'Bình Thuận': 'Binh Thuan',
  'Kiên Giang': 'Kien Giang',
  'Cà Mau': 'Ca Mau',
  'Tiền Giang': 'Tien Giang',
  'Long An': 'Long An',
  'Bến Tre': 'Ben Tre',
  'Vĩnh Long': 'Vinh Long',
  'Trà Vinh': 'Tra Vinh',
  'Hậu Giang': 'Hau Giang',
  'Sóc Trăng': 'Soc Trang',
  'Bạc Liêu': 'Bac Lieu',
  'Bình Định': 'Binh Dinh',
  'Phú Yên': 'Phu Yen',
  'Quảng Nam': 'Quang Nam',
  'Quảng Ngãi': 'Quang Ngai',
  'Gia Lai': 'Gia Lai',
  'Đắk Lắk': 'Dak Lak',
  'Bình Phước': 'Binh Phuoc',
};

// --- HELPERS ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getTodayString = () => new Date().toISOString().split('T')[0];

interface LocationAutocompleteProps {
  icon: React.ReactNode;
  value: string | null;
  onChange: (newValue: string | null) => void;
}

const BannerTab = ({
  label,
  icon,
  isActive,
  badgeText,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  badgeText?: string;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      pb: 1.5,
      borderBottom: isActive ? '3px solid #0060c4' : '3px solid transparent',
      color: isActive ? '#0060c4' : '#555',
      position: 'relative',
      transition: 'all 0.2s',
      '&:hover': { color: '#0060c4' },
    }}
  >
    {icon}
    <Typography fontWeight={isActive ? 700 : 500} variant="body1">
      {label}
    </Typography>
    {badgeText && (
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -20,
          bgcolor: '#ff3333',
          color: 'white',
          fontSize: '0.65rem',
          px: 0.6,
          borderRadius: '4px',
          fontWeight: 'bold',
        }}
      >
        {badgeText}
      </Box>
    )}
  </Box>
);

const BannerInput = ({
  icon,
  placeholder,
  value,
  isLast = false,
  showDivider = true,
  onClick,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  isLast?: boolean;
  showDivider?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      py: 1,
      cursor: 'pointer',
      minWidth: 0,
    }}
  >
    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }} display="block">
        {placeholder}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={700}
        color={value ? 'text.primary' : 'text.disabled'}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value || 'Chọn...'}
      </Typography>
    </Box>
    {!isLast && showDivider && (
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 2, height: '30px', alignSelf: 'center' }}
      />
    )}
  </Box>
);

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ icon, value, onChange }) => (
  <Autocomplete
    options={PROVINCES}
    value={value}
    onChange={(_e, newValue) => onChange(newValue)}
    autoHighlight
    disablePortal
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder="Chọn tỉnh..."
        variant="standard"
        InputProps={{
          ...params.InputProps,
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 1.5 }}>
              {icon}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-root': {
            height: '100%',
            py: 1,
            fontWeight: 700,
            fontSize: '1.0rem',
            color: value ? 'text.primary' : 'text.disabled',
          },
          '& input': {
            cursor: 'pointer',
            textOverflow: 'ellipsis',
          },
        }}
      />
    )}
    renderOption={(props, option) => {
      const { key, ...otherProps } = props;
      return (
        <Box component="li" key={key} {...otherProps}>
          <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 15 }} />
          {option}
        </Box>
      );
    }}
    sx={{ flex: 1, minWidth: 0 }}
  />
);

const SearchWidget: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [departDate, setDepartDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');

  const departInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);

  const handleSwapLocation = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleClearReturnDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReturnDate('');
    if (returnInputRef.current) returnInputRef.current.value = '';
  };

  const handleSearch = () => {
    if (!origin || !destination || !departDate) {
      alert('Vui lòng chọn Điểm đi, Điểm đến và Ngày đi');
      return;
    }

    // Map displayed province names to backend values when building the URL/search params
    const backendOrigin = PROVINCE_BACKEND_MAP[origin] || origin;
    const backendDestination = PROVINCE_BACKEND_MAP[destination] || destination;

    navigate({
      to: '/search-results',
      search: {
        origin: backendOrigin,
        destination: backendDestination,
        date: departDate,
        returnDate: returnDate || undefined,
        page: 1,
        limit: 5,
      },
    });
  };

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 3,
        maxWidth: '96%',
        mx: 'auto',
        overflow: 'hidden',
        bgcolor: 'white',
        boxShadow: '0px 10px 40px rgba(0,0,0,0.1)',
      }}
    >
      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          px: 3,
          pt: 2.5,
          borderBottom: '1px solid #f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <BannerTab
          label="Xe khách"
          icon={<DirectionsBusFilled />}
          isActive={activeTab === 0}
          onClick={() => setActiveTab(0)}
        />
        <BannerTab
          label="Máy bay"
          icon={<Flight />}
          isActive={activeTab === 1}
          badgeText="-30K"
          onClick={() => setActiveTab(1)}
        />
        <BannerTab
          label="Tàu hỏa"
          icon={<Train />}
          isActive={activeTab === 2}
          badgeText="-25%"
          onClick={() => setActiveTab(2)}
        />
        <BannerTab
          label="Thuê xe"
          icon={<DirectionsCar />}
          isActive={activeTab === 3}
          badgeText="Mới"
          onClick={() => setActiveTab(3)}
        />
      </Box>

      {/* Input Row */}
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 3.25fr) minmax(0, 4fr) minmax(0, 1fr)',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {/* 1. LOCATION SECTION */}
          <Box>
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                borderRadius: 2,
                borderColor: '#e0e0e0',
                alignItems: 'center',
                px: 2,
                py: 0.5,
              }}
            >
              {/* Origin */}
              <Box sx={{ flex: 1 }}>
                {/* NEW LABEL HERE */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 4.5, display: 'block', mb: -1, mt: 0.5 }}
                >
                  Nơi xuất phát
                </Typography>
                <LocationAutocomplete
                  icon={<RadioButtonChecked color="primary" />}
                  value={origin}
                  onChange={setOrigin}
                />
              </Box>

              <IconButton
                size="small"
                sx={{ bgcolor: '#f5f5f5', border: '1px solid #eee', mx: 1 }}
                onClick={handleSwapLocation}
              >
                <SwapHoriz fontSize="small" color="action" />
              </IconButton>

              {/* Destination */}
              <Box sx={{ flex: 1 }}>
                {/* NEW LABEL HERE */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 4.5, display: 'block', mb: -1, mt: 0.5 }}
                >
                  Nơi đến
                </Typography>
                <LocationAutocomplete
                  icon={<LocationOn color="error" />}
                  value={destination}
                  onChange={setDestination}
                />
              </Box>
            </Paper>
          </Box>

          {/* Dates */}
          <Box>
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                borderRadius: 2,
                borderColor: '#e0e0e0',
                alignItems: 'center',
                px: 2,
                position: 'relative',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <input
                  type="date"
                  ref={departInputRef}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  value={departDate}
                  min={getTodayString()}
                  onChange={(e) => setDepartDate(e.target.value)}
                />
                <BannerInput
                  icon={<CalendarToday color="primary" />}
                  placeholder="Ngày đi"
                  value={formatDate(departDate)}
                  showDivider={false}
                  onClick={() => departInputRef.current?.showPicker()}
                />
              </Box>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 2, height: '30px', alignSelf: 'center' }}
              />
              <Box sx={{ flex: 1, position: 'relative' }}>
                <input
                  type="date"
                  ref={returnInputRef}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  value={returnDate}
                  min={departDate || getTodayString()}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
                <BannerInput
                  icon={<CalendarToday color="action" />}
                  placeholder="Ngày về"
                  value={formatDate(returnDate)}
                  isLast
                  showDivider={false}
                  onClick={() => returnInputRef.current?.showPicker()}
                />
                {returnDate && (
                  <IconButton
                    size="small"
                    onClick={handleClearReturnDate}
                    sx={{
                      position: 'absolute',
                      right: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 5,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Button */}
          <Box>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#FFC107',
                color: '#212121',
                fontWeight: 700,
                fontSize: '1.1rem',
                height: '56px',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#ffca2c', boxShadow: 'none' },
              }}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchWidget;
