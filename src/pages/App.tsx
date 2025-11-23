import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import PopularRoutes from '../components/home/PopularRoutes.tsx';
import Header from '../components/Header.tsx';
import Banner from '../components/home/Banner.tsx';
import ExclusiveDeal from '../components/home/ExclusiveDeal.tsx';

function App() {
  return (
    <>
      <Header />
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* 1. Banner Section */}
        <Banner />

        {/* 2. Popular Routes Section */}
        <PopularRoutes />

        {/* 3. Featured Offers Section (Placeholder) */}
        <ExclusiveDeal />
      </Box>
    </>
  );
}

export default App;
