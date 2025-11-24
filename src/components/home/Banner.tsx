import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  DirectionsBusFilled,
  Flight,
  Train,
  DirectionsCar,
  VerifiedUser,
  HeadsetMic,
  ConfirmationNumber,
  Payment,
  RadioButtonChecked,
  LocationOn,
  CalendarToday,
  SwapHoriz,
  Close,
} from '@mui/icons-material';

// --- DATA: (Vietnam Provinces) ---
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

// --- HELPER: Format Date to Vietnamese String (e.g., "T6, 12/12/2025") ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short', // T2, T3...
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// --- HELPER: Get Today in YYYY-MM-DD format for Input Default ---
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// --- Internal Helper Components ---

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
  showDivider = true, // NEW: Control divider visibility
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
      // FIX: Đảm bảo input luôn chiếm không gian ổn định
      minWidth: 0,
    }}
  >
    <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {placeholder}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={700}
        color={value ? 'text.primary' : 'text.disabled'}
        sx={{
          whiteSpace: 'nowrap', // FIX: Forces text to stay on one line
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value || 'Chọn...'}
      </Typography>
    </Box>
    {/* Logic: Only show divider if it's not the last item AND showDivider is true */}
    {!isLast && showDivider && (
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 2, height: '30px', alignSelf: 'center' }}
      />
    )}
  </Box>
);

// --- Main Component ---

export default function BannerPage() {
  const [activeTab, setActiveTab] = useState(0);

  // --- STATE: Locations ---
  // UPDATE: Initial state is empty string
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');

  // Logic for Menu (Dropdown)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectingType, setSelectingType] = useState<'origin' | 'destination' | null>(null);

  // --- STATE: Dates ---
  // UPDATE: Initial state is empty string
  const [departDate, setDepartDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');

  // Refs for hidden date inputs
  const departInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS: Location ---
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, type: 'origin' | 'destination') => {
    setAnchorEl(event.currentTarget);
    setSelectingType(type);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectingType(null);
  };

  const handleSelectProvince = (province: string) => {
    if (selectingType === 'origin') setOrigin(province);
    if (selectingType === 'destination') setDestination(province);
    handleCloseMenu();
  };

  const handleSwapLocation = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  // --- HANDLERS: Date ---
  const handleClearReturnDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReturnDate('');
    if (returnInputRef.current) returnInputRef.current.value = '';
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(180deg, #9cecfb 0%, #65c7f7 50%, #0052d4 100%)',
        pt: 6,
        pb: 0,
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pb: 8 }}>
        {/* 1. PROMO TEXT (Updated Styling) */}
        {/* 1. PROMO TEXT - IMAGE REPLICA */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          {/* Top Line: White text, Blue Outline */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Roboto", "Arial", sans-serif',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'white',
              letterSpacing: 1,
              // The "Sticker" Stroke Effect
              textShadow: `
                2px 0 0 #0058AB, 
                -2px 0 0 #0058AB, 
                0 2px 0 #0058AB, 
                0 -2px 0 #0058AB, 
                1px 1px 0 #0058AB, 
                -1px -1px 0 #0058AB, 
                1px -1px 0 #0058AB, 
                -1px 1px 0 #0058AB
              `,
              mb: 0.5,
            }}
          >
            Thứ 3 - Vi vu thả ga
          </Typography>

          {/* Middle Block: Stacked Left + Big Right */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2, // Space between text block and 50%
            }}
          >
            {/* Left Column: Flash Sale + Giảm Đến */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                lineHeight: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Roboto", sans-serif',
                  fontWeight: 900,
                  color: '#FFD600', // Yellow
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  lineHeight: 0.9,
                  // Blue Stroke
                  textShadow: `
                    2px 2px 0 #0058AB, -1px -1px 0 #0058AB, 
                    1px -1px 0 #0058AB, -1px 1px 0 #0058AB,
                    1px 1px 0 #0058AB
                  `,
                }}
              >
                Flash Sale
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Roboto", sans-serif',
                  fontWeight: 900,
                  color: '#FFD600', // Yellow
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  lineHeight: 1,
                  // Blue Stroke
                  textShadow: `
                    2px 2px 0 #0058AB, -1px -1px 0 #0058AB, 
                    1px -1px 0 #0058AB, -1px 1px 0 #0058AB,
                    1px 1px 0 #0058AB
                  `,
                }}
              >
                Giảm Đến
              </Typography>
            </Box>

            {/* Right Side: Huge 50% */}
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 900,
                fontSize: { xs: '4rem', md: '6rem' }, // Very Big
                color: '#00aefd', // Fallback color
                lineHeight: 0.8,
                // Gradient Text
                background: 'linear-gradient(180deg, #50E3C2 0%, #007ADF 100%)', // Simulating the blue/cyan gradient
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                // Note: Standard text-shadow doesn't work well with transparent text fill
                // We simulate the stroke using a filter drop-shadow on the element
                filter:
                  'drop-shadow(0px 2px 0px #0058AB) drop-shadow(2px 0px 0px #0058AB) drop-shadow(-2px 0px 0px #0058AB) drop-shadow(0px -2px 0px #0058AB)',

                // OR simpler yellow version matching the image exactly:
                // If you want the YELLOW 50% from the image, use this instead:
                /*
                color: '#FFD600',
                background: 'none',
                WebkitTextFillColor: 'initial',
                textShadow: '3px 3px 0 #0058AB, -1px -1px 0 #0058AB, 1px -1px 0 #0058AB, -1px 1px 0 #0058AB',
                */
              }}
            >
              <span
                style={{
                  color: '#FFD600', // Yellow Fill
                  WebkitTextFillColor: '#FFD600',
                  textShadow:
                    '4px 4px 0 #0058AB, -2px -2px 0 #0058AB, 2px -2px 0 #0058AB, -2px 2px 0 #0058AB', // Thick Blue Stroke
                }}
              >
                50%
              </span>
            </Typography>
          </Box>

          {/* Bottom text */}
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              mt: 2,
              opacity: 0.95,
              fontSize: '1.25rem',
              fontWeight: 500,
              textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            Vexesieure - Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ vận chuyển (*)
            {/* Added the little info icon from the image */}
            <Box
              component="span"
              sx={{
                border: '1px solid white',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              i
            </Box>
          </Typography>
        </Box>

        {/* 2. SEARCH WIDGET */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            maxWidth: '1000px',
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
              justifyContent: 'center', // Centers content horizontally
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

          {/* Bottom Row: Inputs & Button */}
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                // FIX: Sử dụng minmax(0, Xfr) để cố định tỷ lệ, KHÔNG phụ thuộc vào độ dài chữ bên trong
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'minmax(0, 3.25fr) minmax(0, 4fr) minmax(0, 1fr)',
                },
                gap: 2,
                alignItems: 'center',
              }}
            >
              {/* Input Group: Location */}
              <Box>
                <Paper
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    borderRadius: 2,
                    borderColor: '#e0e0e0',
                    alignItems: 'center',
                    px: 2,
                  }}
                >
                  <BannerInput
                    icon={<RadioButtonChecked color="primary" />}
                    placeholder="Nơi xuất phát"
                    value={origin}
                    showDivider={false}
                    onClick={(e) => handleOpenMenu(e, 'origin')}
                  />

                  <IconButton
                    size="small"
                    sx={{ bgcolor: '#f5f5f5', border: '1px solid #eee' }}
                    onClick={handleSwapLocation}
                  >
                    <SwapHoriz fontSize="small" color="action" />
                  </IconButton>

                  <Box sx={{ ml: 2, flex: 1 }}>
                    <BannerInput
                      icon={<LocationOn color="error" />}
                      placeholder="Nơi đến"
                      value={destination}
                      isLast
                      onClick={(e) => handleOpenMenu(e, 'destination')}
                    />
                  </Box>
                </Paper>
              </Box>

              {/* --- DATE SECTION --- */}
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
                  {/* LEFT SIDE: Depart Date (Flex 1 = 50% width) */}
                  <Box sx={{ flex: 1 }}>
                    {/* Hidden Native Input for Departure */}
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
                      showDivider={false} // Divider handled manually between boxes
                      onClick={() => departInputRef.current?.showPicker()}
                    />
                  </Box>

                  {/* Manual Divider to ensure split */}
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ mx: 2, height: '30px', alignSelf: 'center' }}
                  />

                  {/* RIGHT SIDE: Return Date (Flex 1 = 50% width) */}
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    {/* Hidden Native Input for Return */}
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

                    {/* Cancel Button - FIXED: Positioned Absolute so it doesn't consume width */}
                    {returnDate && (
                      <IconButton
                        size="small"
                        onClick={handleClearReturnDate}
                        sx={{
                          position: 'absolute',
                          right: -8, // Slight negative right to pull it towards edge
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

              {/* Search Button */}
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
                >
                  Tìm kiếm
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* DROPDOWN MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: '250px',
          },
        }}
      >
        {PROVINCES.map((province) => (
          <MenuItem
            key={province}
            onClick={() => handleSelectProvince(province)}
            selected={province === (selectingType === 'origin' ? origin : destination)}
          >
            {province}
          </MenuItem>
        ))}
      </Menu>

      {/* 3. BOTTOM TRUST BAR */}
      <Box
        sx={{
          bgcolor: 'rgba(33, 33, 33, 0.6)',
          backdropFilter: 'blur(4px)',
          py: 1.5,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={0.5}
            sx={{ color: 'white' }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <VerifiedUser sx={{ color: '#FFC107', fontSize: 30 }} />
              <Typography variant="body2" fontWeight={500}>
                Chắc chắn có chỗ
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HeadsetMic sx={{ color: '#FFC107', fontSize: 30 }} />
              <Typography variant="body2" fontWeight={500}>
                Hỗ trợ 24/7
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ConfirmationNumber sx={{ color: '#FFC107', fontSize: 30 }} />
              <Typography variant="body2" fontWeight={500}>
                Nhiều ưu đãi
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Payment sx={{ color: '#FFC107', fontSize: 30 }} />
              <Typography variant="body2" fontWeight={500}>
                Thanh toán đa dạng
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
