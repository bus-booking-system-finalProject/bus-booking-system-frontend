import { Box, Container, Typography, Stack } from '@mui/material';
import { VerifiedUser, HeadsetMic, ConfirmationNumber, Payment } from '@mui/icons-material';

import SearchWidget from '../search/SearchWidget';

// --- Main Component ---

export default function BannerPage() {
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

        {/* --- IMPORTED SEARCH WIDGET --- */}
        <SearchWidget />
      </Container>

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
