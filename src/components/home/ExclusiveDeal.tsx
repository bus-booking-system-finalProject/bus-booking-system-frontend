import { Box, Container, Typography, Card, CardActionArea, CardMedia, Button } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const deals = [
  {
    id: 1,
    title: 'Giảm 50% cho khách hàng mới',
    code: 'NEWMEMBER',
    img: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    color: '#FF9800',
  },
  {
    id: 2,
    title: 'Giảm 20K vé đi Đà Lạt',
    code: 'DALAT20',
    // Using a direct link because source.unsplash can be unstable
    img: 'https://images.unsplash.com/photo-1558603668-6570496b66f8?auto=format&fit=crop&w=400&q=80',
    color: '#4CAF50',
  },
  {
    id: 3,
    title: 'Ưu đãi mùa hè rực rỡ',
    code: 'SUMMER',
    img: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    color: '#2196F3',
  },
  {
    id: 4,
    title: 'Giảm 50K khi thanh toán MoMo',
    code: 'MOMO50',
    img: 'https://images.unsplash.com/photo-1700847304964-9fe563059742?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsZSUyMG9mJTIwNTAlMjB2bmR8ZW58MHx8MHx8fDA%3D',
    color: '#E91E63',
  },
];

function DealCard({ deal }: { deal: (typeof deals)[0] }) {
  return (
    <Card
      sx={{
        // I kept this at 300px so the Code/Button row isn't squashed.
        // If you strictly want 240px to match PopularRoutes, change these values to 240.
        width: 240,
        minWidth: 240,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' },
      }}
    >
      {/* 1. TOP PART: Clickable Image & Title */}
      <CardActionArea sx={{ flex: 1 }}>
        <Box sx={{ position: 'relative', height: 160 }}>
          <CardMedia
            component="img"
            image={deal.img}
            alt={deal.title}
            sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              right: 16,
              color: 'white',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ lineHeight: 1.2, fontSize: '1rem', mb: 0.5 }}
            >
              {deal.title}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>

      {/* 2. BOTTOM PART: Code & Button (MOVED OUTSIDE CardActionArea) */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px dashed #e0e0e0',
          mt: 'auto', // Ensures it stays at bottom if height varies
        }}
      >
        <Box sx={{ bgcolor: '#f5f5f5', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #ddd' }}>
          <Typography
            variant="caption"
            fontFamily="monospace"
            fontWeight={700}
            color="text.secondary"
          >
            {deal.code}
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<ContentCopy fontSize="small" />}
          sx={{ fontSize: '0.75rem', textTransform: 'none' }}
          onClick={(e) => {
            e.stopPropagation(); // Prevents clicking the card if you add a click handler to the card later
            // Handle copy logic here
          }}
        >
          Sao chép
        </Button>
      </Box>
    </Card>
  );
}

export default function ExclusiveDeal() {
  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 8, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3, color: '#484848' }}>
        Ưu đãi nổi bật
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2,
          '::-webkit-scrollbar': { height: '8px' },
          '::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' },
          '::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
          justifyContent: { xs: 'flex-start', md: 'center' },
        }}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </Box>
    </Container>
  );
}
