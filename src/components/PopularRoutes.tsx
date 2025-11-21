import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
} from '@mui/material'

// Mock data based on the image
const popularRoutes = [
  {
    id: 1,
    imgSrc: 'https://via.placeholder.com/300x200/A0522D/FFFFFF?text=Nha+Trang',
    title: 'Sài Gòn - Nha Trang',
    price: '190.000đ',
  },
  {
    id: 2,
    imgSrc: 'https://via.placeholder.com/300x200/800080/FFFFFF?text=Hai+Phong',
    title: 'Hà Nội - Hải Phòng',
    price: '150.000đ',
  },
  {
    id: 3,
    imgSrc: 'https://via.placeholder.com/300x200/FF8C00/FFFFFF?text=Phan+Thiet',
    title: 'Sài Gòn - Phan Thiết',
    price: '160.000đ',
  },
  {
    id: 4,
    imgSrc: 'https://via.placeholder.com/300x200/00008B/FFFFFF?text=Phan+Rang',
    title: 'Sài Gòn - Phan Rang',
    price: '180.000đ',
  },
]

// A single card component
function RouteCard({
  imgSrc,
  title,
  price,
}: {
  imgSrc: string
  title: string
  price: string
}) {
  return (
    <Card sx={{ width: 256, flexShrink: 0, borderRadius: 3, boxShadow: 3 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="128"
          image={imgSrc}
          alt={title}
          sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Từ{' '}
            <Typography component="span" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {price}
            </Typography>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

// The main component with a horizontally scrolling container
export default function PopularRoutes() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
        Tuyến đường phổ biến
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 2, // for scrollbar padding
        }}
      >
        {popularRoutes.map((route) => (
          <RouteCard key={route.id} {...route} />
        ))}
      </Box>
    </Container>
  )
}