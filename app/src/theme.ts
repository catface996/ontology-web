import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    background: {
      default: '#0a0a0f',
      paper: '#0d0d14',
    },
    divider: '#27273a',
    text: {
      primary: '#f4f4f5',
      secondary: '#a1a1aa',
      disabled: '#71717a',
    },
    action: {
      hover: 'rgba(139, 92, 246, 0.08)',
      selected: 'rgba(139, 92, 246, 0.12)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #1e1e2a',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#27273a',
        },
        head: {
          backgroundColor: '#1e1e2a',
          fontWeight: 500,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(30, 30, 42, 0.5)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
