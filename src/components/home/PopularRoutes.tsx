import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Skeleton,
} from '@mui/material';

const popularRoutes = [
  {
    id: 1,
    imgSrc:
      'https://images.unsplash.com/photo-1678864219374-bfbce86d7a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    title: 'Sài Gòn - Nha Trang',
    price: '200.000đ',
    discount: '250.000đ',
  },
  {
    id: 2,
    imgSrc:
      'https://images.unsplash.com/photo-1558793352-4c11eeb53c0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    title: 'Hà Nội - Hải Phòng',
    price: '90.000đ',
    discount: null,
  },
  {
    id: 3,
    imgSrc:
      'https://images.unsplash.com/photo-1702744228739-0123d6e79871?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    title: 'Sài Gòn - Phan Thiết',
    price: '150.000đ',
    discount: '200.000đ',
  },
  {
    id: 4,
    imgSrc:
      'https://images.unsplash.com/photo-1671361339437-8cb8e9cff8b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
    title: 'Sài Gòn - Phan Rang',
    price: '175.000đ',
    discount: null,
  },
];

function RouteCard({
  imgSrc,
  title,
  price,
  discount,
}: {
  imgSrc: string;
  title: string;
  price: string;
  discount: string | null;
}) {
  return (
    <Card
      sx={{
        width: 240,
        minWidth: 240,
        borderRadius: 3, // Softer corners
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardActionArea sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image Section */}
        <Box sx={{ position: 'relative', width: '100%', height: 150, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={imgSrc}
            alt={title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>

        {/* Content Section */}
        <CardContent
          sx={{
            p: 1.5, // Tighter padding
            width: '100%',
            // BEAUTIFUL GRADIENT BACKGROUND
            background: 'linear-gradient(135deg, #0060c4 0%, #2196f3 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 0.5, // "Make it closer"
          }}
        >
          <Typography
            variant="subtitle1"
            component="div"
            fontWeight={700}
            sx={{
              lineHeight: 1.2,
              mb: 0.5,
              fontSize: '1rem',
              textShadow: '0px 2px 2px rgba(0,0,0,0.1)',
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 300 }}>
              Từ
            </Typography>
            {/* PRICE POP - YELLOW */}
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 800,
                color: '#FFD700', // Gold color to match Banner
                fontSize: '1.1rem',
              }}
            >
              {price}
            </Typography>

            {discount && (
              <Typography
                variant="caption"
                sx={{
                  textDecoration: 'line-through',
                  opacity: 0.7,
                  fontSize: '0.75rem',
                  color: '#e0e0e0',
                }}
              >
                {discount}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function PopularRoutes() {
  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Title with exact same style */}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3, color: '#484848' }}>
        Tuyến đường phổ biến
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2.5,
          overflowX: 'auto',
          pb: 2,
          // Hide scrollbar for cleaner look but keep functionality
          '::-webkit-scrollbar': { height: '8px' },
          '::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '4px' },
          '::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
          justifyContent: { xs: 'flex-start', md: 'center' },
        }}
      >
        {popularRoutes.map((route) => (
          <RouteCard key={route.id} {...route} />
        ))}
      </Box>
    </Container>
  );
}
