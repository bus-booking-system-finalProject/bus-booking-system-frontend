import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Stack,
} from "@mui/material";
import {
  DirectionsBus,
  Flight,
  Train,
  DirectionsCar,
  ShieldOutlined,
  SupportAgent,
  LocalOffer,
  Payment,
} from "@mui/icons-material";
import PopularRoutes from "../components/PopularRoutes.tsx";
import Header from "../components/Header.tsx";

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Header />
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        {/* 1. Hero and Search Section */}
        <Box
          sx={{
            width: "100%",
            pt: 8,
            pb: 12,
            backgroundImage:
              "linear-gradient(135deg, #a0c4ff 0%, #dbeafe 100%)",
          }}
        >
          <Container maxWidth="md">
            {/* Promo Banner */}
            <Box sx={{ textAlign: "center", mb: 4, color: "primary.dark" }}>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>
                Flash Sale
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "warning.main" }}
              >
                Giảm Đến 50%
              </Typography>
            </Box>

            {/* Search Form Card */}
            <Paper elevation={4} sx={{ p: 3, borderRadius: 4 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="Transport types"
                sx={{ mb: 2 }}
              >
                <Tab
                  icon={<DirectionsBus />}
                  iconPosition="start"
                  label="Xe khách"
                />
                <Tab icon={<Flight />} iconPosition="start" label="Máy bay" />
                <Tab icon={<Train />} iconPosition="start" label="Tàu hỏa" />
                <Tab
                  icon={<DirectionsCar />}
                  iconPosition="start"
                  label="Thuê xe"
                />
              </Tabs>

              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={2} alignItems="center"></Grid>
              </Box>
            </Paper>

            {/* Trust Badges */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-around"
              alignItems="center"
              spacing={2}
              sx={{ mt: 5, color: "grey.800" }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShieldOutlined color="success" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Chắc chắn có chỗ
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SupportAgent color="primary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Hỗ trợ 24/7
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalOffer color="warning" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Nhiều ưu đãi
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Payment sx={{ color: "purple" }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Thanh toán đa dạng
                </Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* 2. Popular Routes Section */}
        <PopularRoutes />

        {/* 3. Featured Offers Section (Placeholder) */}
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            Ưu đãi nổi bật
          </Typography>
          <Box
            sx={{
              p: 10,
              bgcolor: "grey.200",
              borderRadius: 3,
              textAlign: "center",
              color: "grey.600",
            }}
          >
            (Carousel for "Ưu đãi nổi bật" would go here)
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default App;
