import { createTheme } from '@mui/material/styles';

/**
 * Central MUI theme — keeps typography, spacing, and color decisions
 * in one place instead of scattered inline styles across components.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#6C5CE7',
      dark: '#5849C2',
      light: '#8B7EF0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF5C8A',
    },
    background: {
      default: '#F4F5F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E1E2D',
      secondary: '#6B7280',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', sans-serif",
    h6: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});

export default theme;
