import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0060c4', // Brand blue color (Used for Header, Icon, Active text)
      light: '#4285f4',
      dark: '#003c8f',
      contrastText: '#ffffff', // Text on blue background will be white
    },
    secondary: {
      main: '#FFD600', // Yellow for Flash Sale / Prominent price color
      contrastText: '#212121', // Text on yellow background will be black
    },
    warning: {
      main: '#FFC107', // Yellow color for "Search" button (slightly darker than Flash Sale yellow)
      contrastText: '#212121',
    },
    error: {
      main: '#d32f2f', // Red color (Used for LocationOn icon, Discount badge)
    },
    text: {
      primary: '#212121', // Main text color (Dark gray)
      secondary: '#555555', // Secondary text color (Lighter gray)
    },
    background: {
      default: '#f4f6f8', // General background color for the website (Very light gray)
      paper: '#ffffff', // Background color for Card, Popup components
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Disable uppercase text for buttons
      fontWeight: 700, // Default button text will be bold
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    // Customizations for default components
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Softer button corners (8px)
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,96,196,0.2)', // Hover shadow effect
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Card corner radius (12px) similar to PopularRoutes
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
